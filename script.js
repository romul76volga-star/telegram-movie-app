const tg = window.Telegram.WebApp;
tg.expand();

const simpleWords = ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"];
const hardPhrases = ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай"];

let currentWord = "", score = 0, errorsCount = 0, timeLeft = 60, timerId = null, charIndex = 0;

const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const wordContainer = document.getElementById('word-input-container');
const hiddenInput = document.getElementById('hidden-input');
const timerDisplay = document.getElementById('timer');

function startGame() {
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    score = 0; errorsCount = 0; timeLeft = 60;
    timerDisplay.style.color = "white";
    
    nextWord();
    hiddenInput.focus();
    
    if (timerId) clearInterval(timerId);
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
        span.innerText = char === " " ? "\u00A0" : char;
        span.className = 'char' + (i === 0 ? ' current' : '');
        wordContainer.appendChild(span);
    });
    hiddenInput.value = '';
}

hiddenInput.addEventListener('input', () => {
    const typed = hiddenInput.value;
    if (!typed) return;
    
    const char = typed[typed.length - 1].toLowerCase();
    const target = currentWord[charIndex].toLowerCase();
    const spans = wordContainer.querySelectorAll('.char');

    if (char === target) {
        spans[charIndex].className = 'char correct';
        charIndex++;
        if (charIndex === currentWord.length) {
            score++;
            setTimeout(nextWord, 50);
        } else {
            spans[charIndex].classList.add('current');
        }
    } else {
        spans[charIndex].classList.add('wrong');
        errorsCount++;
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    hiddenInput.value = '';
});

function updateTimer() {
    const s = timeLeft < 10 ? '0' + timeLeft : timeLeft;
    timerDisplay.innerText = `00:${s}`;
}

function endGame() {
    clearInterval(timerId);
    hiddenInput.blur(); // Убираем клавиатуру
    
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errorsCount;
    
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
}

startBtn.onclick = startGame;
retryBtn.onclick = startGame;
gameScreen.onclick = () => hiddenInput.focus();

shareBtn.onclick = () => {
    const text = `Я набрал ${score} слов! Попробуй и ты!`;
    if (tg.shareUrl) tg.shareUrl('https://t.me/romul76volga_bot/game', text);
    else tg.showAlert(text);
};

tg.ready();
