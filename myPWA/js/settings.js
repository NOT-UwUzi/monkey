getID("autosaveToggle").addEventListener("change", (e) => {
    gameSettings.autosave = e.target.checked;
});

getID("notationSelect").addEventListener("change", (e) => {
    gameSettings.notation = e.target.value;
    // updateNotationStyle();
});

// load last saved theme yay
const savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(`theme-${savedTheme}`);
getID("themeSelect").value = savedTheme;

getID("themeSelect").addEventListener("change", (e) => {
    const theme = e.target.value;
    document.body.className = ""; // Clear all
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
});

// saves
function getEncryptedSaveData() {
    const saveData = {
        masteryValue,
        letterUpgrades,
        spentScrews,
        chapter,
        achievementFlags: { typedLetter },
        timestamp: Date.now()
    };

    let json = JSON.stringify(saveData);
    let encoded = btoa(json);
    let reversed = encoded.split('').reverse().join('');
    return reversed;
}

//
function exportSaveToClipboard() {
    navigator.clipboard.writeText(getEncryptedSaveData())
        .then(() => alert("Save copied to clipboard!"))
        .catch(err => alert("Failed to copy save: " + err));
}

getID("exportSave").addEventListener("click", exportSaveToClipboard);

//
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

//
getID("importSave").addEventListener("click", () => {
    const save = prompt("Paste your save here:");
    if (!save) return;

    try {
        const reversed = save.split('').reverse().join('');
        const json = atob(reversed);
        const decoded = JSON.parse(json);

        loadGame(decoded);
        alert("Save imported!");
    } catch {
        alert("Invalid save.");
    }
});

//
getID("cloudSave").addEventListener("click", () => {
    alert("Cloud saving not implemented yet.");
});

// const cloudSaveButton = getID("cloudSave");
// const cloudLoadButton = getID("cloudLoad");
// cloudSaveButton.disabled = true;
// cloudLoadButton.disabled = true;

// // google stuff
// window.handleGoogleLogin = function (response) {
//     const credential = response.credential;
//     const payload = JSON.parse(atob(credential.split('.')[1]));

//     alert(`Welcome, ${payload.name}!`);

//     // Save user info
//     localStorage.setItem("userEmail", payload.email);
//     localStorage.setItem("userName", payload.name);

//     cloudSaveButton.disabled = false;
//     cloudLoadButton.disabled = false;
//     document.querySelector('.g_id_signin').style.display = "none";

// };

// cloudSaveButton.addEventListener("click", () => {
//     const saveData = {
//         masteryValue,
//         letterUpgrades,
//         spentScrews,
//         chapter,
//         achievementFlags: { typedLetter },
//         timestamp: Date.now()
//     };

//     const userEmail = localStorage.getItem("userEmail");
//     if (!userEmail) {
//         alert("Please log in to use cloud save.");
//         return;
//     }

//     const encoded = btoa(JSON.stringify(saveData));
//     localStorage.setItem("cloudSave:" + userEmail, encoded);
//     alert("Game saved to the cloud!");
// });

// // cloud Load
// cloudLoadButton.addEventListener("click", () => {
//     const userEmail = localStorage.getItem("userEmail");
//     if (!userEmail) {
//         alert("Please log in first.");
//         return;
//     }

//     const encoded = localStorage.getItem("cloudSave:" + userEmail);
//     if (!encoded) {
//         alert("No cloud save found.");
//         return;
//     }

//     try {
//         const save = JSON.parse(atob(encoded));
//         loadGame(save);
//         alert("Cloud save loaded!");
//     } catch (e) {
//         alert("Failed to load cloud save.");
//     }
// });

//
getID("resetGame").addEventListener("click", () => {
    const confirmation = prompt("Type RESET to permanently delete all progress.\nThis cannot be undone.");
    if (confirmation === "RESET") {
        localStorage.clear();
        location.reload();
    } else if (confirmation !== null) {
        alert("Reset cancelled. You did not type RESET exactly.");
    }
});
//

function loadGame(save) {
    if (!save) return;

    // mastery
    if (Array.isArray(save.masteryValue)) {
        for (let i = 0; i < masteryOrder.length; i++) {
            masteryValue[i] = save.masteryValue[i] || 0;
        }
    }

    // letter upgrades
    if (save.letterUpgrades) {
        for (let char of Object.keys(letterUpgrades)) {
            if (save.letterUpgrades[char]) {
                letterUpgrades[char].letterMultiplier.level = save.letterUpgrades[char].letterMultiplier?.level || 0;
                letterUpgrades[char].triplePressChance.level = save.letterUpgrades[char].triplePressChance?.level || 0;
            }
        }
    }

    // screws spent
    if (save.spentScrews) {
        for (let char of Object.keys(spentScrews)) {
            spentScrews[char] = save.spentScrews[char] || 0;
        }
    }

    // chapter progression
    chapter = save.chapter || 1;
    if (chapterDisplay) chapterDisplay.textContent = `Chapter ${chapter}`;

    // other flags or unlocked tabs
    achievementTabEnabled = save.achievementTabEnabled ?? achievementTabEnabled;
    collectionTabEnabled = save.collectionTabEnabled ?? collectionTabEnabled;
    masteryTabEnabled = save.masteryTabEnabled ?? masteryTabEnabled;
    chapterTabEnabled = save.chapterTabEnabled ?? chapterTabEnabled;

    // green progress
    if (save.greenProgress) {
        for (let key of Object.keys(greenProgress)) {
            greenProgress[key] = save.greenProgress[key] || 1;
        }
    }

    // UI update
    updateMasteryUI();
    updateMasteryProgress();
}
