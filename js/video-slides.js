// video-slides.js

(function () {
  console.log('[VideoSlides] Global script loaded');

  var VIDEO_MAP = {
    'slide1.webp':  'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/1.MP4',
    'slide3.webp':  'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/3.MP4',
    'slide4.webp':  'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/4.MP4',
    'slide8.webp':  'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/8.MP4',
    'slide13.webp': 'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/13.MP4',
    'slide16.webp': 'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/16.MP4',
    'slide17.webp': 'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/17.MP4',
    'slide18.webp': 'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/19.MP4',
    'slide20.webp': 'https://itden-cdn.b-cdn.net/3-in-1_new/slider-3/20.MP4'
  };

  // Функція точного визначення посилання на відео
  function getVideoUrl(slide, img) {
    if (slide) {
      var directUrl = slide.getAttribute('data-video');
      if (directUrl) return directUrl;
    }
    if (!img) return null;
    var src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    var filename = src.split('/').pop().split('?')[0];
    return VIDEO_MAP[filename] || null;
  }

  // Функція видалення всіх плеєрів та повернення картинок
  function killAllVideos() {
    var videos = document.querySelectorAll('.s9__slide video');
    if (videos.length > 0) {
      console.log('[VideoSlides] Killing active videos:', videos.length);
    }
    videos.forEach(function (v) {
      v.pause();
      v.src = '';
      v.load();
      var parentSlide = v.closest('.s9__slide');
      if (parentSlide) {
        var parentImg = parentSlide.querySelector('.s9__img');
        if (parentImg) parentImg.style.cssText = '';
      }
      v.remove();
    });
  }

  // Функція створення та інтеграції плеєра в слайд
  function openVideo(slide, url) {
    console.log('[VideoSlides] Opening video:', url);
    killAllVideos();

    // Гарантуємо правильне позиціонування всередині слайда Swiper
    slide.style.setProperty('position', 'relative', 'important');
    slide.style.setProperty('overflow', 'hidden', 'important');

    var img = slide.querySelector('.s9__img');
    if (img) {
      img.style.cssText = 'visibility: hidden !important; opacity: 0 !important;';
    }

    var v = document.createElement('video');
    v.setAttribute('src', url);
    v.setAttribute('controls', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.setAttribute('autoplay', '');
    v.setAttribute('preload', 'auto');
    v.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100% !important;min-height:100%;object-fit:cover;z-index:99;background:#000;display:block;';

    // Автоматичне видалення плеєра після завершення перегляду відео
    v.addEventListener('ended', function () { 
      console.log('[VideoSlides] Video ended');
      killAllVideos(); 
    });

    slide.appendChild(v);

    // Спроба відтворення з обробкою політики автоплей-блокувань браузерів
    var p = v.play();
    if (p && typeof p.then === 'function') {
      p.then(function () {
        console.log('[VideoSlides] Play started successfully');
      }).catch(function (err) {
        console.warn('[VideoSlides] Play blocked, retrying muted...');
        v.muted = true;
        v.play().catch(function (e2) { 
          console.error('[VideoSlides] Critical play failure:', e2.message); 
        });
      });
    }
  }

  function initGlobalListeners() {
    console.log('[VideoSlides] Initializing global listeners on document...');

    // Глобальне перехоплення кліку (працює на стадії Capture, обходить заборони Swiper)
    document.addEventListener('click', function (e) {
      // Якщо клікнули на елементи керування самого відео — нічого не ламаємо
      if (e.target.tagName === 'VIDEO') return;

      // Шукаємо найближчий слайд від точки кліку
      var slide = e.target.closest('.s9__slide');
      if (!slide) return;

      var img = slide.querySelector('.s9__img');
      var url = getVideoUrl(slide, img);
      
      if (url) {
        // Зупиняємо стандартну поведінку Swiper для цього кліку
        e.preventDefault();
        e.stopPropagation();
        openVideo(slide, url);
      }
    }, true);

    // Закриваємо відео ТІЛЬКИ тоді, коли користувач почав свайпати/гортати слайдер
    document.addEventListener('touchmove', function (e) {
      if (e.target.tagName === 'VIDEO') return;
      if (e.target.closest('.s9__slide')) {
        killAllVideos();
      }
    }, { passive: true });
  }

  // Безпечний запуск скрипта в залежності від стану завантаження DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalListeners);
  } else {
    initGlobalListeners();
  }
})();