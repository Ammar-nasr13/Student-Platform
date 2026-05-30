// Manage Faculty Logic
const allSubjects = [
    "اسس صناعة السياحة والضيافة",
    "تاريخ وحضارة مصر (1)",
    "لغة أجنبية متخصصة (2)",
    "أعمال شركات الطيران",
    "التجارة الالكترونية في منشآت الضيافة",
    "مبادئ تكنولوجيا المعلومات",
    "التخطيط الاستراتيجي",
    "ادارة التراث والمواقع الأثرية",
    "هياكل البيانات",
    "أنظمة الحجز في منشآت السياحة والضيافة",
    "لغة البرمجة 2",
    "البرمجة الشيئية",
    "المرشد الرقمي",
    "إدارة الأحداث والمناسبات الخاصة في الضيافة",
    "التجارة الإلكترونية في وكالات السفر",
    "أنظمة التشغيل",
    "الإدارة الإلكترونية في منشآت الضيافة",
    "الترويج والعلاقات العامة في الضيافة",
    "نظم إدارة قواعد البيانات",
    "رياضيات 2",
    "تطبيقات تكنولوجيا المعلومات في المتاحف والمواقع الأثرية",
    "هندسة البرمجيات",
    "الأمن السيبراني والتسفير (التشفير)",
    "تكنولوجيا الأشخاص ذوي الإعاقة في منشآت السياحة والضيافة",
    "إدارة المطارات الذكية",
    "إدارة العلامة التجارية لمنشآت الضيافة",
    "مشروع التخرج",
    "التكنولوجيا الحديثة في الاكتشافات الأثرية",
    "مبادئ الإرشاد السياحي",
    "لغة انجليزية 1",
    "جغرافية مصر السياحية" // adding some fallbacks if any missing
];

let doctorsList = [];

function populateSubjects() {
    const container = document.getElementById('subjects-container');
    if (!container) return;
    container.innerHTML = '';
    
    // Remove duplicates and sort
    const uniqueSubjects = [...new Set(allSubjects)].sort();
    
    uniqueSubjects.forEach(subject => {
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4';
        col.innerHTML = `
            <div class="form-check form-switch custom-switch bg-white p-2 rounded shadow-sm border h-100">
                <input class="form-check-input ms-0 me-2 subject-checkbox" type="checkbox" role="switch" id="sub_${subject}" value="${subject}">
                <label class="form-check-label small fw-bold text-dark pt-1" for="sub_${subject}">${subject}</label>
            </div>
        `;
        container.appendChild(col);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    populateSubjects();
    fetchDoctors();
});

async function fetchDoctors() {
    const tbody = document.getElementById("doctors-table-body");
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="text-center py-5 text-muted">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p>جاري جلب بيانات أعضاء هيئة التدريس...</p>
            </td>
        </tr>
    `;

    try {
        if (!window.AppwriteDB) throw new Error("AppwriteDB not initialized");

        const response = await window.AppwriteDB.listDocuments(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.doctorsCol,
            [
                window.AppwriteQuery.orderDesc('$createdAt'),
                window.AppwriteQuery.limit(500)
            ]
        );

        doctorsList = response.documents;
        renderDoctorsTable();
    } catch (error) {
        console.error("Error fetching doctors:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-danger fw-bold">
                    <i class="fa-solid fa-circle-exclamation me-2"></i> حدث خطأ أثناء جلب البيانات.
                </td>
            </tr>
        `;
    }
}

