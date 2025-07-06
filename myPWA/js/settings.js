// settings listener!!
getID("autosaveToggle").addEventListener("change", (e) => {
    gameSettings.autosave = e.target.checked;
});

getID("notationSelect").addEventListener("change", (e) => {
    gameSettings.notation = e.target.value;
    // updateNotationStyle();
});

// theme loading
const savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(`theme-${savedTheme}`);
getID("themeSelect").value = savedTheme;

getID("themeSelect").addEventListener("change", (e) => {
    const theme = e.target.value;
    document.body.className = ""; // clear themes
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
});

// save encryption
function getEncryptedSaveData() {
    const saveData = {
        achievements,
        masteryValue,
        weightValue,
        letterUpgrades,
        spentScrews,
        chapter,
        greenProgress,
        keyDrought,
        timestamp: Date.now(),
        achievementTabEnabled,
        collectionTabEnabled,
        masteryTabEnabled,
        chapterTabEnabled,
        canType
    };

    let json = JSON.stringify(saveData);
    let encoded = btoa(json);
    let reversed = encoded.split('').reverse().join('');
    return reversed;
}

// export save
function exportSaveToClipboard() {
    const saveString = getEncryptedSaveData();
    localStorage.setItem("exportedSave", saveString);

    navigator.clipboard.writeText(saveString)
        .then(() => alert("Save copied to clipboard and stored in localStorage!"))
        .catch(err => alert("Clipboard copy failed: " + err));
}
getID("exportSave").addEventListener("click", exportSaveToClipboard);

function exportSaveToFile() {
    const blob = new Blob([getEncryptedSaveData()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monkey_save.txt';
    a.click();
    URL.revokeObjectURL(url);
}
getID("customSave").addEventListener("click", exportSaveToFile);

// import save
getID("importSave").addEventListener("click", () => {
    const save = prompt("Paste your save here:");
    if (!save) return;

    try {
        const reversed = save.split('').reverse().join('');
        const json = atob(reversed);
        const decoded = JSON.parse(json);

        loadGame(decoded);
        alert("Save imported!");
        location.reload();
    } catch {
        alert("Invalid save.");
    }
});

// cloud save placeholder
getID("cloudSave").addEventListener("click", () => {
    alert("Cloud saving not implemented yet.");
});

// reset
getID("resetGame").addEventListener("click", () => {
    const confirmation = prompt("Type RESET to permanently delete all progress.\nThis cannot be undone.");
    if (confirmation === "RESET") {
        if (typeof autosaveIntervalID !== "undefined") clearInterval(autosaveIntervalID);
        localStorage.clear();
        location.reload();
    } else if (confirmation !== null) {
        alert("Reset cancelled. You did not type RESET exactly.");
    }
});

// load game
function loadGame(save) {
    if (!save) return;

    console.log("Loading save:", save);

    if (Array.isArray(save.masteryValue)) {
        for (let i = 0; i < masteryOrder.length; i++) {
            masteryValue[i] = save.masteryValue[i] ?? 0;
        }
    }

    if (Array.isArray(save.weightValue)) {
        if (!weightValue || weightValue.length < save.weightValue.length) {
            weightValue = new Array(save.weightValue.length).fill(0);
        }
        for (let i = 0; i < save.weightValue.length; i++) {
            weightValue[i] = save.weightValue[i] ?? 0;
        }
    }

    if (save.letterUpgrades) {
        for (let char of Object.keys(letterUpgrades)) {
            if (save.letterUpgrades[char]) {
                letterUpgrades[char].letterMultiplier.level = save.letterUpgrades[char].letterMultiplier?.level ?? 0;
                letterUpgrades[char].triplePressChance.level = save.letterUpgrades[char].triplePressChance?.level ?? 0;
            }
        }
    }

    if (save.spentScrews) {
        for (let char of Object.keys(spentScrews)) {
            spentScrews[char] = save.spentScrews[char] ?? 0;
        }
    }

    if (Array.isArray(save.achievements)) {
        achievements = [];
        for (const id of save.achievements) {
            unlockAchievement(id);
        }
    }


    chapter = save.chapter ?? 1;
    if (chapterDisplay) chapterDisplay.textContent = `Chapter ${chapter}`;

    if (save.greenProgress) {
        for (let key of Object.keys(greenProgress)) {
            greenProgress[key] = save.greenProgress[key] ?? 1;
        }
    }

    if (save.keyDrought) {
        for (let key of Object.keys(keyDrought)) {
            keyDrought[key] = save.keyDrought[key] ?? 0;
        }
    }

    achievementTabEnabled = save.achievementTabEnabled ?? achievementTabEnabled;
    collectionTabEnabled = save.collectionTabEnabled ?? collectionTabEnabled;
    masteryTabEnabled = save.masteryTabEnabled ?? masteryTabEnabled;
    chapterTabEnabled = save.chapterTabEnabled ?? chapterTabEnabled;
    canType = save.canType ?? canType;

    if (achievementTabEnabled) unlockTab("achievement", "Achievements", "award");
    if (masteryTabEnabled) unlockTab("mastery", "Masteries", "trophy");
    if (collectionTabEnabled) unlockTab("collection", "Collections", "collection");
    if (chapterTabEnabled) unlockTab("chapter", "Chapters", "book-open");
    if (canType) showPopup("feature", "Feature Unlocked: Monkey Control");

    updateMasteryUI();
    updateMasteryProgress();
}

// auto save + sync
const AUTO_SAVE_INTERVAL = 500;
let autosaveIntervalID = setInterval(autoSaveGame, AUTO_SAVE_INTERVAL);

function autoSaveGame() {
    const saveString = getEncryptedSaveData();
    localStorage.setItem("autoSave", saveString);
    console.log("Game auto-saved");
}

function loadFromAutoSave() {
    const saveString = localStorage.getItem("autoSave");
    if (!saveString) return;

    try {
        const reversed = saveString.split('').reverse().join('');
        const json = atob(reversed);
        const decoded = JSON.parse(json);

        loadGame(decoded);
        console.log("Game synced from autosave");
    } catch (e) {
        console.error("Failed to load autosave:", e);
    }
}

window.addEventListener("storage", (event) => {
    if (event.key === "autoSave" && event.newValue) {
        loadFromAutoSave();
    }
});

window.addEventListener("load", () => {
    loadFromAutoSave();
    startAutoMonkey();
    renderKeyboard();
    attachCustomKeyboardTooltips();
    updateMasteryUI();
});
