/**
 * Platform Interstitial Ads Engine
 * Fetches active ads from Appwrite, filters by user frequency cap, and displays premium popups.
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

    // 4. Select a random ad from eligible ones
    const selectedAd = eligibleAds[Math.floor(Math.random() * eligibleAds.length)];

    // 5. Render the ad popup
    renderInterstitialAd(selectedAd, impressions);
  } catch (error) {
    // Fail silently in console to prevent breaking client loading if collection isn't created yet
    console.log("Ads Engine: No active advertisements found or ads collection not initialized.", error);
  }
}

function renderInterstitialAd(ad, impressions) {
  // Prevent duplicate ad overlays
  if (document.getElementById("ad-overlay-container")) return;

  const overlay = document.createElement("div");
  overlay.id = "ad-overlay-container";
  overlay.className = "ad-overlay";

  // Build structural HTML with premium glassmorphism layout
  let mediaHtml = "";
  if (ad.mediaType === "video") {
    mediaHtml = `
      <div class="ad-media-wrapper video-wrapper">
        <video id="ad-media-video" class="ad-media-content" autoplay muted playsinline loop>
          <source src="${ad.mediaUrl}" type="video/mp4">
          <source src="${ad.mediaUrl}" type="video/ogg">
          <source src="${ad.mediaUrl}" type="video/webm">
          Your browser does not support the video tag.
        </video>
        <button class="ad-video-unmute-btn" id="ad-video-mute-toggle" title="كتم/تشغيل الصوت">
          <i class="fa-solid fa-volume-mute" id="mute-icon"></i>
        </button>
      </div>`;
  } else {
    mediaHtml = `
      <div class="ad-media-wrapper image-wrapper">
        <img src="${ad.mediaUrl}" alt="${ad.title}" class="ad-media-content" loading="lazy">
      </div>`;
  }

  overlay.innerHTML = `
    <div class="ad-glass-card animate-pop">
      <!-- Header info -->
      <div class="ad-card-header">
        <span class="ad-badge"><i class="fa-solid fa-rectangle-ad me-1"></i> إعلان ممول</span>
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

  document.body.appendChild(overlay);

  // Add event listeners
  const skipBtn = document.getElementById("ad-skip-btn");
  const skipText = document.getElementById("ad-skip-text");
  const spinner = document.getElementById("ad-spinner");
  const clickTarget = document.getElementById("ad-click-target");
  const muteToggle = document.getElementById("ad-video-mute-toggle");
  const video = document.getElementById("ad-media-video");

  let remaining = ad.duration;

  // Click on ad redirect
  if (ad.actionUrl && clickTarget) {
    clickTarget.addEventListener("click", (e) => {
      // Don't redirect if clicking on the mute button
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

  // Timer interval
  const timer = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      if (skipText) skipText.textContent = `تخطي بعد ${remaining} ثانية...`;
    } else {
      clearInterval(timer);
      if (skipBtn) {
        skipBtn.disabled = false;
        skipBtn.classList.add("active-skip");
      }
      if (skipText) skipText.innerHTML = `تخطي الإعلان <i class="fa-solid fa-chevron-left ms-1"></i>`;
      if (spinner) spinner.style.display = "none";
    }
  }, 1000);

  // Skip button click: Save impression and close overlay
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

      // Close modal with animation
      overlay.classList.add("fade-out-ad");
      setTimeout(() => {
        overlay.remove();
      }, 400);
    });
  }
}

// Mock function to test the premium ad popup visually from browser console
window.testPremiumAdPopup = function(type = 'image') {
  const mockAd = {
    $id: "mock_ad_test",
    title: "مهرجان الثقافة والسياحة السنوي الثاني",
    description: "انضم إلينا في أكبر فعاليات قسم تكنولوجيا السياحة والضيافة بجامعة المنيا. محاضرات تفاعلية، عروض مباشرة، وورش عمل مع نخبة من خبراء الفندقة والسفر والضيافة.",
    mediaUrl: type === 'video' 
      ? "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-silent-lake-40890-large.mp4"
      : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000",
    mediaType: type,
    duration: 7,
    weeklyFrequency: 5,
    actionUrl: "https://mu.edu.eg"
  };
  renderInterstitialAd(mockAd, {});
  console.log("Mock ad rendering triggered successfully. Type: " + type);
};

// Global initialization trigger
window.initAppwriteAds = initAppwriteAds;
