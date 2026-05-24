// Authentication & Session Module

function checkAuthSession() {
  document.getElementById("auth-gateway");
  updateUIForFaculty();
}
function closeAuthGateway() {
  const e = document.getElementById("auth-gateway");
  e &&
    (e.classList.add("fade-out"),
    setTimeout(() => {
      e.classList.add("d-none");
    }, 400));
}
function updateUIForFaculty() {
  if ("true" === localStorage.getItem("is_faculty")) {
    const e = document.querySelector(".navbar-nav");
    if (e && !document.getElementById("nav-add-exam")) {
      const t = document.createElement("li");
      ((t.className = "nav-item ms-xl-3 mt-3 mt-xl-0"),
        (t.id = "nav-add-exam"),
        (t.innerHTML =
          '<a href="add_exam.html" class="btn btn-warning fw-bold px-3 rounded-pill text-dark shadow-sm"><i class="fa-solid fa-plus-circle me-1"></i> إضافة اختبار</a>'),
        e.appendChild(t));
    }
  }
}
function selectRole(e) {
    if ("student" === e) {
      localStorage.removeItem("is_faculty");
      const e = document.getElementById("nav-add-exam");
      (e && e.remove(), closeAuthGateway());
    } else
      "faculty" === e &&
        ("true" === localStorage.getItem("is_faculty")
          ? (closeAuthGateway(), updateUIForFaculty())
          : (document
              .getElementById("auth-role-selection")
              .classList.add("d-none"),
            document
              .getElementById("auth-faculty-login")
              .classList.remove("d-none")));
  }
async function logoutFaculty() {
    try {
      window.AppwriteAccount &&
        (await window.AppwriteAccount.deleteSession("current"));
    } catch (e) {
      console.error("Logout error:", e);
    }
    localStorage.removeItem("is_faculty");
    const e = document.getElementById("nav-add-exam");
    e && e.remove();
    const t = document.getElementById("auth-gateway");
    t
      ? (t.classList.remove("d-none", "fade-out"),
        document
          .getElementById("auth-role-selection")
          .classList.remove("d-none"),
        document.getElementById("auth-faculty-login").classList.add("d-none"))
      : (window.location.href = "index.html");
  }
function backToRoles() {
    (document.getElementById("auth-role-selection").classList.remove("d-none"),
      document.getElementById("auth-faculty-login").classList.add("d-none"),
      document.getElementById("auth-error").classList.add("d-none"));
  }
async function loginFaculty() {
    const e = document.getElementById("faculty-username").value.trim(),
      t = document.getElementById("faculty-password").value,
      n = document.getElementById("auth-error"),
      modal = document.getElementById("auth-faculty-login"),
      s = document.querySelectorAll("#auth-faculty-login button");
    modal.classList.remove("shake");
    void modal.offsetWidth;
    if (!e || !t) {
        n.innerHTML = '<i class="fa-solid fa-circle-exclamation me-1 mb-1 fs-6"></i><br>الرجاء إدخال البريد الإلكتروني وكلمة المرور.';
        n.classList.remove("d-none");
        modal.classList.add("shake");
        return;
    }
    if (!e.includes('@')) {
        n.innerHTML = '<i class="fa-solid fa-circle-exclamation me-1 mb-1 fs-6"></i><br>صيغة البريد الإلكتروني غير صحيحة.';
        n.classList.remove("d-none");
        modal.classList.add("shake");
        return;
    }
    let o = null;
    s.forEach((btn) => {
      btn.textContent.includes("تسجيل") && (o = btn);
    });
    let i = "تسجيل الدخول";
    o &&
      ((i = o.innerHTML),
      (o.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري التحقق...'),
      (o.disabled = !0));
    try {
      (await window.AppwriteAccount.createEmailPasswordSession(e, t),
        localStorage.setItem("is_faculty", "true"),
        n.classList.add("d-none"),
        closeAuthGateway(),
        updateUIForFaculty());
    } catch (err) {
      console.error("Auth Error:", err);
      const errStr = String(err).toLowerCase();
      if (errStr.includes("fetch") || errStr.includes("network"))
        n.innerHTML =
          '<i class="fa-solid fa-wifi me-1 mb-1 fs-5"></i><br><b>تعذر الاتصال بالخادم</b><br><small>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</small>';
      else if (errStr.includes("session")) {
        return (
          (n.innerHTML =
            '<i class="fa-solid fa-circle-check me-1 mb-1 fs-6"></i><br>أنت مسجل الدخول بالفعل، جاري توجيهك...'),
            n.classList.replace("alert-danger", "alert-success"),
            n.classList.remove("d-none"),
          void setTimeout(() => {
            (localStorage.setItem("is_faculty", "true"),
              n.classList.add("d-none"),
              n.classList.replace("alert-success", "alert-danger"),
              closeAuthGateway(),
              updateUIForFaculty());
          }, 1500)
        );
      } else {
        n.innerHTML =
          '<i class="fa-solid fa-shield-halved me-1 mb-1 fs-6"></i><br>عذراً، البريد الإلكتروني أو كلمة المرور غير متطابقة مع سجلات النظام المعتمدة.';
        modal.classList.add("shake");
      }
      n.classList.remove("d-none");
    } finally {
      o && ((o.innerHTML = i), (o.disabled = !1));
    }
  }

// Initialize auth check on DOM load
document.addEventListener("DOMContentLoaded", () => {
    if (typeof checkAuthSession === "function") checkAuthSession();
});

document.addEventListener("DOMContentLoaded", () => {
    const togglePassword = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("faculty-password");
    const toggleIcon = document.getElementById("toggle-password-icon");
    if (togglePassword && passwordInput && toggleIcon) {
        togglePassword.addEventListener("click", () => {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            if (type === "text") {
                toggleIcon.classList.remove("fa-eye-slash");
                toggleIcon.classList.add("fa-eye");
            } else {
                toggleIcon.classList.remove("fa-eye");
                toggleIcon.classList.add("fa-eye-slash");
            }
        });
    }
  });

// Attach to window for global access
window.checkAuthSession = checkAuthSession;
window.closeAuthGateway = closeAuthGateway;
window.updateUIForFaculty = updateUIForFaculty;
window.selectRole = selectRole;
window.logoutFaculty = logoutFaculty;
window.backToRoles = backToRoles;
window.loginFaculty = loginFaculty;
