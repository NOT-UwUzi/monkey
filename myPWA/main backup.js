function getID(X) {
    return document.getElementById(X);
}

function safeKeyId(key) {
    return `key-${key.replace(/[^a-zA-Z0-9]/g, ch => ch.charCodeAt(0))}`;
}

// achievement list
const achievementData = {
"01": {
    name: "A lucky start?",
    condition: "Press the key as the monkey.",
    reward: "Unlocks Achievements"
},
"02": {
    name: "Master of one, Jack of none",
    condition: "Master A",
    reward: ""
},
"03": {
    name: "A screw.",
    condition: "Get the first A screw",
    reward: ""
},
"04": {
    name: "Mi, a name I call myself",
    condition: "Master E",
    reward: ""
},
"05": {
    name: "Just One Letter? Pathetic.",
    condition: "Finish the first letter.",
    reward: ""
},
"06": {
    name: "U are screwed",
    condition: "Get the first U screw.",
    reward: ""
},
"07": {
    name: "Buffed Vowels",
    condition: "Upgrade every single vowel.",
    reward: "Automonkeys work 0.5% faster."
},
"08": {
    name: "Prestigious Monkey",
    condition: "Prestige for the first time.",
    reward: ""
},
"09": {
    name: "A Healthy Sleep Schedule",
    condition: "Be offline for a period of 10 hours",
    reward: "+5% Offline rewards."
},
"10": {
    name: "This isn’t a river, is it?",
    condition: "Unlock overflow",
    reward: ""
},
"11": {
    name: "Overflew the Target!",
    condition: "Get 500 overflow letters.",
    reward: ""
},
"12": {
    name: "Double trouble",
    condition: "Master D",
    reward: ""
},
"13": {
    name: "But I rather not",
    condition: "Prestige without utilising double points upgrade.",
    reward: ""
},
"14": {
    name: "Screws!",
    condition: "Get 500 total screws.",
    reward: ""
},
"15": {
    name: "Papers Please",
    condition: "Get 1cm² of paper.",
    reward: ""
},
"16": {
    name: "Truly overflowing",
    condition: "Have 500 points.",
    reward: ""
},
"17": {
    name: "The First Challenge",
    condition: "Unlock CA10A.",
    reward: ""
},
"18": {
    name: "That wasn’t challenging…",
    condition: "Finish CA10A.",
    reward: ""
}};

// mastery
const masteryMilestones = [50, 200, 500, 1000, 5000, 12000, 30000, 100000, 150000, 200000, 275000, 350000, 500000, 600000, 700000, 850000, 1000000];
const screwsPerMilestone = [0, 1, 2, 5, 10, 50, 100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3000, 0];
const masteryList = document.getElementById("mastery-list");

// sidebar
const sidebar = getID("sidebar");
const sidebarContainer = getID("sidebarContainer");
const sidebarLock = getID("sidebarlock");
const sidebarLockIcon = getID("sidebarlockicon");
const tooltip = getID("tooltip");
let hoveredKey = null;
let pinned = false;

// lettergeneration
const maxWeights = {};
["a","e","i","o","u","l","n","r","s","t",
"d","g",
"b","c","m","p",
"f","h","v","w","y",
"k",
"j","x",
"q","z"].forEach(letter => maxWeights[letter] = 100);
const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];
const masteryOrder = [..."aeioulnrstdgbcmpfhvwykjxqz"];
const masteryValue = new Array(masteryOrder.length).fill(0);
const weightValue = new Array(masteryOrder.length).fill(0);
let WeightSum;
let masteredIndex = 0;
let masteredLetters = [];
const greenProgress = {};
let drought = 0;
let keyDrought = {};
const droughtCounter = {};
masteryOrder.forEach(letter => droughtCounter[letter] = 0);
const keyTimestamps = [];
let lastKey = null;
let keyHoldStart = null;
let autoMonkeyInterval = 1;

// achievements
const achievements = [];
const achievementTab = getID("achievementTab");
const achievementPopup = getID("achievement-popup");

// flags
let canType = false;
let autoMonkeyPaused = false;
let resumedOnce = false;
let achievementTabEnabled = false;
let collectionTabEnabled = false;
let masteryTabEnabled = false;

// achievement flags
let typedLetter = false;

// mastery
const masteryTab = getID("masteryTab");
let masteryModeActive = false;
let masteryListDiv = null;
const letterUpgrades = {};
for (const char of "abcdefghijklmnopqrstuvwxyz") {
    letterUpgrades[char] = {
        letterMultiplier: { level: 0 },
        triplePressChance: { level: 0 }
    };
}
const spentScrews = {};
[..."abcdefghijklmnopqrstuvwxyz"].forEach(letter => spentScrews[letter] = 0);

