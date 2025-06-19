// tab+feature+achievement unlocking
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
    if (type == "feature") {
        banner.textContent = text;
        banner.style.backgroundColor = "rgba(150, 255, 150, .5)";
    } else if (type == "achievement") {
        banner.textContent = `Achievement unlocked: ${text}`;
        banner.style.backgroundColor = "rgba(255, 200, 200, .5)";
    } else if (type == "sidebarunlockerror") {
        banner.textContent = "Feature not unlocked yet.";
        banner.style.backgroundColor = "rgba(255, 71, 71, 0.5)";
    }
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