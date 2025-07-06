const PLAYTIME_KEY = "persistentPlaytime";

let totalPlaytime = parseInt(localStorage.getItem(PLAYTIME_KEY)) || 0;
let sessionStart = Date.now();

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
    const days = Math.floor((totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    let parts = [];

    if (weeks > 0) parts.push(`${weeks}w`);
    if (weeks > 0 || days > 0) parts.push(`${days}d`);
    if (weeks > 0 || days > 0 || hours > 0) parts.push(`${hours}h`);
    if (weeks > 0 || days > 0 || hours > 0 || minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(" ");
}

function updatePlaytimeDisplay() {
    const now = Date.now();
    const elapsed = totalPlaytime + (now - sessionStart);
    getID("playtime").textContent = formatTime(elapsed);
}

setInterval(updatePlaytimeDisplay, 1000);

window.addEventListener("beforeunload", () => {
    const now = Date.now();
    const elapsed = now - sessionStart;
    localStorage.setItem(PLAYTIME_KEY, (totalPlaytime + elapsed).toString());
});