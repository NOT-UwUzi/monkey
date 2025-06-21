// Adds mastery upgrades (letter multiplier + triple press) into key generation logic

// type
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

// automonkey!!
setInterval(() => {
    if (!autoMonkeyPaused) {
        const randomKey = alphabet[Math.floor(Math.random() * alphabet.length)];
        showFloatingKey(randomKey);
    }
}, autoMonkeyInterval);

function showFloatingKey() {
    if (activeTab === "chapter") {
        showFloatingKeyChapter();
        return;
    }

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

    const masteringLabel = getID("currently-mastering");
    if (masteringLabel) {
        masteringLabel.textContent = `Currently mastering: ${currentLetter.toUpperCase()}`;
    }

    for (let i = 0; i < masteryOrder.length; i++) {
        acc += weightValue[i];
        if (rand < acc) {
            selectedChar = masteryOrder[i];            break;
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
            span.style.color = "rgba(128,128,128,1)";
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

    // upgrades
    const mult = getLetterMultiplier(selectedChar);
    const tripleChance = getTriplePressChance(selectedChar);
    let pressCount = 1;
    if (Math.random() < tripleChance) pressCount += 2;
    const gain = pressCount * mult;

    span.textContent = selectedChar;
    span.style.color = "#000";
    masteryValue[masteryOrder.indexOf(selectedChar)] += gain;
    weightValue[masteryOrder.indexOf(selectedChar)] += gain;
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

        if (weightValue[masteredIndex] >= 10) {
            if (!chapterTabEnabled) {
                chapterTabEnabled = true;
                unlockTab("chapter", "Chapters", "book-open") //fix
            }
        }
    }

    if (progress >= 50 && selectedChar === currentLetter) {
        masteredLetters.push(selectedChar);
        masteredIndex++;
        updateMasteryUI();

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

function getLetterWeightProbability(letter) {
    let tempWeightSum = 0;
    weightValue.forEach(w => tempWeightSum += w);
    let totalWeight = Math.max(tempWeightSum/4, 20);
    totalWeight += tempWeightSum;

    const probability = (weightValue[masteryOrder.indexOf(letter)] / (totalWeight)) * 100;
    return probability.toFixed(2);
}