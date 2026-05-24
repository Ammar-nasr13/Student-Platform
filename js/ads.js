/**
 * Platform Interstitial Ads Engine - Premium Carousel Queue Version
 * Fetches active ads from Appwrite, filters by user frequency cap, and displays a premium pop-up queue.
 */

async function initAppwriteAds() {
  if (!window.AppwriteDB || !window.DB_CONFIG || !window.DB_CONFIG.adsCol) {
    console.warn("Ads Engine: Appwrite DB or configuration is missing.");
    return;
  }

  try {
    // 1. Fetch active ads from the database
    const response = await window.AppwriteDB.listDocuments(
      window.DB_CONFIG.dbId,
      window.DB_CONFIG.adsCol,
      [window.AppwriteQuery.equal("isActive", true)]
    );

    const ads = response.documents;
    if (!ads || ads.length === 0) {
      return;
    }

    // 2. Load and clean up local frequency capping logs
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    let impressions = {};
    
    try {
      impressions = JSON.parse(localStorage.getItem("platform_ads_impressions")) || {};
    } catch (e) {
      impressions = {};
    }

    // Clean up expired impressions (older than 7 days)
    for (const adId in impressions) {
      if (now - impressions[adId].weekStart > oneWeekMs) {
        delete impressions[adId];
      }
    }

    // 3. Filter eligible ads
    const eligibleAds = ads.filter((ad) => {
      const log = impressions[ad.$id];
      if (!log) return true; // Never seen this week
      return log.count < ad.weeklyFrequency; // Below cap
    });

    if (eligibleAds.length === 0) {
      return; // No ads available for show this week
    }

    // 4. Start displaying ads queue one after another
    startAdsQueue(eligibleAds, impressions);
  } catch (error) {
    console.log("Ads Engine: No active advertisements found or ads collection not initialized.", error);
  }
}

