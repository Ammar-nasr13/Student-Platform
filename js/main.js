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
  const e = window.location.pathname.split("/").pop();
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

document.addEventListener("DOMContentLoaded", () => {
    hidePreloader();
    initThemeMode();
    initBackToTop();
    if (typeof initQuizPageEvents === "function") initQuizPageEvents();
    if (typeof initLevelPagesEvents === "function") initLevelPagesEvents();
    highlightActiveNavLink();
});

// Attach to window for global access
window.showToast = showToast;
