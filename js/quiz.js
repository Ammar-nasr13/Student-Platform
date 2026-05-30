// Quiz & Exam Engine Module

// Quiz state variables
let currentQuiz = null,
  currentQuestionIndex = 0,
  score = 0,
  userAnswers = [],
  quizTimer = null,
  timeLeft = 0;

window.subjectsByLevel = {
    1: [
      { id: "اسس-صناعة-السياحة-والضيافة", name: "اسس صناعة السياحة والضيافة" },
      { id: "تاريخ-وحضارة-مصر-1", name: "تاريخ وحضارة مصر (1)" },
      { id: "لغة-أجنبية-متخصصة-1", name: "لغة أجنبية متخصصة (1)" },
      { id: "شركات-الطيران", name: "شركات الطيران" },
      { id: "التجارة-الالكترونية-في-منشآت-الضيافة", name: "التجارة الالكترونية في منشآت الضيافة" },
      { id: "مبادئ-تكنولوجيا-المعلومات", name: "مبادئ تكنولوجيا المعلومات" },
      { id: "التخطيط-الاستراتيجي", name: "التخطيط الاستراتيجي" },
    ],
    2: [
      { id: "هياكل-البيانات", name: "هياكل البيانات" },
      {
        id: "أنظمة-الحجز-في-منشآت-السياحة-والضيافة",
        name: "أنظمة الحجز في منشآت السياحة والضيافة",
      },
      { id: "لغة-البرمجة-2", name: "لغة البرمجة 2" },
      { id: "البرمجة-الشيئية", name: "البرمجة الشيئية" },
      { id: "المرشد-الرقمي", name: "المرشد الرقمي" },
      {
        id: "إدارة-الأحداث-والمناسبات-الخاصة-في-الضيافة",
        name: "إدارة الأحداث والمناسبات الخاصة في الضيافة",
      },
      {
        id: "إدارة-التراث-والمواقع-الأثرية",
        name: "إدارة التراث والمواقع الأثرية",
      },
    ],
    3: [
      {
        id: "التجارة-الإلكترونية-في-وكالات-السفر",
        name: "التجارة الإلكترونية في وكالات السفر",
      },
      { id: "أنظمة-التشغيل", name: "أنظمة التشغيل" },
      {
        id: "الإدارة-الإلكترونية-في-منشآت-الضيافة",
        name: "الإدارة الإلكترونية في منشآت الضيافة",
      },
      {
        id: "الترويج-والعلاقات-العامة-في-الضيافة",
        name: "الترويج والعلاقات العامة في الضيافة",
      },
      { id: "نظم-إدارة-قواعد-البيانات", name: "نظم إدارة قواعد البيانات" },
      { id: "رياضيات-2", name: "رياضيات 2" },
      {
        id: "تطبيقات-تكنولوجيا-المعلومات-في-المتاحف-والمواقع-الأثرية",
        name: "تطبيقات تكنولوجيا المعلومات في المتاحف والمواقع الأثرية",
      },
    ],
    4: [
      { id: "هندسة-البرمجيات", name: "هندسة البرمجيات" },
      {
        id: "الأمن-السيبراني-والتسفير-التشفير",
        name: "الأمن السيبراني والتسفير (التشفير)",
      },
      {
        id: "تكنولوجيا-الأشخاص-ذوي-الإعاقة-في-منشآت-السياحة-والضيافة",
        name: "تكنولوجيا الأشخاص ذوي الإعاقة في منشآت السياحة والضيافة",
      },
      { id: "إدارة-المطارات-الذكية", name: "إدارة المطارات الذكية" },
      {
        id: "إدارة-العلامة-التجارية-لمنشآت-الضيافة",
        name: "إدارة العلامة التجارية لمنشآت الضيافة",
      },
      { id: "مشروع-التخرج", name: "مشروع التخرج" },
      {
        id: "التكنولوجيا-الحديثة-في-الاكتشافات-الأثرية",
        name: "التكنولوجيا الحديثة في الاكتشافات الأثرية",
      },
    ],
  };

