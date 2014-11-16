document.getElementById("btn-launch").onclick = launchApp;
document.getElementById("btn-stop").onclick = stopApp;
document.getElementById("playpauseresume").onclick = playMedia;
document.getElementById("btn-load").onclick = function() { loadMedia(3); };
document.getElementById("btn-stopm").onclick = stopMedia;
document.getElementById("btn-mute").onclick = function() {muteMedia(this); };
document.getElementById("btn-join").onclick = function() {autoJoin(this.value)};