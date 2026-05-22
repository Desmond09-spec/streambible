import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electron", { saveFile: (e, n) => t.invoke("dialog:saveFile", e, n) });
//#endregion
