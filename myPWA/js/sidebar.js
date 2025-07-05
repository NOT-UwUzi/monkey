// sidebar
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (tabLocked) return;

        const target = btn.getAttribute('data-tab');

        let tempVar = false;
        if (target == "achievement" && !achievementTabEnabled) tempVar = true;
        if (target == "mastery" && !masteryTabEnabled) tempVar = true;
        if (target == "collection" && !collectionTabEnabled) tempVar = true;
        if (target == "chapter" && !chapterTabEnabled) tempVar = true;
        if (!target) return;

        if (tempVar) {
            showPopup("sidebarunlockerror", "");
            return;
        }

        if (target == "chapter") displayChapterContent(currentPos);
        tabLocked = true;
        setTimeout(() => tabLocked = false, 1); // no breaking!

        // switch
        contents.forEach(c => {
            const tabId = c.id;

            if (tabTimeouts.has(tabId)) {
                clearTimeout(tabTimeouts.get(tabId));
                tabTimeouts.delete(tabId);
            }

            if (tabId === target) {
                c.classList.remove('fading');
                c.style.display = "block";
                const timeoutId = setTimeout(() => {
                    c.classList.add('active');
                    activeTab = target;
                }, 10);
                tabTimeouts.set(tabId, timeoutId);
            } else {
                c.classList.remove('active');
                c.classList.add('fading');
                const timeoutId = setTimeout(() => {
                    c.style.display = "none";
                    c.classList.remove('fading');
                }, 400);
                tabTimeouts.set(tabId, timeoutId);
            }
        });

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// more sidebar!!
document.addEventListener("keydown", (e) => {
    if (tabLocked) return;

    const buttonArray = Array.from(buttons);
    const currentIndex = buttonArray.findIndex(btn => btn.getAttribute('data-tab') === activeTab);

    if (e.key === 'ArrowUp') {
        let i = currentIndex;
        do {
            i = (i - 1 + buttonArray.length) % buttonArray.length;
            const target = buttonArray[i].getAttribute('data-tab');
            if (
                target &&
                (target !== "achievement" || achievementTabEnabled) &&
                (target !== "mastery" || masteryTabEnabled) &&
                (target !== "collection" || collectionTabEnabled) &&
                (target !== "chapter" || chapterTabEnabled)
            ) {
                buttonArray[i].click();
                break;
            }
        } while (i !== currentIndex);
    }

    if (e.key === 'ArrowDown') {
        let i = currentIndex;
        do {
            i = (i + 1) % buttonArray.length;
            const target = buttonArray[i].getAttribute('data-tab');
            if (
                target &&
                (target !== "achievement" || achievementTabEnabled) &&
                (target !== "mastery" || masteryTabEnabled) &&
                (target !== "collection" || collectionTabEnabled) &&
                (target !== "chapter" || chapterTabEnabled)
            ) {
                buttonArray[i].click();
                break;
            }
        } while (i !== currentIndex);
    }
});

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