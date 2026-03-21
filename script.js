// Инициализация
const tg = window.Telegram.WebApp;
tg.expand();

// --- СЛОВАРЬ ЛОКАЛИЗАЦИИ (Новое!) ---
const locales = {
    ru: {
        startBtn: "начать",
        endTitle: "итог",
        labelWords: "слов",
        labelErrors: "ошибок",
        shareBtn: "поделиться",
        shareText: "Мой результат в Speed Typing: {score} слов и {errors} ошибок! Попробуй обойти меня!",
        simpleWords: ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"],
        hardPhrases: ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай"]
    },
    en: {
        startBtn: "start",
        endTitle: "result",
        labelWords: "words",
        labelErrors: "errors",
        shareBtn: "share",
        shareText: "My Speed Typing result: {score} words and {errors} errors! Can you beat me?",
        simpleWords: ["apple", "sun", "car", "space", "button", "screen", "time", "city", "pen", "cat"],
        hardPhrases: ["fast run", "blue sky", "bright light", "smart bot", "white snow", "fresh tea"]
    }
};

// Текущий язык (по умолчанию русский)
let currentLang = 'ru';

// Глобальные переменные игры
let currentWord = "";
let score = 0;
let errorsCount = 0; 
let timeLeft = 60;
let timerId = null;
let charIndex = 0;

// Элементы интерфейса
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const settingsPanel = document.getElementById('settings-panel'); // Новый!

const startBtn = document.getElementById('start-btn');
const menuBtn = document.getElementById('menu-btn'); // Новый!
const retryIconBtn = document.getElementById('retry-icon-btn');
const shareBtn = document.getElementById('share-btn');
const langRuBtn = document.getElementById('lang-ru'); // Новый!
const langEnBtn = document.getElementById('lang-en'); // Новый!

const wordContainer = document.getElementById('word-input-container');
const hiddenInput = document.getElementById('hidden-input');
const timerDisplay = document.getElementById('timer');
const finalScoreDisplay = document.getElementById('final-score');
const finalErrorsDisplay = document.getElementById('final-errors');

// Элементы текста для смены языка (Новое!)
const endTitleDisplay = document.getElementById('end-title');
const labelWordsDisplay = document.getElementById('label-words');
const labelErrorsDisplay = document.getElementById('label-errors');

// --- ЛОГИКА ЯЗЫКА (Новое!) ---

function updateInterfaceLanguage(lang) {
    currentLang = lang;
    const data = locales[lang];

    // Обновляем текст на кнопках и заголовках
    startBtn.innerText = data.startBtn;
    endTitleDisplay.innerText = data.endTitle;
    labelWordsDisplay.innerText = data.labelWords;
    labelErrorsDisplay.innerText = data.labelErrors;
    shareBtn.innerText = data.shareBtn;

    // Обновляем активный класс в переключателе
    if (lang === 'ru') {
        langRuBtn.classList.add('active');
        langEnBtn.classList.remove('active');
    } else {
        langEnBtn.classList.add('active');
        langRuBtn.classList.remove('active');
    }

    // Если игра идет, слова не меняем (чтобы не путать игрока), 
    // новые слова подтянутся при следующем вызове nextWord()
}

// --- ЛОГИКА НАСТРОЕК И МЕНЮ (Новое!) ---

function toggleSettings() {
    // Панель открывается только со стартового экрана
    if (!startScreen.classList.contains('hidden')) {
        settingsPanel.classList.toggle('hidden');
    }
}

// Закрытие панели при клике на темный фон
settingsPanel.addEventListener('click', (e) => {
    // Если кликнули именно по фону (а не по контенту панели)
    if (e.target === settingsPanel) {
        settingsPanel.classList.add('hidden');
    }
});

// --- ЛОГИКА ИГРЫ ---

function startGame() {
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    settingsPanel.classList.add('hidden'); // Закрываем настройки, если были открыты
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
    // Берем слова из текущего словаря языка
    const wordList = locales[currentLang];
    currentWord = (timeLeft > 30) 
        ? wordList.simpleWords[Math.floor(Math.random() * wordList.simpleWords.length)]
        : wordList.hardPhrases[Math.floor(Math.random() * wordList.hardPhrases.length)];
    renderWord();
}

function renderWord() {
    wordContainer.innerHTML = '';
    [...currentWord].forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char === " " ? "\u00A0" : char; 
        span.classList.add('char');
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
    
    const lastChar = typedValue[typedValue.length - 1].toLowerCase();
    const targetChar = currentWord[charIndex].toLowerCase();

    if (lastChar === targetChar) {
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
        spans[charIndex].classList.add('wrong');
        errorsCount++;
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }
    
    hiddenInput.value = '';
});

function updateTimer() {
    const s = timeLeft < 10 ? '0' + timeLeft : timeLeft;
    timerDisplay.innerText = `00:${s}`;
}

// --- ФИНАЛ ---

function endGame() {
    clearInterval(timerId);
    
    hiddenInput.blur(); // Убираем клавиатуру

    if (tg.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }

    finalScoreDisplay.innerText = score;
    finalErrorsDisplay.innerText = errorsCount;

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

// --- СЛУШАТЕЛИ ---

// Открытие меню (Новое!)
menuBtn.addEventListener('click', toggleSettings);

// Смена языка (Новое!)
langRuBtn.addEventListener('click', () => updateInterfaceLanguage('ru'));
langEnBtn.addEventListener('click', () => updateInterfaceLanguage('en'));

startBtn.addEventListener('click', startGame);
retryIconBtn.addEventListener('click', startGame);

shareBtn.addEventListener('click', () => {
    // Берем текст шаринга из текущего языка и подставляем значения
    let shareText = locales[currentLang].shareText;
    shareText = shareText.replace('{score}', score).replace('{errors}', errorsCount);

    if (tg.shareUrl) {
        tg.shareUrl('https://t.me/romul76volga_bot/game', shareText);
    } else {
        tg.showAlert(shareText);
    }
});

gameScreen.addEventListener('click', () => {
    if (!gameScreen.classList.contains('hidden')) {
        hiddenInput.focus();
    }
});

// Инициализация языка при запуске
updateInterfaceLanguage('ru');

tg.ready();
