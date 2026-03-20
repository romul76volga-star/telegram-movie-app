const tg = window.Telegram.WebApp;
tg.expand();

const simpleWords = ["яблоко", "солнце", "машина", "космос", "кнопка", "экран", "время"];
const hardPhrases = ["быстрый бег", "синее небо", "яркий свет", "умный бот"];

let score = 0, errors = 0, timeLeft = 60, charIndex = 0, currentWord = "", timerId = null;

const hiddenInput = document.getElementById('hidden-input');
const wordContainer = document.getElementById('word-input-container');

function startGame() {
    score = 0; errors = 0; timeLeft = 60;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    nextWord();
    
    hiddenInput.value = '';
    hiddenInput.focus();
    
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        const s = timeLeft < 10 ? '0' + timeLeft : timeLeft;
        document.getElementById('timer').innerText = `00:${s}`;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    charIndex = 0;
    currentWord = (timeLeft > 30) ? simpleWords[Math.floor(Math.random()*simpleWords.length)] : hardPhrases[Math.floor(Math.random()*hardPhrases.length)];
    wordContainer.innerHTML = '';
    [...currentWord].forEach((c, i) => {
        const span = document.createElement('span');
        span.innerText = c === " " ? "\u00A0" : c;
        span.className = 'char' + (i === 0 ? ' current' : '');
        wordContainer.appendChild(span);
    });
}

hiddenInput.addEventListener('input', () => {
    const char = hiddenInput.value.slice(-1).toLowerCase();
    const spans = wordContainer.querySelectorAll('.char');
    if (!char) return;

    if (char === currentWord[charIndex].toLowerCase()) {
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
        errors++;
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    hiddenInput.value = '';
});

function endGame() {
    clearInterval(timerId);
    hiddenInput.blur(); // Скрываем клавиатуру
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errors;
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
}

document.getElementById('start-btn').onclick = startGame;
document.getElementById('retry-btn').onclick = startGame;
document.getElementById('game-screen').onclick = () => hiddenInput.focus();
tg.ready();