function renderDoctorsTable() {
    const tbody = document.getElementById("doctors-table-body");
    if (!tbody) return;

    if (doctorsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5 text-muted">
                    <i class="fa-solid fa-folder-open fs-1 text-black-50 mb-3"></i>
                    <p class="mb-0">لا يوجد أعضاء هيئة تدريس مسجلين حالياً.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = doctorsList.map(doc => {
        const subjectsCount = doc.subjects ? doc.subjects.length : 0;
        const date = new Date(doc.$createdAt).toLocaleDateString('ar-EG');
        return `
            <tr>
                <td class="fw-bold"><i class="fa-solid fa-user-tie text-primary me-2"></i> ${doc.name}</td>
                <td dir="ltr" class="text-muted">${doc.email}</td>
                <td><span class="badge bg-info text-dark rounded-pill px-3 py-2">${subjectsCount} مقررات</span></td>
                <td class="text-muted small">${date}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3 me-1" onclick="openEditDoctorModal('${doc.$id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="deleteDoctor('${doc.$id}')"><i class="fa-solid fa-trash"></i> حذف</button>
                </td>
            </tr>
        `;
    }).join('');
}

function openAddDoctorModal() {
    document.getElementById("doc-id").value = "";
    document.getElementById("doc-name").value = "";
    document.getElementById("doc-email").value = "";
    document.getElementById("doc-password").value = "";
    document.getElementById("doctorModalTitle").textContent = "إضافة دكتور جديد";
    
    // clear checkboxes
    document.querySelectorAll('.subject-checkbox').forEach(cb => cb.checked = false);
}

function openEditDoctorModal(id) {
    const doc = doctorsList.find(d => d.$id === id);
    if (!doc) return;

    document.getElementById("doc-id").value = doc.$id;
    document.getElementById("doc-name").value = doc.name;
    document.getElementById("doc-email").value = doc.email;
    document.getElementById("doc-password").value = doc.password || "";
    document.getElementById("doctorModalTitle").textContent = "تعديل بيانات الدكتور";

    // set checkboxes
    document.querySelectorAll('.subject-checkbox').forEach(cb => {
        cb.checked = (doc.subjects || []).includes(cb.value);
    });

    const modal = new bootstrap.Modal(document.getElementById('doctorModal'));
    modal.show();
}

async function saveDoctor() {
    const id = document.getElementById("doc-id").value;
    const name = document.getElementById("doc-name").value.trim();
    const email = document.getElementById("doc-email").value.trim();
    const password = document.getElementById("doc-password").value;

    if (!name || !email || !password) {
        Swal.fire('بيانات ناقصة', 'الرجاء إدخال الاسم والبريد وكلمة المرور', 'warning');
        return;
    }

    const selectedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked')).map(cb => cb.value);

    const btn = document.getElementById("btn-save-doctor");
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري الحفظ...';
    btn.disabled = true;

    try {
        if (id) {
            // Update
            await window.AppwriteDB.updateDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.doctorsCol,
                id,
                { name, email, password, subjects: selectedSubjects }
            );
            Swal.fire('نجاح', 'تم تحديث بيانات الدكتور بنجاح', 'success');
        } else {
            // Create
            // First check if email exists
            const existing = await window.AppwriteDB.listDocuments(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.doctorsCol,
                [window.AppwriteQuery.equal("email", email)]
            );
            if (existing.documents.length > 0) {
                Swal.fire('تنبيه', 'هذا البريد الإلكتروني مسجل بالفعل لدكتور آخر', 'error');
                return;
            }

            await window.AppwriteDB.createDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.doctorsCol,
                window.AppwriteID.unique(),
                { name, email, password, subjects: selectedSubjects }
            );
            Swal.fire('نجاح', 'تم إضافة الدكتور وتخصيص المقررات بنجاح', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('doctorModal')).hide();
        fetchDoctors();
    } catch (error) {
        console.error("Error saving doctor:", error);
        Swal.fire('خطأ', 'حدث خطأ أثناء حفظ البيانات', 'error');
    } finally {
        btn.innerHTML = oldText;
        btn.disabled = false;
    }
}

async function deleteDoctor(id) {
    const result = await Swal.fire({
        title: 'هل أنت متأكد؟',
        text: 'سيتم حذف حساب الدكتور هذا نهائياً.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
        try {
            await window.AppwriteDB.deleteDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.doctorsCol,
                id
            );
            Swal.fire('تم الحذف', 'تم حذف الحساب بنجاح.', 'success');
            fetchDoctors();
        } catch (error) {
            console.error("Error deleting doctor:", error);
            Swal.fire('خطأ', 'حدث خطأ أثناء الحذف', 'error');
        }
    }
}
