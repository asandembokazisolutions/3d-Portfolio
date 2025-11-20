const swiper = new Swiper(".swiper", {
    effect: "cube",
    allowTouchMove: false,
    grabCursor: false,
    cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 20,
        shadowScale: 0.94,
    },
    mousewheel: true,
});

function Navigate(indx) {
    const items = Array.from(document.querySelectorAll(".Links li"));
    items.forEach((i) => i.classList.remove("activeLink"));
    if (items[indx]) items[indx].classList.add("activeLink");
    swiper.slideTo(indx, 1000, true);
}

function goToContact(focusForm = false) {
    try {
        Navigate(3);
        if (focusForm) {
            setTimeout(() => {
                const el = document.getElementById("contactName");
                if (el) el.focus();
            }, 1200);
        }
    } catch (e) {
        console.error("Navigation failed", e);
    }
}

function showToast(msg, timeout = 3000) {
    const t = document.createElement("div");
    t.className = "app-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("visible"));
    setTimeout(() => {
        t.classList.remove("visible");
        setTimeout(() => t.remove(), 300);
    }, timeout);
}

function setActiveSidebar(index) {
    const items = Array.from(document.querySelectorAll(".Links li"));
    items.forEach((i) => i.classList.remove("activeLink"));
    if (items[index]) items[index].classList.add("activeLink");
}

if (swiper && swiper.on) {
    swiper.on("slideChange", () => setActiveSidebar(swiper.activeIndex));
}

document.addEventListener("DOMContentLoaded", () => {
    const homeBtn = document.getElementById("homeContactBtn");
    if (homeBtn) homeBtn.addEventListener("click", () => goToContact(true));

    const aboutBtn = document.getElementById("aboutContactBtn");
    if (aboutBtn) aboutBtn.addEventListener("click", () => goToContact(true));

    try {
        setActiveSidebar(swiper.activeIndex);
    } catch (e) {
    }
});