function getUpgradeCost(type, level) {
    if (type === "letterMultiplier") return Math.pow(4, level) * 1;  // base 1, ×4
    if (type === "triplePressChance") return Math.pow(3, level) * 2; // base 2, ×3
    return Infinity;
}

function getLetterMultiplier(char) {
    return Math.min(256, Math.pow(2, letterUpgrades[char].letterMultiplier.level));
}

function getTriplePressChance(char) {
    return Math.min(0.4, letterUpgrades[char].triplePressChance.level * 0.05);
}

// collections
let page = "";

// tabs
const buttons = document.querySelectorAll('.sidebarBtn');
const contents = document.querySelectorAll('.tabContent');
const secretBtn = "secretachievementlist";

// random
let tempVar;

buttons.forEach(btn => {
btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');

    if (target == "achievement" && !achievementTabEnabled) return;
    if (target == "mastery" && !masteryTabEnabled) return;
    if (target == "collection" && !collectionTabEnabled) return;
    if (!target) return;

    updateMasteryUI();

    contents.forEach(c => {
        if (c.id === target) {
            c.classList.remove('fading');
            c.style.display = "block";
            setTimeout(() => {
            c.classList.add('active');
            }, 10);
        } else {
            c.classList.remove('active');
        c.classList.add('fading');
        setTimeout(() => {
            c.style.display = "none";
            c.classList.remove('fading');
        }, 400);
    }});
})});

function activateSecretAchievements() {
    if (!secretBtn) return;

    contents.forEach(c => {
        if (c.id === secretBtn) {
        c.classList.remove('fading');
        c.style.display = "block";
        setTimeout(() => {
            c.classList.add('active');
        }, 10);
        } else {
        c.classList.remove('active');
        c.classList.add('fading');
        setTimeout(() => {
            c.style.display = "none";
            c.classList.remove('fading');
        }, 400);
        }
    });
};

alphabet.forEach(letter => {
    keyDrought[letter] = 0;
    greenProgress[letter] = 1;
});

function togglesidebarPin(e) {
    tooltip.classList.remove("visible");
    e.preventDefault();
    pinned = !pinned;
    sidebar.classList.toggle("pinned", pinned);
    sidebar.classList.toggle("visible", pinned);
    sidebarLockIcon.setAttribute("name", pinned ? "chevrons-left" : "chevrons-right");
    const label = pinned ? "Close Sidebar (ctrl+s)" : "Lock Sidebar Open (ctrl+s)";
    sidebarLock.setAttribute("label", label);
    tooltip.innerHTML = label;
}

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() == 'a') {
        masteryValue[0]+=10;
    }
});

document.querySelectorAll(".sidebar .item").forEach(item => {
    item.addEventListener("mouseenter", (e) => {
        const label = item.getAttribute("label");
        let flag = label.includes("Sidebar");
        if (!label || (pinned && !flag)) return;
        const rect = item.getBoundingClientRect();
        tooltip.textContent = label;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = "translateY(-50%)";
        tooltip.classList.add("visible");
    });
    item.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
});

sidebarLock.addEventListener("click", togglesidebarPin);
sidebarContainer.addEventListener("mouseenter", () => !pinned && sidebar.classList.add("visible"));
sidebarContainer.addEventListener("mouseleave", () => !pinned && sidebar.classList.remove("visible"));

document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() == 's' && e.ctrlKey && !e.repeat) {
        e.preventDefault();
        togglesidebarPin(e);
        return;
    }

    if (e.ctrlKey) return;

    if (!canType) return;
    if (!typedLetter) {
        typedLetter = true;
        unlockAchievement("01");
    }
    if (!resumedOnce) resumedOnce = true;

    const key = e.key.toLowerCase();
    const now = performance.now();
    while (keyTimestamps.length > 0 && now - keyTimestamps[0] > 1000) keyTimestamps.shift();
    const isHolding = lastKey === key && now - keyHoldStart < 200;
    if (!isHolding) keyHoldStart = now;
    const limit = isHolding ? 5 : 15;
    if (keyTimestamps.length < limit) {
        keyTimestamps.push(now);
        showFloatingKey(key);
    }
    lastKey = key;
});

setInterval(() => {
    if (!autoMonkeyPaused) {
        const randomKey = alphabet[Math.floor(Math.random() * alphabet.length)];
        showFloatingKey(randomKey);
    }
}, autoMonkeyInterval);