function initQuizPageEvents() {
  if (localStorage.getItem("is_faculty") === "true" || localStorage.getItem("currentRole") === "faculty") {
    const setupCard = document.getElementById("quiz-setup");
    if (setupCard) {
      setupCard.innerHTML = `
        <div class="text-center py-5">
          <div class="fs-1 text-danger mb-4"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3 class="fw-bold text-primary mb-3">خاصية غير متاحة لأعضاء هيئة التدريس</h3>
          <p class="text-muted mb-4 fs-5">عذراً، بدء وحل الاختبارات التفاعلية متاح فقط للطلاب لتقييم مستواهم الدراسي.</p>
          <div class="alert alert-warning border-0 border-start border-4 border-warning text-right mb-4 mx-auto" style="max-width: 500px;">
            <i class="fa-solid fa-circle-info ms-2"></i> بصفتك عضو هيئة تدريس، يمكنك إضافة وإدارة الاختبارات من لوحة التحكم الخاصة بك.
          </div>
          <div class="d-flex gap-3 justify-content-center">
            <a href="add_exam.html" class="btn btn-navy-solid px-4 py-2" style="background-color: #0f2b46; color: white; border-radius: 8px; text-decoration: none;"><i class="fa-solid fa-plus-circle me-2"></i>إضافة اختبار جديد</a>
            <a href="index.html" class="btn btn-outline-dark px-4 py-2" style="border-radius: 8px; text-decoration: none;"><i class="fa-solid fa-home me-2"></i>الصفحة الرئيسية</a>
          </div>
        </div>
      `;
      return;
    }
  }

  const authStatus = document.getElementById("student-auth-status");
  const sBtn = document.getElementById("start-quiz-btn");
  if (authStatus) {
      if (localStorage.getItem("is_student") === "true") {
          authStatus.innerHTML = `
            <div class="alert alert-success border-0 border-start border-4 border-success">
                <i class="fa-solid fa-user-graduate ms-2"></i> الطالب: <strong>${localStorage.getItem("student_name")}</strong> (كود: ${localStorage.getItem("student_code")})
            </div>
          `;
      } else {
          authStatus.innerHTML = `
            <div class="alert alert-warning border-0 border-start border-4 border-warning">
                <i class="fa-solid fa-circle-exclamation ms-2"></i> يجب <a href="index.html" class="fw-bold">تسجيل الدخول كطالب</a> من الصفحة الرئيسية لتتمكن من أداء الاختبار.
            </div>
          `;
          if (sBtn) sBtn.style.display = "none";
      }
  }

  const e = document.getElementById("quiz-level-select"),
    t = document.getElementById("quiz-subject-select"),
    n = document.getElementById("quiz-exam-select"),
    s = document.getElementById("start-quiz-btn");
  if (!(e && t && n && s)) return;
  (e.addEventListener("change", () => {
    const o = e.value;
    if (
      ((t.innerHTML = '<option value="">-- حدد المادة --</option>'),
      (n.innerHTML = '<option value="">-- يرجى تحديد المادة أولاً --</option>'),
      (n.disabled = !0),
      (s.disabled = !0),
      !o)
    )
      return void (t.disabled = !0);
    ((t.disabled = !1),
      (window.subjectsByLevel[o] || []).forEach((e) => {
        const n = document.createElement("option");
        ((n.value = e.id), (n.textContent = e.name), t.appendChild(n));
      }));
  }),
    t.addEventListener("change", async () => {
      const o = e.value,
        i = t.value;
      if (
        ((n.innerHTML = '<option value="">-- حدد الاختبار --</option>'),
        (s.disabled = !0),
        i)
      ) {
        ((n.innerHTML =
          '<option value="">-- جاري جلب الاختبارات... --</option>'),
          (n.disabled = !0));
        try {
          const e = (
            await window.AppwriteDB.listDocuments(
              window.DB_CONFIG.dbId,
              window.DB_CONFIG.examsCol,
              [
                window.AppwriteQuery.equal("level", o),
                window.AppwriteQuery.equal("subject_id", i),
              ],
            )
          ).documents;
          if (
            ((window.currentSubjectExams = e),
            (n.innerHTML = '<option value="">-- حدد الاختبار --</option>'),
            0 === e.length)
          )
            return (
              (n.innerHTML =
                '<option value="">-- لا يوجد اختبارات مضافة حالياً --</option>'),
              void (n.disabled = !0)
            );
          (e.forEach((e, t) => {
            const s = document.createElement("option");
            ((s.value = t), (s.textContent = e.title), n.appendChild(s));
          }),
            (n.disabled = !1));
        } catch (e) {
          (console.error(e),
            (n.innerHTML =
              '<option value="">-- خطأ في الاتصال بالخادم --</option>'));
        }
      } else n.disabled = !0;
    }),
    n.addEventListener("change", () => {
      s.disabled = !n.value;
      const durationEl = document.getElementById("exam-duration-instruction");
      if (durationEl) {
        if (n.value && window.currentSubjectExams && window.currentSubjectExams[n.value]) {
          const duration = window.currentSubjectExams[n.value].duration || 60;
          durationEl.innerHTML = `<strong>${duration} دقيقة</strong>`;
        } else {
          durationEl.textContent = "حسب ما يحدده أستاذ المادة";
        }
      }
    }),
    s.addEventListener("click", () => {
      if (localStorage.getItem("is_faculty") === "true" || localStorage.getItem("currentRole") === "faculty") {
        const errorMsg = "عذراً، بدء وحل الاختبارات التفاعلية متاح فقط للطلاب! بصفتك عضو هيئة تدريس، يمكنك فقط إدارة أو إضافة الاختبارات.";
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "تنبيه الصلاحية",
            text: errorMsg,
            icon: "warning",
            confirmButtonColor: "#0f2b46",
            confirmButtonText: "موافق"
          });
        } else {
          showToast(errorMsg, "warning");
        }
        return;
      }
      
      if (localStorage.getItem("is_student") !== "true") {
        showToast("يجب تسجيل الدخول كطالب أولاً!", "error");
        return;
      }
      
      const s = e.value,
        o = t.value,
        i = n.value;
      
      window.currentStudentName = localStorage.getItem("student_name");
      window.currentStudentCode = localStorage.getItem("student_code");
      
      startQuiz(s, o, i);
    }));
}
function startQuiz(e, t, n) {
  if (localStorage.getItem("is_faculty") === "true" || localStorage.getItem("currentRole") === "faculty") {
    const errorMsg = "عذراً، بدء وحل الاختبارات التفاعلية متاح فقط للطلاب! بصفتك عضو هيئة تدريس، يمكنك فقط إدارة أو إضافة الاختبارات.";
    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "تنبيه الصلاحية",
        text: errorMsg,
        icon: "warning",
        confirmButtonColor: "#0f2b46",
        confirmButtonText: "موافق"
      });
    } else {
      showToast(errorMsg, "warning");
    }
    return;
  }
  let s = (window.currentSubjectExams || [])[n];
  if (!s) {
    showToast("عذراً، هذا الاختبار غير متوفر حالياً.", "warning");
    return;
  }
  
  if (typeof s.questions === "string") {
    s.questions = JSON.parse(s.questions);
  }
  currentQuiz = s;
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  
  document.getElementById("quiz-setup").classList.add("d-none");
  document.getElementById("quiz-play").classList.remove("d-none");
  document.getElementById("quiz-title").textContent = currentQuiz.title;
  
  const direction = (s.questions && s.questions[0] && s.questions[0].direction) ? s.questions[0].direction : 'rtl';
  showToast(direction === 'rtl' ? "بدء الاختبار التفاعلي، بالتوفيق!" : "Interactive quiz started, good luck!", "info");
  
  resetTimer();
  renderAllQuestions();
}

