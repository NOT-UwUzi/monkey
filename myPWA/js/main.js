function getID(X) {
    return document.getElementById(X);
}

function safeKeyId(key) {
    return `key-${key.replace(/[^a-zA-Z0-9]/g, ch => ch.charCodeAt(0))}`;
}

// achievement list
const achievementData = {
"1": {
    name: "A lucky start?",
    condition: "Press the key as the monkey.",
    reward: "Unlocks Achievements"
},
"2": {
    name: "Master of one, Jack of none",
    condition: "Master A",
    reward: ""
},
"3": {
    name: "A fresh page",
    condition: "Complete the first chapter",
    reward: ""
},
"4": {
    name: "Just One Letter? Pathetic.",
    condition: "Finish the first letter.",
    reward: ""
},
"5": {
    name: "A screw",
    condition: "Get the first A screw",
    reward: ""
},
"6": {
    name: "Mi, a name I call myself",
    condition: "Master I",
    reward: ""
},
"7": {
    name: "U are screwed",
    condition: "Get the first U screw.",
    reward: ""
},
"8": {
    name: "Buffed Vowels",
    condition: "Upgrade every single vowel.",
    reward: "Automonkeys work 0.5% faster."
},
"9": {
    name: "Prestigious Monkey",
    condition: "Prestige for the first time.",
    reward: ""
},
"10": {
    name: "A Healthy Sleep Schedule",
    condition: "Be offline for a period of 10 hours",
    reward: "+5% Offline rewards."
},
"11": {
    name: "This isn’t a river, is it?",
    condition: "Unlock overflow",
    reward: ""
},
"12": {
    name: "Overflew the Target!",
    condition: "Get 500 overflow letters.",
    reward: ""
},
"13": {
    name: "Double trouble",
    condition: "Master D",
    reward: ""
},
"14": {
    name: "But I rather not",
    condition: "Prestige without utilising double points upgrade.",
    reward: ""
},
"15": {
    name: "Screws!",
    condition: "Get 500 total screws.",
    reward: ""
},
"16": {
    name: "Papers Please",
    condition: "Get 1cm² of paper.",
    reward: ""
},
"17": {
    name: "Truly overflowing",
    condition: "Have 500 points.",
    reward: ""
},
"18": {
    name: "The First Challenge",
    condition: "Unlock CA10A.",
    reward: ""
},
"19": {
    name: "That wasn’t challenging…",
    condition: "Finish CA10A.",
    reward: ""
},
"20": {
    name: "Is it over?",
    condition: "Beat the game.",
    reward: ""
}}

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
let activeTab = "typeWriter";
let tabTimeouts = new Map();
let tabLocked = false;

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
const masteryOrder = [..."aeioulnrstdgbcmpfhvwykjxqz", "max"];
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
let baseInterval = 500;
let autoMonkeyInterval = baseInterval;
let currentPos = 0;
let autoMonkeyIntervalTab = getID("automonkeyinterval");
let intervalId = null;

// achievements
let achievements = [];
const achievementTab = getID("achievementTab");
const achievementPopup = getID("achievement-popup");
let screwA = false;
let chapter1 = false;

// flags
let canType = false;
let autoMonkeyPaused = false;
let resumedOnce = false;
let achievementTabEnabled = false;
let collectionTabEnabled = false;
let masteryTabEnabled = false;
let chapterTabEnabled = false;

// achievement flags
let typedLetter = false;

// chapter letter tracking
let chapter = 1;
let maxUnlockedChapter = 1;
let chapters = ["aaaaaa aaaaaa aaaaaaaa", "aeeae eaea iiaieaeae", "aeiaeiaeio eaeiaeiaoei aoeiea"];
let chapterPage = getID("chapter-paragraph");
let chapterDisplay = getID("current-chapter");
let caretInserted = false;

// mastery
const masteryTab = getID("masteryTab");
let masteryModeActive = false;
let masteryListDiv = null;
// let letterUpgrades = {};
// for (const char of "abcdefghijklmnopqrstuvwxyz") {
//     if (!letterUpgrades[char]) continue;
//     letterUpgrades[char] = {
//         letterMultiplier: { level: 0 },
//         triplePressChance: { level: 0 }
//     };
// }
const spentScrews = {};
[..."abcdefghijklmnopqrstuvwxyz"].forEach(letter => spentScrews[letter] = 0);

// collections
let page = "";

// mastery functions
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

// tabs
const buttons = document.querySelectorAll('.sidebarBtn');
const contents = document.querySelectorAll('.tabContent');
const secretBtn = "secretachievementlist";

// random
let tempVar;

// keyboard
alphabet.forEach(letter => {
    keyDrought[letter] = 0;
    greenProgress[letter] = 1;
});

// chapter pages
const pagesContents = getID('chapter-paragraph');

// settings
const resetModal = document.getElementById("resetModal");
const resetInput = document.getElementById("resetInput");
const confirmReset = document.getElementById("confirmReset");
const cancelReset = document.getElementById("cancelReset");