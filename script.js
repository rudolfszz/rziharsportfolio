document.addEventListener('DOMContentLoaded', () => {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    // Get all gallery images
    const images = document.querySelectorAll('.gallery-item img');

    images.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        });
    });

    // Close lightbox when clicking anywhere on it
    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close lightbox on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
