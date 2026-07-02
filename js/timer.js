document.addEventListener('DOMContentLoaded', () => {
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    // Змінено: тепер константа дорівнює 30 хвилинам у мілісекундах
    const TIMER_DURATION_MS = 30 * 60 * 1000; 

    function getEndTime() {
        let endTime = localStorage.getItem('eternal_countdown_end23');
        const now = Date.now();

        // Якщо запису немає або час минув, створюємо нову позначку на +30 хвилин
        if (!endTime || parseInt(endTime, 10) <= now) {
            endTime = now + TIMER_DURATION_MS;
            localStorage.setItem('eternal_countdown_end', endTime);
        }
        return parseInt(endTime, 10);
    }

    let targetEndTime = getEndTime();

    function updateTimer() {
        const now = Date.now();
        let diff = targetEndTime - now;

        // Перевірка на випадок завершення таймера в реальному часі
        if (diff <= 0) {
            targetEndTime = now + TIMER_DURATION_MS;
            localStorage.setItem('eternal_countdown_end', targetEndTime);
            diff = TIMER_DURATION_MS;
        }

        // Розрахунок годин, хвилин та секунд
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Виведення результату з додаванням нулів попереду (01, 02 тощо)
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0'); // додано перевірку на випадок, якщо ви приберете години з HTML
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    // Миттєвий запуск та встановлення інтервалу оновлення кожну секунду
    updateTimer();
    setInterval(updateTimer, 1000);
});