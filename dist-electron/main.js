import { BrowserWindow as e, app as t, dialog as n, ipcMain as r } from "electron";
import { dirname as i, join as a } from "node:path";
import { fileURLToPath as o } from "node:url";
//#region electron/main.ts
var s = i(o(import.meta.url));
r.handle("dialog:saveFile", async (e, t, r) => {
	let { canceled: i, filePath: a } = await n.showSaveDialog({
		title: "Save Setlist",
		defaultPath: r,
		filters: [{
			name: "JSON Files",
			extensions: ["json"]
		}]
	});
	if (!i && a) {
		let e = await import("node:fs/promises");
		try {
			return await e.writeFile(a, t, "utf-8"), {
				success: !0,
				filePath: a
			};
		} catch (e) {
			return {
				success: !1,
				error: e instanceof Error ? e.message : String(e)
			};
		}
	}
	return {
		success: !1,
		error: "User canceled"
	};
}), process.env.DIST = a(s, "../dist"), process.env.VITE_PUBLIC = t.isPackaged ? process.env.DIST : a(process.env.DIST, "../public");
var c = process.env.VITE_DEV_SERVER_URL, l = a(process.env.VITE_PUBLIC || "", "build.png"), u, d;
function f() {
	d = new e({
		width: 480,
		height: 300,
		transparent: !1,
		frame: !1,
		resizable: !1,
		alwaysOnTop: !0,
		center: !0,
		icon: l,
		webPreferences: {
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), d.loadURL("data:text/html;charset=utf-8,%0A%20%20%20%20%3C!DOCTYPE%20html%3E%0A%20%20%20%20%3Chtml%3E%0A%20%20%20%20%20%20%3Chead%3E%0A%20%20%20%20%20%20%20%20%3Cmeta%20charset%3D%22UTF-8%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstyle%3E%0A%20%20%20%20%20%20%20%20%20%20*%20%7B%20margin%3A%200%3B%20padding%3A%200%3B%20box-sizing%3A%20border-box%3B%20%7D%0A%20%20%20%20%20%20%20%20%20%20body%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20width%3A%20480px%3B%20height%3A%20300px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20linear-gradient(160deg%2C%20%230A84FF%200%25%2C%20%23003d99%20100%25)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20display%3A%20flex%3B%20flex-direction%3A%20column%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20align-items%3A%20center%3B%20justify-content%3A%20center%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-family%3A%20-apple-system%2C%20BlinkMacSystemFont%2C%20'Inter'%2C%20'Segoe%20UI'%2C%20sans-serif%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20-webkit-font-smoothing%3A%20antialiased%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20.icon%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin-bottom%3A%2018px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20opacity%3A%200.95%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20svg%20%7B%20width%3A%2048px%3B%20height%3A%2048px%3B%20%7D%0A%20%20%20%20%20%20%20%20%20%20h1%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20%23ffffff%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-size%3A%2032px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-weight%3A%20700%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20letter-spacing%3A%20-0.5px%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20p%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20color%3A%20rgba(255%2C255%2C255%2C0.55)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20font-size%3A%2013px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin-top%3A%208px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20letter-spacing%3A%200.2px%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20.dot%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20display%3A%20inline-block%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20width%3A%206px%3B%20height%3A%206px%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20border-radius%3A%2050%25%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20background%3A%20rgba(255%2C255%2C255%2C0.6)%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20animation%3A%20pulse%201.2s%20ease-in-out%20infinite%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20margin%3A%2020px%203px%200%3B%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20.dot%3Anth-child(2)%20%7B%20animation-delay%3A%200.2s%3B%20%7D%0A%20%20%20%20%20%20%20%20%20%20.dot%3Anth-child(3)%20%7B%20animation-delay%3A%200.4s%3B%20%7D%0A%20%20%20%20%20%20%20%20%20%20%40keyframes%20pulse%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%200%25%2C%20100%25%20%7B%20opacity%3A%200.3%3B%20transform%3A%20scale(0.8)%3B%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%2050%25%20%7B%20opacity%3A%201%3B%20transform%3A%20scale(1)%3B%20%7D%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%3C%2Fstyle%3E%0A%20%20%20%20%20%20%3C%2Fhead%3E%0A%20%20%20%20%20%20%3Cbody%3E%0A%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%22icon%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Csvg%20viewBox%3D%220%200%2048%2048%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Crect%20x%3D%227%22%20y%3D%224%22%20width%3D%2234%22%20height%3D%2240%22%20rx%3D%224%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M14%2014h20M14%2022h20M14%2030h14%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0A%20%20%20%20%20%20%20%20%3Ch1%3EStreamBible%3C%2Fh1%3E%0A%20%20%20%20%20%20%20%20%3Cp%3ELoading%20your%20broadcast%20environment%E2%80%A6%3C%2Fp%3E%0A%20%20%20%20%20%20%20%20%3Cdiv%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%22dot%22%3E%3C%2Fspan%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%22dot%22%3E%3C%2Fspan%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cspan%20class%3D%22dot%22%3E%3C%2Fspan%3E%0A%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%0A%20%20%20%20%20%20%3C%2Fbody%3E%0A%20%20%20%20%3C%2Fhtml%3E%0A%20%20");
}
function p() {
	u = new e({
		width: 1280,
		height: 800,
		show: !1,
		title: "StreamBible",
		icon: l,
		webPreferences: {
			preload: a(s, "preload.mjs"),
			nodeIntegration: !1,
			contextIsolation: !0
		}
	}), u.setMenu(null), c ? u.loadURL(c) : u.loadFile(a(process.env.DIST || "", "index.html")), u.once("ready-to-show", () => {
		d && !d.isDestroyed() && (d.destroy(), d = null), u?.show();
	});
}
t.on("window-all-closed", () => {
	process.platform !== "darwin" && (t.quit(), u = null);
}), t.whenReady().then(() => {
	f(), p();
});
//#endregion
