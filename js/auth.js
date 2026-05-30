// Authentication & Session Module

function checkAuthSession() {
  document.getElementById("auth-gateway");
  if (localStorage.getItem("is_faculty") === "true") {
    updateUIForFaculty();
  } else if (localStorage.getItem("is_student") === "true") {
    updateUIForStudent();
  }
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
    if (e) {
      const isDBAdmin = localStorage.getItem("faculty_email") === "techno-dms@hotmail.com";
      if (isDBAdmin && !document.getElementById("nav-manage-students")) {
        const li = document.createElement("li");
        li.className = "nav-item";
        li.id = "nav-manage-students";
        const isActive = window.location.pathname.includes("manage_students.html") ? "active" : "";
        li.innerHTML = `<a class="nav-link ${isActive}" href="manage_students.html">إدارة الطلاب</a>`;
        e.appendChild(li);
      }
      if (isDBAdmin && !document.getElementById("nav-manage-faculty")) {
        const li = document.createElement("li");
        li.className = "nav-item";
        li.id = "nav-manage-faculty";
        const isActive = window.location.pathname.includes("manage_faculty.html") ? "active" : "";
        li.innerHTML = `<a class="nav-link ${isActive}" href="manage_faculty.html">إدارة أعضاء التدريس</a>`;
        e.appendChild(li);
      }
      if (isDBAdmin && !document.getElementById("nav-dbadmin-profile")) {
        const li = document.createElement("li");
        li.className = "nav-link-item mt-3 mt-xl-0";
        li.id = "nav-dbadmin-profile";
        const isActive = window.location.pathname.includes("profile.html") ? "active" : "";
        li.innerHTML = `
            <a class="nav-link fw-bold d-flex align-items-center ${isActive}" href="profile.html">
                <i class="fa-solid fa-user-shield fs-5 me-1"></i> الملف الشخصي
            </a>`;
        e.appendChild(li);
      }
      if (!isDBAdmin && !document.getElementById("nav-add-exam")) {
        const t = document.createElement("li");
        ((t.className = "nav-item ms-xl-3 mt-3 mt-xl-0"),
          (t.id = "nav-add-exam"),
          (t.innerHTML =
            '<a href="add_exam.html" class="btn btn-warning fw-bold px-3 rounded-pill text-dark shadow-sm"><i class="fa-solid fa-plus-circle me-1"></i> إضافة اختبار</a>'),
          e.appendChild(t));
      }
      if (!isDBAdmin && !document.getElementById("nav-regular-faculty-profile")) {
        const li = document.createElement("li");
        li.className = "nav-link-item mt-3 mt-xl-0";
        li.id = "nav-regular-faculty-profile";
        const isActive = window.location.pathname.includes("faculty_profile.html") ? "active" : "";
        li.innerHTML = `
            <a class="nav-link fw-bold d-flex align-items-center ${isActive}" href="faculty_profile.html">
                <i class="fa-solid fa-user-tie fs-5 me-1"></i> الملف الشخصي
            </a>`;
        e.appendChild(li);
      }
      
      if (isDBAdmin) {
        const selectorsToHide = [
            'a[href="exams.html"]',
            'a[href="summaries.html"]',
            'a[href="favorites.html"]',
            'a[data-bs-target="#levelsModal"]',
            'a[href="add_exam.html"]'
        ];
        selectorsToHide.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (el.parentElement && el.parentElement.tagName === 'LI') {
                    el.parentElement.style.display = 'none';
                } else {
                    el.style.display = 'none';
                }
            });
        });
      }
    }
  }
}
function updateUIForStudent() {
  const e = document.querySelector(".navbar-nav");
  if ("true" === localStorage.getItem("is_student") && e) {
      if (!document.getElementById("nav-student-profile")) {
          const t = document.createElement("li");
          t.className = "nav-link-item mt-3 mt-xl-0";
          t.id = "nav-student-profile";
          t.innerHTML = `
            <a class="nav-link fw-bold d-flex align-items-center" href="profile.html">
                <i class="fa-solid fa-user-circle fs-5 me-1"></i> الملف الشخصي
            </a>`;
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
    localStorage.removeItem("faculty_email");
    const e = document.getElementById("nav-add-exam");
    e && e.remove();
    const ms = document.getElementById("nav-manage-students");
    ms && ms.remove();
    const mf = document.getElementById("nav-manage-faculty");
    mf && mf.remove();
    const prof = document.getElementById("nav-dbadmin-profile");
    prof && prof.remove();
    const regProf = document.getElementById("nav-regular-faculty-profile");
    regProf && regProf.remove();
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
        let docName = "عضو هيئة تدريس";
        let docSubjects = [];
        let isValidLogin = false;

        if (e === 'techno-dms@hotmail.com' && t === 'techno-dms@12345') {
            isValidLogin = true;
            docName = "مسؤول قاعدة البيانات";
        } else {
            const res = await window.AppwriteDB.listDocuments(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.doctorsCol,
                [window.AppwriteQuery.equal("email", e)]
            );
            if (res.documents.length > 0) {
                const doc = res.documents[0];
                if (doc.password === t) {
                    isValidLogin = true;
                    docName = doc.name || docName;
                    docSubjects = doc.subjects || docSubjects;
                }
            }
        }

        if (!isValidLogin) {
            throw new Error("Invalid credentials");
        }

        localStorage.setItem("is_faculty", "true");
        localStorage.setItem("faculty_email", e);
        localStorage.setItem("faculty_name", docName);
        localStorage.setItem("faculty_subjects", JSON.stringify(docSubjects));
        
        localStorage.removeItem("is_student"); // Clear student session if exists
        n.classList.add("d-none");
        closeAuthGateway();
        updateUIForFaculty();
    } catch (err) {
      console.error("Auth Error:", err);
      const errStr = String(err).toLowerCase();
      if (errStr.includes("fetch") || errStr.includes("network")) {
        n.innerHTML =
          '<i class="fa-solid fa-wifi me-1 mb-1 fs-5"></i><br><b>تعذر الاتصال بالخادم</b><br><small>يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</small>';
      } else {
        n.innerHTML =
          '<i class="fa-solid fa-circle-xmark me-1 mb-1 fs-6"></i><br>عذراً، البريد الإلكتروني أو كلمة المرور غير متطابقة.';
      }
      
      n.classList.remove("d-none");
      modal.classList.add("shake");
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
            localStorage.removeItem("is_faculty"); // Clear faculty session if exists
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
