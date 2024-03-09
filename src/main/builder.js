const path = require("path");
const fs = require("fs");
const { cosmiconfigSync } = require("cosmiconfig");
const { processors } = require("@jollywise/jollygoodgame-assets");

let processing = false;

export const detectFFMpeg = async () => {
  return new Promise((resolve) => {
    require("child_process")
      .spawn("ffmpeg", ["-v"])
      .on("exit", function (code, signal) {
        resolve(true);
      })
      .on("error", function (e) {
        resolve(false);
      });
  });
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
    const ffmpegExists = await detectFFMpeg();
    if (ffmpegExists) {
      await runScript(folder, "music", ipcMain);
    }
    await runScript(folder, "vo", ipcMain);
    if (ffmpegExists) {
      await runScript(folder, "audiosprites", ipcMain);
    }
    await runScript(folder, "spritesheets", ipcMain);
    await runScript(folder, "exportspines", ipcMain);
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
