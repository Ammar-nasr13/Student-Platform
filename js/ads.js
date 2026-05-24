/**
 * Platform Interstitial Ads Engine - Premium Floating Corner Version
 * Fetches active ads from Appwrite, filters by user frequency cap, and displays a floating queue on the homepage.
 */

async function initAppwriteAds() {
  // 1. Only run on the homepage
  const path = window.location.pathname.split("/").pop();
  const isHomepage = (!path || path === "index.html" || path === "");
  if (!isHomepage) {
    return;
  }

  if (!window.AppwriteDB || !window.DB_CONFIG || !window.DB_CONFIG.adsCol) {
    console.warn("Ads Engine: Appwrite DB or configuration is missing.");
    return;
  }

  // Delay the advertisement loading and display by 10 seconds after user enters the website
  setTimeout(async () => {
    try {
      // 2. Fetch active ads from the database
      const response = await window.AppwriteDB.listDocuments(
        window.DB_CONFIG.dbId,
        window.DB_CONFIG.adsCol,
        [window.AppwriteQuery.equal("isActive", true)]
      );

      const ads = response.documents;
      if (!ads || ads.length === 0) {
        return;
      }

      // 3. Load and clean up local frequency capping logs
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

      // 4. Filter eligible ads
      const eligibleAds = ads.filter((ad) => {
        const log = impressions[ad.$id];
        if (!log) return true; // Never seen this week
        return log.count < ad.weeklyFrequency; // Below cap
      });

      if (eligibleAds.length === 0) {
        return; // No ads available for show this week
      }

      // 5. Start displaying ads queue one after another on the bottom-left
      startAdsQueue(eligibleAds, impressions);
    } catch (error) {
      console.log("Ads Engine: No active advertisements found or ads collection not initialized.", error);
    }
  }, 10000);
}

function startAdsQueue(ads, impressions) {
  if (document.getElementById("ad-overlay-container")) return;

  // Note: We DO NOT lock scrolling anymore (document.body.style.overflow = "hidden" is removed)
  // because the ad floats on the side and the user can browse normally.

  // Create overlay container (which floats at the bottom-left)
  const overlay = document.createElement("div");
  overlay.id = "ad-overlay-container";
  overlay.className = "ad-overlay";
  document.body.appendChild(overlay);

  let currentIdx = 0;
  let timer = null;

  // Helper to validate Appwrite Storage file IDs
  function isValidId(id) {
    if (id === undefined || id === null) return false;
    const str = String(id).trim();
    return str !== "" && str !== "undefined" && str !== "null";
  }

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
    console.log("Ads Engine Debug: Current ad data:", ad);
    
    // Check if videoId/imageId are valid IDs in the database
    const hasVideo = isValidId(ad.videoId);
    const hasImage = isValidId(ad.imageId);
    
    let mediaHtml = "";
    
    if (hasVideo) {
      const videoUrl = `https://appwrite.etihadalmdina.com/v1/storage/buckets/${(window.DB_CONFIG && window.DB_CONFIG.adsBucket) || '6a106b7a00140b147774'}/files/${ad.videoId}/view?project=6a0f923e00138d15d172`;
      mediaHtml = `
        <div class="ad-media-wrapper video-wrapper">
          <video id="ad-media-video" class="ad-media-content" autoplay muted playsinline loop>
            <source src="${videoUrl}" type="video/mp4">
            <source src="${videoUrl}" type="video/ogg">
            <source src="${videoUrl}" type="video/webm">
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
      // Fallback image if imageId is defined, otherwise use abstract card design
      const imageUrl = hasImage 
        ? `https://appwrite.etihadalmdina.com/v1/storage/buckets/${(window.DB_CONFIG && window.DB_CONFIG.adsBucket) || '6a106b7a00140b147774'}/files/${ad.imageId}/view?project=6a0f923e00138d15d172`
        : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800";
        
      mediaHtml = `
        <div class="ad-media-wrapper image-wrapper">
          <img src="${imageUrl}" alt="${ad.title}" class="ad-media-content" loading="lazy" onerror="handleAdImageError(this, '${ad.imageId || ''}')">
          <div class="ad-progress-bar-container">
            <div class="ad-progress-bar" id="ad-progress-bar" style="width: 100%;"></div>
          </div>
        </div>`;
    }

    const isLastAd = currentIdx === ads.length - 1;
    const skipTextString = isLastAd ? "إغلاق الإعلان" : "الإعلان التالي";

    overlay.innerHTML = `
      <div class="ad-glass-card animate-pop" id="ad-card-content">
        <!-- 1. Main ad contents (Image/Video) at the top of the card -->
        <div class="ad-card-body" id="ad-click-target" style="${ad.actionUrl ? 'cursor: pointer;' : ''}">
          ${mediaHtml}
          ${ad.actionUrl ? `
          <div class="ad-action-banner">
            <span>انقر لمعرفة المزيد</span>
            <i class="fa-solid fa-arrow-up-right-from-square ms-2"></i>
          </div>` : ''}
        </div>

        <!-- 2. Header info (Title and Description) in the middle -->
        <div class="ad-card-header mt-3">
          <div class="ad-header-top">
            <span class="ad-badge"><i class="fa-solid fa-rectangle-ad me-1"></i> إعلان ممول</span>
            ${ads.length > 1 ? `<span class="ad-counter">إعلان ${currentIdx + 1} من ${ads.length}</span>` : ''}
          </div>
          <h4 class="ad-card-title mt-2 mb-1">${ad.title}</h4>
          <p class="ad-card-desc mb-0">${ad.description}</p>
        </div>

        <!-- 3. Footer countdown & skip button at the bottom -->
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
          }, 400);
        }
      });
    }
  }

  // Render the first advertisement
  renderCurrentAd();
}

// Mock function to test the premium ad popup visually from browser console (triggers immediately without delay)
window.testPremiumAdPopup = function() {
  const mockAds = [
    {
      $id: "mock_ad_test_1",
      title: "تطبيق متاحف جامعة المنيا",
      description: "تطبيق متحفي يحتوي على متاحف جامعة المنيا ويجمع بين التاريخ والفن والطبيعة المتميزة.",
      imageId: "mock_image_id_1", // Test fallback logic
      duration: 5,
      weeklyFrequency: 99,
      actionUrl: "https://mu.edu.eg"
    },
    {
      $id: "mock_ad_test_2",
      title: "مكتبة المنصة الأكاديمية",
      description: "احصل على جميع ملخصات المحاضرات والكتب والأسئلة الخاصة بالامتحانات لمختلف المستويات مجاناً.",
      imageId: "mock_image_id_2",
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
