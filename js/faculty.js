// ==========================================
// منطق بناء الاختبارات لأعضاء هيئة التدريس
// ==========================================

let currentExamQuestions = [];

// Populate subjects based on level
const examLevelSelect = document.getElementById('exam-level');
const examSubjectSelect = document.getElementById('exam-subject');

if (examLevelSelect && examSubjectSelect) {
    examLevelSelect.addEventListener('change', function() {
        const level = this.value;
        examSubjectSelect.innerHTML = '<option value="">-- حدد المادة --</option>';
        
        if (level && window.subjectsByLevel && window.subjectsByLevel[level]) {
            examSubjectSelect.disabled = false;
            window.subjectsByLevel[level].forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                examSubjectSelect.appendChild(option);
            });
        } else {
            examSubjectSelect.disabled = true;
        }
    });
}

// Update Question UI in Modal based on type
window.updateQuestionUI = function() {
    const type = document.getElementById('q-type').value;
    document.getElementById('area-mcq').classList.add('d-none');
    document.getElementById('area-tf').classList.add('d-none');
    document.getElementById('area-essay').classList.add('d-none');
    document.getElementById('area-complete').classList.add('d-none');

    if (type === 'mcq') {
        document.getElementById('area-mcq').classList.remove('d-none');
    } else if (type === 'tf') {
        document.getElementById('area-tf').classList.remove('d-none');
    } else if (type === 'essay') {
        document.getElementById('area-essay').classList.remove('d-none');
    } else if (type === 'complete') {
        document.getElementById('area-complete').classList.remove('d-none');
    }
};

let editingQuestionImage = null;
let editingExplainImage = null;

// Save single question to list
window.saveQuestion = async function() {
    const text = document.getElementById('q-text').value.trim();
    const qImageFile = document.getElementById('q-image').files[0];
    
    if (!text && !qImageFile) {
        alert('الرجاء كتابة نص السؤال أو إضافة صورة للسؤال');
        return;
    }
    
    // Helper to upload image
    const uploadImage = async (file) => {
        if (!file) return null;
        try {
            const uploadedFile = await window.AppwriteStorage.createFile(
                window.DB_CONFIG.summariesBucket,
                window.AppwriteID.unique(),
                file
            );
            return uploadedFile.$id;
        } catch (e) {
            console.error("Error uploading image:", e);
            return null;
        }
    };
    
    const saveBtn = document.querySelector('#addQuestionModal .btn-primary');
    const originalBtnHtml = saveBtn ? saveBtn.innerHTML : '';
    if (qImageFile || (document.getElementById('q-explain-image') && document.getElementById('q-explain-image').files[0])) {
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الرفع...';
            saveBtn.disabled = true;
        }
    }
    
    const qImageId = await uploadImage(qImageFile) || editingQuestionImage;
    const explainImageId = await uploadImage(document.getElementById('q-explain-image') ? document.getElementById('q-explain-image').files[0] : null) || editingExplainImage;

    const type = document.getElementById('q-type').value;
    const direction = document.getElementById('exam-direction') ? document.getElementById('exam-direction').value : 'rtl';
    let questionObj = { type: type, q: text, direction: direction };
    if (qImageId) questionObj.qImage = qImageId;

    const explainText = document.getElementById('q-explain') ? document.getElementById('q-explain').value.trim() : "";
    if (explainImageId) questionObj.explainImage = explainImageId;

    if (type === 'mcq') {
        const optionInputs = document.querySelectorAll('.mcq-option');
        let options = [];
        let valid = true;
        optionInputs.forEach(opt => {
            if (!opt.value.trim()) valid = false;
            options.push(opt.value.trim());
        });
        if (!valid) {
            alert('الرجاء ملء جميع الخيارات الأربعة');
            return;
        }
        const correctRadio = document.querySelector('input[name="mcq-correct"]:checked');
        questionObj.options = options;
        questionObj.correct = parseInt(correctRadio.value);
        questionObj.explain = explainText || "تم إنشاء السؤال بواسطة أستاذ المادة.";
    } 
    else if (type === 'tf') {
        const correctRadio = document.querySelector('input[name="tf-correct"]:checked');
        questionObj.options = ['صح', 'خطأ'];
        questionObj.correct = parseInt(correctRadio.value);
        questionObj.explain = explainText || "تم إنشاء السؤال بواسطة أستاذ المادة.";
    }
    else if (type === 'essay') {
        questionObj.explain = explainText || "تم إنشاء السؤال بواسطة أستاذ المادة.";
    }
    else if (type === 'complete') {
        const correctAns = document.getElementById('complete-correct').value.trim();
        if (!correctAns) {
            alert('الرجاء كتابة الإجابة الصحيحة لأكمل العبارة');
            return;
        }
        questionObj.correctAnswer = correctAns;
        questionObj.explain = explainText || `الإجابة الصحيحة هي: ${correctAns}`;
    }

    currentExamQuestions.push(questionObj);
    
    // reset modal
    document.getElementById('q-text').value = '';
    if (document.getElementById('q-image')) document.getElementById('q-image').value = '';
    document.querySelectorAll('.mcq-option').forEach(input => input.value = '');
    document.querySelector('input[name="mcq-correct"][value="0"]').checked = true;
    document.getElementById('tf-true').checked = true;
    if (document.getElementById('complete-correct')) document.getElementById('complete-correct').value = '';
    if (document.getElementById('q-explain')) document.getElementById('q-explain').value = '';
    if (document.getElementById('q-explain-image')) document.getElementById('q-explain-image').value = '';
    
    editingQuestionImage = null;
    editingExplainImage = null;
    
    if (saveBtn) {
        saveBtn.innerHTML = originalBtnHtml;
        saveBtn.disabled = false;
    }
    
    // close modal
    const modalEl = document.getElementById('addQuestionModal');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();

    renderQuestionsList();
};

