// Favorites Page Module - Handles dynamic parsing and loading of favorited courses

document.addEventListener("DOMContentLoaded", () => {
    loadFavorites();
});

async function loadFavorites() {
    const container = document.getElementById("favorites-container");
    if (!container) return;

    const favSlugs = JSON.parse(localStorage.getItem("fav_courses") || "[]");

    if (favSlugs.length === 0) {
        showEmptyState();
        return;
    }

    // List of level pages to scan for course data
    const pages = ["level1.html", "level2.html", "level3.html", "level4.html"];
    const allCards = [];

    try {
        // Fetch and parse all level pages in parallel
        const fetchPromises = pages.map(async (page) => {
            try {
                const response = await fetch(page);
                if (!response.ok) return;
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, "text/html");
                const cards = doc.querySelectorAll(".course-card");
                
                cards.forEach((card) => {
                    const titleEl = card.querySelector(".course-title");
                    if (!titleEl) return;
                    const title = titleEl.textContent.trim();
                    const slug = getSlug(title);
                    
                    if (favSlugs.includes(slug)) {
                        // Store the card markup and metadata
                        allCards.push({
                            slug: slug,
                            title: title,
                            html: card.outerHTML
                        });
                    }
                });
            } catch (err) {
                console.error(`Error fetching page ${page}:`, err);
            }
        });

        await Promise.all(fetchPromises);

        if (allCards.length === 0) {
            showEmptyState();
            return;
        }

        // Render matching cards inside the container
        container.innerHTML = "";
        
        allCards.forEach((cardObj) => {
            const colDiv = document.createElement("div");
            colDiv.className = "col-md-6 fav-card-wrapper mb-4";
            colDiv.innerHTML = cardObj.html;
            container.appendChild(colDiv);
            
            const renderedCard = colDiv.querySelector(".course-card");
            const slug = cardObj.slug;
            const title = cardObj.title;
            
            // 1. Hook up the Favorite Star button and convert it to a red delete button
            const favBtn = renderedCard.querySelector(".favorite-btn");
            if (favBtn) {
                // Style as red delete button
                favBtn.className = "remove-fav-btn btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center position-absolute";
                favBtn.style.top = "15px";
                favBtn.style.left = "15px";
                favBtn.style.width = "32px";
                favBtn.style.height = "32px";
                favBtn.style.padding = "0";
                favBtn.style.zIndex = "10";
                favBtn.style.border = "none";
                favBtn.style.backgroundColor = "#dc3545";
                favBtn.style.color = "#ffffff";
                favBtn.innerHTML = '<i class="fa-solid fa-trash-can" style="font-size: 0.95rem;"></i>';
                favBtn.title = "إزالة من المفضلة";
                
                favBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    let favs = JSON.parse(localStorage.getItem("fav_courses") || "[]");
                    favs = favs.filter((s) => s !== slug);
                    localStorage.setItem("fav_courses", JSON.stringify(favs));
                    
                    // Smooth animation on removal
                    colDiv.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
                    colDiv.style.opacity = "0";
                    colDiv.style.transform = "scale(0.8) translateY(20px)";
                    
                    if (window.showToast) {
                        window.showToast(`تمت إزالة [${title}] من المفضلة`, "info");
                    }
                    
                    setTimeout(() => {
                        colDiv.remove();
                        if (container.querySelectorAll(".fav-card-wrapper").length === 0) {
                            showEmptyState();
                        }
                    }, 400);
                });
            }
            
            // 2. Hook up the Complete toggle button
            const completeToggle = renderedCard.querySelector(".complete-toggle-btn");
            if (completeToggle) {
                // Ensure initial visual state matches localStorage
                const isComplete = localStorage.getItem(`complete_${slug}`) === "true";
                if (isComplete) {
                    completeToggle.classList.add("is-complete");
                    completeToggle.innerHTML = '<i class="fa-solid fa-circle-check"></i> مكتمل';
                } else {
                    completeToggle.classList.remove("is-complete");
                    completeToggle.innerHTML = '<i class="fa-regular fa-circle-check"></i> غير مكتمل';
                }

                completeToggle.addEventListener("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const currentlyComplete = localStorage.getItem(`complete_${slug}`) === "true";
                    if (currentlyComplete) {
                        localStorage.setItem(`complete_${slug}`, "false");
                        completeToggle.classList.remove("is-complete");
                        completeToggle.innerHTML = '<i class="fa-regular fa-circle-check"></i> غير مكتمل';
                        if (window.showToast) {
                            window.showToast(`تم تعيين [${title}] كغير مكتمل`, "info");
                        }
                    } else {
                        localStorage.setItem(`complete_${slug}`, "true");
                        completeToggle.classList.add("is-complete");
                        completeToggle.innerHTML = '<i class="fa-solid fa-circle-check"></i> مكتمل';
                        if (window.showToast) {
                            window.showToast(`رائع! أكملت دراسة مقرر [${title}] ✔️`, "success");
                        }
                    }
                });
            }
            
            // 3. Hook up the Course Card to open the Syllabus Modal
            renderedCard.style.cursor = "pointer";
            renderedCard.style.position = "relative";
            renderedCard.addEventListener("click", () => {
                if (typeof window.openSyllabusModal === "function") {
                    window.openSyllabusModal(slug);
                }
            });
            
            // Prevent syllabus modal from opening when clicking download button
            const downloadBtn = renderedCard.querySelector("a.btn-primary");
            if (downloadBtn) {
                downloadBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                });
            }
        });

    } catch (err) {
        console.error("Error displaying favorites:", err);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="fs-2 text-danger mb-3"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <h5 class="text-danger">حدث خطأ أثناء تحميل المقررات المفضلة.</h5>
                <button class="btn btn-outline-dark mt-3 rounded-pill" onclick="loadFavorites()"><i class="fa-solid fa-redo me-1"></i> إعادة المحاولة</button>
            </div>
        `;
    }
}

function chooseLevelAndRedirect() {
    if (typeof Swal !== "undefined") {
        Swal.fire({
            title: 'تصفح المقررات الدراسية',
            html: `
                <p class="mb-4">يرجى اختيار المستوى الدراسي الذي تود تصفحه:</p>
                <div class="d-grid gap-2">
                    <a href="level1.html" class="btn text-white py-2 fw-bold" style="background-color: #1a365d; border-radius: 8px;">المستوى الأول</a>
                    <a href="level2.html" class="btn text-white py-2 fw-bold" style="background-color: #198754; border-radius: 8px;">المستوى الثاني</a>
                    <a href="level3.html" class="btn text-white py-2 fw-bold" style="background-color: #0d6efd; border-radius: 8px;">المستوى الثالث</a>
                    <a href="level4.html" class="btn text-white py-2 fw-bold" style="background-color: #dc3545; border-radius: 8px;">المستوى الرابع</a>
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'إلغاء',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'rounded-4'
            }
        });
    } else {
        const val = prompt("يرجى كتابة رقم المستوى للتصفح (1 أو 2 أو 3 أو 4):");
        if (val === "1") window.location.href = "level1.html";
        else if (val === "2") window.location.href = "level2.html";
        else if (val === "3") window.location.href = "level3.html";
        else if (val === "4") window.location.href = "level4.html";
    }
}

function showEmptyState() {
    const container = document.getElementById("favorites-container");
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12 text-center py-5 animated-fade-in">
            <div class="display-1 text-muted mb-4" style="font-size: 5rem; opacity: 0.3;"><i class="fa-regular fa-star"></i></div>
            <h3 class="fw-bold text-primary mb-3">مفضلّتك فارغة حالياً</h3>
            <p class="text-muted mb-4 fs-6">لم تقم بإضافة أي مقررات دراسية إلى قائمتك المفضلة حتى الآن.</p>
            <div class="d-flex justify-content-center gap-3">
                <a href="index.html" class="btn btn-navy-solid px-4 py-2"><i class="fa-solid fa-home me-2"></i>الرئيسية</a>
                <a href="#" id="browse-courses-btn" class="btn btn-outline-gold px-4 py-2"><i class="fa-solid fa-book me-2"></i>تصفح المقررات</a>
            </div>
        </div>
    `;

    const btn = document.getElementById("browse-courses-btn");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            chooseLevelAndRedirect();
        });
    }
}

function getSlug(title) {
    return title
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, "");
}

// Attach functions to window for global access
window.loadFavorites = loadFavorites;
window.chooseLevelAndRedirect = chooseLevelAndRedirect;
