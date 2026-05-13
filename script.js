// ============================================================
// 1. PREVENT DOWNLOAD
// ============================================================
document.addEventListener('contextmenu', (event) => event.preventDefault());
document.addEventListener('dragstart', (event) => event.preventDefault());


// ============================================================
// 2. BUILD THE IMAGE GALLERY
// ============================================================
const TOTAL_IMAGES = 64;
const siteOrigin = window.location.origin;

// Known dimensions of each original photo (width × height).
// Setting width + height on <img> lets the browser reserve the
// correct space before the image loads, preventing layout shift.
const IMAGE_DIMENSIONS = {
  "001":[400,266],"002":[400,250],"003":[400,250],"004":[302,400],"005":[400,250],
  "006":[266,400],"007":[266,400],"008":[267,400],"009":[400,237],"010":[400,239],
  "011":[400,197],"012":[400,212],"013":[400,266],"014":[400,266],"015":[243,400],
  "016":[400,275],"017":[400,250],"018":[400,250],"019":[400,250],"020":[266,400],
  "021":[400,250],"022":[400,250],"023":[400,250],"024":[400,250],"025":[400,250],
  "026":[400,250],"027":[400,250],"028":[400,250],"029":[400,250],"030":[400,250],
  "031":[400,248],"032":[266,400],"033":[400,266],"034":[400,266],"035":[400,266],
  "036":[286,400],"037":[400,266],"038":[400,225],"039":[266,400],"040":[400,225],
  "041":[266,400],"042":[400,225],"043":[267,400],"044":[400,225],"045":[400,163],
  "046":[349,400],"047":[266,400],"048":[400,250],"049":[400,250],"050":[400,266],
  "051":[400,261],"052":[266,400],"053":[400,266],"054":[177,400],"055":[266,400],
  "056":[266,400],"057":[266,400],"058":[242,400],"059":[280,400],"060":[400,399],
  "061":[266,400],"062":[400,266],"063":[400,250],"064":[400,250]
};

// Create a list of numbers 1 through 64, then shuffle them randomly.
// This makes the photos appear in a different order every time the page loads.
const imageNumbers = Array.from({ length: TOTAL_IMAGES }, (_, index) => index + 1);

for (let i = imageNumbers.length - 1; i > 0; i--) {
  const randomIndex = Math.floor(Math.random() * (i + 1));
  [imageNumbers[i], imageNumbers[randomIndex]] = [imageNumbers[randomIndex], imageNumbers[i]];
}

const pad3 = (n) => String(n).padStart(3, '0');

// Build two sets of paths for each photo:
//   - thumbPath: a small 400px-wide AVIF for the gallery grid
//   - fullPath:  the original WEBP, loaded only when the lightbox opens
const thumbPaths = imageNumbers.map((number) => {
  return `${siteOrigin}/thumbnails/${pad3(number)}.avif`;
});

const fullPaths = imageNumbers.map((number) => {
  return `${siteOrigin}/photos/avif/${pad3(number)}.avif`;
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
  if (index >= 10) image.loading = 'lazy';

  const [width, height] = IMAGE_DIMENSIONS[pad3(imageNumbers[index])];
  image.style.aspectRatio = `${width} / ${height}`;

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
