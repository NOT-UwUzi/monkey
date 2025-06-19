// changes sidebar tab
buttons.forEach(btn => {
btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');

    tempVar = false;
    if (target == "achievement" && !achievementTabEnabled) tempVar = true;
    if (target == "mastery" && !masteryTabEnabled) tempVar = true;
    if (target == "collection" && !collectionTabEnabled) tempVar = true;
    if (target == "chapter" && !chapterTabEnabled) tempVar = true;
    if (!target) return;

    if (tempVar == true) {showPopup("sidebarunlockerror", ""); return;}

    contents.forEach(c => {
        if (c.id === target) {
            c.classList.remove('fading');
            c.style.display = "block";
            setTimeout(() => {
            c.classList.add('active');
            }, 10);
        } else {
            c.classList.remove('active');
        c.classList.add('fading');
        setTimeout(() => {
            c.style.display = "none";
            c.classList.remove('fading');
        }, 400);
    }});
})});

// open sidebar when mouse enters
document.querySelectorAll(".sidebar .item").forEach(item => {
    item.addEventListener("mouseenter", (e) => {
        const label = item.getAttribute("label");
        let flag = label.includes("Sidebar");
        if (!label || (pinned && !flag)) return;
        const rect = item.getBoundingClientRect();
        tooltip.textContent = label;
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = "translateY(-50%)";
        tooltip.classList.add("visible");
    });
    item.addEventListener("mouseleave", () => tooltip.classList.remove("visible"));
});

// sidebar lock icon
function togglesidebarPin(e) {
    tooltip.classList.remove("visible");
    e.preventDefault();
    pinned = !pinned;
    sidebar.classList.toggle("pinned", pinned);
    sidebar.classList.toggle("visible", pinned);
    sidebarLockIcon.setAttribute("name", pinned ? "chevrons-left" : "chevrons-right");
    const label = pinned ? "Close Sidebar (ctrl+s)" : "Lock Sidebar Open (ctrl+s)";
    sidebarLock.setAttribute("label", label);
    tooltip.innerHTML = label;
}

sidebarLock.addEventListener("click", togglesidebarPin);
sidebarContainer.addEventListener("mouseenter", () => !pinned && sidebar.classList.add("visible"));
sidebarContainer.addEventListener("mouseleave", () => !pinned && sidebar.classList.remove("visible"));

// secret achievement open!
function activateSecretAchievements() {
    if (!secretBtn) return;

    contents.forEach(c => {
        if (c.id === secretBtn) {
        c.classList.remove('fading');
        c.style.display = "block";
        setTimeout(() => {
            c.classList.add('active');
        }, 10);
        } else {
        c.classList.remove('active');
        c.classList.add('fading');
        setTimeout(() => {
            c.style.display = "none";
            c.classList.remove('fading');
        }, 400);
        }
    });
};