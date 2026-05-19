import { contextBridge, ipcRenderer } from "electron";
//#region electron/preload.ts
contextBridge.exposeInMainWorld("electron", { saveFile: (content, filename) => ipcRenderer.invoke("dialog:saveFile", content, filename) });
//#endregion