function resetTimer() {
  clearInterval(quizTimer);
  const direction = (currentQuiz.questions && currentQuiz.questions[0] && currentQuiz.questions[0].direction) ? currentQuiz.questions[0].direction : 'rtl';
  
  // currentQuiz.duration is in minutes. Convert to seconds.
  timeLeft = (currentQuiz.duration || 60) * 60;
  
  updateTimerUI();
  quizTimer = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(quizTimer);
      if ("undefined" != typeof Swal) {
        Swal.fire({
          title: direction === 'rtl' ? "انتهى الوقت!" : "Time's up!",
          text: direction === 'rtl' ? "تم إغلاق الاختبار وحساب نتيجتك." : "The exam has been closed and your score calculated.",
          icon: "warning",
          confirmButtonColor: "#0f2b46"
        });
      } else {
        showToast(direction === 'rtl' ? "انتهى وقت الحل!" : "Solving time ended!", "warning");
      }
      processExamSubmission();
    }
  }, 1000);
}

function updateTimerUI() {
  const e = document.getElementById("quiz-timer");
  if (e) {
    const direction = (currentQuiz.questions && currentQuiz.questions[0] && currentQuiz.questions[0].direction) ? currentQuiz.questions[0].direction : 'rtl';
    
    const t = Math.floor(timeLeft / 60);
    const n = timeLeft % 60;
    
    e.textContent = direction === 'rtl' 
      ? `الوقت المتبقي: ${t}:${n < 10 ? "0" : ""}${n} دقيقة`
      : `Time remaining: ${t}:${n < 10 ? "0" : ""}${n} minutes`;
      
    if (timeLeft <= 60) {
      e.classList.add("text-danger", "fw-bold");
    } else {
      e.classList.remove("text-danger", "fw-bold");
    }
  }
}

