const tg = window.Telegram.WebApp;
tg.expand();

const simpleWords = ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"];
const hardPhrases = ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай", "старый друг", "тихий звук"];

let currentWord = "";
let score = 0;
let timeLeft = 60;
let timerId = null;
let charIndex = 0; // Какую букву сейчас печатаем

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const wordContainer = document.getElementById('word-input-container');
const hiddenInput = document.getElementById('hidden-input');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score-counter');

function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    score = 0;
    timeLeft = 60;
    updateScore();
    nextWord();

    hiddenInput.focus();
    
    timerId = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 10) timerDisplay.style.color = "#ff3b30";
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    charIndex = 0;
    currentWord = (timeLeft > 30) 
        ? simpleWords[Math.floor(Math.random() * simpleWords.length)]
        : hardPhrases[Math.floor(Math.random() * hardPhrases.length)];
    
    renderWord();
}

function renderWord() {
    wordContainer.innerHTML = '';
    [...currentWord].forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.classList.add('char');
        if (i === 0) span.classList.add('current');
        wordContainer.appendChild(span);
    });
    hiddenInput.value = '';
}

hiddenInput.addEventListener('input', () => {
    const spans = wordContainer.querySelectorAll('.char');
    const typed = hiddenInput.value;
    const lastChar = typed[typed.length - 1];

    if (!lastChar) return;

    if (lastChar.toLowerCase() === currentWord[charIndex].toLowerCase()) {
        // ПРАВИЛЬНО
        spans[charIndex].classList.remove('current', 'wrong');
        spans[charIndex].classList.add('correct');
        charIndex++;
        
        if (charIndex === currentWord.length) {
            score++;
            updateScore();
            setTimeout(nextWord, 100);
        } else {
            spans[charIndex].classList.add('current');
        }
    } else {
        // ОШИБКА
        spans[charIndex].classList.add('wrong');
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    
    // Всегда очищаем инпут, чтобы ловить только одно нажатие
    hiddenInput.value = '';
});

function updateTimer() {
    timerDisplay.innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
}

function updateScore() {
    scoreDisplay.innerText = `Очки: ${score}`;
}

function endGame() {
    clearInterval(timerId);
    tg.showAlert(`Финиш! Очки: ${score}`);
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
// Поддержка клика по экрану для фокуса клавиатуры
gameScreen.addEventListener('click', () => hiddenInput.focus());
