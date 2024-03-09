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
  if (payload) {
    document.getElementById("project_capabilities").innerHTML =
      "FFMpeg is installed.";
  } else {
    document.getElementById("project_capabilities").innerHTML =
      "FFMpeg is NOT installed. Processing will be skipped for audiosprites and music.<br />Please install by running <pre>winget install ffmpeg</pre> in a terminal window.";
  }
});

document.getElementById("app").innerHTML =
  '<div style="display: flex; flex-direction: column; height: 100%"><h1>Asset Builder v' +
  packageJson.version +
  '</h1> \
<div style="margin-top: 10px; " id="project_stage">Current state: waiting...</div> \
<div style="margin-top: 10px" id="project_capabilities"></div> \
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

import "./styles.css";
