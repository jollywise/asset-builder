const { ipcRenderer } = require("electron");
const packageJson = require("../../package.json");

ipcRenderer.on("error", (payload) => {
  document.getElementById("project_error").style.display = "block";
});
ipcRenderer.on("processing", (payload) => {
  document.getElementById("project_output").innerHTML = "";
});
ipcRenderer.on("success", (payload) => {
  document.getElementById("project_stage").innerHTML =
    "<span style='color: green'>Current state: complete!</span>";
});
ipcRenderer.on("stdout", (event, payload) => {
  document.getElementById("project_output").innerHTML =
    payload + "<br />" + document.getElementById("project_output").innerHTML;
});
ipcRenderer.on("stderr", (event, payload) => {
  document.getElementById("project_output").innerHTML =
    payload + "<br />" + document.getElementById("project_output").innerHTML;
});
ipcRenderer.on("stage", (event, payload) => {
  document.getElementById("project_stage").innerHTML =
    "Current state: " + payload;
});
ipcRenderer.on("ffmpeg", (event, payload) => {
  if (!payload) {
    document.getElementById("project_capabilities_ffmpeg").innerHTML +=
      "FFMpeg is not installed. Processing will be skipped for audiosprites and music.<br />";
  }
});
ipcRenderer.on("spine", (event, payload) => {
  if (!payload) {
    document.getElementById("project_capabilities_spine").innerHTML +=
      "Spine is not installed. Processing will be skipped for spine files.<br />";
  }
});
ipcRenderer.on("tiled", (event, payload) => {
  if (!payload) {
    document.getElementById("project_capabilities_tiled").innerHTML +=
      "Tiled is not installed. Processing will be skipped for tiled files.<br />";
  }
});

document.getElementById("app").innerHTML =
  '<div style="display: flex; flex-direction: column; height: 100%"><h1>Asset Builder v' +
  packageJson.version +
  '</h1> \
  <div style="display: none; margin-top: 10px; color: red" id="update_asset_builder">Please update to the latest version of Asset Builder (v<span id="update_asset_builder_v"></span>).</div> \
  <div style="margin-top: 10px;" id="project_stage">Current state: waiting...</div> \
<div style="margin-top: 10px" id="missing_externals"></div> \
<div style="margin-top: 10px" id="project_initial">Please drag and drop a project folder here to process the assets.</div> \
<div style="display: none; margin-top: 10px; color: red" id="project_error">Please make sure you drag the project folder, which should contain folders such as <pre style="display: inline">assets_src</pre> and <pre style="display: inline">src</pre>.</div> \
<div style="margin-top: 10px; overflow-y: auto; flex-grow: 1;" id="project_output"></div>';

document.addEventListener("drop", (event) => {
  event.preventDefault();
  event.stopPropagation();

  document.getElementById("project_initial").style.display = "none";
  if (event.dataTransfer.files.length != 1) {
    document.getElementById("project_error").style.display = "block";
  } else {
    document.getElementById("project_error").style.display = "none";
    ipcRenderer.send("drop", event.dataTransfer.files[0].path);
  }
});

document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener("dragenter", (event) => {
  // console.log("File is in the Drop Space");
});

document.addEventListener("dragleave", (event) => {
  // console.log("File has left the Drop Space");
});

document.getElementById("app").style.height = "500px";

fetch(
  "https://api.github.com/repos/jollywise/asset-builder/git/matching-refs/tags"
).then((response) => {
  response.json().then((data) => {
    if (data.length > 0) {
      const version = data[data.length - 1].ref.replace("refs/tags/", "");
      if (version !== packageJson.version) {
        document.getElementById("update_asset_builder").style.display = "block";
        document.getElementById("update_asset_builder_v").innerHTML = version;
      }
    }
  });
});

import "./styles.css";