function showFloatingKey() {
    const container = getID("key-float-container");
    const span = document.createElement("span");
    span.className = "key-float";

    WeightSum = weightValue.reduce((a, b) => a + b, 0);
    if (weightValue[masteredIndex] == 0) weightValue[masteredIndex]++;
    tempVar = Math.max(WeightSum/4, 20);
    WeightSum += tempVar;

    const rand = Math.random() * WeightSum;

    let acc = 0;
    let selectedChar = "void";

    const currentLetter = masteryOrder[masteredIndex];
    const expected = (200 / getLetterWeightProbability(currentLetter)+1).toFixed(1);

    for (let i = 0; i < masteryOrder.length; i++) {
        acc += weightValue[i];
        if (rand < acc) {
            selectedChar = masteryOrder[i];
            break;
        }
    }

    if (selectedChar === "void") {
        droughtCounter[currentLetter]++;
        if (droughtCounter[currentLetter] >= expected) {
            console.log(`[Auto-mastery] "${currentLetter}" unlocked due to drought.`);
            droughtCounter[currentLetter] = 0;
            selectedChar = currentLetter;
            span.textContent = selectedChar;
            span.style.color = "#000";
            span.classList.remove("failure-float");
        } else {
            span.textContent = randomFailure();
            span.style.color = "rgba(128,128,128,.4)";
            span.style.fontStyle = "italic";
            span.classList.add("failure-float");
            container.appendChild(span);
            setTimeout(() => span.remove(), 1000);
            return;
        }
    } else {
        droughtCounter[selectedChar] = 0;
    }

    if (selectedChar != currentLetter) {
        droughtCounter[currentLetter]++;
        if (droughtCounter[currentLetter] >= expected) {
            console.log(`[Auto-mastery] "${currentLetter}" unlocked due to drought.`);
            droughtCounter[currentLetter] = 0;
            selectedChar = currentLetter;
            span.textContent = selectedChar;
            span.style.color = "rgba(0,0,0,.5)";
            span.classList.remove("failure-float");
            return;
        }
    }
    span.textContent = selectedChar;
    span.style.color = "#000";
    masteryValue[masteryOrder.indexOf(selectedChar)]++;
    weightValue[masteryOrder.indexOf(selectedChar)]++;
    weightValue[masteryOrder.indexOf(selectedChar)] = Math.min(weightValue[masteryOrder.indexOf(selectedChar)], maxWeights[selectedChar]);

    const progress = Math.min(50, Math.floor(masteryValue[masteryOrder.indexOf(selectedChar)] + 1));
    greenProgress[selectedChar] = progress;

    const keyDiv = getID(safeKeyId(selectedChar));
    if (keyDiv) {
        keyDiv.style.backgroundColor = `rgba(0,255,0,${progress / 50})`;
    }

    if (masteredIndex == 0) {
        if (weightValue[masteredIndex] >= 5) {
            if (!canType) {
                canType = true;
                showPopup("feature", "Feature Unlocked: Monkey Control");
            }
        }
    }

    if (progress >= 50 && selectedChar === currentLetter) {
        masteredLetters.push(selectedChar);
        masteredIndex++;

        const nextKey = masteryOrder[masteredIndex];
        const nextKeyDiv = getID(safeKeyId(nextKey));
        if (nextKeyDiv) {
            nextKeyDiv.style.opacity = "1";
            nextKeyDiv.style.filter = "";
        }
        if (masteredIndex === 1) unlockAchievement("02");
        if (masteredIndex === 2 && !masteryTabEnabled) unlockTab("mastery", "Masteries", "trophy");
        if (masteredIndex === 3 && !collectionTabEnabled) unlockTab("collection", "Collections", "collection");
    }

    container.appendChild(span);
    setTimeout(() => span.remove(), 1000);
}

function randomFailure() {
    const failureMessages = [
        "monkeys can't type", "monkey slipped", "banana break",
        "keyboard smashed", "chimp error", "monkey brain not found"
    ];
    return failureMessages[Math.floor(Math.random() * failureMessages.length)];
}

