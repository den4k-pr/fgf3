
document.addEventListener("DOMContentLoaded", () => {
  // 1. Змінено селектор під твій новий головний контейнер
  const statsBanner = document.querySelector(".stats-section-container");
  if (!statsBanner) return;

  const animateNumbers = (element) => {
    const targetText = element.textContent.trim();
    
    // Шукаємо тільки цифри та роздільники
    const numericMatch = targetText.match(/[\d.,]+/);
    if (!numericMatch) return;

    const numericString = numericMatch[0];
    
    // Розумна перевірка: якщо є 'M', то крапка — це децимал (2.2), інакше — роздільник тисяч (55.000)
    const isMillion = targetText.includes('M');
    
    // Отримуємо чисте число для математичного підрахунку
    const targetValue = isMillion 
      ? parseFloat(numericString) 
      : parseFloat(numericString.replace(/\./g, '').replace(/,/g, '.'));
    
    // Отримуємо все, що йде ДО та ПІСЛЯ числа ("M" або "+")
    const prefix = targetText.split(numericString)[0] || "";
    const suffix = targetText.split(numericString)[1] || "";

    const duration = 2000; // 2 секунди
    const startTime = performance.now();

    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Плавне сповільнення (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentValue = easeProgress * targetValue;

      // Форматування числа назад під час анімації
      let formattedValue;
      if (isMillion) {
        // Для мільйонів залишаємо один знак після крапки (наприклад, 1.5 -> 2.2)
        formattedValue = currentValue.toFixed(1);
      } else if (numericString.includes('.')) {
        // Для 55.000 повертаємо крапку як роздільник тисячних
        formattedValue = Math.floor(currentValue).toString().replace(/\B(?=(\d{3})+(?!\n))/g, ".");
      } else {
        // Для звичайних цілих чисел (як 12+)
        formattedValue = Math.floor(currentValue).toString();
      }

      // Виводимо проміжний результат
      element.textContent = `${prefix}${formattedValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        // Фінальний запуск — повертаємо оригінальний рядок
        element.textContent = targetText;
      }
    };

    requestAnimationFrame(updateNumber);
  };

  // Налаштування Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 2. Змінено селектор на твої нові класи .stats-number
        const numbers = entry.target.querySelectorAll(".stats-number");
        numbers.forEach(num => animateNumbers(num));
        
        // Вимикаємо спостереження, щоб анімація не повторювалася при кожному скролі
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observer.observe(statsBanner);
});