function downloadSolvedExamPDF() {
  if (!currentQuiz) return;
  let questions = currentQuiz.questions;
  if (typeof questions === "string") {
    questions = JSON.parse(questions);
  }
  
  // Security check: Verify if all questions were answered
  let allAnswered = true;
  questions.forEach((q, idx) => {
    const uAns = userAnswers[idx];
    if (q.type === 'mcq' || q.type === 'tf') {
      if (uAns === undefined || uAns === null || uAns === -1) {
        allAnswered = false;
      }
    } else if (q.type === 'essay' || q.type === 'complete') {
      if (uAns === undefined || uAns === null || (typeof uAns === 'string' && uAns.trim() === "")) {
        allAnswered = false;
      }
    }
  });

  const direction = (questions && questions[0] && questions[0].direction) ? questions[0].direction : 'rtl';
  const textAlign = direction === 'rtl' ? 'right' : 'left';

  if (!allAnswered) {
    const alertMsg = direction === 'rtl' 
      ? "عذراً، لا يمكن تحميل أو طباعة ملف PDF إلا بعد إنهاء حل جميع الأسئلة بالكامل."
      : "Sorry, you cannot download or print the PDF unless you answer all questions in full.";
    if ("undefined" != typeof Swal) {
      Swal.fire(direction === 'rtl' ? "تنبيه" : "Alert", alertMsg, "error");
    } else {
      alert(alertMsg);
    }
    return;
  }
  
  const levelText = currentQuiz.level ? (direction === 'rtl' ? `المستوى ${currentQuiz.level}` : `Level ${currentQuiz.level}`) : "";
  const studentName = window.currentStudentName || (direction === 'rtl' ? "طالب مجهول" : "Unknown Student");
  const studentCode = window.currentStudentCode || (direction === 'rtl' ? "غير مسجل" : "Not registered");
  const dateStr = new Date().toLocaleDateString(direction === 'rtl' ? 'ar-EG' : 'en-US', { dateStyle: 'long' });
  const maxScore = currentQuiz.max_score || questions.length;
  const actualScore = Math.round((score / questions.length) * maxScore);
  const finalScore = direction === 'rtl' ? `${actualScore} من ${maxScore}` : `${actualScore} out of ${maxScore}`;
  const percentage = Math.round((score / questions.length) * 100); 
  let win = window.open("", "_blank");
  let html = `
    <html dir="${direction}" lang="${direction === 'rtl' ? 'ar' : 'en'}">
    <head>
        <meta charset="utf-8">
        <title>${direction === 'rtl' ? 'تقرير نتائج الاختبار' : 'Exam Results Report'} - ${currentQuiz.title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; direction: ${direction}; text-align: ${textAlign}; }
            .header { text-align: center; border-bottom: 2px solid #0f2b46; padding-bottom: 15px; margin-bottom: 25px; }
            .header h1 { color: #0f2b46; margin: 5px 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .header h3 { color: #555; margin: 5px 0; font-size: 14px; font-weight: normal; }
            .header h2 { color: #198754; margin: 10px 0 0 0; font-size: 18px; border-top: 1px dashed #ccc; padding-top: 10px; display: inline-block; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; flex-wrap: wrap; gap: 10px; }
            .meta-item { font-size: 15px; }
            .meta-item strong { color: #0f2b46; }
            .score-badge { font-size: 18px; font-weight: bold; color: #198754; text-align: center; margin-bottom: 30px; padding: 10px; background: #e8f5e9; border-radius: 8px; border: 1px solid #c8e6c9; }
            .question-box { margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .question-text { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; }
            .options-list { margin-${direction === 'rtl' ? 'right' : 'left'}: 20px; list-style: none; padding: 0; }
            .option-item { margin-bottom: 8px; font-size: 15px; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; }
            .option-correct { background-color: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; font-weight: bold; }
            .option-incorrect { background-color: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
            .option-unselected { color: #555; }
            .explain-box { margin-top: 12px; background-color: #e2f0d9; border-${direction === 'rtl' ? 'right' : 'left'}: 4px solid #70ad47; padding: 10px 15px; font-size: 14px; border-radius: ${direction === 'rtl' ? '0 4px 4px 0' : '4px 0 0 4px'}; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
            @media print {
                @page { margin: 1.5cm; }
                body { padding: 0; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Minia University - Faculty of Tourism & Hotels</h1>
            <h3>Tourism Industry & Hospitality Technology Department</h3>
            <h2>${direction === 'rtl' ? 'تقرير نتائج الاختبار:' : 'Exam Results Report:'} ${currentQuiz.title}</h2>
        </div>
        
        <div class="meta-info">
            <div class="meta-item"><strong>${direction === 'rtl' ? 'اسم الطالب:' : 'Student Name:'}</strong> ${studentName}</div>
            <div class="meta-item"><strong>${direction === 'rtl' ? 'كود الطالب:' : 'Student Code:'}</strong> ${studentCode}</div>
            <div class="meta-item"><strong>${direction === 'rtl' ? 'المستوى:' : 'Level:'}</strong> ${levelText}</div>
            <div class="meta-item"><strong>${direction === 'rtl' ? 'التاريخ:' : 'Date:'}</strong> ${dateStr}</div>
        </div>
        
        <div class="score-badge">
            ${direction === 'rtl' ? 'النتيجة النهائية:' : 'Final Result:'} ${finalScore} (${percentage}%)
        </div>
 
        <div class="content">
  `;
 
  questions.forEach((q, idx) => {
    const userAnswerIdx = userAnswers[idx];
    const correctIdx = q.correct;
    
    let qImageHtml = '';
    if (q.qImage) {
        const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${q.qImage}/view?project=6a0f923e00138d15d172`;
        qImageHtml = `<div style="text-align: center; margin-bottom: 15px;"><img src="${imgUrl}" style="max-height: 250px; max-width: 100%; border: 1px solid #ccc; border-radius: 4px;" alt="Question Image"></div>`;
    }
    
    let qDir = q.direction === 'ltr' ? 'ltr' : 'rtl';
    let qText = q.q ? q.q : (qDir === 'ltr' ? '<span style="color: #6c757d; font-style: italic;">(Image Question)</span>' : '<span style="color: #6c757d; font-style: italic;">(سؤال مصور - انظر الصورة)</span>');    
    html += `
        <div class="question-box">
            <div class="question-text">${idx + 1}. ${qText}</div>
            ${qImageHtml}
    `;
 
    if (q.type === 'mcq' || q.type === 'tf') {
      html += `<ul class="options-list">`;
      q.options.forEach((opt, optIdx) => {
        let classStr = "option-unselected";
        let marker = "";
        
        if (optIdx === correctIdx) {
          classStr = "option-correct";
          marker = direction === 'rtl' ? " [الإجابة الصحيحة ✔️]" : " [Correct Answer ✔️]";
        } else if (optIdx === userAnswerIdx && userAnswerIdx !== correctIdx) {
          classStr = "option-incorrect";
          marker = direction === 'rtl' ? " [إجابتك ❌]" : " [Your Answer ❌]";
        }
 
        html += `<li class="option-item ${classStr}">${opt}${marker}</li>`;
      });
      html += `</ul>`;
    } else if (q.type === 'essay') {
      html += `
        <div style="margin-top: 10px; font-style: italic; color: #555;">
            <strong>${direction === 'rtl' ? 'إجابتك:' : 'Your Answer:'}</strong> ${userAnswerIdx || (direction === 'rtl' ? "لم يتم كتابة إجابة" : "No answer entered")}
        </div>
      `;
    } else if (q.type === 'complete') {
      const isCorrect = (userAnswerIdx && userAnswerIdx.trim().toLowerCase() === q.correctAnswer.toLowerCase());
      html += `
        <div style="margin-top: 10px; padding: 8px 12px; border-radius: 4px; border: 1px solid ${isCorrect ? '#badbcc' : '#f5c2c7'}; background-color: ${isCorrect ? '#d1e7dd' : '#f8d7da'}; color: ${isCorrect ? '#0f5132' : '#842029'}; font-weight: bold;">
            ${direction === 'rtl' ? 'إجابتك:' : 'Your Answer:'} ${userAnswerIdx || (direction === 'rtl' ? 'لم يتم كتابة إجابة' : 'No answer entered')} ${isCorrect ? ' ✔️' : ' ❌'}
        </div>
        ${!isCorrect ? `
        <div style="margin-top: 8px; font-weight: bold; color: #0f5132;">
            ${direction === 'rtl' ? 'الإجابة الصحيحة:' : 'Correct Answer:'} ${q.correctAnswer}
        </div>` : ''}
      `;
    }
 
    if (q.explain && q.explain !== "undefined" || q.explainImage) {
      let expImgHtml = '';
      if (q.explainImage) {
          const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${q.explainImage}/view?project=6a0f923e00138d15d172`;
          expImgHtml = `<div style="text-align: center; margin-top: 10px;"><img src="${imgUrl}" style="max-height: 200px; max-width: 100%; border: 1px solid #ccc; border-radius: 4px;" alt="Explanation Image"></div>`;
      }
      html += `
        <div class="explain-box">
            <strong>${direction === 'rtl' ? 'الشرح / التفسير:' : 'Explanation:'}</strong> ${q.explain && q.explain !== "undefined" ? q.explain : ''}
            ${expImgHtml}
        </div>
      `;
    }
 
    html += `</div>`;
  });
 
  html += `
        </div>
        <div class="footer">
            ${direction === 'rtl' 
              ? 'تم إنشاء وتصحيح هذا التقرير عبر المنصة التعليمية لقسم تكنولوجيا السياحة والضيافة - جامعة المنيا' 
              : 'This report was generated and graded by the Educational Platform of Tourism Industry & Hospitality Technology Department - Minia University'}
        </div>
        <script>
            window.onload = function() { window.print(); }
        <\/script>
    </body>
    </html>
  `;
 
  win.document.write(html);
  win.document.close();
}

