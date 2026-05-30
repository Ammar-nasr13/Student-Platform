const databases = new Appwrite.Databases(client);
let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("is_faculty") !== "true") {
        window.location.href = "index.html";
        return;
    }
    loadStudents();
});

async function loadStudents() {
    const tbody = document.getElementById("students-table-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted p-4"><i class="fa-solid fa-spinner fa-spin me-2"></i> جاري تحميل بيانات الطلاب...</td></tr>`;
    
    try {
        const response = await databases.listDocuments(
            DB_CONFIG.DATABASE_ID,
            DB_CONFIG.STUDENTS_COLLECTION_ID,
            [
                Appwrite.Query.limit(100),
                Appwrite.Query.orderDesc("$createdAt")
            ]
        );
        
        allStudents = response.documents;
        renderStudents(allStudents);
    } catch (error) {
        console.error("Error loading students:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger p-4">حدث خطأ أثناء تحميل البيانات: ${error.message}</td></tr>`;
        showToast("فشل في تحميل قائمة الطلاب", "error");
    }
}

function renderStudents(studentsArray) {
    const tbody = document.getElementById("students-table-body");
    tbody.innerHTML = "";
    
    if (studentsArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-muted p-4">لا يوجد طلاب مسجلين حالياً.</td></tr>`;
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
        tr.innerHTML = `
            <td class="fw-bold text-muted">${index + 1}</td>
            <td class="fw-bold" dir="ltr">${student.code}</td>
            <td class="fw-bold text-primary">${student.name}</td>
            <td><span class="badge bg-secondary">${levelNames[student.level] || student.level}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditStudentModal('${student.$id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${student.$id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterStudents() {
    const searchTerm = document.getElementById("search-student").value.toLowerCase().trim();
    const filterLevel = document.getElementById("filter-level").value;
    
    const filtered = allStudents.filter(student => {
        const matchSearch = student.name.toLowerCase().includes(searchTerm) || student.code.toLowerCase().includes(searchTerm);
        const matchLevel = filterLevel === "" || student.level === filterLevel;
        return matchSearch && matchLevel;
    });
    
    renderStudents(filtered);
}

function openAddStudentModal() {
    document.getElementById("studentModalTitle").innerHTML = `إضافة طالب جديد <i class="fa-solid fa-user-plus ms-2"></i>`;
    document.getElementById("student-form").reset();
    document.getElementById("student-doc-id").value = "";
}

function openEditStudentModal(id) {
    const student = allStudents.find(s => s.$id === id);
    if (!student) return;
    
    document.getElementById("studentModalTitle").innerHTML = `تعديل بيانات الطالب <i class="fa-solid fa-user-pen ms-2"></i>`;
    document.getElementById("student-doc-id").value = student.$id;
    document.getElementById("student-form-name").value = student.name;
    document.getElementById("student-form-code").value = student.code;
    document.getElementById("student-form-level").value = student.level;
    
    const modal = new bootstrap.Modal(document.getElementById("studentModal"));
    modal.show();
}

async function saveStudent() {
    const name = document.getElementById("student-form-name").value.trim();
    const code = document.getElementById("student-form-code").value.trim();
    const level = document.getElementById("student-form-level").value;
    const docId = document.getElementById("student-doc-id").value;
    
    if (!name || !code || !level) {
        showToast("يرجى تعبئة جميع الحقول بشكل صحيح", "warning");
        return;
    }
    
    const btn = document.getElementById("save-student-btn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري الحفظ...`;
    btn.disabled = true;
    
    try {
        const payload = {
            name: name,
            code: code,
            level: level
        };
        
        if (docId) {
            // Update existing
            await databases.updateDocument(
                DB_CONFIG.DATABASE_ID,
                DB_CONFIG.STUDENTS_COLLECTION_ID,
                docId,
                payload
            );
            showToast("تم تحديث بيانات الطالب بنجاح", "success");
        } else {
            // Check if code already exists to avoid duplicates
            const existing = await databases.listDocuments(
                DB_CONFIG.DATABASE_ID,
                DB_CONFIG.STUDENTS_COLLECTION_ID,
                [Appwrite.Query.equal("code", code)]
            );
            
            if (existing.documents.length > 0) {
                showToast("كود الطالب مسجل مسبقاً في النظام!", "error");
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }
            
            // Create new
            await databases.createDocument(
                DB_CONFIG.DATABASE_ID,
                DB_CONFIG.STUDENTS_COLLECTION_ID,
                Appwrite.ID.unique(),
                payload,
                [
                    Appwrite.Permission.read(Appwrite.Role.any())
                ]
            );
            showToast("تم إضافة الطالب بنجاح", "success");
        }
        
        // Hide modal and reload
        const modalEl = document.getElementById("studentModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        } else {
            // Fallback for bootstrap modal closure
            modalEl.classList.remove('show');
            modalEl.style.display = 'none';
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        }
        
        loadStudents();
    } catch (error) {
        console.error("Save Student Error:", error);
        showToast("حدث خطأ أثناء الحفظ: " + error.message, "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function deleteStudent(id) {
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
        await databases.deleteDocument(
            DB_CONFIG.DATABASE_ID,
            DB_CONFIG.STUDENTS_COLLECTION_ID,
            id
        );
        showToast("تم حذف الطالب بنجاح", "success");
        loadStudents();
    } catch (error) {
        console.error("Delete error:", error);
        showToast("حدث خطأ أثناء الحذف: " + error.message, "error");
    }
}
