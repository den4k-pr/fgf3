document.addEventListener("DOMContentLoaded", () => {
    const galleryEl = document.querySelector(".gallery-swiper");
    if (!galleryEl) return;

    new Swiper(galleryEl, {
        loop: true,
        spaceBetween: 20,
        
        // Змінено на 'auto' для підтримки різної ширини слайдів
        slidesPerView: 'auto', 
        
        autoHeight: false, // Рекомендується вимкнути, якщо висота слайдів фіксована CSS-ом
        centeredSlides: false,
        
        // Кнопки навігації видалено згідно з ТЗ
        
        pagination: {
            el: ".gallery-slider-pagination",
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
        },

        navigation: {
            nextEl: ".s8__arrow-next",
            prevEl: ".s8__arrow-prev"
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const sliderEl = document.querySelector(".second-swiper");
    if (!sliderEl) return;

    new Swiper(sliderEl, {
        loop: false,
        spaceBetween: 14,
        slidesPerView: 'auto',

        pagination: {
            el: ".second-slider-pagination",
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active',
        },

        navigation: {
            nextEl: ".s7__arrow-next",
            prevEl: ".s7__arrow-prev"
        }
    });
});
