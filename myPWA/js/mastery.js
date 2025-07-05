const letterUpgrades = {};
for (const char of "abcdefghijklmnopqrstuvwxyz") {
    letterUpgrades[char] = {
        letterMultiplier: { level: 0 },
        triplePressChance: { level: 0 }
    };
}

// upgrades
function getUpgradeCost(type, level) {
    if (type === "letterMultiplier") return Math.pow(4, level) * 1;
    if (type === "triplePressChance") return Math.pow(3, level) * 2;
    return Infinity;
}

function getLetterMultiplier(char) {
    let x = 1 << letterUpgrades[char].letterMultiplier.level;
    return Math.min(256, x);
}

function getTriplePressChance(char) {
    return Math.min(0.4, letterUpgrades[char].triplePressChance.level * 0.05);
}

function getTotalScrews(count, char) {
    let total = 0;
    for (let i = 0; i < masteryMilestones.length; i++) {
        if (count >= masteryMilestones[i]) total += screwsPerMilestone[i] || 0;
        else break;
    }
    total -= spentScrews[char];
    return Math.max(0, total);
}

function getTotalScrewsSpent() {
    return Object.values(spentScrews).reduce((a, b) => a + b, 0);
}

function updateAutoMonkeyInterval() {
    const baseInterval = 500; // base interval in ms
    const totalSpent = getTotalScrewsSpent();
    autoMonkeyInterval = Math.max(1, baseInterval * Math.pow(0.9, totalSpent));
    const intervalDisplay = document.getElementById("auto-monkey-interval");
    if (intervalDisplay) intervalDisplay.textContent = autoMonkeyInterval.toFixed(2) + "ms";
    console.log(autoMonkeyInterval);
    startAutoMonkey();
}

function buyLetterUpgrade(char, type, screws) {
    const upgrade = letterUpgrades[char][type];
    const cost = getUpgradeCost(type, upgrade.level);

    if (screws >= cost) {
        spentScrews[char] += cost;
        upgrade.level++;
        updateAutoMonkeyInterval();
        updateMasteryUI();
        updateMasteryProgress();
    } else {
        console.log("Not enough screws.");
        showPopup("notenoughscrews", cost);
    }
}

// mastery ui ONCE
function updateMasteryUI() {
    const masteryList = getID("mastery-list");
    masteryList.className = "lab-grid"; // apply grid layout
    masteryList.innerHTML = "";

    for (let char of masteryOrder) {
        const index = masteryOrder.indexOf(char);
        const count = masteryValue[index] || 0;
        if (index > masteredIndex) continue;

        const multiplierLevel = letterUpgrades[char].letterMultiplier.level;
        const tripleLevel = letterUpgrades[char].triplePressChance.level;

        const container = document.createElement("div");
        container.className = "lab-station";
        container.dataset.char = char;

        container.innerHTML = `
            <div class="lab-header">
                <span>${char.toUpperCase()}</span>
                <span>${getLetterMultiplier(char)}x Multiplier</span>
            </div>

            <div>Typed: <span id="count-${char}">${count}</span></div>
            <div>Screws: <span id="screws-${char}">0</span></div>

            <div class="lab-progress">
                <div class="lab-bar" id="bar-${char}" style="width: 0%"></div>
            </div>

            <button class="lab-btn buy-upgrade" data-char="${char}" data-type="letterMultiplier">
                Letter Multiplier: x2 increase<br>
                Cost: <span id="cost-mult-${char}">${getUpgradeCost("letterMultiplier", multiplierLevel)}</span>
            </button>

            ${multiplierLevel > 0 ? `
            <button class="lab-btn buy-upgrade" data-char="${char}" data-type="triplePressChance">
                Triple Press Chance (<span id="triple-${char}">${(getTriplePressChance(char) * 100).toFixed(0)}</span>%): +5% chance<br>
                Cost: <span id="cost-triple-${char}">${getUpgradeCost("triplePressChance", tripleLevel)}</span>
            </button>` : ''}
        `;

        masteryList.appendChild(container);
    }

    const infoPanel = document.createElement("div");
    infoPanel.className = "lab-info";
    infoPanel.innerHTML = `
        <div>Total Screws Spent: <span id="total-screws-spent">${getTotalScrewsSpent()}</span></div>
        <div>AutoMonkey Interval: <span id="auto-monkey-interval">Loading...</span></div>
        <button onclick="respecUpgrades()">Respec Upgrades</button>
    `;
    masteryList.appendChild(infoPanel);

    masteryList.onclick = debounce((e) => {
        const btn = e.target.closest(".buy-upgrade");
        if (!btn) return;
        const char = btn.dataset.char;
        const type = btn.dataset.type;
        const count = masteryValue[masteryOrder.indexOf(char)] || 0;
        const screws = getTotalScrews(count, char);

        buyLetterUpgrade(char, type, screws);
        updateMasteryProgress();
    }, 50);
}

function updateMasteryProgress() {
    for (let char of masteryOrder) {
        const index = masteryOrder.indexOf(char);
        if (index > masteredIndex) continue;

        const count = masteryValue[index] || 0;
        const milestoneIndex = masteryMilestones.findIndex(m => count < m);

        let progressToNext = 1;
        if (milestoneIndex !== -1) {
            const prev = milestoneIndex === 0 ? 0 : masteryMilestones[milestoneIndex - 1];
            const next = masteryMilestones[milestoneIndex];
            progressToNext = (count - prev) / (next - prev);
        }

        const screws = getTotalScrews(count, char);
        const multLevel = letterUpgrades[char].letterMultiplier.level;
        const tripleLevel = letterUpgrades[char].triplePressChance.level;

        getID(`count-${char}`).textContent = count.toLocaleString();
        getID(`bar-${char}`).style.width = `${(progressToNext * 100).toFixed(1)}%`;
        getID(`screws-${char}`).textContent = screws;
        getID(`cost-mult-${char}`).textContent = getUpgradeCost("letterMultiplier", multLevel);

        const tripleEl = getID(`triple-${char}`);
        const costTripleEl = getID(`cost-triple-${char}`);
        if (tripleEl) tripleEl.textContent = (getTriplePressChance(char) * 100).toFixed(0);
        if (costTripleEl) costTripleEl.textContent = getUpgradeCost("triplePressChance", tripleLevel);
    }

    const totalSpentDisplay = getID("total-screws-spent");
    if (totalSpentDisplay) totalSpentDisplay.textContent = getTotalScrewsSpent();

    const intervalDisplay = getID("auto-monkey-interval");
    if (intervalDisplay) intervalDisplay.textContent = autoMonkeyInterval.toFixed(0) + "ms";
}

function respecUpgrades() {
    for (let char of masteryOrder) {
        if (char.length != 1) continue;
        console.log(char);
        letterUpgrades[char].letterMultiplier.level = 0;
        letterUpgrades[char].triplePressChance.level = 0;
        spentScrews[char] = 0;
    }
    updateAutoMonkeyInterval();
    updateMasteryProgress();
    updateMasteryUI();
}

// initialising
updateMasteryUI();
setInterval(updateMasteryProgress, 10);