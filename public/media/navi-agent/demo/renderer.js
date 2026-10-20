"use strict";
const KIND_COLOR = {
    urgent: "#ff3b30",
    warning: "#ffd60a",
    success: "#34c759",
};
const IDLE_COLOR = "#9ecfff";
const RESET_MS = 6000;
const SPARK_MS = 300;
const DRIFT_X = 30;
const DRIFT_Y = 24;
const DRIFT_MS = 5200;
const drift = document.getElementById("drift");
const fairy = document.getElementById("fairy");
const bubble = document.getElementById("bubble");
const bubbleTitle = document.getElementById("bubble-title");
const bubbleMessage = document.getElementById("bubble-message");
let resetTimer;
/** Flashes the fairy to the notification color, shows the bubble, rings. */
function showNotification(n) {
    document.documentElement.style.setProperty("--navi-color", KIND_COLOR[n.kind]);
    fairy.classList.remove("alert-urgent", "alert-warning", "alert-success");
    fairy.classList.add(`alert-${n.kind}`);
    bubbleTitle.textContent = n.title ?? "";
    bubbleTitle.style.display = n.title ? "block" : "none";
    bubbleMessage.textContent = n.message;
    bubble.classList.remove("hidden");
    playChime(n.kind);
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(resetToIdle, RESET_MS);
}
/** Returns the fairy to her idle glow and hides the bubble. */
function resetToIdle() {
    document.documentElement.style.setProperty("--navi-color", IDLE_COLOR);
    fairy.classList.remove("alert-urgent", "alert-warning", "alert-success");
    bubble.classList.add("hidden");
}
/** Spawns one fading spark near the fairy's current position. */
function spawnSpark() {
    const rect = fairy.getBoundingClientRect();
    const spark = document.createElement("div");
    spark.className = "spark";
    spark.style.left = `${rect.left + rect.width / 2 + (Math.random() * 44 - 22)}px`;
    spark.style.top = `${rect.top + rect.height / 2 + (Math.random() * 30 - 8)}px`;
    spark.addEventListener("animationend", () => spark.remove());
    document.body.appendChild(spark);
}
/** Sends the fairy floating toward a new random offset in her corner. */
function driftStep() {
    const x = (Math.random() * 2 - 1) * DRIFT_X;
    const y = (Math.random() * 2 - 1) * DRIFT_Y;
    drift.style.transform = `translate(${x}px, ${y}px)`;
}
window.navi.onNotify(showNotification);
window.setInterval(spawnSpark, SPARK_MS);
window.setInterval(driftStep, DRIFT_MS);
driftStep();
