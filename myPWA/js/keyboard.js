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

renderKeyboard();
attachCustomKeyboardTooltips();
setInterval(updateTooltipContent, 1);
