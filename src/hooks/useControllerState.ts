import { useState, useEffect, useRef, useCallback } from "react";
import {
  parseReference,
  getCanonicalBookName,
  fetchVerse,
  curatedVersions,
  type TriageCategory,
  type ParsedReference,
} from "../services/bibleService";
import {
  loadBibleStore,
  getVerse,
  getVerseRange,
} from "../services/bibleStore";
import { useSettings } from "../context/SettingsContext";
import { useSession } from "../context/SessionContext";

export const useControllerState = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // externalQuery: set from Setlist or other external sources to populate the
  // search input. The SearchModule watches this prop and adopts its value.
  const [externalQuery, setExternalQuery] = useState("");

  const { pushVerse, broadcastClear } = useSession();

  const [showPushConfirm, setShowPushConfirm] = useState(false);
  const [pendingPush, setPendingPush] = useState<(() => void) | null>(null);

  const {
    pushConfirmEnabled,
    autoClearSeconds,
    showVerseNumbers,
    setlistStyle,
  } = useSettings();

  const autoClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [primaryVersion, setPrimaryVersion] = useState(
    () => localStorage.getItem("streambible-primary-version") || "1",
  );
  const [secondaryVersion, setSecondaryVersion] = useState(
    () => localStorage.getItem("streambible-secondary-version") || "1",
  );
  const [showPrimary, setShowPrimary] = useState(
    () => localStorage.getItem("streambible-show-primary") !== "false",
  );
  const [showSecondary, setShowSecondary] = useState(
    () => localStorage.getItem("streambible-show-secondary") !== "false",
  );

  const [primaryText, setPrimaryText] = useState("");
  const [primaryRef, setPrimaryRef] = useState("");
  const [primaryExpanded, setPrimaryExpanded] = useState(false);

  const [secondaryText, setSecondaryText] = useState("");
  const [secondaryRef, setSecondaryRef] = useState("");
  const [secondaryExpanded, setSecondaryExpanded] = useState(false);

  const [primaryFums, setPrimaryFums] = useState<string | undefined>(undefined);
  const [secondaryFums, setSecondaryFums] = useState<string | undefined>(undefined);

  const [status, setStatus] = useState<
    "default" | "fetching" | "success" | "live" | "error"
  >("default");
  const [statusMsg, setStatusMsg] = useState("Ready");

  useEffect(() => {
    localStorage.setItem("streambible-primary-version", primaryVersion);
    localStorage.setItem("streambible-secondary-version", secondaryVersion);
    localStorage.setItem("streambible-show-primary", showPrimary.toString());
    localStorage.setItem(
      "streambible-show-secondary",
      showSecondary.toString(),
    );
  }, [primaryVersion, secondaryVersion, showPrimary, showSecondary]);

  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);

  const [copiedType, setCopiedType] = useState<
    "overlay" | "fullscreen" | "controller" | null
  >(null);
  const [showFallbackToast, setShowFallbackToast] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [fallbackType, setFallbackType] = useState<
    "api.bible" | "local" | null
  >(null);
  const [primarySource, setPrimarySource] = useState<
    "api.bible" | "local" | "nlt"
  >("local");
  const [secondarySource, setSecondarySource] = useState<
    "api.bible" | "local" | "nlt"
  >("local");
  const [triageReason, setTriageReason] = useState<TriageCategory>(null);
  const [fallbackOriginalVersion, setFallbackOriginalVersion] = useState<
    string | null
  >(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Walkthrough State
  const [showTour, setShowTour] = useState(false);

  const tourSteps = [
    {
      id: "welcome",
      title: "Welcome to StreamBible",
      text: "A clean, simple, and powerful way to present scripture on your livestream. Let's quickly go over the basics.",
    },
    {
      id: "search",
      title: "Search in Milliseconds",
      text: 'Type a reference like "John 3:16" in the search bar. StreamBible will instantly fetch it from our curated library of reliable translations.',
    },
    {
      id: "preview",
      title: "Dual Language Support",
      text: "Preview your text before it goes live. You can even toggle a secondary translation (like Yoruba) to display side-by-side with English.",
    },
    {
      id: "broadcast",
      title: "Push to OBS",
      text: 'Once you are happy with the preview, click "Push Live". Copy the overlay link from the top right and paste it into an OBS Browser Source to see it on screen!',
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("streambible-theme") || "light";
    Promise.resolve().then(() => setTheme(saved as "light" | "dark"));

    const hasSeenTour = localStorage.getItem("streambible-tour-seen");
    // App uses HashRouter: params live in window.location.hash, not .search
    const hash = window.location.hash; // e.g. "#/controller?tour=true"
    const hashSearch = hash.includes('?') ? hash.substring(hash.indexOf('?')) : '';
    const urlParams = new URLSearchParams(hashSearch);
    if (!hasSeenTour || urlParams.get("tour") === "true") {
      setTimeout(() => setShowTour(true), 1000);
      if (urlParams.get("tour") === "true") {
        // Strip ?tour=true from the hash cleanly
        const cleanHash = hash.replace(/[?&]tour=true/, '');
        window.history.replaceState({}, "", window.location.pathname + cleanHash);
      }
    }
  }, []);

  // ── Load BibleStore once on mount ─────────────────────────────────────────
  // Loads all 66 books for KJV and Yoruba into memory. After this, every
  // keystroke lookup is synchronous — zero I/O.
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [latestRef, setLatestRef] = useState<ParsedReference | null>(null);

  useEffect(() => {
    loadBibleStore(["1", "2533"]).then(() => {
      setStoreLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setIsTransitioning(true);
    setTheme(next);
    localStorage.setItem("streambible-theme", next);
    setTimeout(() => setIsTransitioning(false), 280);
  };

  // ── Real-time preview path (synchronous) ─────────────────────────────────
  //
  // Called by SearchModule every time the incremental parser resolves a
  // reference. 
  const handleReferenceResolved = useCallback((ref: ParsedReference) => {
    setLatestRef(ref);
    // Clear any lingering error toast from a previous failed manual search
    setShowFallbackToast(false);
    setTriageReason(null);
  }, []);

  // Reactively lookup verses whenever the reference, versions, or store load state changes.
  // This ensures the preview populates instantly once background JSON fetching finishes,
  // and updates instantly if the user changes their primary/secondary version dropdowns.
  useEffect(() => {
    if (!latestRef) return;

    const verses = latestRef.verses && latestRef.verses.length > 0
      ? latestRef.verses
      : [latestRef.verse];
    const pText = getVerseRange(primaryVersion, latestRef.bookCode, latestRef.chapter, verses);
    const sText = getVerseRange(secondaryVersion, latestRef.bookCode, latestRef.chapter, verses);

    setPrimaryText(pText ?? "");
    setPrimaryRef(latestRef.canonical);
    setPrimarySource("local");

    setSecondaryText(sText ?? "");
    setSecondaryRef(latestRef.canonical);
    setSecondarySource("local");

    if (pText || sText) {
      setStatus("success");
      setStatusMsg("Ready to push");
    } else {
      setStatus("default");
      setStatusMsg("Ready");
    }
  }, [latestRef, primaryVersion, secondaryVersion, storeLoaded]);

  // ── handleClear: clears preview when the search input is emptied ──────────
  const handleClear = useCallback(() => {
    setLatestRef(null);
    setPrimaryText("");
    setPrimaryRef("");
    setSecondaryText("");
    setSecondaryRef("");
    setStatus("default");
    setStatusMsg("Ready");
    setShowFallbackToast(false);
    setTriageReason(null);
  }, []);

  // ── handleSearch: retained for Push Live path and manual lookups ──────────
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setStatus("fetching");
    setStatusMsg("Fetching…");

    const parsed = parseReference(searchQuery);
    let canonicalRef = searchQuery;
    if (parsed) {
      const bookName = getCanonicalBookName(parsed.bookCode);
      let versePart = "";
      if (parsed.verses && parsed.verses.length > 0) {
        const v = parsed.verses;
        const groups = [];
        let start = v[0], end = v[0];
        for (let i = 1; i <= v.length; i++) {
          if (i < v.length && v[i] === end + 1) { 
            end = v[i]; 
          } else {
            groups.push(start === end ? `${start}` : `${start}-${end}`);
            if (i < v.length) { start = end = v[i]; }
          }
        }
        versePart = `:${groups.join(", ")}`;
      }
      canonicalRef = `${bookName} ${parsed.chapter}${versePart}`;
    }

    try {
      let pText = "Verse not found.";
      let sText = "Verse not found.";
      const LOCAL_NATIVE_IDS = new Set(["1", "2079", "2533", "asv", "bsb", "web"]);
      let isLocalSubstitute = false;
      let pSource: "api.bible" | "local" | "nlt" = "local";
      let sSource: "api.bible" | "local" | "nlt" = "local";
      let pFums: string | undefined = undefined;
      let sFums: string | undefined = undefined;
      let overallTriage: TriageCategory = null;

      try {
        const pRes = await fetchVerse(primaryVersion, searchQuery);
        pText = pRes.text;
        pSource = pRes.source;
        pFums = pRes.fums;
        if (pRes.triageReason) overallTriage = pRes.triageReason;
        // Only flag as substitute if local served a different translation than requested
        if (pSource === "local" && !LOCAL_NATIVE_IDS.has(primaryVersion))
          isLocalSubstitute = true;
      } catch (e: unknown) {
        if (
          e instanceof Error &&
          (e.message === "Verse not found." ||
            e.message === "Unable to parse reference.")
        ) {
          overallTriage = "user_input";
        } else if (
          e instanceof Error &&
          e.message === "YouVersion fetch failed"
        ) {
          // Already handled by fetchVerse assigning triageReason, but just in case
        }
      }

      if (isLocalSubstitute) {
        setIsUsingFallback(true);
        setFallbackType("local");
        setPrimarySource("local");
        setSecondarySource("local");
        setTriageReason(overallTriage);
        setFallbackOriginalVersion(primaryVersion);
        setShowFallbackToast(true);
        // pText is already KJV from Tier 1 — no need to re-fetch
        try {
          const sRes = await fetchVerse("2079", searchQuery);
          sText = sRes.text;
          sSource = sRes.source;
          sFums = sRes.fums;
        } catch {
          /* ignore */
        }
      } else {
        try {
          const sRes = await fetchVerse(secondaryVersion, searchQuery);
          sText = sRes.text;
          sSource = sRes.source;
          sFums = sRes.fums;
          if (sRes.triageReason && !overallTriage)
            overallTriage = sRes.triageReason;

          if (sSource === "local" && !LOCAL_NATIVE_IDS.has(secondaryVersion)) {
            setIsUsingFallback(true);
            setFallbackType("local");
            setPrimarySource(pSource);
            setSecondarySource("local");
            setTriageReason(overallTriage);
            setFallbackOriginalVersion(secondaryVersion);
            setShowFallbackToast(true);
            // sText already has KJV from Tier 1, no need to re-fetch
          } else {
            setIsUsingFallback(false);
            setFallbackType(null);
            setPrimarySource(pSource);
            setSecondarySource(sSource);
            setTriageReason(overallTriage);
            setFallbackOriginalVersion(null);
            if (overallTriage) {
              setShowFallbackToast(true);
            }
          }
        } catch (e: unknown) {
          if (
            e instanceof Error &&
            (e.message === "Verse not found." ||
              e.message === "Unable to parse reference.")
          ) {
            if (!overallTriage) overallTriage = "user_input";
          }
          setTriageReason(overallTriage);
          if (overallTriage) {
            setShowFallbackToast(true);
          }
        }
      }

      setPrimaryText(pText);
      setPrimaryRef(canonicalRef);
      setPrimaryFums(pFums);

      setSecondaryText(sText);
      setSecondaryRef(canonicalRef);
      setSecondaryFums(sFums);

      // Catch-all: if nothing was retrieved, ensure the user sees a toast
      if (pText === "Verse not found." && sText === "Verse not found.") {
        setTriageReason("user_input");
        setShowFallbackToast(true);
        setStatus("success");
        setStatusMsg("Verse not found");
      } else {
        if (!overallTriage) {
          setShowFallbackToast(false);
          setTriageReason(null);
        }
        setStatus("success");
        setStatusMsg("Ready to push");
      }
    } catch {
      setStatus("error");
      setStatusMsg("Error fetching verses");
    }
  };

  // The query-watching useEffect that called handleSearch on every keystroke
  // has been removed. Real-time preview is now handled synchronously via
  // handleReferenceResolved, which is called directly by SearchModule.


  const pushLive = () => {
    const doPush = () => {
      const pVersionObj = curatedVersions.find((v) => v.id === primaryVersion);
      const sVersionObj = curatedVersions.find(
        (v) => v.id === secondaryVersion,
      );
      pushVerse({
        ref: primaryRef,
        primaryText: primaryText,
        primaryVersion: pVersionObj ? pVersionObj.abbreviation : "",
        secondaryText: secondaryText,
        secondaryVersion: sVersionObj ? sVersionObj.abbreviation : "",
        showPrimary: showPrimary,
        showSecondary: showSecondary,
        primarySource: primarySource,
        secondarySource: secondarySource,
        showVerseNumbers: showVerseNumbers,
        fums: primaryFums || secondaryFums || undefined // Provide FUMS token if either translation is API.Bible
      });
    };
    if (pushConfirmEnabled) {
      setPendingPush(() => doPush);
      setShowPushConfirm(true);
    } else {
      doPush();
    }
    setStatus("live");
    setStatusMsg("Live on stream");
    scheduleAutoClear();
  };

  // Auto-clear timer: fires after pushLive if the setting is on
  const scheduleAutoClear = () => {
    if (autoClearSeconds <= 0) return;
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
    autoClearTimerRef.current = setTimeout(() => {
      broadcastClear();
      setPrimaryText("");
      setPrimaryRef("");
      setSecondaryText("");
      setSecondaryRef("");
      setQuery("");
      setStatus("default");
      setStatusMsg("Ready");
    }, autoClearSeconds * 1000);
  };

  const clearScreen = () => {
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current);
    broadcastClear();
    setPrimaryText("");
    setPrimaryRef("");
    setSecondaryText("");
    setSecondaryRef("");
    setQuery("");
    setStatus("default");
    setStatusMsg("Ready");
  };

  const copyUrl = (
    url: string,
    type: "overlay" | "fullscreen" | "controller",
  ) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const finishTour = () => {
    setShowTour(false);
    localStorage.setItem("streambible-tour-seen", "true");
  };

  return {
    theme, toggleTheme, isTransitioning,
    externalQuery, setExternalQuery,
    handleReferenceResolved, handleClear,
    showPushConfirm, setShowPushConfirm, pendingPush, setPendingPush,
    primaryVersion, setPrimaryVersion,
    secondaryVersion, setSecondaryVersion,
    showPrimary, setShowPrimary,
    showSecondary, setShowSecondary,
    primaryText, primaryRef, primaryExpanded, setPrimaryExpanded,
    secondaryText, secondaryRef, secondaryExpanded, setSecondaryExpanded,
    status, statusMsg,
    isNetworkExpanded, setIsNetworkExpanded,
    copiedType, copyUrl,
    showFallbackToast, isUsingFallback, fallbackType, primarySource, secondarySource, triageReason, fallbackOriginalVersion,
    isMobileMenuOpen, setIsMobileMenuOpen,
    showTour, finishTour, tourSteps,
    pushLive, clearScreen,
    setlistStyle
  };
};
