// script.js
// ... (предыдущий код без изменений до раздела слушателей) ...

// Добавляем новый элемент
const retryIconBtn = document.getElementById('retry-icon-btn');

// В endGame теперь не нужно менять текст кнопки, просто показываем экран
function endGame() {
    clearInterval(timerId);
    hiddenInput.blur();

    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

    finalScoreDisplay.innerText = score;
    finalErrorsDisplay.innerText = errorsCount;

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// Слушатели
startBtn.addEventListener('click', startGame);
// Иконка в квадрате теперь запускает игру заново
retryIconBtn.addEventListener('click', () => {
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    startGame();
});

shareBtn.addEventListener('click', () => {
    const text = `Я набрал ${score} слов и сделал всего ${errorsCount} ошибок в Speed Typing!`;
    tg.shareUrl('https://t.me/your_bot_link', text); // Замените ссылку
});

gameScreen.addEventListener('click', () => hiddenInput.focus());
tg.ready();