function renderKeyboard() {
    const layout = [
        ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"],
        ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
        ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
        ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
        ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
        ["space"]
    ];

    const keyboard = getID("keyboard");
    keyboard.innerHTML = "";

    layout.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";

        row.forEach(key => {
            const keyDiv = document.createElement("div");
            const id = safeKeyId(key);
            keyDiv.className = "key";
            keyDiv.id = id;
            keyDiv.textContent = key === "space" ? "" : key;
            keyDiv.style.display = "flex";
            keyDiv.style.alignItems = "center";
            keyDiv.style.justifyContent = "center";

            if (alphabet.includes(key)) {
                keyDiv.style.opacity = masteredLetters.includes(key) || key === masteryOrder[masteredIndex] ? "1" : "0.2";
                if (parseFloat(keyDiv.style.opacity) <= 0.2) {keyDiv.style.filter = "blur(1px)"; keyDiv.style.cursor = "auto";}
            } else {
                keyDiv.style.opacity = "0.2";
                keyDiv.style.filter = "blur(1px)";
                keyDiv.style.cursor = "auto";
                keyDiv.setAttribute("data-locked", "true");
            }

            if (key === "space") {
                keyDiv.classList.add("spacebar");
                keyDiv.style.height = "100%";
            }

            rowDiv.appendChild(keyDiv);
        });

        keyboard.appendChild(rowDiv);
    });
}

function attachCustomKeyboardTooltips() {
    document.querySelectorAll(".key").forEach(keyDiv => {
        keyDiv.addEventListener("mouseenter", () => {
            const keyText = keyDiv.textContent.trim().toLowerCase();
            hoveredKey = keyText;

            const isLetter = alphabet.includes(keyText);
            const rect = keyDiv.getBoundingClientRect();
            tooltip.style.top = `${rect.top + rect.height / 2}px`;
            tooltip.style.left = `${rect.right + 10}px`;
            tooltip.style.transform = "translateY(-50%)";

            if (isLetter) {
                const progress = greenProgress[keyText] || 0;
                const weightProgress = weightValue[masteryOrder.indexOf(hoveredKey)];
                const mastered = progress >= 50;
                const probability = getLetterWeightProbability(keyText);
                tooltip.textContent = mastered
                    ? `Key mastered! Weight: ${weightProgress}\n(Chance: ${probability}%)`
                    : progress > 1 || masteredIndex == masteryOrder.indexOf(hoveredKey)
                        ? `Weight: ${progress}\n(Chance: ${probability}%)`
                        : "Not unlocked yet";
            } else {
                tooltip.textContent = "Not unlocked yet";
            }

            tooltip.classList.add("visible");
        });

        keyDiv.addEventListener("mouseleave", () => {
            tooltip.classList.remove("visible");
            hoveredKey = null;
        });
    });
}

function updateTooltipContent() {
    if (!hoveredKey) return;

    const isLetter = alphabet.includes(hoveredKey);
    if (!isLetter) {
        tooltip.textContent = "Not unlocked yet";
        return;
    }

    const progress = greenProgress[hoveredKey] || 0;
    const weightProgress = weightValue[masteryOrder.indexOf(hoveredKey)];
    const mastered = progress >= 50;
    const probability = getLetterWeightProbability(hoveredKey);
    tooltip.textContent = mastered
        ? `Key mastered! Weight: ${weightProgress}\n(Chance: ${probability}%)`
        : progress > 1 || masteredIndex == masteryOrder.indexOf(hoveredKey)
            ? `Weight: ${progress}\n(Chance: ${probability}%)`
            : "Not unlocked yet";
}

function getLetterWeightProbability(letter) {
    let tempWeightSum = 0;
    weightValue.forEach(w => tempWeightSum += w);
    let totalWeight = Math.max(tempWeightSum/4, 20);
    totalWeight += tempWeightSum;

    const probability = (weightValue[masteryOrder.indexOf(letter)] / (totalWeight)) * 100;
    return probability.toFixed(1);
}

