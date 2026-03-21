const tg = window.Telegram.WebApp;
tg.expand();

const locales = {
    ru: {
        startBtn: "начать", endTitle: "итог", labelWords: "слов", labelErrors: "ошибок", shareBtn: "поделиться",
        simpleWords: ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время", "город", "ручка", "кошка"],
        hardPhrases: ["быстрый бег", "синее небо", "яркий свет", "умный бот", "белый снег", "свежий чай"]
    },
    en: {
        startBtn: "start", endTitle: "result", labelWords: "words", labelErrors: "errors", shareBtn: "share",
        simpleWords: ["apple", "sun", "car", "space", "button", "screen", "time", "city", "pen", "cat"],
        hardPhrases: ["fast run", "blue sky", "bright light", "smart bot", "white snow", "fresh tea"]
    }
};

let currentLang = 'ru', currentWord = "", score = 0, errorsCount = 0, timeLeft = 60, timerId = null, charIndex = 0;

const sStart = document.getElementById('start-screen'), sGame = document.getElementById('game-screen'), 
      sEnd = document.getElementById('end-screen'), sSet = document.getElementById('settings-panel'),
      sLeader = document.getElementById('leaderboard-screen');
const bStart = document.getElementById('start-btn'), bMenu = document.getElementById('menu-btn'), 
      bRetry = document.getElementById('retry-icon-btn'), bOpenLeader = document.getElementById('open-leaderboard'),
      bCloseLeader = document.getElementById('close-leaderboard');
const wordBox = document.getElementById('word-input-container'), input = document.getElementById('hidden-input'), 
      timerBox = document.getElementById('timer');

function updateLang(lang) {
    currentLang = lang;
    const d = locales[lang];
    bStart.innerText = d.startBtn;
    document.getElementById('end-title').innerText = d.endTitle;
    document.getElementById('label-words').innerText = d.labelWords;
    document.getElementById('label-errors').innerText = d.labelErrors;
    document.getElementById('share-btn').innerText = d.shareBtn;
    document.getElementById('lang-ru').className = lang === 'ru' ? 'lang-opt active' : 'lang-opt';
    document.getElementById('lang-en').className = lang === 'en' ? 'lang-opt active' : 'lang-opt';
}

function startGame() {
    sStart.classList.add('hidden'); sEnd.classList.add('hidden'); sSet.classList.add('hidden'); sGame.classList.remove('hidden');
    score = 0; errorsCount = 0; timeLeft = 60; timerBox.style.color = "white";
    nextWord(); input.focus();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--; updateTimer();
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    charIndex = 0;
    const list = locales[currentLang];
    currentWord = (timeLeft > 30) ? list.simpleWords[Math.floor(Math.random() * list.simpleWords.length)] : list.hardPhrases[Math.floor(Math.random() * list.hardPhrases.length)];
    wordBox.innerHTML = '';
    [...currentWord].forEach((c, i) => {
        const s = document.createElement('span'); s.innerText = c; s.className = 'char' + (i === 0 ? ' current' : '');
        wordBox.appendChild(s);
    });
    input.value = '';
}

input.addEventListener('input', () => {
    const typed = input.value; if (!typed) return;
    const spans = wordBox.querySelectorAll('.char');
    if (typed[typed.length - 1].toLowerCase() === currentWord[charIndex].toLowerCase()) {
        spans[charIndex].className = 'char correct'; charIndex++;
        if (charIndex === currentWord.length) { score++; setTimeout(nextWord, 50); }
        else spans[charIndex].classList.add('current');
    } else {
        spans[charIndex].classList.add('wrong'); errorsCount++;
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    input.value = '';
});

function endGame() {
    clearInterval(timerId);
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errorsCount;
    sGame.classList.add('hidden'); sEnd.classList.remove('hidden');
    
    // Сохранение в имитацию лидеров
    let leaders = JSON.parse(localStorage.getItem('typing_top')) || [{name: "player1", score: 10}];
    leaders.push({name: tg.initDataUnsafe?.user?.first_name || "ты", score: score});
    leaders.sort((a,b) => b.score - a.score);
    localStorage.setItem('typing_top', JSON.stringify(leaders.slice(0, 5)));
}

function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const leaders = JSON.parse(localStorage.getItem('typing_top')) || [];
    leaders.forEach((p, i) => {
        list.innerHTML += `<div class="leader-row"><div class="leader-rank">${i+1}</div><div class="leader-badge"><span>${p.name}</span><span>${p.score}</span></div></div>`;
    });
    sSet.classList.add('hidden'); sLeader.classList.remove('hidden');
}

function updateTimer() { timerBox.innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`; }

bStart.onclick = startGame;
bRetry.onclick = startGame;
bMenu.onclick = () => sSet.classList.remove('hidden');
sSet.onclick = (e) => { if (e.target === sSet) sSet.classList.add('hidden'); };
bOpenLeader.onclick = showLeaderboard;
bCloseLeader.onclick = () => sLeader.classList.add('hidden');
document.getElementById('lang-ru').onclick = () => updateLang('ru');
document.getElementById('lang-en').onclick = () => updateLang('en');
sGame.onclick = () => input.focus();

updateLang('ru');
tg.ready();
