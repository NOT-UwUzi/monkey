function showFloatingKeyChapter () {
    const container = getID("key-float-container-chapter");
    const span = document.createElement("span");
    span.className = "key-float";

    WeightSum = weightValue.reduce((a, b) => a + b, 0);
    if (weightValue[masteredIndex] == 0) weightValue[masteredIndex]++;
    tempVar = Math.max(WeightSum/4, 20);
    WeightSum += tempVar;

    const rand = Math.random() * WeightSum;

    let acc = 0;
    let selectedChar = "void";

    let currentChapter = getChapterContent().replace(/\s/g, "");
    let currentLetter = currentChapter[currentPos];
    const expected = (200 / getLetterWeightProbability(currentLetter)+1).toFixed(1);

    // console.log(chapter, currentChapter, currentPos, currentLetter);

    for (let i = 0; i < masteryOrder.length; i++) {
        acc += weightValue[i];
        if (rand < acc) {
            selectedChar = masteryOrder[i];
            break;
        }
    }

    // fail
    if (selectedChar === "void") {
        droughtCounter[currentLetter]++;
        if (droughtCounter[currentLetter] >= expected) {
            console.log(`[Auto-mastery] "${currentLetter}" typed in chapter due to drought.`);
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
            span.style.color = "#000";
            span.classList.remove("failure-float");
            return;
        }
        span.textContent = selectedChar;
        span.style.color = "rgba(206, 53, 53, .5)";
        container.appendChild(span);
        setTimeout(() => span.remove(), 1000);
        return;
    }

    span.textContent = selectedChar;
    span.style.color = "#000";
    currentPos++;
    if (currentPos >= currentChapter.length-1) {chapter++; currentPos = 0;}
    if (chapter >= 2 && !chapter1) {chapter1 = true; unlockAchievement("3");}
    displayChapterContent(currentPos)

    container.appendChild(span);
    setTimeout(() => span.remove(), 1000);
}

function displayChapterContent(currentPos) {
    let tempVar1 = 0;
    let result = ""
    let caretInserted = false;
    for (let char of getChapterContent()) {
        if (tempVar1 < currentPos && char !== " ") {
            result += `<span class="black">${char}</span>`
            tempVar1++;
        } else if (char == " ") {
            result += `<span class="gray">${char}</span>`;
        } else {
            if (!caretInserted) {
                result += `<span class="caret">|</span>`;
                caretInserted = true;
            }
            result += `<span class="gray">${char}</span>`;
        }
    }
    if (!caretInserted) result += `<span class="caret">|</span>`;

    chapterPage.innerHTML = result;
    chapterDisplay.innerHTML = "Current Chapter:" + chapter;
}

function getChapterContent() {
    if (chapter >= chapters.length) return "maxed";
    else return chapters[chapter - 1];
}
