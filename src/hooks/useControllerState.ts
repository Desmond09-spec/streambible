import { useState, useEffect, useRef } from "react";
import {
  parseReference,
  getCanonicalBookName,
  fetchVerse,
  curatedVersions,
  type TriageCategory,
} from "../services/bibleService";
import { useSettings } from "../context/SettingsContext";
import { useSession } from "../context/SessionContext";

export const useControllerState = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [query, setQuery] = useState("");

  const { pushVerse, broadcastClear } = useSession();

  const [showPushConfirm, setShowPushConfirm] = useState(false);
  const [pendingPush, setPendingPush] = useState<(() => void) | null>(null);

  const {
    debounceEnabled,
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
    const urlParams = new URLSearchParams(window.location.search);
    if (!hasSeenTour || urlParams.get("tour") === "true") {
      setTimeout(() => setShowTour(true), 1000); // Small delay to let UI load
      if (urlParams.get("tour") === "true") {
        urlParams.delete("tour");
        const newUrl = urlParams.toString()
          ? `${window.location.pathname}?${urlParams.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setIsTransitioning(true);
    setTheme(next);
    localStorage.setItem("streambible-theme", next);
    setTimeout(() => setIsTransitioning(false), 280);
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setStatus("fetching");
    setStatusMsg("Fetching…");

    const parsed = parseReference(searchQuery);
    let canonicalRef = searchQuery;
    if (parsed) {
      const bookName = getCanonicalBookName(parsed.bookCode);
      const versePart = parsed.verseStart
        ? `:${parsed.verseStart}${parsed.verseEnd && parsed.verseEnd !== parsed.verseStart ? `-${parsed.verseEnd}` : ""}`
        : "";
      canonicalRef = `${bookName} ${parsed.chapter}${versePart}`;
    }

    try {
      let pText = "Verse not found.";
      let sText = "Verse not found.";
      const LOCAL_NATIVE_IDS = new Set(["1", "2079", "2533"]);
      let isLocalSubstitute = false;
      let pSource: "api.bible" | "local" | "nlt" = "local";
      let sSource: "api.bible" | "local" | "nlt" = "local";
      let overallTriage: TriageCategory = null;

      try {
        const pRes = await fetchVerse(primaryVersion, searchQuery);
        pText = pRes.text;
        pSource = pRes.source;
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
        setTimeout(() => setShowFallbackToast(false), 5000);
        // pText is already KJV from Tier 1 — no need to re-fetch
        try {
          const sRes = await fetchVerse("2079", searchQuery);
          sText = sRes.text;
          sSource = sRes.source;
        } catch {
          /* ignore */
        }
      } else {
        try {
          const sRes = await fetchVerse(secondaryVersion, searchQuery);
          sText = sRes.text;
          sSource = sRes.source;
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
            setTimeout(() => setShowFallbackToast(false), 5000);
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
              setTimeout(() => setShowFallbackToast(false), 5000);
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
            setTimeout(() => setShowFallbackToast(false), 5000);
          }
        }
      }

      setPrimaryText(pText);
      setPrimaryRef(canonicalRef);

      setSecondaryText(sText);
      setSecondaryRef(canonicalRef);

      // Catch-all: if nothing was retrieved, ensure the user sees a toast
      if (pText === "Verse not found." && sText === "Verse not found.") {
        setTriageReason("user_input");
        setShowFallbackToast(true);
        setTimeout(() => setShowFallbackToast(false), 5000);
        setStatus("success");
        setStatusMsg("Verse not found");
      } else {
        setStatus("success");
        setStatusMsg("Ready to push");
      }
    } catch {
      setStatus("error");
      setStatusMsg("Error fetching verses");
    }
  };

  useEffect(() => {
    if (!query.trim()) return;
    const delay = debounceEnabled ? 900 : 0;
    const timerId = setTimeout(() => handleSearch(query), delay);
    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, primaryVersion, secondaryVersion]);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

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
    query, setQuery, onFormSubmit,
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
