// Core UI & Main Setup Module

function hidePreloader() {
  const e = document.getElementById("preloader");
  e &&
    (e.classList.add("fade-out"),
    setTimeout(() => {
      e.style.display = "none";
    }, 500));
}
function highlightActiveNavLink() {
  let e = window.location.pathname.split("/").pop();
  if (!e || e === "/") e = "index.html";
  document.querySelectorAll(".navbar-nav .nav-link").forEach((t) => {
    const n = t.getAttribute("href");
    e === n ? t.classList.add("active") : t.classList.remove("active");
  });
}
function initThemeMode() {
  const e = document.getElementById("theme-toggle");
  if (!e) return;
  ("dark" === (localStorage.getItem("theme") || "light")
    ? (document.body.classList.add("dark-theme"),
      (e.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>'))
    : (document.body.classList.remove("dark-theme"),
      (e.innerHTML = '<i class="fa-solid fa-moon"></i>')),
    e.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      let t = "light";
      (document.body.classList.contains("dark-theme")
        ? ((t = "dark"),
          (e.innerHTML = '<i class="fa-solid fa-sun text-warning"></i>'),
          showToast("تم تفعيل الوضع الليلي 🌙", "info"))
        : ((e.innerHTML = '<i class="fa-solid fa-moon"></i>'),
          showToast("تم تفعيل الوضع المضيء ☀️", "info")),
        localStorage.setItem("theme", t));
    }));
}
function initBackToTop() {
  let e = document.getElementById("back-to-top-btn");
  (e ||
    ((e = document.createElement("button")),
    (e.id = "back-to-top-btn"),
    (e.className = "back-to-top"),
    (e.innerHTML = '<i class="fa-solid fa-arrow-up"></i>'),
    document.body.appendChild(e)),
    window.addEventListener("scroll", () => {
      window.scrollY > 300
        ? e.classList.add("show")
        : e.classList.remove("show");
    }),
    e.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
}
function showToast(e, t = "success") {
  let n = document.getElementById("toast-container");
  n ||
    ((n = document.createElement("div")),
    (n.id = "toast-container"),
    document.body.appendChild(n));
  const s = document.createElement("div");
  s.className = `custom-toast toast-${t}`;
  let o = '<i class="fa-solid fa-circle-check text-success"></i>';
  ("info" === t && (o = '<i class="fa-solid fa-circle-info text-info"></i>'),
    "warning" === t &&
      (o = '<i class="fa-solid fa-triangle-exclamation text-warning"></i>'),
    (s.innerHTML = `\n        ${o}\n        <div>${e}</div>\n    `),
    n.appendChild(s),
    setTimeout(() => {
      ((s.style.opacity = "0"),
        setTimeout(() => {
          s.remove();
        }, 300));
    }, 3500));
}

function initLevelSelectorButtons() {
  const containers = document.querySelectorAll(".level-buttons-container");
  containers.forEach((container) => {
    const buttons = container.querySelectorAll(".level-select-btn");
    const selectId = container.id.includes("summaries") ? "summaries-level-select" : "quiz-level-select";
    const hiddenInput = document.getElementById(selectId);
    
    if (hiddenInput) {
      hiddenInput.addEventListener("change", () => {
        const val = hiddenInput.value;
        if (!val) {
          buttons.forEach((b) => b.classList.remove("active-level"));
          container.classList.remove("has-active");
        } else {
          buttons.forEach((b) => {
            if (b.getAttribute("data-level") === val) {
              b.classList.add("active-level");
            } else {
              b.classList.remove("active-level");
            }
          });
          container.classList.add("has-active");
        }
      });
    }

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = btn.getAttribute("data-level");
        if (hiddenInput) {
          hiddenInput.value = val;
          hiddenInput.dispatchEvent(new Event("change"));
        }
      });
    });
  });
}

function loadAdsScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="js/ads.js"]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'js/ads.js';
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load ads script."));
    document.body.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", () => {
    hidePreloader();
    initThemeMode();
    initBackToTop();
    if (typeof initQuizPageEvents === "function") initQuizPageEvents();
    if (typeof initLevelPagesEvents === "function") initLevelPagesEvents();
    highlightActiveNavLink();
    initLevelSelectorButtons();
    
    // Load and initialize Ads Engine dynamically
    loadAdsScript().then(() => {
        if (typeof initAppwriteAds === "function") {
            initAppwriteAds();
        }
    }).catch((err) => console.warn("Ads Engine: ", err));
});

// Attach to window for global access
window.showToast = showToast;
