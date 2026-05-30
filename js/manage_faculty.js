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
                <td colspan="6" class="text-center py-5 text-muted">
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
                <td>
                    <input class="form-check-input doctor-select-check" type="checkbox" value="${doc.$id}">
                </td>
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

function toggleSelectAllDoctors() {
    const isChecked = document.getElementById('selectAllDoctors').checked;
    document.querySelectorAll('.doctor-select-check').forEach(cb => {
        cb.checked = isChecked;
    });
}

function openPrintModal() {
    const selected = document.querySelectorAll('.doctor-select-check:checked');
    if (selected.length === 0) {
        Swal.fire('تنبيه', 'الرجاء تحديد دكتور واحد على الأقل للطباعة', 'info');
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById('printModal'));
    modal.show();
}

async function executePrint() {
    // 1. Get selected doctors
    const selectedIds = Array.from(document.querySelectorAll('.doctor-select-check:checked')).map(cb => cb.value);
    const selectedDocs = doctorsList.filter(d => selectedIds.includes(d.$id));
    
    // 2. Get selected columns
    const cols = Array.from(document.querySelectorAll('.print-col-check:checked')).map(cb => cb.value);
    if (cols.length === 0) {
        Swal.fire('تنبيه', 'الرجاء اختيار عمود واحد على الأقل للطباعة', 'warning');
        return;
    }

    // 3. Logo Handling
    const logoRightInput = document.getElementById('print-logo-right');
    const logoCenterInput = document.getElementById('print-logo-center');
    const logoLeftInput = document.getElementById('print-logo-left');

    const readLogo = (input) => new Promise((resolve) => {
        if (input && input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(input.files[0]);
        } else {
            resolve('');
        }
    });

    const [logoRightUrl, logoCenterUrl, logoLeftUrl] = await Promise.all([
        readLogo(logoRightInput),
        readLogo(logoCenterInput),
        readLogo(logoLeftInput)
    ]);

    // 4. Build HTML Template (Academic Letter Format)
    let html = `
    <style>
        @media print {
            @page {
                size: A4;
                margin: 20mm;
            }
            body * {
                visibility: hidden;
            }
            #print-container {
                display: block !important;
                visibility: visible;
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                direction: rtl;
                font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            #print-container * {
                visibility: visible;
            }
            .print-card {
                page-break-after: always;
                padding: 40px 20px;
                border: 2px solid #1a365d;
                border-radius: 15px;
                background-color: #fff;
                margin-bottom: 20px;
                position: relative;
            }
            .print-card:last-child {
                page-break-after: auto;
            }
            .print-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 30px;
                border-bottom: 4px double #1a365d;
                padding-bottom: 20px;
            }
            .logo-placeholder {
                width: 120px;
            }
            .logo-img {
                max-width: 120px;
                max-height: 120px;
                object-fit: contain;
            }
            .center-logo-img {
                max-width: 100px;
                max-height: 100px;
                margin-bottom: 10px;
            }
            .university-titles {
                flex-grow: 1;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .university-titles h2 {
                color: #1a365d !important;
                margin: 0 0 10px 0;
                font-size: 26px;
                font-weight: 800;
                letter-spacing: 0.5px;
            }
            .university-titles h3 {
                color: #4b5563 !important;
                margin: 0;
                font-size: 20px;
                font-weight: 600;
            }
            .doc-title {
                text-align: center;
                margin-bottom: 40px;
                font-weight: 800;
                font-size: 22px;
                text-decoration: underline;
                text-underline-offset: 8px;
                color: #1e293b !important;
            }
            .greeting-text {
                font-size: 18px;
                line-height: 2;
                color: #334155 !important;
            }
            .print-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                border: 2px solid #94a3b8;
            }
            .print-table th, .print-table td {
                border: 1px solid #cbd5e1;
                padding: 14px 18px;
                font-size: 17px;
            }
            .print-table th {
                background-color: #f8fafc !important;
                color: #0f172a !important;
                font-weight: 800;
                width: 35%;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .print-table td {
                color: #1e293b !important;
                font-weight: 600;
            }
            .footer-signature {
                margin-top: 70px;
                display: flex;
                justify-content: space-between;
                padding: 0 40px;
            }
            .signature-box {
                text-align: center;
                min-width: 200px;
            }
            .signature-box p {
                margin: 5px 0;
                font-weight: 800;
                font-size: 19px;
                color: #0f172a !important;
            }
            .signature-line {
                margin-top: 40px;
                border-bottom: 2px dashed #94a3b8;
                width: 80%;
                margin-left: auto;
                margin-right: auto;
            }
        }
    </style>
    `;

    selectedDocs.forEach(doc => {
        const rightHtml = logoRightUrl ? `<img src="${logoRightUrl}" class="logo-img" alt="شعار يمين">` : `<div class="logo-placeholder"></div>`;
        const centerHtml = logoCenterUrl ? `<img src="${logoCenterUrl}" class="logo-img center-logo-img" alt="شعار وسط">` : ``;
        const leftHtml = logoLeftUrl ? `<img src="${logoLeftUrl}" class="logo-img" alt="شعار يسار">` : `<div class="logo-placeholder"></div>`;

        html += `
        <div class="print-card">
            <div class="print-header">
                ${rightHtml}
                <div class="university-titles">
                    ${centerHtml}
                    <h2>جامعة المنيا - كلية السياحة والفنادق</h2>
                    <h3>قسم تكنولوجيا صناعة السياحة والضيافة</h3>
                </div>
                ${leftHtml}
            </div>
            
            <div class="doc-title">
                بيان رسمي ببيانات الدخول لمنصة الاختبارات التفاعلية
            </div>
            
            <div class="greeting-text">
                ${cols.includes('name') ? `<p style="font-size: 21px;"><strong>السيد الأستاذ الدكتور / </strong> <span style="color: #1d4ed8 !important; font-weight: 800;">${doc.name}</span></p>` : ''}
                <p style="font-weight: 700; margin-top: 20px;">تحية طيبة وبعد،،،</p>
                <p>مرفق لسيادتكم بيانات الدخول الخاصة بكم على منصة الاختبارات التفاعلية الخاصة بالقسم، نرجو من سيادتكم التكرم بالاحتفاظ بها في مكان آمن والبدء في إعداد الاختبارات للطلاب:</p>
                
                <table class="print-table">
                    <tbody>
                        ${cols.includes('email') ? `
                        <tr>
                            <th>البريد الإلكتروني (اسم المستخدم)</th>
                            <td style="text-align: left; direction: ltr;">${doc.email}</td>
                        </tr>` : ''}
                        
                        ${cols.includes('password') ? `
                        <tr>
                            <th>كلمة المرور</th>
                            <td style="text-align: left; direction: ltr;">${doc.password || 'غير متوفر'}</td>
                        </tr>` : ''}
                        
                        ${cols.includes('subjects') ? `
                        <tr>
                            <th>المقررات الدراسية المخصصة</th>
                            <td>${(doc.subjects || []).length > 0 ? (doc.subjects || []).join(' ، ') : 'لم يتم تخصيص مقررات بعد'}</td>
                        </tr>` : ''}
                        
                        ${cols.includes('date') ? `
                        <tr>
                            <th>تاريخ استخراج البيان</th>
                            <td>${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>` : ''}
                    </tbody>
                </table>
                
                <p style="margin-top: 40px; font-weight: 600;">في حال وجود أية استفسارات أو مواجهة صعوبات فنية، يرجى عدم التردد في التواصل مع فريق الدعم الفني بالكلية.</p>
                <p style="text-align: center; font-weight: 800; font-size: 20px; margin-top: 30px;">وتفضلوا بقبول فائق الاحترام والتقدير،،،</p>
                
                <div class="footer-signature">
                    <div class="signature-box">
                        <p>رئيس القسم</p>
                        <div class="signature-line"></div>
                    </div>
                    <div class="signature-box">
                        <p>عميد الكلية</p>
                        <div class="signature-line"></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });

    // 4. Inject and Print
    const printContainer = document.getElementById('print-container');
    printContainer.innerHTML = html;
    
    bootstrap.Modal.getInstance(document.getElementById('printModal')).hide();
    
    setTimeout(() => {
        window.print();
    }, 500);
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
