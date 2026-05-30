// Global safe reference getter
function getAppwriteDB() {
    return window.AppwriteDB;
}

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("is_faculty") !== "true") {
        window.location.href = "index.html";
        return;
    }
    
    // Catch any synchronous errors during initialization
    try {
        loadStudents();
    } catch (err) {
        document.getElementById("students-table-body").innerHTML = `<tr><td colspan="5" class="text-danger p-4">خطأ غير متوقع: ${err.message}</td></tr>`;
    }
});

async function loadStudents() {
    const tbody = document.getElementById("students-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted p-4"><i class="fa-solid fa-spinner fa-spin me-2"></i> جاري تحميل بيانات الطلاب...</td></tr>`;
    
    try {
        // Safe checks before making API call
        if (!window.AppwriteDB) throw new Error("AppwriteDB is not initialized");
        if (!window.DB_CONFIG) throw new Error("DB_CONFIG is not initialized");
        if (!window.AppwriteQuery) throw new Error("AppwriteQuery is not initialized");

        // Removed orderDesc("$createdAt") just in case the index doesn't exist
        // to prevent Appwrite 400 errors, though they should have been caught anyway.
        const response = await window.AppwriteDB.listDocuments(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.studentsCol,
            [
                window.AppwriteQuery.limit(1000)
            ]
        );
        
        allStudents = response.documents || [];
        // ترتيب الطلاب حسب المستوى (1 ثم 2 ثم 3 ثم 4)، وإذا تساوى المستوى نرتبهم أبجدياً حسب الاسم
        allStudents.sort((a, b) => {
            const levelA = parseInt(a.level) || 0;
            const levelB = parseInt(b.level) || 0;
            if (levelA !== levelB) {
                return levelA - levelB; // تصاعدي حسب المستوى
            }
            const nameA = (a.name || "").trim();
            const nameB = (b.name || "").trim();
            return nameA.localeCompare(nameB, 'ar'); // ترتيب أبجدي عربي
        });
        
        renderStudents(allStudents);
    } catch (error) {
        console.error("Error loading students:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger p-4 fw-bold">حدث خطأ أثناء تحميل البيانات:<br><small dir="ltr">${error.message}</small></td></tr>`;
        if (typeof showToast === 'function') showToast("فشل في تحميل قائمة الطلاب", "error");
    }
}

