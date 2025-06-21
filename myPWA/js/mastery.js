// upgrades
function getUpgradeCost(type, level) {
    if (type === "letterMultiplier") return Math.pow(4, level) * 1;
    if (type === "triplePressChance") return Math.pow(3, level) * 2;
    return Infinity;
}

function getLetterMultiplier(char) {
    return Math.min(256, Math.pow(2, letterUpgrades[char].letterMultiplier.level));
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

function buyLetterUpgrade(char, type, screws) {
    const upgrade = letterUpgrades[char][type];
    const cost = getUpgradeCost(type, upgrade.level);

    if (screws >= cost) {
        spentScrews[char] += cost;
        upgrade.level++;
        updateMasteryProgress();
    } else {
        console.log("Not enough screws.");
        showPopup("notenoughscrews", letterUpgrades[char][type]); // lol fix this!!
    }
}

// mastery ui ONCE
function updateMasteryUI() {
    const masteryList = getID("mastery-list");
    masteryList.innerHTML = "";

    for (let char of masteryOrder) {
        const index = masteryOrder.indexOf(char);
        const count = masteryValue[index] || 0;
        const isVisible = index <= masteredIndex;
        if (!isVisible) continue;

        const multiplierLevel = letterUpgrades[char].letterMultiplier.level;
        const tripleLevel = letterUpgrades[char].triplePressChance.level;

        const showTriple = multiplierLevel > 0;

        const container = document.createElement("div");
        container.className = "masteryItem";
        container.dataset.char = char;

        container.innerHTML = `
            <div class="masteryHeader">
                <strong>${char.toUpperCase()}</strong> — <span id="count-${char}">0</span> typed
            </div>

            <div class="masteryBarWrapper">
                <div class="masteryBar" id="bar-${char}" style="width: 0%"></div>
            </div>

            <div class="screwDisplay">
                Total Screws: <span id="screws-${char}">0</span>
            </div>

            <div class="upgradeSection">
                <button class="buy-upgrade" data-char="${char}" data-type="letterMultiplier">
                    Letter Multiplier (<span id="mult-${char}">${getLetterMultiplier(char)}</span>x)<br>
                    Cost: <span id="cost-mult-${char}">${getUpgradeCost("letterMultiplier", multiplierLevel)}</span>
                </button>
                ${showTriple ? `
                <button class="buy-upgrade" data-char="${char}" data-type="triplePressChance">
                    Triple Press Chance (<span id="triple-${char}">${(getTriplePressChance(char) * 100).toFixed(0)}</span>%)<br>
                    Cost: <span id="cost-triple-${char}">${getUpgradeCost("triplePressChance", tripleLevel)}</span>
                </button>` : ''}
            </div>
        `;

        masteryList.appendChild(container);
    }

    // click handler
    masteryList.onclick = debounce((e) => {
        const btn = e.target.closest(".buy-upgrade");
        if (!btn) return;

        const char = btn.dataset.char;
        const type = btn.dataset.type;
        const count = masteryValue[masteryOrder.indexOf(char)] || 0;
        const screws = getTotalScrews(count, char);

        buyLetterUpgrade(char, type, screws);
        updateMasteryProgress(); // only update progress
    }, 50);
}

// progress so no flashing stuff
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

        const countEl = getID(`count-${char}`);
        const barEl = getID(`bar-${char}`);
        const screwsEl = getID(`screws-${char}`);
        const multEl = getID(`mult-${char}`);
        const costMultEl = getID(`cost-mult-${char}`);
        const tripleEl = getID(`triple-${char}`);
        const costTripleEl = getID(`cost-triple-${char}`);

        if (!countEl) continue;

        countEl.textContent = count.toLocaleString();
        barEl.style.width = `${(progressToNext * 100).toFixed(1)}%`;
        screwsEl.textContent = screws;
        multEl.textContent = getLetterMultiplier(char);
        costMultEl.textContent = getUpgradeCost("letterMultiplier", multLevel);

        if (tripleEl) tripleEl.textContent = (getTriplePressChance(char) * 100).toFixed(0);
        if (costTripleEl) costTripleEl.textContent = getUpgradeCost("triplePressChance", tripleLevel);
    }
}

// initialising
updateMasteryUI();
setInterval(updateMasteryProgress, 1);
