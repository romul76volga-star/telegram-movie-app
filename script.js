const tg = window.Telegram.WebApp;
tg.expand();

const locales = {
    ru: { betterThan: "лучше чем {n}% игроков", startBtn: "начать", endTitle: "итог", labelWords: "слов", labelErrors: "ошибок", shareBtn: "поделиться" },
    en: { betterThan: "better than {n}% of players", startBtn: "start", endTitle: "result", labelWords: "words", labelErrors: "errors", shareBtn: "share" }
};

let currentLang = 'ru', score = 0, errorsCount = 0, timeLeft = 60, timerId = null, charIndex = 0;

const sStart = document.getElementById('start-screen'), sGame = document.getElementById('game-screen'), 
      sEnd = document.getElementById('end-screen'), sSet = document.getElementById('settings-panel'),
      sLeader = document.getElementById('leaderboard-screen');

const bStart = document.getElementById('start-btn'), bRetry = document.getElementById('retry-icon-btn'),
      bOpenLeader = document.getElementById('open-leaderboard'), bCloseLeader = document.getElementById('close-leaderboard'),
      input = document.getElementById('hidden-input'), wordBox = document.getElementById('word-input-container');

function startGame() {
    sStart.classList.add('hidden'); sEnd.classList.add('hidden'); sSet.classList.add('hidden'); sLeader.classList.add('hidden');
    sGame.classList.remove('hidden');
    score = 0; errorsCount = 0; timeLeft = 60;
    nextWord();
    setTimeout(() => input.focus(), 100);
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    clearInterval(timerId);
    
    // ПРИНУДИТЕЛЬНО СКРЫВАЕМ КЛАВИАТУРУ
    input.blur();
    input.type = "text"; 
    
    // Расчет процента (имитация на основе score, 50 слов = 99%)
    let p = Math.min(99, Math.floor((score / 50) * 100));
    document.getElementById('percent-label').innerText = locales[currentLang].betterThan.replace('{n}', p);
    
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errorsCount;
    
    sGame.classList.add('hidden');
    sEnd.classList.remove('hidden');

    // Сохранение в локальный ТОП
    let top = JSON.parse(localStorage.getItem('typing_top')) || [];
    top.push({ name: tg.initDataUnsafe?.user?.first_name || "Игрок", score: score });
    top.sort((a,b) => b.score - a.score);
    localStorage.setItem('typing_top', JSON.stringify(top.slice(0, 10)));
}

function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const top = JSON.parse(localStorage.getItem('typing_top')) || [{name: "Speedy", score: 40}, {name: "Pro", score: 30}];
    top.forEach((p, i) => {
        list.innerHTML += `<div class="leader-row">
            <div class="leader-rank">${i+1}</div>
            <div class="leader-badge"><span>${p.name}</span><span>${p.score}</span></div>
        </div>`;
    });
    sSet.classList.add('hidden');
    sLeader.classList.remove('hidden');
}

// Навигация
bOpenLeader.onclick = showLeaderboard;
bCloseLeader.onclick = () => { sLeader.classList.add('hidden'); sStart.classList.remove('hidden'); };
bStart.onclick = startGame;
bRetry.onclick = startGame;
document.getElementById('menu-btn').onclick = () => sSet.classList.remove('hidden');
sSet.onclick = (e) => { if(e.target === sSet) sSet.classList.add('hidden'); };

// Логика печати (упрощенно для краткости)
function nextWord() {
    const words = ["яблоко", "солнце", "машина", "космос", "время"];
    currentWord = words[Math.floor(Math.random()*words.length)];
    charIndex = 0;
    wordBox.innerHTML = '';
    [...currentWord].forEach((c, i) => {
        const s = document.createElement('span'); s.innerText = c; s.className = 'char' + (i === 0 ? ' current' : '');
        wordBox.appendChild(s);
    });
    input.value = '';
}

input.oninput = () => {
    const char = input.value.toLowerCase().slice(-1);
    const spans = wordBox.querySelectorAll('.char');
    if (char === currentWord[charIndex]) {
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

updateLang = (l) => {
    currentLang = l;
    bStart.innerText = locales[l].startBtn;
    document.getElementById('end-title').innerText = locales[l].endTitle;
    document.getElementById('label-words').innerText = locales[l].labelWords;
    document.getElementById('label-errors').innerText = locales[l].labelErrors;
    document.getElementById('share-btn').innerText = locales[l].shareBtn;
};

document.getElementById('lang-ru').onclick = () => updateLang('ru');
document.getElementById('lang-en').onclick = () => updateLang('en');
sGame.onclick = () => input.focus();

tg.ready();
