// Authentication & Session Module

function checkAuthSession() {
  document.getElementById("auth-gateway");
  updateUIForFaculty();
  updateUIForStudent();
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
function updateUIForStudent() {
  const e = document.querySelector(".navbar-nav");
  if ("true" === localStorage.getItem("is_student") && e) {
      if (!document.getElementById("nav-student-profile")) {
          const t = document.createElement("li");
          t.className = "nav-item dropdown ms-xl-3 mt-3 mt-xl-0";
          t.id = "nav-student-profile";
          
          const levelNames = {
              "1": "المستوى الأول",
              "2": "المستوى الثاني",
              "3": "المستوى الثالث",
              "4": "المستوى الرابع"
          };
          const lvl = localStorage.getItem("student_level");
          const levelText = levelNames[lvl] || lvl;
          
          t.innerHTML = `
            <a class="nav-link dropdown-toggle fw-bold text-warning" href="#" id="studentDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fa-solid fa-user-circle fs-5 me-1"></i> ${localStorage.getItem("student_name").split(' ')[0]}
            </a>
            <ul class="dropdown-menu shadow border-0" aria-labelledby="studentDropdown" style="text-align: right; font-family: 'Cairo', sans-serif; min-width: 250px;">
                <li class="px-3 py-2 border-bottom mb-2">
                    <span class="d-block fw-bold text-primary mb-1"><i class="fa-solid fa-user me-2"></i> ${localStorage.getItem("student_name")}</span>
                    <span class="d-block text-muted small mb-1"><i class="fa-solid fa-id-card me-2"></i> الكود: ${localStorage.getItem("student_code")}</span>
                    <span class="d-block text-muted small"><i class="fa-solid fa-layer-group me-2"></i> ${levelText}</span>
                </li>
                <li><a class="dropdown-item text-danger fw-bold py-2" href="#" onclick="logoutStudent(); return false;"><i class="fa-solid fa-right-from-bracket me-2"></i> تسجيل الخروج</a></li>
            </ul>`;
          e.appendChild(t);
      }
  }
}
function selectRole(e) {
    if ("student" === e) {
        if ("true" === localStorage.getItem("is_student")) {
            closeAuthGateway();
            updateUIForStudent();
        } else {
            document.getElementById("auth-role-selection").classList.add("d-none");
            document.getElementById("auth-student-login").classList.remove("d-none");
        }
    } else if ("faculty" === e) {
        if ("true" === localStorage.getItem("is_faculty")) {
            closeAuthGateway();
            updateUIForFaculty();
        } else {
            document.getElementById("auth-role-selection").classList.add("d-none");
            document.getElementById("auth-faculty-login").classList.remove("d-none");
        }
    }
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
        document.getElementById("auth-role-selection").classList.remove("d-none"),
        document.getElementById("auth-faculty-login").classList.add("d-none"),
        document.getElementById("auth-student-login").classList.add("d-none"))
      : (window.location.href = "index.html");
}

function logoutStudent() {
    localStorage.removeItem("is_student");
    localStorage.removeItem("student_code");
    localStorage.removeItem("student_level");
    localStorage.removeItem("student_name");
    const e = document.getElementById("nav-student-profile");
    e && e.remove();
    const t = document.getElementById("auth-gateway");
    t
      ? (t.classList.remove("d-none", "fade-out"),
        document.getElementById("auth-role-selection").classList.remove("d-none"),
        document.getElementById("auth-faculty-login").classList.add("d-none"),
        document.getElementById("auth-student-login").classList.add("d-none"))
      : (window.location.href = "index.html");
}
function backToRoles() {
    document.getElementById("auth-role-selection").classList.remove("d-none");
    document.getElementById("auth-faculty-login").classList.add("d-none");
    document.getElementById("auth-student-login").classList.add("d-none");
    document.getElementById("auth-error").classList.add("d-none");
    document.getElementById("student-auth-error").classList.add("d-none");
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

async function loginStudentByCode() {
    const code = document.getElementById("student-code").value.trim();
    const level = document.getElementById("student-level").value;
    const errorEl = document.getElementById("student-auth-error");
    const modal = document.getElementById("auth-student-login");
    const btns = document.querySelectorAll("#auth-student-login button");
    
    modal.classList.remove("shake");
    void modal.offsetWidth;
    
    if (!code || !level) {
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation me-1 mb-1 fs-6"></i><br>الرجاء إدخال كود الطالب واختيار المستوى.';
        errorEl.classList.remove("d-none");
        modal.classList.add("shake");
        return;
    }
    
    let submitBtn = null;
    btns.forEach((btn) => {
        if (btn.textContent.includes("تسجيل")) submitBtn = btn;
    });
    
    let originalText = "تسجيل الدخول";
    if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري التحقق...';
        submitBtn.disabled = true;
    }
    
    try {
        const res = await window.AppwriteDB.listDocuments(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.studentsCol,
            [
                window.AppwriteQuery.equal("code", code),
                window.AppwriteQuery.equal("level", level)
            ]
        );
        
        if (res.documents.length > 0) {
            const student = res.documents[0];
            localStorage.setItem("is_student", "true");
            localStorage.setItem("student_code", student.code);
            localStorage.setItem("student_name", student.name);
            localStorage.setItem("student_level", student.level);
            
            errorEl.classList.add("d-none");
            closeAuthGateway();
            updateUIForStudent();
        } else {
            errorEl.innerHTML = '<i class="fa-solid fa-shield-halved me-1 mb-1 fs-6"></i><br>عذراً، بيانات الطالب غير صحيحة أو غير موجودة.';
            errorEl.classList.remove("d-none");
            modal.classList.add("shake");
        }
    } catch (err) {
        console.error("Student Auth Error:", err);
        errorEl.innerHTML = '<i class="fa-solid fa-wifi me-1 mb-1 fs-5"></i><br><b>تعذر الاتصال بالخادم</b><br><small>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</small>';
        errorEl.classList.remove("d-none");
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
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
window.updateUIForStudent = updateUIForStudent;
window.selectRole = selectRole;
window.logoutFaculty = logoutFaculty;
window.logoutStudent = logoutStudent;
window.backToRoles = backToRoles;
window.loginFaculty = loginFaculty;
window.loginStudentByCode = loginStudentByCode;
