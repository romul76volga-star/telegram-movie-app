// script.js
const tg = window.Telegram.WebApp;
tg.expand();

// Списки слов
const simpleWords = ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"];
const hardPhrases = ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай", "старый друг", "тихий звук"];

// Глобальные переменные
let currentWord = "";
let score = 0;
let errorsCount = 0; 
let timeLeft = 60;
let timerId = null;
let charIndex = 0;

// Элементы
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-btn');
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const wordContainer = document.getElementById('word-input-container');
const hiddenInput = document.getElementById('hidden-input');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('final-score');
const finalErrorsDisplay = document.getElementById('final-errors');

// --- ЛОГИКА ИГРЫ ---

function startGame() {
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Сброс данных
    score = 0;
    errorsCount = 0;
    timeLeft = 60;
    timerDisplay.style.color = "white";
    updateTimer();
    
    nextWord();
    
    // Вызов клавиатуры
    hiddenInput.value = '';
    hiddenInput.focus();
    
    if (timerId) clearInterval(timerId);
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
    // Выбор сложности в зависимости от времени
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
        span.classList.add('char');
        // Первая буква сразу подсвечивается белым
        if (i === 0) span.classList.add('current');
        wordContainer.appendChild(span);
    });
    hiddenInput.value = '';
}

// --- ОБРАБОТКА ВВОДА ---

hiddenInput.addEventListener('input', () => {
    const spans = wordContainer.querySelectorAll('.char');
    const typedValue = hiddenInput.value;
    
    if (!typedValue) return;
    
    // Берем последний введенный символ
    const lastChar = typedValue[typedValue.length - 1].toLowerCase();
    const targetChar = currentWord[charIndex].toLowerCase();

    if (lastChar === targetChar) {
        // Успех: красим в зеленый, убираем курсор
        spans[charIndex].classList.remove('current', 'wrong');
        spans[charIndex].classList.add('correct');
        charIndex++;
        
        if (charIndex === currentWord.length) {
            score++;
            // Короткая пауза для визуального подтверждения и новое слово
            setTimeout(nextWord, 50);
        } else {
            // Подсвечиваем следующую букву белым (current)
            spans[charIndex].classList.add('current');
        }
    } else {
        // Ошибка: красим в красный и трясем
        spans[charIndex].classList.add('wrong');
        errorsCount++;
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }
    
    // Важно: очищаем инпут после каждого символа, чтобы не копился текст
    hiddenInput.value = '';
});

function updateTimer() {
    const s = timeLeft < 10 ? '0' + timeLeft : timeLeft;
    timerDisplay.innerText = `00:${s}`;
}

// --- ФИНАЛ ---

function endGame() {
    clearInterval(timerId);
    
    // ПРИНУДИТЕЛЬНО УБИРАЕМ КЛАВИАТУРУ
    hiddenInput.blur();
    document.activeElement.blur(); 

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    // Заполняем итоги
    finalScoreDisplay.innerText = score;
    finalErrorsDisplay.innerText = errorsCount;

    // Переключаем экраны
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// --- СЛУШАТЕЛИ ---

startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

shareBtn.addEventListener('click', () => {
    const shareText = `Мой результат в Speed Typing: ${score} слов и ${errorsCount} ошибок! Попробуй обойти меня!`;
    if (tg.shareUrl) {
        tg.shareUrl('https://t.me/romul76volga_bot/game', shareText);
    } else {
        tg.showAlert(shareText);
    }
});

// Если игрок случайно кликнул мимо во время игры — возвращаем фокус (клавиатуру)
gameScreen.addEventListener('click', () => {
    if (!gameScreen.classList.contains('hidden')) {
        hiddenInput.focus();
    }
});

tg.ready();
