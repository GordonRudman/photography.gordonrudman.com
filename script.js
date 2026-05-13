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
  "00001":[1024,683],"00002":[720,450],"00003":[720,450],"00004":[544,720],"00005":[720,450],
  "00006":[400,600],"00007":[465,698],"00008":[667,1000],"00009":[1745,1034],"00010":[1619,969],
  "00011":[1468,724],"00012":[1920,1018],"00013":[1920,1280],"00014":[1920,1280],"00015":[970,1593],
  "00016":[1857,1280],"00017":[1680,1050],"00018":[1680,1050],"00019":[1680,1050],"00020":[1024,1536],
  "00021":[1680,1050],"00022":[1680,1050],"00023":[1680,1050],"00024":[1680,1050],"00025":[1680,1050],
  "00026":[1680,1050],"00027":[1680,1050],"00028":[1680,1050],"00029":[1680,1050],"00030":[1680,1050],
  "00031":[800,497],"00032":[465,698],"00033":[825,550],"00034":[950,633],"00035":[950,633],
  "00036":[1206,1685],"00037":[950,633],"00038":[977,550],"00039":[465,698],"00040":[950,535],
  "00041":[465,698],"00042":[950,534],"00043":[465,697],"00044":[950,534],"00045":[1348,550],
  "00046":[465,533],"00047":[465,698],"00048":[1680,1050],"00049":[1680,1050],"00050":[800,533],
  "00051":[5393,3528],"00052":[1024,1536],"00053":[800,533],"00054":[318,716],"00055":[533,800],
  "00056":[533,800],"00057":[533,800],"00058":[439,724],"00059":[533,761],"00060":[667,666],
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
  const paddedNumber = String(number).padStart(3, '0');
  return `${siteOrigin}/thumbnails/${paddedNumber}.avif`;
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