function startAdsQueue(ads, impressions) {
  if (document.getElementById("ad-overlay-container")) return;

  // Prevent scroll on main body to avoid user scrolling underneath the ad
  document.body.style.overflow = "hidden";

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.id = "ad-overlay-container";
  overlay.className = "ad-overlay";
  document.body.appendChild(overlay);

  let currentIdx = 0;
  let timer = null;

  // Error handler for image issues (e.g. wrong permissions or invalid file IDs)
  window.handleAdImageError = function(img, mediaId) {
    console.error("Ads Engine: Failed to load ad image. File ID:", mediaId, "URL:", img.src);
    img.onerror = null; // Prevent infinite loop
    // Fallback to a high-quality abstract design so the UI is never broken
    img.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800";
    
    console.warn(
      `Ads Engine Advice: If you see this fallback, make sure the Appwrite Storage bucket "${
        (window.DB_CONFIG && window.DB_CONFIG.adsBucket) || '6a106b7a00140b147774'
      }" has the "Read" permission set to "Any" (role:all) in the settings tab.`
    );
  };

  function renderCurrentAd() {
    const ad = ads[currentIdx];
    
    // Resolve dynamic Storage view URL if mediaId is provided, fallback to mediaUrl
    const mediaUrl = ad.mediaId 
      ? `https://appwrite.etihadalmdina.com/v1/storage/buckets/${(window.DB_CONFIG && window.DB_CONFIG.adsBucket) || '6a106b7a00140b147774'}/files/${ad.mediaId}/view?project=6a0f923e00138d15d172`
      : ad.mediaUrl;

    let mediaHtml = "";
    if (ad.mediaType === "video") {
      mediaHtml = `
        <div class="ad-media-wrapper video-wrapper">
          <video id="ad-media-video" class="ad-media-content" autoplay muted playsinline loop>
            <source src="${mediaUrl}" type="video/mp4">
            <source src="${mediaUrl}" type="video/ogg">
            <source src="${mediaUrl}" type="video/webm">
            Your browser does not support the video tag.
          </video>
          <button class="ad-video-unmute-btn" id="ad-video-mute-toggle" title="كتم/تشغيل الصوت">
            <i class="fa-solid fa-volume-mute" id="mute-icon"></i>
          </button>
          <div class="ad-progress-bar-container">
            <div class="ad-progress-bar" id="ad-progress-bar" style="width: 100%;"></div>
          </div>
        </div>`;
    } else {
      mediaHtml = `
        <div class="ad-media-wrapper image-wrapper">
          <img src="${mediaUrl}" alt="${ad.title}" class="ad-media-content" loading="lazy" onerror="handleAdImageError(this, '${ad.mediaId}')">
          <div class="ad-progress-bar-container">
            <div class="ad-progress-bar" id="ad-progress-bar" style="width: 100%;"></div>
          </div>
        </div>`;
    }

    const isLastAd = currentIdx === ads.length - 1;
    const skipTextString = isLastAd ? "إغلاق الإعلان" : "الإعلان التالي";

    overlay.innerHTML = `
      <div class="ad-glass-card animate-pop" id="ad-card-content">
        <!-- Header info -->
        <div class="ad-card-header">
          <div class="ad-header-top">
            <span class="ad-badge"><i class="fa-solid fa-rectangle-ad me-1"></i> إعلان ممول</span>
            ${ads.length > 1 ? `<span class="ad-counter">إعلان ${currentIdx + 1} من ${ads.length}</span>` : ''}
          </div>
          <h4 class="ad-card-title mt-2 mb-1">${ad.title}</h4>
          <p class="ad-card-desc mb-3">${ad.description}</p>
        </div>

        <!-- Main ad contents clickable (direct to actionUrl) -->
        <div class="ad-card-body" id="ad-click-target" style="${ad.actionUrl ? 'cursor: pointer;' : ''}">
          ${mediaHtml}
          ${ad.actionUrl ? `
          <div class="ad-action-banner">
            <span>انقر لمعرفة المزيد</span>
            <i class="fa-solid fa-arrow-up-right-from-square ms-2"></i>
          </div>` : ''}
        </div>

        <!-- Footer countdown & skip button -->
        <div class="ad-card-footer mt-3">
          <button id="ad-skip-btn" class="ad-skip-button" disabled>
            <span class="ad-spinner-circle" id="ad-spinner"></span>
            <span id="ad-skip-text">تخطي بعد ${ad.duration} ثانية...</span>
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    const skipBtn = document.getElementById("ad-skip-btn");
    const skipText = document.getElementById("ad-skip-text");
    const spinner = document.getElementById("ad-spinner");
    const clickTarget = document.getElementById("ad-click-target");
    const muteToggle = document.getElementById("ad-video-mute-toggle");
    const video = document.getElementById("ad-media-video");
    const progressBar = document.getElementById("ad-progress-bar");

    let remaining = ad.duration;

    // Click on ad redirect
    if (ad.actionUrl && clickTarget) {
      clickTarget.addEventListener("click", (e) => {
        if (e.target.closest("#ad-video-mute-toggle")) return;
        window.open(ad.actionUrl, "_blank");
      });
    }

    // Mute/Unmute video handler
    if (video && muteToggle) {
      const icon = document.getElementById("mute-icon");
      muteToggle.addEventListener("click", () => {
        video.muted = !video.muted;
        if (video.muted) {
          icon.className = "fa-solid fa-volume-mute";
        } else {
          icon.className = "fa-solid fa-volume-high";
        }
      });
    }

    // Initialize progress bar width
    if (progressBar) {
      progressBar.style.width = "100%";
    }

    // Timer interval
    timer = setInterval(() => {
      remaining--;
      if (progressBar) {
        // Linear decrement of progress bar width
        progressBar.style.width = ((remaining / ad.duration) * 100) + '%';
      }
      
      if (remaining > 0) {
        if (skipText) skipText.textContent = `تخطي بعد ${remaining} ثانية...`;
      } else {
        clearInterval(timer);
        if (skipBtn) {
          skipBtn.disabled = false;
          skipBtn.classList.add("active-skip");
        }
        if (skipText) {
          skipText.innerHTML = `${skipTextString} <i class="fa-solid fa-chevron-left ms-1"></i>`;
        }
        if (spinner) spinner.style.display = "none";
      }
    }, 1000);

    // Skip button click handler (next ad or close)
    if (skipBtn) {
      skipBtn.addEventListener("click", () => {
        clearInterval(timer);

        // Save impression count to localStorage
        const now = Date.now();
        if (!impressions[ad.$id]) {
          impressions[ad.$id] = { count: 0, weekStart: now };
        }
        impressions[ad.$id].count++;
        localStorage.setItem("platform_ads_impressions", JSON.stringify(impressions));

        // Go to next ad or close modal
        if (currentIdx < ads.length - 1) {
          const card = document.getElementById("ad-card-content");
          if (card) {
            card.classList.remove("animate-pop");
            card.classList.add("fade-out-card");
          }
          setTimeout(() => {
            currentIdx++;
            renderCurrentAd();
          }, 300);
        } else {
          // Close modal with exit animations
          overlay.classList.add("fade-out-ad");
          setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = ""; // Restore scrolling
          }, 400);
        }
      });
    }
  }

  // Render the first advertisement
  renderCurrentAd();
}

// Mock function to test the premium ad popup visually from browser console
window.testPremiumAdPopup = function(type = 'image') {
  const mockAds = [
    {
      $id: "mock_ad_test_1",
      title: "تطبيق متاحف جامعة المنيا",
      description: "تطبيق متحفي يحتوي على متاحف جامعة المنيا ويجمع بين التاريخ والفن والطبيعة.",
      mediaUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1000",
      mediaType: "image",
      duration: 5,
      weeklyFrequency: 99,
      actionUrl: "https://mu.edu.eg"
    },
    {
      $id: "mock_ad_test_2",
      title: "مكتبة المنصة الأكاديمية",
      description: "احصل على جميع ملخصات المحاضرات والكتب والأسئلة الخاصة بالامتحانات لمختلف المستويات مجاناً.",
      mediaUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=1000",
      mediaType: "image",
      duration: 5,
      weeklyFrequency: 99,
      actionUrl: "https://mu.edu.eg"
    }
  ];
  
  startAdsQueue(mockAds, {});
  console.log("Mock ad carousel queue triggered successfully.");
};

// Global initialization trigger
window.initAppwriteAds = initAppwriteAds;
