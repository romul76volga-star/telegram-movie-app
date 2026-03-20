const tg = window.Telegram.WebApp;
tg.expand();

const simpleWords = ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"];
const hardPhrases = ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай", "старый друг", "тихий звук"];

let currentWord = "";
let score = 0;
let timeLeft = 60;
let timerId = null;
let charIndex = 0;

const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const wordContainer = document.getElementById('word-input-container');
const hiddenInput = document.getElementById('hidden-input');
const timerDisplay = document.getElementById('timer');

function startGame() {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Сброс состояния
    score = 0;
    timeLeft = 60;
    timerDisplay.style.color = "white"; // Исправлен баг с цветом
    
    nextWord();
    hiddenInput.focus();
    
    timerId = setInterval(() => {
        timeLeft--;
        updateTimer();
        
        if (timeLeft <= 10) {
            timerDisplay.style.color = "#ff3b30";
        }
        
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    charIndex = 0;
    // Последние 30 секунд - словосочетания
    currentWord = (timeLeft > 30) 
        ? simpleWords[Math.floor(Math.random() * simpleWords.length)]
        : hardPhrases[Math.floor(Math.random() * hardPhrases.length)];
    renderWord();
}

function renderWord() {
    wordContainer.innerHTML = '';
    [...currentWord].forEach((char, i) => {
        const span = document.createElement('span');
        // Обработка пробела для корректного отображения
        span.innerText = char === " " ? "\u00A0" : char; 
        span.classList.add('char');
        if (i === 0) span.classList.add('current');
        wordContainer.appendChild(span);
    });
    hiddenInput.value = '';
}

hiddenInput.addEventListener('input', () => {
    const spans = wordContainer.querySelectorAll('.char');
    const typed = hiddenInput.value;
    if (!typed) return;
    
    const lastChar = typed[typed.length - 1].toLowerCase();
    const targetChar = currentWord[charIndex].toLowerCase();

    if (lastChar === targetChar) {
        // Правильная буква
        spans[charIndex].classList.remove('current', 'wrong');
        spans[charIndex].classList.add('correct');
        charIndex++;
        
        if (charIndex === currentWord.length) {
            score++;
            setTimeout(nextWord, 50);
        } else {
            spans[charIndex].classList.add('current');
        }
    } else {
        // Ошибка
        spans[charIndex].classList.add('wrong');
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }
    hiddenInput.value = ''; // Всегда чистим для следующего символа
});

function updateTimer() {
    const s = timeLeft < 10 ? '0' + timeLeft : timeLeft;
    timerDisplay.innerText = `00:${s}`;
}

function endGame() {
    clearInterval(timerId);
    tg.showAlert(`Игра окончена!\nВаш результат: ${score} очков.`);
    gameScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

startBtn.addEventListener('click', startGame);
// Фокус при клике в любое место игрового экрана
gameScreen.addEventListener('click', () => hiddenInput.focus());

tg.ready();