function renderQuestionsList() {
    const list = document.getElementById('questions-list');
    document.getElementById('q-count').textContent = currentExamQuestions.length;

    if (currentExamQuestions.length === 0) {
        list.innerHTML = '<div class="text-center text-muted p-4 border rounded" id="no-questions">لم يتم إضافة أي أسئلة بعد. انقر على "إضافة سؤال" للبدء.</div>';
        return;
    }

    list.innerHTML = '';
    currentExamQuestions.forEach((q, index) => {
        let typeBadge = '';
        if (q.type === 'mcq') typeBadge = '<span class="badge bg-primary">اختيارات</span>';
        if (q.type === 'tf') typeBadge = '<span class="badge bg-info text-dark">صح وخطأ</span>';
        if (q.type === 'essay') typeBadge = '<span class="badge bg-secondary">مقالي</span>';
        if (q.type === 'complete') typeBadge = '<span class="badge bg-warning text-dark">أكمل</span>';

        let correctAnswerHtml = '';
        if (q.type === 'mcq' || q.type === 'tf') {
            correctAnswerHtml = `<div class="text-success small fw-bold">الإجابة الصحيحة: ${q.options[q.correct]}</div>`;
        } else if (q.type === 'complete') {
            correctAnswerHtml = `<div class="text-success small fw-bold">الإجابة الصحيحة: ${q.correctAnswer}</div>`;
        }

        let qPrefix = q.direction === 'ltr' ? `Q${index + 1}:` : `سؤال ${index + 1}:`;
        let qDirStyle = q.direction === 'ltr' ? 'dir="ltr" style="text-align: left; padding-right: 80px;"' : 'dir="rtl" style="text-align: right; padding-left: 80px;"';
        let btnPositionClass = q.direction === 'ltr' ? 'start-0' : 'end-0';
        let imgBadge = q.qImage ? '<i class="fa-regular fa-image text-primary ms-2 me-2" title="يحتوي على صورة"></i>' : '';
        let qImageHtml = '';
        let qText = q.q ? q.q : (q.direction === 'ltr' ? '<span class="text-muted fst-italic">(Image Question - see below)</span>' : '<span class="text-muted fst-italic">(سؤال مصور - انظر الصورة)</span>');
        if (q.qImage) {
            const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${q.qImage}/view?project=6a0f923e00138d15d172`;
            qImageHtml = `<div class="mt-2"><img src="${imgUrl}" class="img-fluid rounded border shadow-sm" style="max-height: 150px;" alt="Question Image"></div>`;
        }

        const item = document.createElement('div');
        item.className = 'border p-3 rounded-3 bg-light position-relative mb-2';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2" ${qDirStyle}>
                <h6 class="fw-bold mb-0">${qPrefix} <span class="ms-1 me-1">${qText}</span> ${imgBadge}</h6>
                <div>${typeBadge}</div>
            </div>
            ${qImageHtml}
            <div ${qDirStyle}>${correctAnswerHtml}</div>
            <div class="position-absolute top-0 ${btnPositionClass} m-2 d-flex gap-2" style="z-index: 10;">
                <button type="button" class="btn btn-sm btn-warning" onclick="editQuestion(${index})" title="تعديل السؤال"><i class="fa-solid fa-edit"></i></button>
                <button type="button" class="btn btn-sm btn-danger" onclick="deleteQuestion(${index})" title="حذف السؤال"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        list.appendChild(item);
    });
}

window.deleteQuestion = function(index) {
    currentExamQuestions.splice(index, 1);
    renderQuestionsList();
};

window.editQuestion = function(index) {
    const q = currentExamQuestions[index];
    
    editingQuestionImage = q.qImage || null;
    editingExplainImage = q.explainImage || null;
    
    // تعبئة البيانات في نافذة إضافة سؤال
    document.getElementById('q-type').value = q.type;
    window.updateQuestionUI();
    
    document.getElementById('q-text').value = q.q;
    if (document.getElementById('q-explain')) document.getElementById('q-explain').value = q.explain || '';
    if (document.getElementById('exam-direction')) document.getElementById('exam-direction').value = q.direction || 'rtl';
    
    if (q.type === 'mcq') {
        const optionInputs = document.querySelectorAll('.mcq-option');
        if (q.options) {
            optionInputs.forEach((input, i) => {
                if (q.options[i] !== undefined) input.value = q.options[i];
            });
        }
        const correctRadio = document.querySelector(`input[name="mcq-correct"][value="${q.correct}"]`);
        if (correctRadio) correctRadio.checked = true;
    } else if (q.type === 'tf') {
        const correctRadio = document.querySelector(`input[name="tf-correct"][value="${q.correct}"]`);
        if (correctRadio) correctRadio.checked = true;
    } else if (q.type === 'complete') {
        const correctAnsInput = document.getElementById('complete-correct');
        if (correctAnsInput) correctAnsInput.value = q.correctAnswer || '';
    }
    
    // إزالة السؤال من القائمة لكي يتم إضافته كجديد عند حفظ التعديل
    currentExamQuestions.splice(index, 1);
    renderQuestionsList();
    
    // فتح النافذة
    const modalEl = document.getElementById('addQuestionModal');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
};

// Save entire exam
const addExamForm = document.getElementById('add-exam-form');
if (addExamForm) {
    addExamForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (currentExamQuestions.length === 0) {
            alert('يجب إضافة سؤال واحد على الأقل لنشر الاختبار!');
            return;
        }

        const level = document.getElementById('exam-level').value;
        const subject = document.getElementById('exam-subject').value;
        const subjectName = document.getElementById('exam-subject').options[document.getElementById('exam-subject').selectedIndex].text;

        // Key format like: 1-2-subject_id
        // Since we don't track terms strictly in custom exams, let's just use 0 for term, or derive it.
        // Actually, subjects in main.js have IDs like 'tourism-foundations'. Let's just use 'level-subject' as key.
        const examKey = `${level}-custom-${subject}`;

        const examTitle = document.getElementById('exam-title').value.trim();
        if (!examTitle) {
            alert('الرجاء كتابة عنوان الاختبار!');
            return;
        }

        const hours = parseInt(document.getElementById('exam-hours').value) || 0;
        const minutes = parseInt(document.getElementById('exam-minutes').value) || 0;
        const totalDuration = (hours * 60) + minutes;
        const maxScore = parseInt(document.getElementById('exam-max-score').value) || 100;

        if (totalDuration <= 0) {
            if (typeof Swal !== 'undefined') Swal.fire('تنبيه', 'الرجاء تحديد مدة الاختبار بحيث لا تقل عن دقيقة واحدة!', 'warning');
            else alert('الرجاء تحديد مدة الاختبار بحيث لا تقل عن دقيقة واحدة!');
            return;
        }
        if (maxScore <= 0) {
            if (typeof Swal !== 'undefined') Swal.fire('تنبيه', 'الرجاء تحديد درجة نهائية صحيحة للاختبار!', 'warning');
            else alert('الرجاء تحديد درجة نهائية صحيحة للاختبار!');
            return;
        }

        const examData = {
            title: examTitle,
            level: level,
            subject_id: subject,
            duration: totalDuration,
            max_score: maxScore,
            questions: JSON.stringify(currentExamQuestions)
        };

        const saveBtn = document.getElementById('save-exam-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري الحفظ...';
        saveBtn.disabled = true;

        try {
            if (window.editingExamId) {
                await window.AppwriteDB.updateDocument(
                    window.DB_CONFIG.dbId, 
                    window.DB_CONFIG.examsCol, 
                    window.editingExamId, 
                    examData
                );
                
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        title: 'نجاح!',
                        text: 'تم تحديث الاختبار بنجاح!',
                        icon: 'success',
                        confirmButtonText: 'حسناً'
                    });
                } else {
                    alert('تم تحديث الاختبار بنجاح!');
                }
            } else {
                await window.AppwriteDB.createDocument(
                    window.DB_CONFIG.dbId, 
                    window.DB_CONFIG.examsCol, 
                    window.AppwriteID.unique(), 
                    examData
                );
                
                if (typeof Swal !== 'undefined') {
                    await Swal.fire({
                        title: 'نجاح!',
                        text: 'تم حفظ ونشر الاختبار بنجاح على قاعدة البيانات!',
                        icon: 'success',
                        confirmButtonText: 'حسناً'
                    });
                } else {
                    alert('تم حفظ ونشر الاختبار بنجاح على قاعدة البيانات!');
                }
            }
            
            window.location.reload();
        } catch (error) {
            console.error("Appwrite Error:", error);
            if (typeof Swal !== 'undefined') {
                Swal.fire('خطأ', 'حدث خطأ أثناء حفظ الاختبار: ' + error.message, 'error');
            } else {
                alert('حدث خطأ أثناء حفظ الاختبار: ' + error.message);
            }
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    });
}

// Logout logic moved to main.js to be globally accessible
// Render uploaded exams table
async function renderManageExams() {
    const tbody = document.getElementById('manage-exams-list');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin me-2"></i> جاري تحميل الاختبارات من الخادم...</td></tr>';
    
    try {
        const response = await window.AppwriteDB.listDocuments(
            window.DB_CONFIG.dbId, 
            window.DB_CONFIG.examsCol,
            [window.AppwriteQuery.orderDesc('$createdAt')]
        );
        
        window.allLoadedExams = response.documents;
        
        let html = '';
        
        if (response.documents.length === 0) {
            html = '<tr><td colspan="5" class="text-center text-muted py-4">لا توجد أي اختبارات مرفوعة حالياً.</td></tr>';
        } else {
            response.documents.forEach(exam => {
                let subjectName = exam.subject_id;
                if (window.subjectsByLevel && window.subjectsByLevel[exam.level]) {
                    const subObj = window.subjectsByLevel[exam.level].find(s => s.id === exam.subject_id);
                    if (subObj) subjectName = subObj.name;
                }
                
                const questionsArray = JSON.parse(exam.questions);
                
                html += `
                    <tr>
                        <td>المستوى ${exam.level}</td>
                        <td>${subjectName}</td>
                        <td class="fw-bold text-primary">${exam.title}</td>
                        <td><span class="badge bg-secondary">${questionsArray.length} أسئلة</span></td>
                        <td>
                            <div class="d-flex gap-1 justify-content-center">
                                <button class="btn btn-sm btn-warning fw-bold text-dark" onclick="editFullExam('${exam.$id}')" title="تعديل الاختبار">
                                    تعديل <i class="fa-solid fa-pen-to-square ms-1"></i>
                                </button>
                                <button class="btn btn-sm btn-danger fw-bold" onclick="deleteExam('${exam.$id}')" title="حذف الاختبار">
                                    حذف <i class="fa-solid fa-trash ms-1"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = html;
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">حدث خطأ أثناء تحميل الاختبارات من الخادم...</td></tr>';
    }
}

window.editFullExam = function(examId) {
    const exam = window.allLoadedExams.find(e => e.$id === examId);
    if (!exam) return;
    
    // Set edit mode
    window.editingExamId = examId;
    
    // Populate form fields
    document.getElementById('exam-title').value = exam.title;
    document.getElementById('exam-level').value = exam.level;
    
    // Trigger change to populate subjects dropdown, then select the subject
    const event = new Event('change');
    document.getElementById('exam-level').dispatchEvent(event);
    setTimeout(() => {
        document.getElementById('exam-subject').value = exam.subject_id;
    }, 100);
    
    // Populate duration and score
    const durationMins = exam.duration || 60;
    document.getElementById('exam-hours').value = Math.floor(durationMins / 60);
    document.getElementById('exam-minutes').value = durationMins % 60;
    document.getElementById('exam-max-score').value = exam.max_score || 100;
    
    // Populate questions
    currentExamQuestions = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions;
    
    renderQuestionsList();
    
    // Update save button text
    const saveBtn = document.getElementById('save-exam-btn');
    saveBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-2"></i> تحديث الاختبار';
    saveBtn.classList.replace('btn-success', 'btn-warning');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'وضع التعديل: يمكنك الآن تعديل بيانات الاختبار والأسئلة.',
            showConfirmButton: false,
            timer: 3000
        });
    }
};