function renderStudents(studentsArray) {
    const tbody = document.getElementById("students-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    if (!studentsArray || studentsArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-muted p-4 fw-bold">لا يوجد طلاب مسجلين حالياً.</td></tr>`;
        return;
    }

    const levelNames = {
        "1": "المستوى الأول",
        "2": "المستوى الثاني",
        "3": "المستوى الثالث",
        "4": "المستوى الرابع"
    };

    studentsArray.forEach((student, index) => {
        const tr = document.createElement("tr");
        const studentLevelStr = String(student.level);
        tr.innerHTML = `
            <td class="fw-bold text-muted">${index + 1}</td>
            <td class="fw-bold" dir="ltr">${student.code || 'غير متوفر'}</td>
            <td class="fw-bold text-primary">${student.name || 'غير متوفر'}</td>
            <td><span class="badge bg-secondary">${levelNames[studentLevelStr] || studentLevelStr}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditStudentModal('${student.$id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${student.$id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.filterStudents = function() {
    const searchInput = document.getElementById("search-student");
    const levelInput = document.getElementById("filter-level");
    if (!searchInput || !levelInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterLevel = levelInput.value;
    
    const filtered = allStudents.filter(student => {
        const name = student.name || "";
        const code = student.code || "";
        const matchSearch = name.toLowerCase().includes(searchTerm) || code.toLowerCase().includes(searchTerm);
        const matchLevel = filterLevel === "" || String(student.level) === filterLevel;
        return matchSearch && matchLevel;
    });
    
    renderStudents(filtered);
}

window.openAddStudentModal = function() {
    document.getElementById("studentModalTitle").innerHTML = `إضافة طالب جديد <i class="fa-solid fa-user-plus ms-2"></i>`;
    const form = document.getElementById("student-form");
    if (form) form.reset();
    document.getElementById("student-doc-id").value = "";
}

window.openEditStudentModal = function(id) {
    const student = allStudents.find(s => s.$id === id);
    if (!student) return;
    
    document.getElementById("studentModalTitle").innerHTML = `تعديل بيانات الطالب <i class="fa-solid fa-user-pen ms-2"></i>`;
    document.getElementById("student-doc-id").value = student.$id;
    document.getElementById("student-form-name").value = student.name || '';
    document.getElementById("student-form-code").value = student.code || '';
    document.getElementById("student-form-level").value = student.level || '';
    
    const modalEl = document.getElementById("studentModal");
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

window.saveStudent = async function() {
    const name = document.getElementById("student-form-name").value.trim();
    const code = document.getElementById("student-form-code").value.trim();
    const level = document.getElementById("student-form-level").value;
    const docId = document.getElementById("student-doc-id").value;
    
    if (!name || !code || !level) {
        if (typeof showToast === 'function') showToast("يرجى تعبئة جميع الحقول بشكل صحيح", "warning");
        return;
    }
    
    const btn = document.getElementById("save-student-btn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري الحفظ...`;
    btn.disabled = true;
    
    try {
        if (!window.AppwriteDB) throw new Error("AppwriteDB not initialized");

        const payload = {
            name: name,
            code: code,
            level: String(level)
        };
        
        if (docId) {
            // Update existing
            const updatedDoc = await window.AppwriteDB.updateDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.studentsCol,
                docId,
                payload
            );
            
            // تحديث المصفوفة محلياً وإعادة الترتيب لاحتمالية تغير المستوى
            const index = allStudents.findIndex(s => s.$id === docId);
            if (index !== -1) {
                allStudents[index] = updatedDoc;
            }
            allStudents.sort((a, b) => {
                const levelA = parseInt(a.level) || 0;
                const levelB = parseInt(b.level) || 0;
                if (levelA !== levelB) {
                    return levelA - levelB;
                }
                const nameA = (a.name || "").trim();
                const nameB = (b.name || "").trim();
                return nameA.localeCompare(nameB, 'ar');
            });
            
            if (typeof showToast === 'function') showToast("تم تحديث بيانات الطالب بنجاح", "success");
        } else {
            // Check if code already exists to avoid duplicates
            const existing = await window.AppwriteDB.listDocuments(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.studentsCol,
                [window.AppwriteQuery.equal("code", code)]
            );
            
            if (existing.documents && existing.documents.length > 0) {
                if (typeof showToast === 'function') showToast("كود الطالب مسجل مسبقاً في النظام!", "error");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            // Create new
            const newDoc = await window.AppwriteDB.createDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.studentsCol,
                window.AppwriteID.unique(),
                payload
            );
            
            // إضافة الطالب للمصفوفة محلياً وإعادة الترتيب وعرضه مباشرة لتجنب تأخير الفهرسة
            allStudents.push(newDoc);
            allStudents.sort((a, b) => {
                const levelA = parseInt(a.level) || 0;
                const levelB = parseInt(b.level) || 0;
                if (levelA !== levelB) {
                    return levelA - levelB;
                }
                const nameA = (a.name || "").trim();
                const nameB = (b.name || "").trim();
                return nameA.localeCompare(nameB, 'ar');
            });
            
            if (typeof showToast === 'function') showToast("تم إضافة الطالب بنجاح", "success");
        }
        
        // Hide modal and reload
        const modalEl = document.getElementById("studentModal");
        if (modalEl) {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) backdrop.remove();
            }
        }
        
        // إعادة عرض القائمة محلياً بعد التحديث
        filterStudents(); // Filter and render
    } catch (error) {
        console.error("Save Student Error:", error);
        if (typeof showToast === 'function') showToast("حدث خطأ أثناء الحفظ: " + error.message, "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

window.deleteStudent = async function(id) {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            title: "هل أنت متأكد؟",
            text: "لن تتمكن من استعادة بيانات هذا الطالب بعد الحذف!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "نعم، احذف الطالب!",
            cancelButtonText: "إلغاء"
        }).then(async (result) => {
            if (result.isConfirmed) {
                await executeDelete(id);
            }
        });
    } else {
        if (confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
            await executeDelete(id);
        }
    }
}

async function executeDelete(id) {
    try {
        if (!window.AppwriteDB) throw new Error("AppwriteDB not initialized");
        await window.AppwriteDB.deleteDocument(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.studentsCol,
            id
        );
        
        // إزالة الطالب محلياً وتحديث العرض فوراً
        allStudents = allStudents.filter(s => s.$id !== id);
        
        if (typeof showToast === 'function') showToast("تم حذف الطالب بنجاح", "success");
        filterStudents();
    } catch (error) {
        console.error("Delete error:", error);
        if (typeof showToast === 'function') showToast("حدث خطأ أثناء الحذف: " + error.message, "error");
    }
}
