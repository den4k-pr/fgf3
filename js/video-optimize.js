document.addEventListener('DOMContentLoaded', () => {

    const LAZY_THRESHOLD = 0.01;

    // ==============================================================
    // 1. ЛЕЗИВНЕ ЗАВАНТАЖЕННЯ (Оптимізоване)
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

    document.querySelectorAll('.video-player').forEach(v => lazyObserver.observe(v));

    // ==============================================================
    // 2. КАСТОМНИЙ ПЛЕЄР (З урахуванням мобільних обмежень)
    // ==============================================================
    document.querySelectorAll('.video-card-item').forEach(card => {
        const video = card.querySelector('video');
        const wrapper = card.querySelector('.video-wrapper-big, .video-wrapper-small');
        if (!video || !wrapper) return;

        video.controls = false;
        video.removeAttribute('controls');

        // Перевіряємо, чи оверлей ВЖЕ Є в HTML (щоб не створювати дублікат)
        let overlay = wrapper.querySelector('.video-overlay');
        
        if (!overlay) {
            // Створюємо тільки якщо його немає в розмітці
            overlay = document.createElement('div');
            overlay.className = 'video-overlay';
            overlay.innerHTML = `
                <div class="video-play-btn" aria-label="Play">
                    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.9)" stroke-width="2.5"/>
                        <polygon class="icon-play" points="34,24 58,40 34,56" fill="white"/>
                        <g class="icon-pause" style="display:none"> <rect x="26" y="24" width="9" height="32" rx="2" fill="white"/>
                            <rect x="45" y="24" width="9" height="32" rx="2" fill="white"/>
                        </g>
                    </svg>
                </div>
            `;
            wrapper.style.position = 'relative';
            wrapper.appendChild(overlay);
        }

        const iconPlay = overlay.querySelector('.icon-play');
        const iconPause = overlay.querySelector('.icon-pause');

        let isHandling = false;

        const setIcon = (playing) => {
            if(iconPlay) iconPlay.style.display = playing ? 'none' : '';
            if(iconPause) iconPause.style.display = playing ? '' : 'none';
        };

        const stopAllOthers = () => {
            document.querySelectorAll('.video-card-item video').forEach(v => {
                if (v !== video && !v.paused) {
                    v.pause();
                    const otherOverlay = v.closest('.video-card-item')?.querySelector('.video-overlay');
                    if (otherOverlay) {
                        const pIcon = otherOverlay.querySelector('.icon-play');
                        const paIcon = otherOverlay.querySelector('.icon-pause');
                        // ВИПРАВЛЕНО: видалено дублювання .style.style
                        if(pIcon) pIcon.style.display = ''; 
                        if(paIcon) paIcon.style.display = 'none'; 
                    }
                }
            });
        };

        const togglePlay = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (isHandling) return;
            isHandling = true;
            setTimeout(() => { isHandling = false; }, 250);

            // Якщо src ще не підставився через LazyLoad — підставляємо негайно СИНХРОННО
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                // ВИПРАВЛЕНО: прибрано виклик video.load(), щоб мобільні браузери не скидали потік перед стартом
            }

            // Звук вмикаємо СИНХРОННО перед викликом play
            video.muted = false;

            if (video.paused) {
                stopAllOthers();
                
                // КЛЮЧОВЕ ВИПРАВЛЕННЯ: Викликаємо .play() прямо тут, без canplay лісенерів
                video.play()
                    .then(() => {
                        setIcon(true);
                    })
                    .catch(err => {
                        console.log('Спроба запуску зі звуком заблокована браузером, вмикаємо без звуку:', err);
                        // ФОЛБЕК для iOS (на випадок режиму енергозбереження):
                        // Якщо браузер заборонив звук, запускаємо відео muted (це дозволено завжди)
                        video.muted = true;
                        video.play()
                            .then(() => setIcon(true))
                            .catch(e => console.error('Повна блокування медіа:', e));
                    });
            } else {
                video.pause();
                setIcon(false);
            }
        };

        // Використовуємо pointerdown або click, але без конфліктів тачу
        overlay.addEventListener('click', togglePlay);

        // Синхронізація станів через нативні події тегу video
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