function unlockAchievement(id) {
    if (achievements.includes(id)) return;
    achievements.push(id);

    const { name, condition, reward } = achievementData[id] || {
        name: "Unknown Achievement",
        condition: "???",
        reward: ""
    };

    showPopup("achievement", name);

    const container = getID("achievementImages");
    if (!container) {
        console.error("Element with id 'achievementImages' not found in the DOM");
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.classList.add("achievementWrapper");

    const img = document.createElement("img");
    img.src = "monkey.webp";
    img.className = "achievementImage";

    const tooltip = document.createElement("div");
    tooltip.className = "achievementTooltip";
    tooltip.innerHTML = `<strong>${name}</strong><br>${condition}${reward ? `<br><em>${reward}</em>` : ""}`;

    wrapper.appendChild(img);
    wrapper.appendChild(tooltip);
    container.appendChild(wrapper);

    if (!achievementTabEnabled) {
        achievementTabEnabled = true;
        unlockTab("achievement", "Achievements", "award")
    }
}

function showPopup(type, text, duration = 5000) {
    const container = getID("popups");
    const banner = document.createElement("div");
    banner.className = "banner";
    banner.textContent = type=="feature" ? text : `Achievement unlocked: ${text}`;
    banner.style.backgroundColor = type=="feature" ? "rgba(150, 255, 150, .5)" : "rgba(255, 200, 200, .5)";
    container.appendChild(banner);

    requestAnimationFrame(() => {
        banner.classList.add("visible");
    });

    setTimeout(() => {
        banner.classList.remove("visible");
        setTimeout(() => banner.remove(), 500);
    }, duration);
}

function unlockTab(id, label, icon) {
    showPopup("feature", `Tab unlocked: ${label}`);
    const tab = getID(`${id}Tab`);
    tab.setAttribute("label", label);
    tab.innerHTML = `<box-icon name='${icon}'></box-icon><span>${label}</span>`;
    tab.style.transition = 'all 3s ease';
    tab.style.backgroundColor = 'rgba(150, 255, 150, 1)';
    sidebar.classList.add("visible");
    tab.style.fontWeight = "bold";
    setTimeout(() => tab.style.fontWeight = "", 5000);
    setTimeout(() => tab.style.backgroundColor = "", 5000);
    setTimeout(() => tab.style.transition = "all .3s ease", 5000);
    if (id === "collection") collectionTabEnabled = true;
    if (id === "mastery") masteryTabEnabled = true;
}

function updateMasteryUI() {
    const masteryList = getID("mastery-list");
    masteryList.innerHTML = "";

    for (let char of "abcdefghijklmnopqrstuvwxyz") {
        const count = masteryValue[masteryOrder.indexOf(char)] || 0;
        const milestoneIndex = masteryMilestones.findIndex(m => count < m);

        let progressToNext;

        if (milestoneIndex === -1) {
            progressToNext = 1;
        } else {
            const prevMilestone = milestoneIndex === 0 ? 0 : masteryMilestones[milestoneIndex - 1];
            const nextMilestone = masteryMilestones[milestoneIndex];
            progressToNext = (count - prevMilestone) / (nextMilestone - prevMilestone);
        }
        const totalScrews = getTotalScrews(count, char);

        const upgrades = letterUpgrades[char];
        const multLevel = upgrades.letterMultiplier.level;
        const tripleLevel = upgrades.triplePressChance.level;

        const multCost = getUpgradeCost("letterMultiplier", multLevel);
        const tripleCost = getUpgradeCost("triplePressChance", tripleLevel);

        const container = document.createElement("div");
        container.className = "masteryItem";

        container.innerHTML = `
            <div><strong>${char.toUpperCase()}</strong> — ${count.toLocaleString()} typed</div>
            <div class="masteryBarWrapper">
                <div class="masteryBar" style="width:${(progressToNext * 100).toFixed(1)}%"></div>
            </div>
            <div>Total Screws: ${totalScrews}</div>

            <div class="upgradeSection">
                <button class="buy-mult" data-char="${char}">
                    Letter Multiplier (x${getLetterMultiplier(char)})<br>
                    Cost: ${multCost}
                </button>
                <button class="buy-triple" data-char="${char}">
                    Triple Press Chance (${(getTriplePressChance(char) * 100).toFixed(0)}%)<br>
                    Cost: ${tripleCost}
                </button>
            </div>
        `;

        masteryList.appendChild(container);
    }
}

document.querySelectorAll(".buy-mult").forEach(button => {
    button.addEventListener("click", () => {
        const char = button.dataset.char;
        // const screw = 
        buyLetterUpgrade(char, "letterMultiplier"); // screw
    });
});

document.querySelectorAll(".buy-triple").forEach(button => {
    button.addEventListener("click", () => {
        const char = button.dataset.char;
        buyLetterUpgrade(char, "triplePressChance");
    });
});

function buyLetterUpgrade(char, type, screw) {
    const upgrade = letterUpgrades[char][type];
    const cost = getUpgradeCost(type, upgrade.level);

    if (screw >= cost) {
        spentScrews[char] += cost;
        upgrade.level++;
        updateMasteryUI();
    } else {
        console.log("Not enough resources.");
        // display something to show
    }
}

function getTotalScrews(count, char) {
    let total = 0;
    for (let i = 0; i < masteryMilestones.length; i++) {
        if (count >= masteryMilestones[i]) {
            total += screwsPerMilestone[i] || 0;
        } else {
            break;
        }
    }
    
    total -= spentScrews[char];
    return Math.max(0, total);
}

renderKeyboard();
attachCustomKeyboardTooltips();

setInterval(updateTooltipContent, 100);
setInterval(updateMasteryUI, 100);