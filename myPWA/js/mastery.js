function updateMasteryUI() {
    const masteryList = getID("mastery-list");

    masteryList.innerHTML = "";

    for (let char of "aeioulnrstdgbcmpfhvwykjxqz") {
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
        `; // idea, make it so that you can only unlock next mastery after u bought something for that one

        masteryList.appendChild(container);
    }

    masteryList.addEventListener("click", (e) => {
        const btn = e.target.closest(".buy-upgrade");
        if (!btn) return;

        const char = btn.dataset.char;
        const type = btn.dataset.type;
        const count = masteryValue[masteryOrder.indexOf(char)] || 0;
        const screws = getTotalScrews(count, char);
        buyLetterUpgrade(char, type, screws);

        // refresh ui to reveal second upgrade
        updateMasteryUI();
    });
}


// updates progress bar
function updateMasteryProgress() {
    for (let char of "aeioulnrstdgbcmpfhvwykjxqz") {
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

        if (!countEl) continue; // skip if not rendered

        countEl.textContent = count.toLocaleString();
        barEl.style.width = `${(progressToNext * 100).toFixed(1)}%`;
        screwsEl.textContent = screws;
        multEl.textContent = getLetterMultiplier(char);
        costMultEl.textContent = getUpgradeCost("letterMultiplier", multLevel);
        tripleEl.textContent = (getTriplePressChance(char) * 100).toFixed(0);
        costTripleEl.textContent = getUpgradeCost("triplePressChance", tripleLevel);
    }
}


// upgrades calculation
function buyLetterUpgrade(char, type, screws) {
    const upgrade = letterUpgrades[char][type];
    const cost = getUpgradeCost(type, upgrade.level);

    if (screws >= cost) {
        spentScrews[char] += cost;
        upgrade.level++;
    } else {
        console.log("Not enough screws.");
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

updateMasteryUI();
setInterval(updateMasteryProgress, 10);
