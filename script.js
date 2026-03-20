// Инициализация Telegram
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран

const words = ["яблоко", "солнце", "телефон", "машина", "космос", "кнопка", "запуск", "экран", "поток", "время"];
let currentWord = "";
let score = 0;
let timeLeft = 60;
let timerId = null;

// Элементы
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const inputField = document.getElementById('input-field');
const wordDisplay = document.getElementById('word-to-type');
const timerDisplay = document.getElementById('timer');

// Начать игру
function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    score = 0;
    timeLeft = 60;
    updateTimerDisplay();
    nextWord();

    // Ждём 300 мс (время анимации развертывания TMA) и принудительно ставим фокус
    setTimeout(() => {
        inputField.focus(); // Кликаем по полю ввода программно
        inputField.click(); // На всякий случай еще и клик
    }, 300);

    // Таймер
    timerId = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    currentWord = words[randomIndex];
    wordDisplay.innerText = currentWord;
    inputField.value = "";
}

function updateTimerDisplay() {
    let seconds = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
    timerDisplay.innerText = `00:${seconds}`;
}

function endGame() {
    clearInterval(timerId);
    // Показываем результат через встроенное окно Telegram
    tg.showAlert(`Игра окончена!\nТвой результат: ${score} слов.`);
    
    // Возвращаемся на главный экран
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Проверка ввода в реальном времени
inputField.addEventListener('input', () => {
    if (inputField.value.toLowerCase().trim() === currentWord) {
        score++;
        nextWord();
    }
});

// Слушатель кнопки
startBtn.addEventListener('click', startGame);

// Сообщаем Telegram, что приложение готово
tg.ready();;
