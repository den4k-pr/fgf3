document.addEventListener('DOMContentLoaded', () => {

    const AUTOPLAY_THRESHOLD = 0.5;
    const LAZY_THRESHOLD = 0.01;

    // ==============================================================
    // 1. ЛЕЗИВНЕ ЗАВАНТАЖЕННЯ (Збережено оригінальну логіку)
    // ==============================================================
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const video = entry.target;
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                video.preload = 'metadata';
                video.load();
            }
            lazyObserver.unobserve(video);
        });
    }, { threshold: LAZY_THRESHOLD, rootMargin: '200px 0px' });

    // Реєструємо всі відео для ленивого завантаження
    document.querySelectorAll('.video-player').forEach(v => lazyObserver.observe(v));

    // ==============================================================
    // 2. КАСТОМНИЙ ПЛЕЄР ДЛЯ СІТКИ (Адаптовано під .video-card-item)
    // ==============================================================
    document.querySelectorAll('.video-card-item').forEach(card => {
        const video = card.querySelector('video');
        const wrapper = card.querySelector('.video-wrapper-big, .video-wrapper-small');
        if (!video || !wrapper) return;

        // Прибираємо нативні controls назавжди
        video.controls = false;
        video.removeAttribute('controls');

        // Створюємо overlay-кнопку (Стилізація за дизайном)
        const overlay = document.createElement('div');
        overlay.className = 'video-overlay';
        overlay.innerHTML = `
            <div class="video-play-btn" aria-label="Play">
                <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.9)" stroke-width="2.5"/>
                    <polygon class="icon-play" points="34,24 58,40 34,56" fill="white"/>
                    <g class="icon-pause" style="display:none">
                        <rect x="26" y="24" width="9" height="32" rx="2" fill="white"/>
                        <rect x="45" y="24" width="9" height="32" rx="2" fill="white"/>
                    </g>
                </svg>
            </div>
        `;

        // Вставляємо всередину контейнера відео
        wrapper.style.position = 'relative';
        wrapper.appendChild(overlay);

        const btn = overlay.querySelector('.video-play-btn');
        const iconPlay = overlay.querySelector('.icon-play');
        const iconPause = overlay.querySelector('.icon-pause');

        let isHandling = false;

        const setIcon = (playing) => {
            iconPlay.style.display = playing ? 'none' : '';
            iconPause.style.display = playing ? '' : 'none';
        };

        const stopAllOthers = () => {
            document.querySelectorAll('.video-card-item video').forEach(v => {
                if (v !== video && !v.paused) {
                    v.pause();
                    const otherOverlay = v.closest('.video-card-item')?.querySelector('.video-overlay');
                    if (otherOverlay) {
                        otherOverlay.querySelector('.icon-play').style.display = '';
                        otherOverlay.querySelector('.icon-pause').style.display = 'none';
                    }
                }
            });
        };

        const togglePlay = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            if (isHandling) return;
            isHandling = true;
            setTimeout(() => { isHandling = false; }, 300);

            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                video.load();
            }

            video.muted = false;

            if (video.paused) {
                stopAllOthers();
                const tryPlay = () => {
                    video.play()
                        .then(() => setIcon(true))
                        .catch(err => {
                            console.error('Помилка відтворення:', err);
                            isHandling = false;
                        });
                };
                video.readyState >= 2 ? tryPlay() : video.addEventListener('canplay', tryPlay, { once: true });
            } else {
                video.pause();
                setIcon(false);
            }
        };

        overlay.addEventListener('click', togglePlay, true);
        overlay.addEventListener('touchstart', () => {
            if (overlay.classList.contains('is-playing')) {
                overlay.classList.add('touched');
                setTimeout(() => overlay.classList.remove('touched'), 800);
            }
        }, { passive: true });

        video.addEventListener('play', () => {
            setIcon(true);
            overlay.classList.add('is-playing');
        });
        video.addEventListener('pause', () => {
            setIcon(false);
            overlay.classList.remove('is-playing');
        });
        video.addEventListener('ended', () => {
            setIcon(false);
            overlay.classList.remove('is-playing');
        });
    });
});