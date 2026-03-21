const tg = window.Telegram.WebApp;
tg.expand();

const locales = {
    ru: { 
        startBtn: "начать", endTitle: "итог", labelWords: "слов", labelErrors: "ошибок", shareBtn: "поделиться",
        percentText: "ЛУЧШЕ ЧЕМ {n}% ИГРОКОВ",
        motivation: "ТВОЙ ПРЕДЕЛ — ЭТО ТОЛЬКО ТВОЕ ВООБРАЖЕНИЕ. ДАВИ НА ГАЗ!",
        // Смешанный список: простые + средней сложности (до 12-13 символов, чтобы влезли)
        words: [
            "яблоко", "солнце", "машина", "космос", "время", "субстанция", 
            "экран", "поток", "код", "логика", "изъявление", "проверка", 
            "шторм", "рывок", "память", "конъюнктура", "смысл", "объект", 
            "интерфейс", "запрос", "схватка", "архитектор", "финал", "старт"
        ],
        // Короткие фразы для финала
        phrases: ["быстрый лис", "синий код", "яркий свет", "твой рекорд", "жми на газ", "верный путь"]
    },
    en: { 
        startBtn: "start", endTitle: "result", labelWords: "words", labelErrors: "errors", shareBtn: "share",
        percentText: "BETTER THAN {n}% OF PLAYERS",
        motivation: "LIMITS EXIST ONLY IN THE MIND. KEEP PUSHING!",
        words: ["apple", "sun", "space", "time", "logic", "interface", "phenomenon", "stream", "object", "dynamic", "pointer", "structure"],
        phrases: ["quick fox", "blue code", "bright light", "top score", "keep going", "fast lane"]
    }
};

let currentLang = 'ru', score = 0, errorsCount = 0, timeLeft = 60, timerId = null, charIndex = 0, currentWord = "";

const sStart = document.getElementById('start-screen'), sGame = document.getElementById('game-screen'), 
      sEnd = document.getElementById('end-screen'), sSet = document.getElementById('settings-panel'),
      sLeader = document.getElementById('leaderboard-screen'), bStart = document.getElementById('start-btn'),
      bRetry = document.getElementById('retry-icon-btn'), input = document.getElementById('hidden-input'), 
      wordBox = document.getElementById('word-input-container');

function startGame() {
    sStart.classList.add('hidden'); sEnd.classList.add('hidden'); sSet.classList.add('hidden'); sLeader.classList.add('hidden');
    sGame.classList.remove('hidden');
    score = 0; errorsCount = 0; timeLeft = 60;
    nextWord();
    setTimeout(() => input.focus(), 150);
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    const list = locales[currentLang];
    // Чередуем: последние 20 сек — короткие фразы, остальное время — слова
    if (timeLeft <= 20) {
        currentWord = list.phrases[Math.floor(Math.random() * list.phrases.length)];
    } else {
        currentWord = list.words[Math.floor(Math.random() * list.words.length)];
    }
    
    charIndex = 0;
    wordBox.innerHTML = '';
    [...currentWord].forEach((c, i) => {
        const s = document.createElement('span'); 
        s.innerText = c === " " ? "\u00A0" : c; 
        s.className = 'char' + (i === 0 ? ' current' : '');
        wordBox.appendChild(s);
    });
    input.value = '';
}

function endGame() {
    clearInterval(timerId);
    input.blur();
    
    const randomP = Math.floor(Math.random() * 99) + 1;
    document.getElementById('percent-label').innerText = locales[currentLang].percentText.replace('{n}', randomP);
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errorsCount;
    
    sGame.classList.add('hidden');
    sEnd.classList.remove('hidden');

    let top = JSON.parse(localStorage.getItem('typing_top')) || [];
    top.push({ name: tg.initDataUnsafe?.user?.first_name || "Игрок", score: score });
    top.sort((a, b) => b.score - a.score);
    localStorage.setItem('typing_top', JSON.stringify(top.slice(0, 3)));
}

function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    const motivBox = document.getElementById('motivation-box');
    list.innerHTML = '';
    const top = JSON.parse(localStorage.getItem('typing_top')) || [];
    top.forEach((p, i) => {
        list.innerHTML += `<div class="leader-row">
            <div class="leader-rank">${i+1}</div>
            <div class="leader-badge"><span>${p.name}</span><span>${p.score}</span></div>
        </div>`;
    });
    motivBox.innerText = locales[currentLang].motivation;
    sSet.classList.add('hidden');
    sLeader.classList.remove('hidden');
}

document.getElementById('open-leaderboard').onclick = showLeaderboard;
document.getElementById('close-leaderboard').onclick = () => { sLeader.classList.add('hidden'); sStart.classList.remove('hidden'); };
bStart.onclick = startGame;
bRetry.onclick = startGame;
document.getElementById('menu-btn').onclick = () => sSet.classList.remove('hidden');
sSet.onclick = (e) => { if (e.target === sSet) sSet.classList.add('hidden'); };

input.oninput = () => {
    const char = input.value.toLowerCase().slice(-1);
    const spans = wordBox.querySelectorAll('.char');
    const target = currentWord[charIndex].toLowerCase();

    if (char === target || (target === " " && char === " ")) {
        spans[charIndex].className = 'char correct';
        charIndex++;
        if (charIndex === currentWord.length) { score++; nextWord(); }
        else spans[charIndex].classList.add('current');
    } else {
        spans[charIndex].classList.add('wrong');
        errorsCount++;
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    input.value = '';
};

function updateLang(l) {
    currentLang = l;
    bStart.innerText = locales[l].startBtn;
    document.getElementById('end-title').innerText = locales[l].endTitle;
    document.getElementById('label-words').innerText = locales[l].labelWords;
    document.getElementById('label-errors').innerText = locales[l].labelErrors;
    document.getElementById('share-btn').innerText = locales[l].shareBtn;
}

document.getElementById('lang-ru').onclick = () => updateLang('ru');
document.getElementById('lang-en').onclick = () => updateLang('en');
sGame.onclick = () => input.focus();

updateLang('ru');
tg.ready();
