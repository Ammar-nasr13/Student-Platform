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

    if (type === 'mcq') {
        document.getElementById('area-mcq').classList.remove('d-none');
    } else if (type === 'tf') {
        document.getElementById('area-tf').classList.remove('d-none');
    } else if (type === 'essay') {
        document.getElementById('area-essay').classList.remove('d-none');
    }
};

// Save single question to list
window.saveQuestion = function() {
    const text = document.getElementById('q-text').value.trim();
    if (!text) {
        alert('الرجاء كتابة نص السؤال');
        return;
    }

    const type = document.getElementById('q-type').value;
    let questionObj = { type: type, q: text };

    const explainText = document.getElementById('q-explain') ? document.getElementById('q-explain').value.trim() : "";

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

    currentExamQuestions.push(questionObj);
    
    // reset modal
    document.getElementById('q-text').value = '';
    document.querySelectorAll('.mcq-option').forEach(input => input.value = '');
    document.querySelector('input[name="mcq-correct"][value="0"]').checked = true;
    document.getElementById('tf-true').checked = true;
    if (document.getElementById('q-explain')) document.getElementById('q-explain').value = '';
    
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

        const item = document.createElement('div');
        item.className = 'border p-3 rounded-3 bg-light position-relative';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold mb-0">${index + 1}. ${q.q}</h6>
                ${typeBadge}
            </div>
            ${q.type !== 'essay' ? `<div class="text-success small fw-bold">الإجابة الصحيحة: ${q.options[q.correct]}</div>` : ''}
            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="deleteQuestion(${index})" title="حذف السؤال"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

window.deleteQuestion = function(index) {
    currentExamQuestions.splice(index, 1);
    renderQuestionsList();
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

        const examData = {
            title: examTitle,
            level: level,
            subject_id: subject,
            duration: 60,
            questions: JSON.stringify(currentExamQuestions)
        };

        const saveBtn = document.getElementById('save-exam-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري الحفظ...';
        saveBtn.disabled = true;

        try {
            await window.AppwriteDB.createDocument(
                window.DB_CONFIG.dbId, 
                window.DB_CONFIG.examsCol, 
                window.AppwriteID.unique(), 
                examData
            );
            alert('تم حفظ ونشر الاختبار بنجاح على قاعدة البيانات!');
            window.location.reload();
        } catch (error) {
            console.error("Appwrite Error:", error);
            alert('حدث خطأ أثناء حفظ الاختبار: ' + error.message);
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
                            <button class="btn btn-sm btn-danger fw-bold" onclick="deleteExam('${exam.$id}')">
                                حذف <i class="fa-solid fa-trash ms-1"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = html;
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">حدث خطأ أثناء الاتصال بقاعدة البيانات.</td></tr>';
    }
}

window.deleteExam = async function(examId) {
    if (confirm('هل أنت متأكد من حذف هذا الاختبار نهائياً؟ لا يمكن التراجع عن هذه الخطوة.')) {
        try {
            await window.AppwriteDB.deleteDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.examsCol,
                examId
            );
            alert('تم حذف الاختبار بنجاح!');
            renderManageExams();
        } catch (error) {
            console.error("Appwrite Error:", error);
            alert('حدث خطأ أثناء تحميل الاختبارات: ' + error.message);
        }
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
        
    else if (type === 'essay') {
        questionObj.explain = explainText || "تم إنشاء السؤال بواسطة أستادة المادة.";
    }

    currentExamQuestions.push(questionObj);
    
    // reset modal
    document.getElementById('q-text').value = '';
    document.querySelectorAll('.mcq-option').forEach(input => input.value = '');
    document.querySelector('input[name="mcq-correct"][value="0"]').checked = true;
    document.getElementById('tf-true').checked = true;
    if (document.getElementById('q-explain')) document.getElementById('q-explain').value = '';
    
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

        const item = document.createElement('div');
        item.className = 'border p-3 rounded-3 bg-light position-relative';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold mb-0">${index + 1}. ${q.q}</h6>
                ${typeBadge}
            </div>
            ${q.type !== 'essay' ? `<div class="text-success small fw-bold">الإجابة الصحيحة: ${q.options[q.correct]}</div>` : ''}
            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2" onclick="deleteQuestion(${index})" title="حذف السؤال"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

window.deleteQuestion = function(index) {
    currentExamQuestions.splice(index, 1);
    renderQuestionsList();
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

        const examData = {
            title: examTitle,
            level: level,
            subject_id: subject,
            duration: 60,
            questions: JSON.stringify(currentExamQuestions)
        };

        const saveBtn = document.getElementById('save-exam-btn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري الحفظ...';
        saveBtn.disabled = true;

        try {
            await window.AppwriteDB.createDocument(
                window.DB_CONFIG.dbId, 
                window.DB_CONFIG.examsCol, 
                window.AppwriteID.unique(), 
                examData
            );
            alert('تم حفظ ونشر الاختبار بنجاح على قاعدة البيانات!');
            window.location.reload();
        } catch (error) {
            console.error("Appwrite Error:", error);
            alert('حدث خطأ أثناء حفظ الاختبار: ' + error.message);
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
                            <button class="btn btn-sm btn-danger fw-bold" onclick="deleteExam('${exam.$id}')">
                                حذف <i class="fa-solid fa-trash ms-1"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = html;
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">حدث خطأ أثناء الاتصال بقاعدة البيانات.</td></tr>';
    }
}

window.deleteExam = async function(examId) {
    if (confirm('هل أنت متأكد من حذف هذا الاختبار نهائياً؟ لا يمكن التراجع عن هذه الخطوة.')) {
        try {
            await window.AppwriteDB.deleteDocument(
                window.DB_CONFIG.dbId,
                window.DB_CONFIG.examsCol,
                examId
            );
            alert('تم حذف الاختبار بنجاح!');
            renderManageExams();
        } catch (error) {
            console.error("Appwrite Error:", error);
            alert('حدث خطأ أثناء تحميل الاختبارات: ' + error.message);
        }
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
                <td><span class="badge ${badgeClass} fs-6">${scorePercent}%</span></td>
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
        
        if (q.type === 'essay') {
            ansHtml = `
                <div class="mt-2 p-3 bg-light rounded border border-warning">
                    <div class="text-muted small mb-1">إجابة الطالب:</div>
                    <div class="fw-bold">${studentAns || 'لم يجب'}</div>
                </div>`;
            isCorrect = true; // Essay is manually graded but we highlight it neutrally
        } else {
            isCorrect = (studentAns === q.correct);
            let ansText = studentAns !== undefined && studentAns !== -1 && q.options[studentAns] ? q.options[studentAns] : 'لم يجب أو إجابة ملغاة';
            
            ansHtml = `
                <div class="mt-2 p-2 rounded ${isCorrect ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} fw-bold border border-2 ${isCorrect ? 'border-success' : 'border-danger'}">
                    <i class="fa-solid ${isCorrect ? 'fa-check' : 'fa-xmark'} me-2"></i> ${ansText}
                </div>
                ${!isCorrect ? `<div class="mt-1 text-success small fw-bold"><i class="fa-solid fa-check-circle me-1"></i> الإجابة الصحيحة: ${q.options[q.correct]}</div>` : ''}
            `;
        }
        
        html += `
            <div class="border p-3 rounded shadow-sm">
                <div class="fw-bold mb-2">${idx + 1}. ${q.q}</div>
                ${ansHtml}
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
