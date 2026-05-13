// ============================================================
// 1. PREVENT DOWNLOAD
// ============================================================
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('dragstart', (event) => event.preventDefault());


// ============================================================
// 2. SCROLL ANIMATIONS
// ============================================================
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
});

document.querySelectorAll('.fade').forEach((element) => {
  scrollObserver.observe(element);
});


// ============================================================
// 3. BUILD THE IMAGE GALLERY
// ============================================================
const TOTAL_IMAGES = 64;
const siteOrigin = window.location.origin;

// Known dimensions of each original photo (width × height).
// Setting width + height on <img> lets the browser reserve the
// correct space before the image loads, preventing layout shift.
const IMAGE_DIMENSIONS = {
  "00001":[899,600],"00002":[960,600],"00003":[960,600],"00004":[453,600],"00005":[960,600],
  "00006":[400,600],"00007":[399,600],"00008":[400,600],"00009":[1012,600],"00010":[1002,600],
  "00011":[1216,600],"00012":[1131,600],"00013":[900,600],"00014":[900,600],"00015":[365,600],
  "00016":[870,600],"00017":[960,600],"00018":[960,600],"00019":[960,600],"00020":[400,600],
  "00021":[960,600],"00022":[960,600],"00023":[960,600],"00024":[960,600],"00025":[960,600],
  "00026":[960,600],"00027":[960,600],"00028":[960,600],"00029":[960,600],"00030":[960,600],
  "00031":[965,600],"00032":[399,600],"00033":[900,600],"00034":[900,600],"00035":[900,600],
  "00036":[429,600],"00037":[900,600],"00038":[1065,600],"00039":[399,600],"00040":[1065,600],
  "00041":[399,600],"00042":[1067,600],"00043":[400,600],"00044":[1067,600],"00045":[1470,600],
  "00046":[523,600],"00047":[399,600],"00048":[960,600],"00049":[960,600],"00050":[900,600],
  "00051":[917,600],"00052":[400,600],"00053":[900,600],"00054":[266,600],"00055":[399,600],
  "00056":[399,600],"00057":[399,600],"00058":[363,600],"00059":[420,600],"00060":[667,666],
  "00061":[465,698],"00062":[720,480],"00063":[950,594],"00064":[950,594]
};

// Create a list of numbers 1 through 64, then shuffle them randomly.
// This makes the photos appear in a different order every time the page loads.
const imageNumbers = Array.from({ length: TOTAL_IMAGES }, (_, index) => index + 1);

for (let i = imageNumbers.length - 1; i > 0; i--) {
  const randomIndex = Math.floor(Math.random() * (i + 1));
  [imageNumbers[i], imageNumbers[randomIndex]] = [imageNumbers[randomIndex], imageNumbers[i]];
}

// Build two sets of paths for each photo:
//   - thumbPath: a small 400px-wide AVIF for the gallery grid
//   - fullPath:  the original WEBP, loaded only when the lightbox opens
const thumbPaths = imageNumbers.map((number) => {
  const paddedNumber = String(number).padStart(5, '0');
  return `${siteOrigin}/thumbs/photo${paddedNumber}.avif`;
});

const fullPaths = imageNumbers.map((number) => {
  const paddedNumber = String(number).padStart(5, '0');
  return `${siteOrigin}/photos/photo${paddedNumber}.webp`;
});

// Create each gallery card and insert it into the page.
//
// loading="lazy" tells the browser to skip downloading images
// that are below the fold until the user scrolls near them.
// This makes the initial page load faster by prioritising the
// photos the visitor can actually see.
const galleryContainer = document.getElementById('gallery');

thumbPaths.forEach((path, index) => {
  const card = document.createElement('div');
  card.className = 'gallery-item';

  const image = document.createElement('img');
  image.src = path;
  image.dataset.full = fullPaths[index];
  if (index >= 6) image.loading = 'lazy';

  // Set aspect-ratio so the browser reserves the correct vertical
  // space before the image loads — no jarring layout shift.
  const paddedNumber = imageNumbers[index].toString().padStart(5, '0');
  const [width, height] = IMAGE_DIMENSIONS[paddedNumber];
  image.style.aspectRatio = `${width} / ${height}`;

  image.addEventListener('load', () => {
    image.style.opacity = '1';
  });

  const overlay = document.createElement('div');
  overlay.className = 'overlay';

  card.appendChild(image);
  card.appendChild(overlay);
  galleryContainer.appendChild(card);
});


// ============================================================
// 4. LIGHTBOX — OPEN / CLOSE / NAVIGATE
// ============================================================
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-img');
const allGalleryImages = [...document.querySelectorAll('.gallery img')];

let currentImageIndex = 0;

function openLightbox() {
  lightbox.style.display = 'flex';
  const currentImage = allGalleryImages[currentImageIndex];
  lightboxImage.src = currentImage.dataset.full;
}

function closeLightbox() {
  lightbox.style.display = 'none';
}

function showPreviousImage() {
  const total = allGalleryImages.length;
  currentImageIndex = (currentImageIndex - 1 + total) % total;
  openLightbox();
}

function showNextImage() {
  const total = allGalleryImages.length;
  currentImageIndex = (currentImageIndex + 1) % total;
  openLightbox();
}

// Clicking a gallery image opens the lightbox at that image.
allGalleryImages.forEach((image, index) => {
  image.addEventListener('click', () => {
    currentImageIndex = index;
    openLightbox();
  });
});

// Clicking the dark background (but not the image or buttons) closes the lightbox.
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

// Close button, previous button, and next button.
document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', showPreviousImage);
document.getElementById('lb-next').addEventListener('click', showNextImage);


// ============================================================
// 5. KEYBOARD SUPPORT
// ============================================================
document.addEventListener('keydown', (event) => {
  if (lightbox.style.display !== 'flex') return;

  if (event.key === 'Escape') {
    closeLightbox();
  }

  if (event.key === 'ArrowLeft') {
    showPreviousImage();
  }

  if (event.key === 'ArrowRight') {
    showNextImage();
  }
});


// ============================================================
// 6. TOUCH SWIPE SUPPORT (for phones and tablets)
// ============================================================
let touchStartX = 0;
const SWIPE_THRESHOLD = 50; // minimum pixels to count as a swipe

lightbox.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
});

lightbox.addEventListener('touchend', (event) => {
  const touchEndX = event.changedTouches[0].clientX;
  const swipeDistance = touchEndX - touchStartX;

  if (swipeDistance > SWIPE_THRESHOLD) {
    // Swiped right → go to the previous image
    showPreviousImage();
  }

  if (swipeDistance < -SWIPE_THRESHOLD) {
    // Swiped left → go to the next image
    showNextImage();
  }
});


// ============================================================
// 7. CONTACT FORM (hidden until the HTML comment is removed)
// ============================================================
const bookButton = document.getElementById('btn');

if (bookButton) {
  bookButton.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const messageElement = document.getElementById('msg');

    if (!name) {
      messageElement.textContent = 'Enter your name';
      return;
    }

    if (!email.includes('@')) {
      messageElement.textContent = 'Enter a valid email';
      return;
    }

    messageElement.textContent = 'Sending...';

    fetch('https://api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
      .then(() => {
        messageElement.textContent = 'Thanks! I will contact you soon.';
      })
      .catch(() => {
        messageElement.textContent = 'Error submitting.';
      });
  });
}
