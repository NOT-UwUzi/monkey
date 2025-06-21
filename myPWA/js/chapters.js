// Chapter content (feel free to add more pages!)
let chapterPages = [
  "aaaeeaaeei aeiaiooiiiee aieoiao",
  "banana bandana anna baboon noon",
  "education is essential to evolution",
];
let currentPageIndex = 0;
let currentPageSpans = [];
let totalTypeableLetters = 0;
let chapterProgress = 0;
let chapterFinished = false;

// HTML elements
const paragraphElement = getID("chapter-paragraph");
const overflowDisplay = getID("chapter-overflow");
const progressDisplay = getID("chapter-progress");

// Load the first page
loadChapterPage(currentPageIndex);

function loadChapterPage(index) {
  const text = chapterPages[index].toLowerCase();
  paragraphElement.innerHTML = "";
  chapterTypedCount = {};
  chapterOverflow.length = 0;
  chapterProgress = 0;
  chapterFinished = false;
  totalTypeableLetters = 0;

  for (let char of text) {
    const span = document.createElement("span");
    span.textContent = char;
    span.className = "chapter-letter";
    if (/[a-z]/.test(char)) {
      span.style.opacity = 0.3;
      totalTypeableLetters++;
      chapterTypedCount[char] = 0;
    } else {
      span.style.opacity = 1;
    }
    paragraphElement.appendChild(span);
  }

  currentPageSpans = [...paragraphElement.querySelectorAll(".chapter-letter")];
  updateChapterProgress();
  updateOverflowDisplay();
}

// Draw a random letter from the current page
function getRandomChapterLetter() {
  const remaining = currentPageSpans.filter(
    span => /[a-z]/.test(span.textContent) && span.style.opacity !== "1"
  );
  if (remaining.length === 0) return null;
  const random = remaining[Math.floor(Math.random() * remaining.length)];
  return random.textContent;
}

// Handle typing a letter in chapter mode
function typeLetterInChapter(letter) {
  letter = letter.toLowerCase();
  let typed = false;

  for (let span of currentPageSpans) {
    if (span.textContent === letter && span.style.opacity !== "1") {
      span.style.opacity = "1";
      chapterTypedCount[letter]++;
      chapterProgress++;
      typed = true;
      break;
    }
  }

  if (!typed) {
    // Overflow
    const isAlreadyOverflowed = chapterOverflow.includes(letter);
    if (!isAlreadyOverflowed) chapterOverflow.push(letter);
    updateOverflowDisplay();
  }

  updateChapterProgress();

  // Check if page completed
  if (chapterProgress >= totalTypeableLetters && !chapterFinished) {
    chapterFinished = true;
    setTimeout(() => {
      if (currentPageIndex + 1 < chapterPages.length) {
        currentPageIndex++;
        loadChapterPage(currentPageIndex);
      } else {
        progressDisplay.textContent = "All chapters completed!";
      }
    }, 1000);
  }
}

// Display progress
function updateChapterProgress() {
  if (progressDisplay) {
    progressDisplay.textContent = `Progress: ${chapterProgress} / ${totalTypeableLetters}`;
  }
}

// Display overflowed letters
function updateOverflowDisplay() {
  if (overflowDisplay) {
    overflowDisplay.textContent = `Overflow: ${[...new Set(chapterOverflow)].join(", ")}`;
  }
}

function showFloatingKeyChapter() {
  const letter = getRandomChapterLetter();
  if (!letter) return;

  const container = getID("key-float-container");
  const span = document.createElement("span");
  span.className = "key-float";
  span.textContent = letter;
  span.style.color = "#000";

  container.appendChild(span);
  setTimeout(() => span.remove(), 1000);
}

// Allow keyboard input
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (/^[a-z]$/.test(key)) {
    typeLetterInChapter(key);
  }
});
