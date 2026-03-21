const locales = {
    ru: {
        betterThan: "лучше чем {n}% игроков", 
        startBtn: "начать", 
        endTitle: "итог", 
        labelWords: "слов", 
        labelErrors: "ошибок", 
        shareBtn: "поделиться",
        // Сложные слова для клавиатуры
        simpleWords: [
            "синхрофазотрон", "превысокомногорассматривающий", "субстанция", 
            "изъявление", "интерпретация", "двухъярусный", "электростанция", 
            "конъюнктура", "архитектура", "параллелепипед", "достопримечательность"
        ],
        hardPhrases: [
            "быстрый бурый лис", "съешь этих булок", "чрезвычайное происшествие", 
            "желтый кронштейн", "взрывной характер", "цифровой барьер"
        ]
    },
    en: {
        betterThan: "better than {n}% of players",
        simpleWords: ["cryptography", "synchronization", "infrastructure", "juxtaposition", "phenomenon"],
        hardPhrases: ["quick brown fox", "heavy metal thunder", "digital frontier", "space exploration"]
    }
};

function nextWord() {
    charIndex = 0;
    const list = locales[currentLang];
    // Если осталось 20 секунд и меньше — даем фразы, иначе сложные слова
    currentWord = (timeLeft <= 20) 
        ? list.hardPhrases[Math.floor(Math.random() * list.hardPhrases.length)] 
        : list.simpleWords[Math.floor(Math.random() * list.simpleWords.length)];
    
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
    input.type = "text"; 

    let p = Math.floor(Math.random() * 100);
    document.getElementById('percent-label').innerText = `лучше чем ${p}% игроков`;
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-errors').innerText = errorsCount;
    
    sGame.classList.add('hidden');
    sEnd.classList.remove('hidden');

    // СОХРАНЕНИЕ ТОЛЬКО ТОП-3
    let top = JSON.parse(localStorage.getItem('typing_top')) || [];
    top.push({ name: tg.initDataUnsafe?.user?.first_name || "Игрок", score: score });
    top.sort((a, b) => b.score - a.score);
    localStorage.setItem('typing_top', JSON.stringify(top.slice(0, 3)));
}

function showLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const top = JSON.parse(localStorage.getItem('typing_top')) || [];
    
    top.forEach((p, i) => {
        list.innerHTML += `
            <div class="leader-row">
                <div class="leader-rank">${i+1}</div>
                <div class="leader-badge"><span>${p.name}</span><span>${p.score}</span></div>
            </div>`;
    });
    
    // Добавляем мотивацию в конец списка
    list.innerHTML += `<div class="motivation-text"><b>ТВОЙ ПРЕДЕЛ — ЭТО ТОЛЬКО ТВОЕ ВООБРАЖЕНИЕ. ДАВИ НА ГАЗ!</b></div>`;
    
    sSet.classList.add('hidden');
    sLeader.classList.remove('hidden');
}
