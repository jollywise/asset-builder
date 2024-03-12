"use strict";

import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import { build, checkFFMpeg, checkSpine, checkTiled } from "./builder";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  if (isDevelopment) {
    // window.webContents.openDevTools();
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true,
      })
    );
  }

  ipcMain.on("drop", (e, folder) => {
    build(folder, window.webContents);
  });

  window.webContents.on("did-finish-load", () => {
    checkFFMpeg().then((result) => {
      window.webContents.send("ffmpeg", result);
    });
    window.webContents.send("spine", checkSpine());
    window.webContents.send("tiled", checkTiled());
  });

  window.on("closed", () => {
    mainWindow = null;
  });

  return window;
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on("ready", () => {
  mainWindow = createMainWindow();
});