window.deleteExam = async function(examId) {
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "هل أنت متأكد من حذف هذا الاختبار نهائياً؟ لا يمكن التراجع عن هذه الخطوة.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });
        if (!result.isConfirmed) return;
    } else {
        if (!confirm('هل أنت متأكد من حذف هذا الاختبار نهائياً؟ لا يمكن التراجع عن هذه الخطوة.')) return;
    }

    try {
        if (typeof Swal !== 'undefined') Swal.fire({ title: 'جاري الحذف...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        await window.AppwriteDB.deleteDocument(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.examsCol,
            examId
        );
        if (typeof Swal !== 'undefined') Swal.fire('تم الحذف!', 'تم حذف الاختبار بنجاح.', 'success');
        else alert('تم حذف الاختبار بنجاح!');
        renderManageExams();
    } catch (error) {
        console.error("Appwrite Error:", error);
        if (typeof Swal !== 'undefined') Swal.fire('خطأ', 'حدث خطأ أثناء تحميل الاختبارات: ' + error.message, 'error');
        else alert('حدث خطأ أثناء تحميل الاختبارات: ' + error.message);
    }
};

window.deleteResult = async function(resultId) {
    if (typeof Swal !== 'undefined') {
        const res = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "هل تريد حقاً حذف نتيجة هذا الطالب؟",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });
        if (!res.isConfirmed) return;
    } else {
        if (!confirm('هل تريد حقاً حذف نتيجة هذا الطالب؟')) return;
    }

    try {
        if (typeof Swal !== 'undefined') Swal.fire({ title: 'جاري الحذف...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        await window.AppwriteDB.deleteDocument(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.resultsCol,
            resultId
        );
        if (typeof Swal !== 'undefined') Swal.fire('تم الحذف!', 'تم حذف نتيجة الطالب بنجاح.', 'success');
        renderStudentResults();
    } catch (error) {
        console.error("Appwrite Error:", error);
        if (typeof Swal !== 'undefined') Swal.fire('خطأ', 'حدث خطأ أثناء حذف النتيجة: ' + error.message, 'error');
    }
};

