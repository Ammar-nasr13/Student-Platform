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
        questionObj.explain = "تم إنشاء السؤال بواسطة أستاذ المادة.";
    } 
    else if (type === 'tf') {
        const correctRadio = document.querySelector('input[name="tf-correct"]:checked');
        questionObj.options = ['صح', 'خطأ'];
        questionObj.correct = parseInt(correctRadio.value);
        questionObj.explain = "تم إنشاء السؤال بواسطة أستاذ المادة.";
    }
    // essay doesn't need options or correct index

    currentExamQuestions.push(questionObj);
    
    // reset modal
    document.getElementById('q-text').value = '';
    document.querySelectorAll('.mcq-option').forEach(input => input.value = '');
    document.querySelector('input[name="mcq-correct"][value="0"]').checked = true;
    document.getElementById('tf-true').checked = true;
    
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

window.logoutFaculty = async function() {
    try {
        if (window.AppwriteAccount) {
            await window.AppwriteAccount.deleteSession('current');
        }
    } catch(err) {
        console.error(err);
    }
    localStorage.removeItem('is_faculty');
    window.location.href = 'index.html';
};


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
            alert('حدث خطأ أثناء الحذف: ' + error.message);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(renderManageExams, 300);
});
