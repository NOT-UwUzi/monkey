document.getElementById("autosaveToggle").addEventListener("change", (e) => {
    gameSettings.autosave = e.target.checked;
});

document.getElementById("notationSelect").addEventListener("change", (e) => {
    gameSettings.notation = e.target.value;
    // updateNotationStyle();
});

// load last saved theme yay
const savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(`theme-${savedTheme}`);
document.getElementById("themeSelect").value = savedTheme;

document.getElementById("themeSelect").addEventListener("change", (e) => {
    const theme = e.target.value;
    document.body.className = ""; // Clear all
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
});

// saves
document.getElementById("importSave").addEventListener("click", () => {
    const save = prompt("Paste your save here:");
    if (!save) return;
    try {
        const decoded = JSON.parse(atob(save));
        loadGame(decoded);
        alert("Save imported!");
    } catch {
        alert("Invalid save.");
    }
});

document.getElementById("customSave").addEventListener("click", () => {
    const blob = new Blob([btoa(JSON.stringify(gameState))], {type: "text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "monkey-save.txt";
    a.click();
});

document.getElementById("cloudSave").addEventListener("click", () => {
    alert("Cloud saving not implemented yet.");
});

document.getElementById("resetGame").addEventListener("click", () => {
    const confirmation = prompt("Type RESET to permanently delete all progress.\nThis cannot be undone.");
    if (confirmation === "RESET") {
        localStorage.clear();
        location.reload();
    } else if (confirmation !== null) {
        alert("Reset cancelled. You did not type RESET exactly.");
    }
});
