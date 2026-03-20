const tg = window.Telegram.WebApp;
tg.expand();

const simpleWords = ["яблоко", "солнце", "машина", "космос", "кнопка", "экран"];
const hardPhrases = ["быстрый бег", "синее небо", "яркий свет", "умный бот"];

let score = 0, errors = 0, timeLeft = 60, charIndex = 0, currentWord = "", timerId = null;

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const wordContainer = document.getElementById('word-input-container');
const hiddenInput = document.getElementById('hidden-input');

function startGame() {
    score = 0; errors = 0; timeLeft = 60;
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    document.getElementById('timer').style.color = "white";
    nextWord();
    hiddenInput.focus();
    
    timerId = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if(timeLeft <= 10) document.getElementById('timer').style.color = "#ff3b30";
        if(timeLeft <= 0) endGame();
    }, 1000);
}

function nextWord() {
    charIndex = 0;
    currentWord = timeLeft > 30 ? simpleWords[Math.floor(Math.random()*simpleWords.length)] : hardPhrases[Math.floor(Math.random()*hardPhrases.length)];
    wordContainer.innerHTML = '';
    [...currentWord].forEach((c, i) => {
        const s = document.createElement('span');
        s.innerText = c === " " ? "\u00A0" : c;
        s.classList.add('char');
        if(i === 0) s.classList.add('current');
        wordContainer.appendChild(s);
    });
}

hiddenInput.addEventListener('input', () => {
    const spans = wordContainer.querySelectorAll('.char');
    const char = hiddenInput.value.slice(-1).toLowerCase();
    if(!char) return;

    if(char === currentWord[charIndex].toLowerCase()) {
        spans[charIndex].className = 'char correct';
        charIndex++;
        if(charIndex === currentWord.length) {
            score++;
            nextWord();
        } else {
            spans[charIndex].classList.add('current');
        }
    } else {
        spans[charIndex].classList.add('wrong');
        errors++;
        if(tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
    }
    hiddenInput.value = '';
});

function endGame() {
    clearInterval(timerId);
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errors;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

document.getElementById('start-btn').onclick = startGame;
document.getElementById('retry-btn').onclick = startGame;
document.getElementById('share-btn').onclick = () => tg.showAlert("Поделись результатом!");
gameScreen.onclick = () => hiddenInput.focus();
tg.ready();