// Render student results table
window.renderStudentResults = async function() {
    const tbody = document.getElementById('manage-results-list');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fa-solid fa-spinner fa-spin me-2"></i> جاري تحميل النتائج من الخادم...</td></tr>';
    
    try {
        const response = await window.AppwriteDB.listDocuments(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.resultsCol,
            [window.AppwriteQuery.orderDesc('$createdAt')]
        );
        if (response.documents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">لا توجد نتائج للطلاب حتى الآن.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        response.documents.forEach(res => {
            const scorePercent = Math.round((res.score / res.totalScore) * 100) || 0;
            let badgeClass = 'bg-danger';
            if (scorePercent >= 85) badgeClass = 'bg-success';
            else if (scorePercent >= 60) badgeClass = 'bg-warning text-dark';
            
            const tr = document.createElement('tr');
            if (res.details) {
                tr.style.cursor = 'pointer';
                tr.onclick = () => showStudentDetails(res);
                tr.title = "انقر لعرض إجابات الطالب التفصيلية";
            }
            tr.innerHTML = `
                <td class="fw-bold text-primary">${res.studentName || 'غير معروف'} ${res.details ? '<i class="fa-solid fa-eye text-success ms-1" style="font-size: 0.8em;"></i>' : ''}</td>
                <td>${res.examTitle || 'غير معروف'}</td>
                <td><span class="badge bg-secondary">${res.subjectName || 'غير محدد'}</span></td>
                <td class="fw-bold">${res.score} / ${res.totalScore}</td>
                <td>
                    <span class="badge ${badgeClass} fs-6">${scorePercent}%</span>
                    <button class="btn btn-sm btn-outline-danger ms-2 border-0" onclick="event.stopPropagation(); deleteResult('${res.$id}')" title="حذف النتيجة"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Appwrite Error:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger py-4 text-center">حدث خطأ أثناء جلب النتائج، تأكد من إنشاء جدول result وإضافة الحقول المطلوبة (studentName, examTitle, subjectName, score, totalScore)</td></tr>`;
    }
}

window.showStudentDetails = function(res) {
    if (!res.details) return;
    
    let detailsObj;
    try {
        detailsObj = JSON.parse(res.details);
    } catch(e) {
        console.error("Error parsing details", e);
        return;
    }
    
    const userAnswers = detailsObj.userAnswers || [];
    const quiz = detailsObj.quiz || { questions: [] };
    const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
    
    const body = document.getElementById('student-details-body');
    
    let html = `
        <div class="mb-4 text-center border-bottom pb-3">
            <h4 class="fw-bold text-primary">${res.studentName}</h4>
            <div class="text-muted">${res.examTitle} - ${res.subjectName}</div>
            <div class="mt-2 fw-bold fs-5 text-success">النتيجة: ${res.score} / ${res.totalScore}</div>
        </div>
        <div class="d-flex flex-column gap-3">
    `;
    
    questions.forEach((q, idx) => {
        const studentAns = userAnswers[idx];
        let ansHtml = '';
        let isCorrect = false;
        
        let qDirStyle = q.direction === 'ltr' ? 'dir="ltr" style="text-align: left;"' : 'dir="rtl" style="text-align: right;"';
        let qPrefix = q.direction === 'ltr' ? `Q${idx + 1}:` : `سؤال ${idx + 1}:`;
        
        let qImageHtml = '';
        let qText = q.q ? q.q : (q.direction === 'ltr' ? '<span class="text-muted fst-italic">(Image Question - see below)</span>' : '<span class="text-muted fst-italic">(سؤال مصور - انظر الصورة)</span>');
        if (q.qImage) {
            const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${q.qImage}/view?project=6a0f923e00138d15d172`;
            qImageHtml = `<div class="mt-2 text-center"><img src="${imgUrl}" class="img-fluid rounded border shadow-sm" style="max-height: 200px;" alt="Question Image"></div>`;
        }
        
        if (q.type === 'essay') {
            ansHtml = `
                <div class="mt-2 p-3 bg-light rounded border border-warning" ${qDirStyle}>
                    <div class="text-muted small mb-1">${q.direction === 'ltr' ? 'Student Answer:' : 'إجابة الطالب:'}</div>
                    <div class="fw-bold" style="white-space: pre-wrap;">${studentAns || (q.direction === 'ltr' ? 'Not answered' : 'لم يجب')}</div>
                </div>`;
            isCorrect = true; 
        } else if (q.type === 'complete') {
            isCorrect = (studentAns && studentAns.trim().toLowerCase() === q.correctAnswer.toLowerCase());
            ansHtml = `
                <div class="mt-2 p-2 rounded ${isCorrect ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold border border-2 ${isCorrect ? 'border-success' : 'border-danger'}" ${qDirStyle}>
                    <i class="fa-solid ${isCorrect ? 'fa-check' : 'fa-xmark'} me-2"></i> ${studentAns || (q.direction === 'ltr' ? 'Not answered' : 'لم يجب')}
                </div>
                ${!isCorrect ? `<div class="mt-1 text-success small fw-bold" ${qDirStyle}><i class="fa-solid fa-check-circle me-1"></i> ${q.direction === 'ltr' ? 'Correct Answer:' : 'الإجابة الصحيحة:'} ${q.correctAnswer}</div>` : ''}
            `;
        } else {
            isCorrect = (studentAns === q.correct);
            let notAnsweredText = q.direction === 'ltr' ? 'Not answered or invalid' : 'لم يجب أو إجابة ملغاة';
            let ansText = studentAns !== undefined && studentAns !== -1 && q.options[studentAns] ? q.options[studentAns] : notAnsweredText;
            
            ansHtml = `
                <div class="mt-2 p-2 rounded ${isCorrect ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold border border-2 ${isCorrect ? 'border-success' : 'border-danger'}" ${qDirStyle}>
                    <i class="fa-solid ${isCorrect ? 'fa-check' : 'fa-xmark'} me-2"></i> ${ansText}
                </div>
                ${!isCorrect ? `<div class="mt-1 text-success small fw-bold" ${qDirStyle}><i class="fa-solid fa-check-circle me-1"></i> ${q.direction === 'ltr' ? 'Correct Answer:' : 'الإجابة الصحيحة:'} ${q.options[q.correct]}</div>` : ''}
            `;
        }
        
        let expImgHtml = '';
        if (q.explainImage) {
            const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${q.explainImage}/view?project=6a0f923e00138d15d172`;
            expImgHtml = `<div class="mt-2 text-center"><img src="${imgUrl}" class="img-fluid rounded border shadow-sm" style="max-height: 200px;" alt="Explanation Image"></div>`;
        }
        
        html += `
            <div class="border p-3 rounded shadow-sm" ${qDirStyle}>
                <div class="fw-bold mb-2">${qPrefix} ${qText}</div>
                ${qImageHtml}
                ${ansHtml}
                ${expImgHtml}
            </div>
        `;
    });
    
    html += `</div>`;
    body.innerHTML = html;
    
    const modalEl = document.getElementById('studentDetailsModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

document.addEventListener('DOMContentLoaded', () => {
    // Only load exams and results if we are on the add_exam page
    if (document.getElementById('manage-exams-list')) {
        renderManageExams();
        renderStudentResults();
    }
});
