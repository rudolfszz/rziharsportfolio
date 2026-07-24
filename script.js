document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LIGHTBOX SETUP
    // ==========================================
    // We set up the lightbox container first so it's ready to go
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

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

    // ==========================================
    // 2. DYNAMIC GALLERY GENERATION
    // ==========================================
    const gallery = document.getElementById("dynamic-gallery");

    // Only run the loop if we are on the page with the gallery
    if (gallery) {
        // You can safely set this to a high number (like 30 or 50). 
        // Missing numbers will just be skipped automatically!
        const totalImages = 13;

        for (let i = 1; i <= totalImages; i++) {
            const imageNumber = i < 10 ? `0${i}` : i;
            const imagePath = `BEST/portfolio-${imageNumber}.avif`;

            const div = document.createElement("div");
            div.className = "gallery-item";

            const img = document.createElement("img");
            img.src = imagePath;
            img.alt = "Photography";
            img.loading = "lazy";

            // THE FIX: If the file is not found (404 error), remove the div entirely
            img.onerror = () => {
                div.remove();
            };

            // Hook up the lightbox click event exactly as the image is created
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });

            div.appendChild(img);
            gallery.appendChild(div);
        }
    }
});