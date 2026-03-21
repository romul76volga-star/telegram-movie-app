const tg = window.Telegram.WebApp;
tg.expand();

const locales = {
    ru: {
        startBtn: "начать", endTitle: "итог", labelWords: "слов", labelErrors: "ошибок", shareBtn: "поделиться",
        shareText: "Мой результат: {score} слов и {errors} ошибок!",
        simpleWords: ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"],
        hardPhrases: ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай"]
    },
    en: {
        startBtn: "start", endTitle: "result", labelWords: "words", labelErrors: "errors", shareBtn: "share",
        shareText: "My result: {score} words and {errors} errors!",
        simpleWords: ["apple", "sun", "car", "space", "button", "screen", "time", "city", "pen", "cat"],
        hardPhrases: ["fast run", "blue sky", "bright light", "smart bot", "white snow", "fresh tea"]
    }
};

let currentLang = 'ru', currentWord = "", score = 0, errorsCount = 0, timeLeft = 60, timerId = null, charIndex = 0;

// Элементы
const sStart = document.getElementById('start-screen'), sGame = document.getElementById('game-screen'), sEnd = document.getElementById('end-screen'), sSet = document.getElementById('settings-panel');
const bStart = document.getElementById('start-btn'), bMenu = document.getElementById('menu-btn'), bRetry = document.getElementById('retry-icon-btn'), bShare = document.getElementById('share-btn');
const lRu = document.getElementById('lang-ru'), lEn = document.getElementById('lang-en');
const wordBox = document.getElementById('word-input-container'), input = document.getElementById('hidden-input'), timerBox = document.getElementById('timer');

function updateLang(lang) {
    currentLang = lang;
    const d = locales[lang];
    bStart.innerText = d.startBtn;
    document.getElementById('end-title').innerText = d.endTitle;
    document.getElementById('label-words').innerText = d.labelWords;
    document.getElementById('label-errors').innerText = d.labelErrors;
    bShare.innerText = d.shareBtn;
    lRu.classList.toggle('active', lang === 'ru');
    lEn.classList.toggle('active', lang === 'en');
}

function startGame() {
    sStart.classList.add('hidden'); sEnd.classList.add('hidden'); sSet.classList.add('hidden'); sGame.classList.remove('hidden');
    score = 0; errorsCount = 0; timeLeft = 60; timerBox.style.color = "white";
    nextWord();
    input.focus();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--; updateTimer();
        if (timeLeft <= 10) timerBox.style.color = "#ff3b30";
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    charIndex = 0;
    const list = locales[currentLang];
    currentWord = (timeLeft > 30) ? list.simpleWords[Math.floor(Math.random() * list.simpleWords.length)] : list.hardPhrases[Math.floor(Math.random() * list.hardPhrases.length)];
    wordBox.innerHTML = '';
    [...currentWord].forEach((c, i) => {
        const s = document.createElement('span'); s.innerText = c === " " ? "\u00A0" : c; s.className = 'char' + (i === 0 ? ' current' : '');
        wordBox.appendChild(s);
    });
    input.value = '';
}

input.addEventListener('input', () => {
    const typed = input.value.toLowerCase(); if (!typed) return;
    const spans = wordBox.querySelectorAll('.char');
    const target = currentWord[charIndex].toLowerCase();
    if (typed[typed.length - 1] === target) {
        spans[charIndex].className = 'char correct'; charIndex++;
        if (charIndex === currentWord.length) { score++; setTimeout(nextWord, 50); }
        else spans[charIndex].classList.add('current');
    } else {
        spans[charIndex].classList.add('wrong'); errorsCount++;
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    input.value = '';
});

function updateTimer() { const s = timeLeft < 10 ? '0' + timeLeft : timeLeft; timerBox.innerText = `00:${s}`; }

function endGame() {
    clearInterval(timerId); input.blur();
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errorsCount;
    sGame.classList.add('hidden'); sEnd.classList.remove('hidden');
}

bStart.onclick = startGame;
bRetry.onclick = startGame;
bMenu.onclick = () => sSet.classList.remove('hidden');
sSet.onclick = (e) => { if (e.target === sSet) sSet.classList.add('hidden'); };
lRu.onclick = () => updateLang('ru');
lEn.onclick = () => updateLang('en');
sGame.onclick = () => input.focus();
updateLang('ru');
tg.ready();
