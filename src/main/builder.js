const path = require("path");
const fs = require("fs");
const { cosmiconfigSync } = require("cosmiconfig");
const {
  processors,
  detectFFMpeg,
  getSpineLocation,
  getTiledLocation,
} = require("@jollywise/jollygoodgame-assets");

let processing = false;

export const checkFFMpeg = async () => {
  return await detectFFMpeg();
};

export const checkSpine = () => {
  return !!getSpineLocation();
};

export const checkTiled = () => {
  return !!getTiledLocation();
};

export const build = async (folder, ipcMain) => {
  if (processing) return;
  if (!fs.lstatSync(folder).isDirectory()) {
    ipcMain.send("error");
  } else if (
    !fs.existsSync(path.join(folder, "assets_src")) ||
    !fs.existsSync(path.join(folder, "src"))
  ) {
    ipcMain.send("error");
  } else {
    ipcMain.send("processing");
    processing = true;

    await runScript(folder, "staticfiles", ipcMain);
    await runScript(folder, "fonts", ipcMain);
    const tiledExists = getTiledLocation();
    if (tiledExists) {
      await runScript(folder, "exporttiled");
    }
    const ffmpegExists = await detectFFMpeg();
    if (ffmpegExists) {
      await runScript(folder, "music", ipcMain);
    }
    await runScript(folder, "vo", ipcMain);
    if (ffmpegExists) {
      await runScript(folder, "audiosprites", ipcMain);
    }
    await runScript(folder, "spritesheets", ipcMain);
    const spineLocation = getSpineLocation();
    if (spineLocation) {
      await runScript(folder, "exportspines", ipcMain);
    }
    await runScript(folder, "compressImages", ipcMain);

    ipcMain.send("success");
    processing = false;
  }
};

const runScript = (cwd, action, ipcMain) => {
  const cons = {
    log: (...data) => {
      ipcMain.send("stdout", "" + data.join(" "));
    },
    error: (...data) => {
      ipcMain.send("stderr", "" + data.join(" "));
    },
  };

  const cosmiconfig = cosmiconfigSync(action).load(
    path.join(cwd, "package.json")
  );
  const config = cosmiconfig ? cosmiconfig.config || {} : {};
  config.rootDirectory = cwd;
  return new Promise((resolve) => {
    ipcMain.send("stage", action);
    processors[action].process(config, cons).then(resolve);
  });
};
