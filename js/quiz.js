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
      { id: "مبادئ-البرمجة-الهيكلية", name: "مبادئ البرمجة الهيكلية" },
      { id: "لغة-أجنبية-متخصصة-1", name: "لغة أجنبية متخصصة (1)" },
      { id: "لغة-أجنبية-متخصصة-2", name: "لغة أجنبية متخصصة (2)" },
      { id: "تكنولوجيا-المعلومات", name: "تكنولوجيا المعلومات" },
      { id: "تاريخ-وحضارة-مصر-القديمة", name: "تاريخ وحضارة مصر القديمة" },
      { id: "صناعة-السياحة-والضيافة", name: "صناعة السياحة والضيافة" },
      { id: "شركات-الطيران", name: "شركات الطيران" },
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
      const e = document.getElementById("download-pdf-btn");
      e && (e.disabled = !n.value);
    }),
    s.addEventListener("click", () => {
      const s = e.value,
        o = t.value,
        i = n.value,
        a = document.getElementById("student-name");
      if (a) {
        const e = a.value.trim();
        if (!e || e.split(" ").length < 2)
          return (
            showToast(
              "الرجاء كتابة اسمك الثنائي على الأقل قبل بدء الاختبار!",
              "warning",
            ),
            void a.focus()
          );
        window.currentStudentName = e;
      }
      startQuiz(s, o, i);
    }));
  const o = document.getElementById("download-pdf-btn");
  o &&
    o.addEventListener("click", () => {
      downloadExamPDF(e.value, t.value, n.value);
    });
}
function downloadExamPDF(e, t, n) {
  let s = (window.currentSubjectExams || [])[n];
  if (!s) return;
  let o = s.questions;
  "string" == typeof o && (o = JSON.parse(o));
  const i = document.getElementById("quiz-subject-select");
  let a = i.options[i.selectedIndex].text,
    l = window.open("", "_blank"),
    d = `\n    <html dir="ltr" lang="en">\n    <head>\n        <title>${s.title} - ${a}</title>\n        <style>\n            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }\n            .header { text-align: center; border-bottom: 2px solid #0f2b46; padding-bottom: 20px; margin-bottom: 30px; }\n            .header img { max-height: 80px; }\n            .header h1 { color: #0f2b46; margin: 10px 0; }\n            .header h3 { color: #555; margin: 5px 0; }\n            .question-box { margin-bottom: 25px; page-break-inside: avoid; text-align: left; }\n            .question-text { font-size: 18px; font-weight: bold; margin-bottom: 10px; font-family: sans-serif; }\n            .options-list { margin-left: 20px; text-align: left; }\n            .option-item { margin-bottom: 8px; font-size: 16px; font-family: sans-serif; }\n            .circle { display: inline-block; width: 15px; height: 15px; border: 1px solid #333; border-radius: 50%; margin-right: 10px; position: relative; top: 2px; }\n            .essay-lines { margin-top: 15px; border-bottom: 1px dashed #ccc; height: 30px; width: 100%; }\n            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; }\n            @media print {\n                @page { margin: 1.5cm; }\n                body { padding: 0; }\n            }\n        </style>\n    </head>\n    <body>\n        <div class="header">\n            <h1>جامعة المنيا - كلية السياحة والفنادق</h1>\n            <h3>قسم تكنولوجيا صناعة السياحة والضيافة</h3>\n            <h2>${a} - ${s.title}</h2>\n        </div>\n        <div class="content">\n    `;
  (o.forEach((e, t) => {
    ((d += `<div class="question-box">\n                    <div class="question-text">${t + 1}. ${e.q}</div>\n                    <div class="options-list">`),
      "mcq" === e.type || "tf" === e.type
        ? e.options.forEach((e) => {
            d += `<div class="option-item"><span class="circle"></span> ${e}</div>`;
          })
        : "essay" === e.type &&
          (d +=
            '<div class="essay-lines"></div><div class="essay-lines"></div><div class="essay-lines"></div>'),
      (d += "   </div>\n                 </div>"));
  }),
    (d +=
      '\n        </div>\n        <div class="footer">\n            تم إنشاء هذا الاختبار عبر منصة الطلاب - قسم تكنولوجيا السياحة والضيافة\n        </div>\n        <script>\n            window.onload = function() { window.print(); }\n        <\/script>\n    </body>\n    </html>'),
    l.document.write(d),
    l.document.close());
}
function startQuiz(e, t, n) {
  let s = (window.currentSubjectExams || [])[n];
  s
    ? ("string" == typeof s.questions &&
        (s.questions = JSON.parse(s.questions)),
      (currentQuiz = s),
      (currentQuestionIndex = 0),
      (score = 0),
      (userAnswers = []),
      document.getElementById("quiz-setup").classList.add("d-none"),
      document.getElementById("quiz-play").classList.remove("d-none"),
      (document.getElementById("quiz-title").textContent = currentQuiz.title),
      showToast("بدأ الاختبار التفاعلي ⏱️، بالتوفيق!", "info"),
      resetTimer(),
      renderAllQuestions())
    : showToast("عذراً، هذا الاختبار غير متوفر حالياً.", "warning");
}
function resetTimer() {
  clearInterval(quizTimer);
  const e = 60 === currentQuiz.duration;
  ((timeLeft = e ? 3600 : 45),
    updateTimerUI(),
    (quizTimer = setInterval(() => {
      (timeLeft--,
        updateTimerUI(),
        timeLeft <= 0 &&
          (clearInterval(quizTimer),
          "undefined" != typeof Swal
            ? Swal.fire(
                "انتهى الوقت!",
                "تم إغلاق الاختبار وحساب نتيجتك.",
                "warning",
              )
            : showToast("انتهى وقت السؤال! ⏰", "warning"),
          processExamSubmission()));
    }, 1e3)));
}
function updateTimerUI() {
  const e = document.getElementById("quiz-timer");
  if (e) {
    if (60 === currentQuiz.duration) {
      const t = Math.floor(timeLeft / 60),
        n = timeLeft % 60;
      e.textContent = `الوقت المتبقي: ${t}:${n < 10 ? "0" : ""}${n} دقيقة`;
    } else e.textContent = `الوقت المتبقي: ${timeLeft} ثانية`;
    timeLeft <= 10
      ? e.classList.add("text-danger", "fw-bold")
      : e.classList.remove("text-danger", "fw-bold");
  }
}
function downloadSolvedExamPDF() {
  if (!currentQuiz) return;
  let questions = currentQuiz.questions;
  if (typeof questions === "string") {
    questions = JSON.parse(questions);
  }
  
  const levelText = currentQuiz.level ? `المستوى ${currentQuiz.level}` : "";
  const studentName = window.currentStudentName || "طالب مجهول";
  const dateStr = new Date().toLocaleDateString('ar-EG', { dateStyle: 'long' });
  const finalScore = `${score} من ${questions.length}`;
  const percentage = Math.round((score / questions.length) * 100);

  let win = window.open("", "_blank");
  let html = `
    <html dir="rtl" lang="ar">
    <head>
        <title>تقرير نتائج الاختبار - ${currentQuiz.title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; direction: rtl; text-align: right; }
            .header { text-align: center; border-bottom: 3px double #0f2b46; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #0f2b46; margin: 10px 0; font-size: 24px; }
            .header h3 { color: #555; margin: 5px 0; font-size: 18px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
            .meta-item { font-size: 15px; }
            .meta-item strong { color: #0f2b46; }
            .score-badge { font-size: 18px; font-weight: bold; color: #198754; text-align: center; margin-bottom: 30px; padding: 10px; background: #e8f5e9; border-radius: 8px; border: 1px solid #c8e6c9; }
            .question-box { margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .question-text { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; }
            .options-list { margin-right: 20px; list-style: none; padding: 0; }
            .option-item { margin-bottom: 8px; font-size: 15px; padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; }
            .option-correct { background-color: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; font-weight: bold; }
            .option-incorrect { background-color: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
            .option-unselected { color: #555; }
            .explain-box { margin-top: 12px; background-color: #e2f0d9; border-right: 4px solid #70ad47; padding: 10px 15px; font-size: 14px; border-radius: 0 4px 4px 0; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
            @media print {
                @page { margin: 1.5cm; }
                body { padding: 0; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>جامعة المنيا - كلية السياحة والفنادق</h1>
            <h3>قسم تكنولوجيا صناعة السياحة والضيافة</h3>
            <h2>تقرير نتائج الاختبار: ${currentQuiz.title}</h2>
        </div>
        
        <div class="meta-info">
            <div class="meta-item"><strong>اسم الطالب:</strong> ${studentName}</div>
            <div class="meta-item"><strong>المستوى:</strong> ${levelText}</div>
            <div class="meta-item"><strong>التاريخ:</strong> ${dateStr}</div>
        </div>

        <div class="score-badge">
            النتيجة النهائية: ${finalScore} (${percentage}%)
        </div>

        <div class="content">
  `;

  questions.forEach((q, idx) => {
    const userAnswerIdx = userAnswers[idx];
    const correctIdx = q.correct;
    
    html += `
        <div class="question-box">
            <div class="question-text">${idx + 1}. ${q.q}</div>
            <ul class="options-list">
    `;

    if (q.type === 'mcq' || q.type === 'tf') {
      q.options.forEach((opt, optIdx) => {
        let classStr = "option-unselected";
        let marker = "";
        
        if (optIdx === correctIdx) {
          classStr = "option-correct";
          marker = " [الإجابة الصحيحة ✔️]";
        } else if (optIdx === userAnswerIdx && userAnswerIdx !== correctIdx) {
          classStr = "option-incorrect";
          marker = " [إجابتك ❌]";
        }

        html += `<li class="option-item ${classStr}">${opt}${marker}</li>`;
      });
    } else if (q.type === 'essay') {
      html += `
        <div style="margin-top: 10px; font-style: italic; color: #555;">
            <strong>إجابتك:</strong> ${userAnswerIdx || "لم يتم كتابة إجابة"}
        </div>
      `;
    }

    html += `</ul>`;

    if (q.explain && q.explain !== "undefined") {
      html += `
        <div class="explain-box">
            <strong>الشرح / التفسير:</strong> ${q.explain}
        </div>
      `;
    }

    html += `</div>`;
  });

  html += `
        </div>
        <div class="footer">
            تم إنشاء وتصحيح هذا التقرير عبر المنصة التعليمية لقسم تكنولوجيا السياحة والضيافة - جامعة المنيا
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
  if (window.AppwriteDB && window.DB_CONFIG) {
    const e = {
      studentName: window.currentStudentName || "طالب مجهول",
      examTitle: currentQuiz.title || "بدون عنوان",
      subjectName: currentQuiz.subject_id || "غير معروف",
      level: currentQuiz.level ? currentQuiz.level.toString() : "غير محدد",
      score: score,
      totalScore: t,
      details: JSON.stringify({ userAnswers: userAnswers, quiz: currentQuiz }),
    };
    window.AppwriteDB.createDocument(
      window.DB_CONFIG.dbId,
      window.DB_CONFIG.resultsCol,
      window.AppwriteID.unique(),
      e,
    )
      .then(() => {
        console.log("تم حفظ النتيجة مع التفاصيل بنجاح.");
      })
      .catch((t) => {
        (console.error(
          "خطأ أثناء حفظ النتيجة بالتفاصيل، محاولة الحفظ بدون التفاصيل...",
          t,
        ),
          delete e.details,
          window.AppwriteDB.createDocument(
            window.DB_CONFIG.dbId,
            window.DB_CONFIG.resultsCol,
            window.AppwriteID.unique(),
            e,
          )
            .then(() => {
              console.log("تم حفظ النتيجة المصغرة بنجاح.");
            })
            .catch((e) => {
              console.error("فشل الحفظ النهائي:", e);
            }));
      });
  }
  let s = "",
    o = "";
  (n >= 85
    ? ((s = "ممتاز جداً! أنت مستعد تماماً للامتحانات النهائية 🌟"),
      (o = "alert-success"))
    : n >= 60
      ? ((s = "أداء جيد! يمكنك الحصول على نتيجة أفضل بمزيد من المراجعة 👍"),
        (o = "alert-warning"))
      : ((s =
          "تحتاج إلى قراءة المادة والمحاضرات بشكل أكبر. حاول مرة أخرى لرفع مستواك 📚"),
        (o = "alert-danger")),
    (e.innerHTML = `\n        <div class="text-center p-4">\n            <div class="display-1 text-gold mb-3"><i class="fas fa-trophy text-warning"></i></div>\n            <h3 class="fw-bold text-primary">اكتمل الاختبار!</h3>\n            <p class="fs-5 text-muted mb-4">لقد أجبت بشكل صحيح على <strong>${score}</strong> أسئلة من أصل <strong>${t}</strong></p>\n            \n            <div class="progress mb-4" style="height: 25px; border-radius: 50px;">\n                <div class="progress-bar bg-warning progress-bar-striped progress-bar-animated text-dark fw-bold" \n                     role="progressbar" style="width: ${n}%;" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="100">\n                     ${n}%\n                </div>\n            </div>\n\n            <div class="alert ${o} py-3 mb-4">\n                ${s}\n            </div>\n\n            <div class="d-flex gap-2 flex-wrap justify-content-center">\n                <button class="btn btn-success px-4 py-2" onclick="downloadSolvedExamPDF()"><i class="fas fa-file-pdf me-2"></i>تحميل الإجابات PDF</button>\n                <button class="btn btn-gold px-4 py-2" onclick="restartQuiz()"><i class="fas fa-redo me-2"></i>إعادة الاختبار</button>\n                <button class="btn btn-outline-dark px-4 py-2" onclick="goToSetup()"><i class="fas fa-home me-2"></i>شاشة الاختيار</button>\n            </div>\n        </div>\n    `));
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
    (document.getElementById("quiz-level-select").value = ""));
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
    (currentQuiz.questions.forEach((e, t) => {
      ((n += `\n            <div class="question-block mb-5 p-4 border rounded-3 bg-light shadow-sm" id="q-block-${t}" dir="ltr" style="text-align: left;">\n                <div class="question-text fw-bold fs-5 mb-3" style="font-family: sans-serif;">${t + 1}. ${e.q}</div>\n                <div class="options-list d-flex flex-column gap-2" id="q-opts-${t}">\n        `),
        "essay" === e.type
          ? (n += `<textarea class="form-control" rows="4" placeholder="اكتب إجابتك هنا..." id="essay-ans-${t}"></textarea>`)
          : e.options.forEach((e, s) => {
              n += `\n                    <label class="btn btn-outline-secondary text-start w-100 option-label d-flex align-items-center" style="cursor: pointer; font-family: sans-serif;">\n                        <input type="radio" name="q-${t}" value="${s}" class="me-3 ms-1" style="transform: scale(1.2);"> \n                        <span class="badge bg-secondary me-3 ms-1">${s + 1}</span> <span>${e}</span>\n                    </label>\n                `;
            }),
        (n += `\n                </div>\n                <div class="explanation-area mt-3 d-none" id="q-exp-${t}"></div>\n            </div>\n        `));
    }),
      (n +=
        '\n        <button class="btn w-100 py-3 fw-bold fs-5 shadow-sm text-white" id="submit-full-exam-btn" style="background-color: #0f2b46; border-radius: 8px;">\n            إنهاء الاختبار وحفظ النتيجة <i class="fa-solid fa-check-circle ms-2"></i>\n        </button>\n    '),
      (t.innerHTML = n),
      document
        .getElementById("submit-full-exam-btn")
        .addEventListener("click", submitFullExam));
  }
window.submitFullExam = function () {
    "undefined" != typeof Swal
      ? Swal.fire({
          title: "تأكيد الإنهاء",
          text: "هل أنت متأكد من رغبتك في إنهاء الاختبار وحفظ الإجابات؟",
          icon: "question",
          showCancelButton: !0,
          confirmButtonColor: "#0f2b46",
          confirmButtonText: "نعم، قم بالإنهاء",
          cancelButtonText: "تراجع",
        }).then((e) => {
          e.isConfirmed && processExamSubmission();
        })
      : confirm("هل أنت متأكد من رغبتك في إنهاء الاختبار؟") &&
        processExamSubmission();
  }
window.processExamSubmission = function () {
    (clearInterval(quizTimer),
      (score = 0),
      (userAnswers = []),
      currentQuiz.questions.forEach((e, t) => {
        let n;
        if ("essay" === e.type) {
          if (
            ((n = document.getElementById(`essay-ans-${t}`).value.trim()),
            userAnswers.push(n),
            score++,
            (document.getElementById(`essay-ans-${t}`).disabled = !0),
            e.explain && "undefined" !== e.explain)
          ) {
            const n = document.getElementById(`q-exp-${t}`);
            ((n.innerHTML = `<div class="alert alert-info border-0 border-start border-4 border-info"><i class="fa-solid fa-lightbulb ms-2 text-warning"></i><strong>Answer:</strong><p class="mb-0 mt-2 text-dark lh-lg">${e.explain}</p></div>`),
              n.classList.remove("d-none"));
          }
        } else {
          const s = document.querySelector(`input[name="q-${t}"]:checked`);
          ((n = s ? parseInt(s.value) : -1), userAnswers.push(n));
          if (
            (document
              .getElementById(`q-opts-${t}`)
              .querySelectorAll(".option-label")
              .forEach((t, s) => {
                t.classList.remove("btn-outline-secondary");
                ((t.querySelector("input").disabled = !0),
                  s === e.correct &&
                    t.classList.add(
                      "bg-success",
                      "text-white",
                      "border-success",
                    ),
                  s === n &&
                    n !== e.correct &&
                    t.classList.add("bg-danger", "text-white", "border-danger"),
                  s !== e.correct &&
                    s !== n &&
                    t.classList.add("bg-light", "text-muted"));
              }),
            n === e.correct && score++,
            e.explain && "undefined" !== e.explain)
          ) {
            const n = document.getElementById(`q-exp-${t}`);
            ((n.innerHTML = `<div class="alert alert-info border-0 border-start border-4 border-info mt-2"><i class="fa-solid fa-lightbulb ms-2 text-warning"></i><strong>Answer:</strong><p class="mb-0 mt-2 text-dark lh-lg">${e.explain}</p></div>`),
              n.classList.remove("d-none"));
          }
        }
      }));
    const e = document.getElementById("submit-full-exam-btn");
    ((e.innerHTML =
      'الذهاب إلى النتيجة النهائية <i class="fa-solid fa-arrow-left ms-2"></i>'),
      (e.style.backgroundColor = "#198754"),
      e.removeEventListener("click", submitFullExam),
      e.addEventListener("click", showQuizResults),
      window.scrollTo({ top: 0, behavior: "smooth" }),
      "undefined" != typeof Swal
        ? Swal.fire(
            "اكتمل التصحيح!",
            "تم تصحيح جميع الأسئلة تلقائياً. راجع أخطاءك ثم انتقل للنتيجة النهائية.",
            "success",
          )
        : showToast("تم التصحيح!", "success"));
  }

// Attach variables and functions to window for global access
window.initQuizPageEvents = initQuizPageEvents;
window.downloadExamPDF = downloadExamPDF;
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
