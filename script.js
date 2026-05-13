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

// Create a list of numbers 1 through 64, then shuffle them randomly.
// This makes the photos appear in a different order every time the page loads.
const imageNumbers = Array.from({ length: TOTAL_IMAGES }, (_, index) => index + 1);

for (let i = imageNumbers.length - 1; i > 0; i--) {
  const randomIndex = Math.floor(Math.random() * (i + 1));
  [imageNumbers[i], imageNumbers[randomIndex]] = [imageNumbers[randomIndex], imageNumbers[i]];
}

// Convert the shuffled numbers into full image file paths.
const imagePaths = imageNumbers.map((number) => {
  const paddedNumber = String(number).padStart(5, '0');
  return `${siteOrigin}/photos/photo${paddedNumber}.webp`;
});

// Create each gallery card and insert it into the page.
const galleryContainer = document.getElementById('gallery');

imagePaths.forEach((path) => {
  const card = document.createElement('div');
  card.className = 'gallery-item';

  const image = document.createElement('img');
  image.src = path;
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
  lightboxImage.src = allGalleryImages[currentImageIndex].src;
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
