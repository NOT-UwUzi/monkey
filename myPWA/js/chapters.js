// chapter letter tracking
const chapterTypedCount = {};
const chapterOverflow = [];

function setupChapterParagraph(paragraphElement) {
    const text = paragraphElement.textContent.toLowerCase();
    paragraphElement.innerHTML = "";

    // Create span for each letter
    for (let char of text) {
        const span = document.createElement("span");
        span.textContent = char;
        span.className = "chapter-letter";
        span.style.opacity = /[a-z]/.test(char) ? 0.5 : 1;
        paragraphElement.appendChild(span);

        if (/[a-z]/.test(char)) {
            if (!chapterTypedCount[char]) chapterTypedCount[char] = 0;
        }
    }
}

function typeLetterInChapter(letter) {
    letter = letter.toLowerCase();
    const spans = document.querySelectorAll(".chapter-letter");
    let typed = 0;

    for (let span of spans) {
        if (span.textContent === letter && span.style.opacity !== "1") {
            span.style.opacity = "1";
            chapterTypedCount[letter]++;
            typed++;
            break;
        }
    }

    if (typed === 0) {
        // If max count already used in paragraph
        const visibleCount = [...spans].filter(s => s.textContent === letter && s.style.opacity === "1").length;
        const totalCount = [...spans].filter(s => s.textContent === letter).length;
        if (visibleCount >= totalCount) {
            chapterOverflow.push(letter);
            updateOverflowDisplay();
        }
    }
}

function updateOverflowDisplay() {
    const overflowDiv = getID("chapter-overflow");
    if (!overflowDiv) return;
    overflowDiv.textContent = `Overflow: ${[...new Set(chapterOverflow)].join(", ")}`;
}

document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
        typeLetterInChapter(key);
    }
});