function showQuizResults() {
  document.getElementById("quiz-play").classList.add("d-none");
  const e = document.getElementById("quiz-result");
  e.classList.remove("d-none");
  const t = currentQuiz.questions.length,
    n = Math.round((score / t) * 100);
  const maxScore = currentQuiz.max_score || t;
  const actualScore = Math.round((score / t) * maxScore);
  const direction = (currentQuiz.questions && currentQuiz.questions[0] && currentQuiz.questions[0].direction) ? currentQuiz.questions[0].direction : 'rtl';
  
  let allAnswered = true;
  if (currentQuiz && currentQuiz.questions) {
    currentQuiz.questions.forEach((q, idx) => {
      const uAns = userAnswers[idx];
      if (q.type === 'mcq' || q.type === 'tf') {
        if (uAns === undefined || uAns === null || uAns === -1) {
          allAnswered = false;
        }
      } else if (q.type === 'essay' || q.type === 'complete') {
        if (uAns === undefined || uAns === null || (typeof uAns === 'string' && uAns.trim() === "")) {
          allAnswered = false;
        }
      }
    });
  }
 
  let pdfBtnHTML = '';
  if (allAnswered) {
    pdfBtnHTML = `<button class="btn btn-success px-4 py-2" onclick="downloadSolvedExamPDF()"><i class="fas fa-file-pdf me-2"></i>${direction === 'rtl' ? 'تحميل الإجابات PDF' : 'Download Answers PDF'}</button>`;
  } else {
    pdfBtnHTML = `<button class="btn btn-secondary px-4 py-2" disabled title="${direction === 'rtl' ? 'يجب حل جميع الأسئلة بالكامل أولاً' : 'Must answer all questions first'}"><i class="fas fa-file-pdf me-2"></i>${direction === 'rtl' ? 'تحميل الإجابات غير متاح' : 'Download PDF Unavailable'}</button>
                  <div class="w-100 text-danger small mt-1"><i class="fas fa-exclamation-circle me-1"></i> ${direction === 'rtl' ? 'تحميل ملف الـ PDF متاح فقط بعد حل جميع أسئلة الاختبار بالكامل (انتهى وقت الاختبار قبل إتمام الإجابات).' : 'PDF download is only available after answering all questions (time ran out before completion).'}</div>`;
  }
 
  let feedbackText = "";
  let feedbackClass = "";
  if (n >= 85) {
    feedbackText = direction === 'rtl' ? "ممتاز جداً! أنت مستعد تماماً للامتحانات النهائية 🌟" : "Excellent! You are fully prepared for the final exams 🌟";
    feedbackClass = "alert-success";
  } else if (n >= 60) {
    feedbackText = direction === 'rtl' ? "أداء جيد! يمكنك الحصول على نتيجة أفضل بمزيد من المراجعة 👍" : "Good performance! You can get a better score with more review 👍";
    feedbackClass = "alert-warning";
  } else {
    feedbackText = direction === 'rtl' ? "تحتاج إلى قراءة المادة والمحاضرات بشكل أكبر. حاول مرة أخرى لرفع مستواك 📚" : "You need to read the material and lectures more. Try again to improve your level 📚";
    feedbackClass = "alert-danger";
  }
 
  e.innerHTML = `
        <div class="text-center p-4" dir="${direction}">
            <div class="display-1 text-gold mb-3"><i class="fas fa-trophy text-warning"></i></div>
            <h3 class="fw-bold text-primary">${direction === 'rtl' ? 'اكتمل الاختبار!' : 'Quiz Completed!'}</h3>
            <p class="fs-5 text-muted mb-4">${direction === 'rtl' ? `أجبت بشكل صحيح على ${score} من ${t} أسئلة.<br>الدرجة المستحقة: <strong>${actualScore}</strong> من أصل <strong>${maxScore}</strong> درجة.` : `You answered ${score} out of ${t} questions correctly.<br>Total score: <strong>${actualScore}</strong> out of <strong>${maxScore}</strong> points.`}</p>
            
            <div class="progress mb-4" style="height: 25px; border-radius: 50px;">
                <div class="progress-bar bg-warning progress-bar-striped progress-bar-animated text-dark fw-bold" 
                     role="progressbar" style="width: ${n}%;" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100">
                     ${n}%
                </div>
            </div>
 
            <div class="alert ${feedbackClass} py-3 mb-4">
                ${feedbackText}
            </div>
 
            <div class="d-flex gap-2 flex-wrap justify-content-center align-items-center">
                ${pdfBtnHTML}
                <button class="btn btn-gold px-4 py-2" onclick="restartQuiz()"><i class="fas fa-redo me-2"></i>${direction === 'rtl' ? 'إعادة الاختبار' : 'Retake Quiz'}</button>
                <button class="btn btn-outline-dark px-4 py-2" onclick="goToSetup()"><i class="fas fa-home me-2"></i>${direction === 'rtl' ? 'شاشة الاختيار' : 'Setup Screen'}</button>
            </div>
        </div>
    `;
}
function restartQuiz() {
  (document.getElementById("quiz-result").classList.add("d-none"),
    document.getElementById("quiz-play").classList.remove("d-none"),
    (currentQuestionIndex = 0),
    (score = 0),
    (userAnswers = []),
    resetTimer(),
    loadQuestion());
}
function goToSetup() {
  (document.getElementById("quiz-result").classList.add("d-none"),
    document.getElementById("quiz-play").classList.add("d-none"),
    document.getElementById("quiz-setup").classList.remove("d-none"),
    (document.getElementById("quiz-level-select").value = ""),
    document.getElementById("quiz-level-select").dispatchEvent(new Event("change")));
  const e = document.getElementById("quiz-subject-select");
  ((e.innerHTML = '<option value="">-- اختر المادة --</option>'),
    (e.disabled = !0),
    (document.getElementById("start-quiz-btn").disabled = !0));
}
window.renderAllQuestions = function () {
    if (!currentQuiz) return;
    const e = currentQuiz.questions.length;
    ((document.getElementById("question-number").textContent =
      `كل الأسئلة (${e})`),
      (document.getElementById("quiz-progress-bar").style.width = "100%"));
    const t = document.getElementById("question-area");
    let n = "";
    
    // Determine the direction of the exam (LTR or RTL)
    const direction = (currentQuiz.questions && currentQuiz.questions[0] && currentQuiz.questions[0].direction) ? currentQuiz.questions[0].direction : 'rtl';
    const textAlign = direction === 'rtl' ? 'right' : 'left';
    
    const hasEssay = currentQuiz.questions.some(q => q.type === 'essay');
    if (hasEssay) {
        n += `<div class="alert alert-info border-0 border-start border-4 border-info mb-4" dir="rtl" style="text-align: right;">
                <i class="fa-solid fa-circle-info ms-2 text-primary"></i>
                <strong>تعليمات هامة:</strong>
                <p class="mb-0 mt-1">سيتم احتساب جميع الأسئلة المقالية صحيحة كإجراء افتراضي. برجاء التأكد والاطلاع على الإجابات النموذجية أسفل كل سؤال بعد الانتهاء من الاختبار للتأكد من صحة إجابتك. قريباً سيتم إضافة نظام ذكي لتصحيح الأسئلة المقالية.</p>
              </div>`;
    }
    
    (currentQuiz.questions.forEach((e, t) => {
        let qDir = e.direction === 'ltr' ? 'ltr' : 'rtl';
        let qAlign = qDir === 'ltr' ? 'left' : 'right';
        let qPrefix = qDir === 'ltr' ? `Q${t + 1}:` : `سؤال ${t + 1}:`;
        let qText = e.q ? e.q : (qDir === 'ltr' ? '<span class="text-muted fst-italic">(Image Question - see below)</span>' : '<span class="text-muted fst-italic">(سؤال مصور - انظر الصورة أدناه)</span>');
        
        let qImageHtml = "";
        if (e.qImage) {
            const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${e.qImage}/view?project=6a0f923e00138d15d172`;
            qImageHtml = `<div class="mb-3 text-center"><img src="${imgUrl}" class="img-fluid rounded border shadow-sm" style="max-height: 400px;" alt="Question Image"></div>`;
        }
        
      ((n += `\n            <div class="question-block mb-5 p-4 border rounded-3 bg-light shadow-sm" id="q-block-${t}" dir="${qDir}" style="text-align: ${qAlign};">\n                <div class="question-text fw-bold fs-5 mb-3" style="font-family: Cairo, sans-serif;">${qPrefix} ${qText}</div>\n                ${qImageHtml}\n                <div class="options-list d-flex flex-column gap-2" id="q-opts-${t}">\n        `),
        "essay" === e.type
          ? (n += `<textarea class="form-control" rows="4" placeholder="${qDir === 'rtl' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}" id="essay-ans-${t}"></textarea>`)
          : "complete" === e.type
            ? (n += `<input type="text" class="form-control" placeholder="${qDir === 'rtl' ? 'اكتب الكلمة أو العبارة المناسبة لإكمال الجملة...' : 'Type the correct answer to complete the sentence...'}" id="complete-ans-${t}">`)
            : e.options.forEach((e, s) => {
                n += `\n                    <label class="btn btn-outline-secondary text-start w-100 option-label d-flex align-items-center" style="cursor: pointer; font-family: Cairo, sans-serif;" dir="${qDir}">\n                        <input type="radio" name="q-${t}" value="${s}" class="me-3 ms-1" style="transform: scale(1.2);"> \n                        <span class="badge bg-secondary me-3 ms-1">${s + 1}</span> <span>${e}</span>\n                    </label>\n                `;
              }),
        (n += `\n                </div>\n                <div class="explanation-area mt-3 d-none" id="q-exp-${t}"></div>\n            </div>\n        `));
    }),
      (n +=
        `\n        <button class="btn w-100 py-3 fw-bold fs-5 shadow-sm text-white" id="submit-full-exam-btn" style="background-color: #0f2b46; border-radius: 8px;">\n            ${direction === 'rtl' ? 'إنهاء الاختبار وحفظ النتيجة' : 'Submit Exam & Save Result'} <i class="fa-solid fa-check-circle ms-2"></i>\n        </button>\n    `),
      (t.innerHTML = n),
      document
        .getElementById("submit-full-exam-btn")
        .addEventListener("click", submitFullExam));
}

window.submitFullExam = function () {
    if (!currentQuiz) return;
    
    // Check if there are any unanswered questions
    let unansweredCount = 0;
    currentQuiz.questions.forEach((e, t) => {
      if ("essay" === e.type) {
        const val = document.getElementById(`essay-ans-${t}`).value.trim();
        if (!val) unansweredCount++;
      } else if ("complete" === e.type) {
        const val = document.getElementById(`complete-ans-${t}`).value.trim();
        if (!val) unansweredCount++;
      } else {
        const radio = document.querySelector(`input[name="q-${t}"]:checked`);
        if (!radio) unansweredCount++;
      }
    });

    const direction = (currentQuiz.questions && currentQuiz.questions[0] && currentQuiz.questions[0].direction) ? currentQuiz.questions[0].direction : 'rtl';

    if (unansweredCount > 0) {
      const titleText = direction === 'rtl' ? "لم تكتمل الإجابات" : "Incomplete Answers";
      const bodyText = direction === 'rtl' 
        ? `يرجى الإجابة على جميع الأسئلة أولاً! (متبقي ${unansweredCount} سؤال بدون إجابة) لتتمكن من إنهاء الاختبار وتحميل ملف الـ PDF.`
        : `Please answer all questions first! (${unansweredCount} unanswered questions remaining) to submit the exam and download the PDF.`;
      const btnText = direction === 'rtl' ? "موافق، سأكمل الحل" : "OK, I will continue";
      
      if ("undefined" != typeof Swal) {
        Swal.fire({
          title: titleText,
          text: bodyText,
          icon: "warning",
          confirmButtonColor: "#0f2b46",
          confirmButtonText: btnText
        });
      } else {
        alert(bodyText);
      }
      return;
    }

    const confirmTitle = direction === 'rtl' ? "تأكيد الإنهاء" : "Confirm Submission";
    const confirmBody = direction === 'rtl' 
      ? "هل أنت متأكد من رغبتك في إنهاء الاختبار وحفظ الإجابات؟" 
      : "Are you sure you want to finish the exam and save your answers?";
    const confirmBtn = direction === 'rtl' ? "نعم، قم بالإنهاء" : "Yes, Submit";
    const cancelBtn = direction === 'rtl' ? "تراجع" : "Cancel";

    "undefined" != typeof Swal
      ? Swal.fire({
          title: confirmTitle,
          text: confirmBody,
          icon: "question",
          showCancelButton: !0,
          confirmButtonColor: "#0f2b46",
          confirmButtonText: confirmBtn,
          cancelButtonText: cancelBtn,
        }).then((e) => {
          e.isConfirmed && processExamSubmission();
        })
      : confirm(confirmBody) &&
        processExamSubmission();
}

window.processExamSubmission = function () {
    clearInterval(quizTimer);
    score = 0;
    userAnswers = [];
    
    const direction = (currentQuiz.questions && currentQuiz.questions[0] && currentQuiz.questions[0].direction) ? currentQuiz.questions[0].direction : 'rtl';
    
    currentQuiz.questions.forEach((e, t) => {
        let n;
        if ("essay" === e.type) {
            n = document.getElementById(`essay-ans-${t}`).value.trim();
            userAnswers.push(n);
            score++;
            document.getElementById(`essay-ans-${t}`).disabled = true;
            
            if (e.explain && e.explain !== "undefined" || e.explainImage) {
                const explainDiv = document.getElementById(`q-exp-${t}`);
                let expImg = "";
                if (e.explainImage) {
                    const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${e.explainImage}/view?project=6a0f923e00138d15d172`;
                    expImg = `<div class="mt-2"><img src="${imgUrl}" class="img-fluid rounded border" style="max-height: 300px;" alt="Answer Image"></div>`;
                }
                explainDiv.innerHTML = `<div class="alert alert-info border-0 border-start border-4 border-info">
                    <i class="fa-solid fa-lightbulb ms-2 text-warning"></i><strong>${direction === 'rtl' ? 'الإجابة النموذجية:' : 'Model Answer:'}</strong>
                    ${e.explain && e.explain !== "undefined" ? `<p class="mb-0 mt-2 text-dark lh-lg" style="white-space: pre-wrap;">${e.explain}</p>` : ''}
                    ${expImg}
                </div>`;
                explainDiv.classList.remove("d-none");
            }
        } else if ("complete" === e.type) {
            const studentInput = document.getElementById(`complete-ans-${t}`);
            n = studentInput.value.trim();
            userAnswers.push(n);
            studentInput.disabled = true;
            
            const isCorrect = (n.toLowerCase() === e.correctAnswer.toLowerCase());
            if (isCorrect) {
                score++;
                studentInput.classList.add("is-valid", "bg-success-subtle", "text-success", "border-success");
            } else {
                studentInput.classList.add("is-invalid", "bg-danger-subtle", "text-danger", "border-danger");
            }
            
            const explainDiv = document.getElementById(`q-exp-${t}`);
            const correctText = direction === 'rtl' ? `الإجابة الصحيحة هي: ${e.correctAnswer}` : `Correct answer is: ${e.correctAnswer}`;
            let expHtml = `<div class="alert alert-info border-0 border-start border-4 border-info mt-2">
                <i class="fa-solid fa-circle-info ms-2 text-primary"></i><strong>${correctText}</strong>`;
            if (e.explain && e.explain !== "undefined") {
                expHtml += `<p class="mb-0 mt-2 text-dark lh-lg" style="white-space: pre-wrap;">${e.explain}</p>`;
            }
            if (e.explainImage) {
                const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${e.explainImage}/view?project=6a0f923e00138d15d172`;
                expHtml += `<div class="mt-2"><img src="${imgUrl}" class="img-fluid rounded border" style="max-height: 300px;" alt="Answer Image"></div>`;
            }
            expHtml += `</div>`;
            explainDiv.innerHTML = expHtml;
            explainDiv.classList.remove("d-none");
        } else {
            const s = document.querySelector(`input[name="q-${t}"]:checked`);
            n = s ? parseInt(s.value) : -1;
            userAnswers.push(n);
            
            document.getElementById(`q-opts-${t}`).querySelectorAll(".option-label").forEach((t, s) => {
                t.classList.remove("btn-outline-secondary");
                t.querySelector("input").disabled = true;
                
                if (s === e.correct) {
                    t.classList.add("bg-success", "text-white", "border-success");
                }
                if (s === n && n !== e.correct) {
                    t.classList.add("bg-danger", "text-white", "border-danger");
                }
                if (s !== e.correct && s !== n) {
                    t.classList.add("bg-light", "text-muted");
                }
            });
            
            if (n === e.correct) score++;
            
            if (e.explain && e.explain !== "undefined" || e.explainImage) {
                const explainDiv = document.getElementById(`q-exp-${t}`);
                let expImg = "";
                if (e.explainImage) {
                    const imgUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${window.DB_CONFIG.summariesBucket}/files/${e.explainImage}/view?project=6a0f923e00138d15d172`;
                    expImg = `<div class="mt-2"><img src="${imgUrl}" class="img-fluid rounded border" style="max-height: 300px;" alt="Explanation Image"></div>`;
                }
                explainDiv.innerHTML = `<div class="alert alert-info border-0 border-start border-4 border-info mt-2">
                    <i class="fa-solid fa-lightbulb ms-2 text-warning"></i><strong>${direction === 'rtl' ? 'الشرح:' : 'Explanation:'}</strong>
                    ${e.explain && e.explain !== "undefined" ? `<p class="mb-0 mt-2 text-dark lh-lg" style="white-space: pre-wrap;">${e.explain}</p>` : ''}
                    ${expImg}
                </div>`;
                explainDiv.classList.remove("d-none");
            }
        }
    });

    const eBtn = document.getElementById("submit-full-exam-btn");
    eBtn.innerHTML = direction === 'rtl' 
        ? 'الذهاب إلى النتيجة النهائية <i class="fa-solid fa-arrow-left ms-2"></i>'
        : 'Go to Final Result <i class="fa-solid fa-arrow-left ms-2"></i>';
    eBtn.style.backgroundColor = "#198754";
    eBtn.removeEventListener("click", submitFullExam);
    eBtn.addEventListener("click", showQuizResults);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    const t_total = currentQuiz.questions.length;
    const maxScore = currentQuiz.max_score || t_total;
    const actualScore = Math.round((score / t_total) * maxScore);
    
    if (window.AppwriteDB && window.DB_CONFIG) {
      const dbObj = {
        studentName: window.currentStudentName || (direction === 'rtl' ? "طالب مجهول" : "Unknown Student"),
        examTitle: currentQuiz.title || (direction === 'rtl' ? "بدون عنوان" : "Untitled"),
        subjectName: currentQuiz.subject_id || (direction === 'rtl' ? "غير معروف" : "Unknown"),
        level: currentQuiz.level ? currentQuiz.level.toString() : (direction === 'rtl' ? "غير محدد" : "Not specified"),
        score: actualScore,
        totalScore: maxScore,
        details: JSON.stringify({ userAnswers: userAnswers, quiz: currentQuiz }),
      };
      window.AppwriteDB.createDocument(
        window.DB_CONFIG.dbId,
        window.DB_CONFIG.resultsCol,
        window.AppwriteID.unique(),
        dbObj,
      )
        .then(() => {
          console.log("تم حفظ النتيجة مع التفاصيل بنجاح.");
        })
        .catch((err) => {
          console.error(
            "خطأ أثناء حفظ النتيجة بالتفاصيل، محاولة الحفظ بدون التفاصيل...",
            err,
          );
          delete dbObj.details;
          window.AppwriteDB.createDocument(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.resultsCol,
            window.AppwriteID.unique(),
            dbObj,
          )
            .then(() => {
              console.log("تم حفظ النتيجة المصغرة بنجاح.");
            })
            .catch((err2) => {
              console.error("فشل الحفظ النهائي:", err2);
            });
        });
    }
    
    if ("undefined" != typeof Swal) {
        Swal.fire(
            direction === 'rtl' ? "اكتمل التصحيح!" : "Correction Complete!",
            direction === 'rtl' 
                ? "تم تصحيح جميع الأسئلة تلقائياً. راجع أخطاءك ثم انتقل للنتيجة النهائية."
                : "All questions have been graded automatically. Check your mistakes and go to the final result.",
            "success"
        );
    } else {
        showToast(direction === 'rtl' ? "تم التصحيح!" : "Graded!", "success");
    }
}

// Attach variables and functions to window for global access
window.initQuizPageEvents = initQuizPageEvents;
window.downloadSolvedExamPDF = downloadSolvedExamPDF;
window.startQuiz = startQuiz;
window.resetTimer = resetTimer;
window.updateTimerUI = updateTimerUI;
window.showQuizResults = showQuizResults;
window.restartQuiz = restartQuiz;
window.goToSetup = goToSetup;
window.renderAllQuestions = renderAllQuestions;
window.submitFullExam = submitFullExam;
window.processExamSubmission = processExamSubmission;
