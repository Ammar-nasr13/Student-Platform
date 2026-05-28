// js/summaries.js

document.addEventListener('DOMContentLoaded', () => {
    const levelSelect = document.getElementById('summaries-level-select');
    const container = document.getElementById('subjects-summaries-container');
    const placeholder = document.getElementById('summaries-placeholder');
    const loading = document.getElementById('summaries-loading');
    const content = document.getElementById('summaries-content');

    const modalLevel = document.getElementById('summary-level');
    const modalSubject = document.getElementById('summary-subject');
    const submitBtn = document.getElementById('submit-summary-btn');
    const summaryForm = document.getElementById('add-summary-form');

    // التحقق من صلاحيات التدريس
    const isFaculty = localStorage.getItem('is_faculty') === 'true' || localStorage.getItem('currentRole') === 'faculty';

    // إظهار زر إضافة الملخصات فقط لأعضاء هيئة التدريس
    const addSummaryBtn = document.getElementById('add-summary-btn-main');
    if (addSummaryBtn && isFaculty) {
        addSummaryBtn.classList.remove('d-none');
    }

    // 1. عند تغيير المستوى في الشاشة الرئيسية:
    if (levelSelect) {
        levelSelect.addEventListener('change', async () => {
            const level = levelSelect.value;
            if (!level) {
                placeholder.classList.remove('d-none');
                loading.classList.add('d-none');
                content.classList.add('d-none');
                return;
            }

            placeholder.classList.add('d-none');
            loading.classList.remove('d-none');
            content.classList.add('d-none');
            content.innerHTML = '';

            await fetchAndRenderSummaries(level);
        });
    }

    // 2. عند تغيير المستوى في النافذة المنبثقة:
    if (modalLevel) {
        modalLevel.addEventListener('change', () => {
            const level = modalLevel.value;
            if (!level) {
                modalSubject.innerHTML = '<option value="">-- يرجى اختيار المستوى أولاً --</option>';
                modalSubject.disabled = true;
                return;
            }

            // تحويل القيمة إلى رقم للتطابق مع مفاتيح subjectsByLevel
            const levelKey = parseInt(level, 10);
            const subjects = (window.subjectsByLevel && window.subjectsByLevel[levelKey]) || [];

            modalSubject.disabled = false;
            modalSubject.innerHTML = '<option value="">-- حدد المادة --</option>';

            if (subjects.length === 0) {
                modalSubject.innerHTML += '<option value="" disabled>-- لا توجد مواد لهذا المستوى --</option>';
                return;
            }

            subjects.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub.id;
                opt.textContent = sub.name;
                modalSubject.appendChild(opt);
            });
        });
    }

    // 3. رفع الملف:
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (!summaryForm.checkValidity()) {
                summaryForm.reportValidity();
                return;
            }

            const studentName = document.getElementById('summary-student-name').value.trim();
            const level = document.getElementById('summary-level').value;
            const subjectId = document.getElementById('summary-subject').value;
            const fileInput = document.getElementById('summary-file');
            const file = fileInput.files[0];

            if (!file) {
                Swal.fire('تنبيه', 'يرجى اختيار ملف للرفع.', 'warning');
                return;
            }

            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                Swal.fire('تنبيه', 'حجم الملف يتجاوز 100 ميغابايت.', 'warning');
                return;
            }

            setBtnLoading(submitBtn, true);

            try {
                // التأكد من وجود جلسة (Session) لتجنب خطأ الصلاحيات
                try {
                    await window.AppwriteAccount.get();
                } catch (sessionError) {
                    console.log("No active session found, creating anonymous session...");
                    await window.AppwriteAccount.createAnonymousSession();
                }

                // رفع الملف إلى Storage
                const uploadedFile = await window.AppwriteStorage.createFile(
                    window.DB_CONFIG.summariesBucket,
                    window.AppwriteID.unique(),
                    file
                );

                // إنشاء سجل في قاعدة البيانات
                await window.AppwriteDB.createDocument(
                    window.DB_CONFIG.dbId,
                    window.DB_CONFIG.summariesCol,
                    window.AppwriteID.unique(),
                    {
                        level: level.toString(),
                        subject_id: subjectId,
                        student_name: studentName,
                        file_id: uploadedFile.$id
                    }
                );

                Swal.fire('نجاح!', 'تم رفع ونشر الملخص بنجاح، شكراً لمساهمتك.', 'success');
                
                // إغلاق المودال وتصفير النموذج
                bootstrap.Modal.getInstance(document.getElementById('addSummaryModal')).hide();
                summaryForm.reset();
                modalSubject.innerHTML = '<option value="">-- يرجى اختيار المستوى أولاً --</option>';
                modalSubject.disabled = true;

                // تحديث القائمة إذا كان نفس المستوى محدد
                if (levelSelect.value === level) {
                    await fetchAndRenderSummaries(level);
                }

            } catch (error) {
                console.error("Error uploading summary:", error);
                Swal.fire('خطأ', 'حدث خطأ أثناء الرفع: ' + error.message, 'error');
            } finally {
                setBtnLoading(submitBtn, false);
            }
        });
    }

    async function fetchAndRenderSummaries(level) {
        try {
            const response = await window.AppwriteDB.listDocuments(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.summariesCol,
                [window.AppwriteQuery.equal('level', level.toString())]
            );

            const documents = response.documents;
            const subjects = window.subjectsByLevel[level] || [];

            if (subjects.length === 0) {
                content.innerHTML = '<div class="col-12 text-center text-muted py-4">لا توجد مواد لهذا المستوى.</div>';
            } else {
                content.innerHTML = '';
                let hasSummaries = false;

                subjects.forEach(subject => {
                    const subjectSummaries = documents.filter(doc => doc.subject_id === subject.id);
                    
                    if (subjectSummaries.length === 0) {
                        return; // لا تظهر المقرر إذا لم يكن به ملخصات
                    }
                    
                    hasSummaries = true;
                    const col = document.createElement('div');
                    col.className = 'col-md-6 col-lg-4 mb-4';
                    
                    let summariesHtml = '<ul class="list-group list-group-flush mt-3">';
                    subjectSummaries.forEach(doc => {
                        const fileUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${doc.file_id}/view?project=6a0f923e00138d15d172`;
                        
                        // أزرار التحكم للهيئة فقط
                        let actionsHtml = '';
                        if (isFaculty) {
                            actionsHtml = `
                                <button class="btn btn-sm btn-outline-warning ms-1 edit-summary-btn" data-doc-id="${doc.$id}" data-student-name="${doc.student_name}" data-subject-id="${doc.subject_id}" data-file-id="${doc.file_id}" title="تعديل تفاصيل الملف"><i class="fa-solid fa-edit"></i></button>
                                <button class="btn btn-sm btn-outline-danger ms-1 delete-summary-btn" data-doc-id="${doc.$id}" data-file-id="${doc.file_id}" title="حذف الملخص"><i class="fa-solid fa-trash"></i></button>
                            `;
                        }

                        let dateStr = doc.$createdAt ? new Date(doc.$createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '';

                        summariesHtml += `
                            <li class="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0 border-light">
                                <div>
                                    <div class="fw-bold text-dark"><i class="fa-solid fa-file-pdf text-danger me-2"></i> بواسطة: ${doc.student_name}</div>
                                    ${dateStr ? `<small class="text-muted"><i class="fa-regular fa-clock me-1"></i> ${dateStr}</small>` : ''}
                                </div>
                                <div class="d-flex align-items-center">
                                    <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-primary rounded-circle" title="عرض الملف">
                                        <i class="fa-solid fa-download"></i>
                                    </a>
                                    ${actionsHtml}
                                </div>
                            </li>
                        `;
                    });
                    summariesHtml += '</ul>';

                    col.innerHTML = `
                        <div class="card h-100 border-0 shadow-sm" style="background-color: #f8f9fa;">
                            <div class="card-body">
                                <h5 class="card-title fw-bold text-primary border-bottom pb-2 mb-0">
                                    <i class="fa-solid fa-book text-warning me-2"></i>${subject.name}
                                </h5>
                                ${summariesHtml}
                            </div>
                        </div>
                    `;
                    content.appendChild(col);
                });

                if (!hasSummaries) {
                    content.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <div class="fs-1 text-muted mb-3"><i class="fa-solid fa-folder-open"></i></div>
                            <h5 class="text-muted">لم يتم رفع أي ملخصات في هذا المستوى حتى الآن.</h5>
                        </div>
                    `;
                }

                // تفعيل أحداث الأزرار للهيئة
                document.querySelectorAll('.delete-summary-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const docId = btn.getAttribute('data-doc-id');
                        const fileId = btn.getAttribute('data-file-id');
                        await deleteSummary(docId, fileId, level);
                    });
                });

                document.querySelectorAll('.edit-summary-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const docId = btn.getAttribute('data-doc-id');
                        const currentStudentName = btn.getAttribute('data-student-name') || '';
                        const currentSubjectId = btn.getAttribute('data-subject-id');
                        
                        const { value: formValues } = await Swal.fire({
                            title: 'تعديل تفاصيل الملف',
                            html:
                                `<label class="d-block text-start mb-1 fw-bold">اسم المقرر:</label>
                                <select id="swal-edit-subject" class="swal2-select w-100 mb-3" style="font-size: 1rem;">
                                    ${subjects.map(s => `<option value="${s.id}" ${s.id === currentSubjectId ? 'selected' : ''}>${s.name}</option>`).join('')}
                                </select>
                                <label class="d-block text-start mb-1 fw-bold">اسم الناشر:</label>
                                <input id="swal-edit-student" class="swal2-input w-100 m-0" placeholder="اسم الطالب" value="${currentStudentName}">`,
                            focusConfirm: false,
                            showCancelButton: true,
                            confirmButtonText: 'حفظ التعديلات',
                            cancelButtonText: 'إلغاء',
                            preConfirm: () => {
                                return {
                                    subject_id: document.getElementById('swal-edit-subject').value,
                                    student_name: document.getElementById('swal-edit-student').value.trim() || 'طالب'
                                }
                            }
                        });

                        if (formValues) {
                            try {
                                Swal.fire({ title: 'جاري التعديل...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                                await window.AppwriteDB.updateDocument(
                                    window.DB_CONFIG.dbId,
                                    window.DB_CONFIG.summariesCol,
                                    docId,
                                    {
                                        subject_id: formValues.subject_id,
                                        student_name: formValues.student_name
                                    }
                                );
                                Swal.fire('تم التعديل!', 'تم تحديث البيانات بنجاح.', 'success');
                                fetchAndRenderSummaries(level);
                            } catch (error) {
                                console.error('Edit error:', error);
                                Swal.fire('خطأ!', 'حدث خطأ أثناء التعديل.', 'error');
                            }
                        }
                    });
                });
            }

        } catch (error) {
            console.error("Error fetching summaries:", error);
            content.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="fs-1 text-muted mb-3"><i class="fa-solid fa-folder-open"></i></div>
                    <h5 class="text-muted">عذراً، لا توجد ملخصات متاحة حالياً أو جاري تحديث البيانات.</h5>
                </div>
            `;
        } finally {
            loading.classList.add('d-none');
            content.classList.remove('d-none');
        }
    }

    async function deleteSummary(docId, fileId, currentLevel) {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم حذف هذا الملخص نهائياً ولن تتمكن من استرجاعه!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذفه!',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                // حذف الملف من Storage
                await window.AppwriteStorage.deleteFile(window.DB_CONFIG.summariesBucket, fileId);
                // حذف السجل من Database
                await window.AppwriteDB.deleteDocument(window.DB_CONFIG.dbId, window.DB_CONFIG.summariesCol, docId);

                Swal.fire('تم الحذف!', 'تم حذف الملخص بنجاح.', 'success');
                // تحديث العرض
                loading.classList.remove('d-none');
                content.classList.add('d-none');
                content.innerHTML = '';
                await fetchAndRenderSummaries(currentLevel);
            } catch (error) {
                console.error("Error deleting summary:", error);
                Swal.fire('خطأ', 'فشل حذف الملخص.', 'error');
            }
        }
    }

    function setBtnLoading(btn, isLoading) {
        const spinner = btn.querySelector('.spinner-border');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('#summary-btn-text');
        
        if (isLoading) {
            btn.disabled = true;
            if(spinner) spinner.classList.remove('d-none');
            if(icon) icon.classList.add('d-none');
            if(text) text.textContent = 'جاري الرفع...';
        } else {
            btn.disabled = false;
            if(spinner) spinner.classList.add('d-none');
            if(icon) icon.classList.remove('d-none');
            if(text) text.textContent = 'رفع ونشر';
        }
    }
});
