// Данные игры
const gameData = {
    xp: 0,
    level: 1,
    rank: "Стажер",
    quests: {
        '1.1': { completed: false, xp: 10, unlocked: true },
        '1.2': { completed: false, xp: 15, unlocked: true },
        '2.1': { completed: false, xp: 15, unlocked: false },
        '2.2': { completed: false, xp: 10, unlocked: false },
        '3.1': { completed: false, xp: 15, unlocked: false },
        '3.2': { completed: false, xp: 15, unlocked: false }
    }
};

// Уровни и звания
const levels = [
    { level: 1, xpNeeded: 0, rank: "Стажер" },
    { level: 2, xpNeeded: 25, rank: "Сетевой детектив" },
    { level: 3, xpNeeded: 50, rank: "Файловый мастер" }
];

// Система достижений
const achievements = {
    firstQuest: { name: "Первый шаг", desc: "Выполните первый квест", unlocked: false },
    networkMaster: { name: "Сетевой мастер", desc: "Завершите все сетевые квесты", unlocked: false },
    fileMaster: { name: "Файловый мастер", desc: "Завершите все квесты по файловой системе", unlocked: false },
    allQuests: { name: "Великий сисадмин", desc: "Завершите все квесты", unlocked: false }
};

// Текущий открытый уровень
let currentLevel = 1;

// Новая функция проверки IP для ALT Linux
function checkIP(questId) {
    const ipInput = document.getElementById(`ip-input-${questId}`);
    const validationResult = document.getElementById(`validation-${questId}`);
    const ip = ipInput.value.trim();
    
    // Проверяем, что IP в сети 10.0.2.0/24
    const ipRegex = /^10\.0\.2\.(\d{1,3})$/;
    const match = ip.match(ipRegex);
    
    if (match) {
        const lastOctet = parseInt(match[1]);
        if (lastOctet >= 1 && lastOctet <= 254) {
            // Правильный IP
            validationResult.innerHTML = '<span style="color: #48bb78;">✅ Правильно! Это IP из сети 10.0.2.0/24</span>';
            ipInput.style.borderColor = '#48bb78';
            updateQuest(questId, true);
            showAchievement('🎯 Отлично! Вы нашли свой IP в ALT Linux!');
            return;
        }
    }
    
    // Неправильный IP
    validationResult.innerHTML = '<span style="color: #e53e3e;">❌ Неправильный IP. Должен быть в сети 10.0.2.0/24</span>';
    ipInput.style.borderColor = '#e53e3e';
}

// Новая функция проверки шлюза для ALT Linux
function checkGateway(questId) {
    const ipInput = document.getElementById(`ip-input-${questId}`);
    const validationResult = document.getElementById(`validation-${questId}`);
    const ip = ipInput.value.trim();
    
    if (ip === '10.0.2.2') {
        // Правильный шлюз
        validationResult.innerHTML = '<span style="color: #48bb78;">✅ Правильно! Шлюз определен верно</span>';
        ipInput.style.borderColor = '#48bb78';
        updateQuest(questId, true);
        showAchievement('🌐 Отлично! Вы нашли шлюз в ALT Linux!');
    } else {
        // Неправильный шлюз
        validationResult.innerHTML = '<span style="color: #e53e3e;">❌ Неправильный шлюз. Используйте команду "ip route show" чтобы найти правильный IP</span>';
        ipInput.style.borderColor = '#e53e3e';
    }
}

// Инициализация игры
function initGame() {
    loadProgress();
    updateUI();
    showSection('theory');
    updateAllQuestStatuses();
    updateMap();
}

// Навигация по разделам
function showSection(sectionName) {
    // Скрываем все разделы
    document.querySelectorAll('.game-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активность со всех кнопок навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужный раздел
    if (sectionName === 'theory') {
        document.getElementById('theory-section').classList.add('active');
        document.querySelector('.nav-btn[onclick="showSection(\'theory\')"]').classList.add('active');
    } else if (sectionName === 'map') {
        document.getElementById('map-section').classList.add('active');
        document.querySelector('.nav-btn[onclick="showSection(\'map\')"]').classList.add('active');
        updateMap();
    } else if (sectionName === 'quests') {
        document.getElementById('quests-section').classList.add('active');
    }
}

// Показать конкретный уровень
function showLevel(levelNumber) {
    // Проверяем, доступен ли уровень
    const levelNode = document.querySelector(`.level-node[data-level="${levelNumber}"]`);
    if (levelNode.classList.contains('locked')) {
        return;
    }
    
    currentLevel = levelNumber;
    
    // Скрываем все уровни
    document.querySelectorAll('.quest-level').forEach(level => {
        level.classList.remove('active');
    });
    
    // Показываем выбранный уровень
    document.getElementById(`level-${levelNumber}`).classList.add('active');
    
    // Обновляем заголовок уровня
    const levelTitles = {
        1: "Уровень 1: Стажер",
        2: "Уровень 2: Сетевой детектив", 
        3: "Уровень 3: Файловый мастер"
    };
    document.getElementById('current-level-title').textContent = levelTitles[levelNumber];
    
    // Переходим к разделу квестов
    showSection('quests');
    updateLevelProgress();
}

// Обновление карты уровней
function updateMap() {
    // Обновляем статусы узлов на карте
    document.querySelectorAll('.level-node').forEach(node => {
        const level = parseInt(node.getAttribute('data-level'));
        
        // Сбрасываем классы
        node.classList.remove('active', 'completed', 'locked');
        
        if (level === 1) {
            // Уровень 1 всегда доступен
            node.classList.add('active');
            node.querySelector('.node-status').textContent = 'Доступно';
        } else {
            // Проверяем, доступен ли уровень
            const prevLevelCompleted = isLevelCompleted(level - 1);
            
            if (prevLevelCompleted) {
                node.classList.add('active');
                node.querySelector('.node-status').textContent = 'Доступно';
            } else {
                node.classList.add('locked');
                node.querySelector('.node-status').textContent = 'Заблокировано';
            }
        }
        
        // Проверяем, завершен ли уровень
        if (isLevelCompleted(level)) {
            node.classList.remove('active', 'locked');
            node.classList.add('completed');
            node.querySelector('.node-status').textContent = 'Завершено';
        }
        
        // Обновляем прогресс на карте
        updateLevelProgressOnMap(level);
    });
}

// Проверка завершенности уровня
function isLevelCompleted(level) {
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));
    
    return levelQuests.every(questId => gameData.quests[questId].completed);
}

// Обновление прогресса уровня на карте
function updateLevelProgressOnMap(level) {
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(level + '.'));
    
    const completedQuests = levelQuests.filter(questId => gameData.quests[questId].completed);
    const totalXP = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);
    const earnedXP = completedQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);
    
    const progress = (earnedXP / totalXP) * 100;
    
    // Обновляем прогресс-бар
    const progressBar = document.getElementById(`map-progress-${level}`);
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Обновляем текст XP
    const xpText = document.getElementById(`map-xp-${level}`);
    if (xpText) {
        xpText.textContent = `${earnedXP}/${totalXP} XP`;
    }
}

// Обновление прогресса текущего уровня
function updateLevelProgress() {
    const levelQuests = Object.keys(gameData.quests)
        .filter(questId => questId.startsWith(currentLevel + '.'));
    
    const completedQuests = levelQuests.filter(questId => gameData.quests[questId].completed);
    const totalXP = levelQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);
    const earnedXP = completedQuests.reduce((sum, questId) => sum + gameData.quests[questId].xp, 0);
    
    const progress = totalXP > 0 ? (earnedXP / totalXP) * 100 : 0;
    
    // Обновляем прогресс-бар
    const progressBar = document.getElementById('level-progress-fill');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Обновляем текст прогресса
    const progressText = document.getElementById('level-progress-text');
    if (progressText) {
        progressText.textContent = `${Math.round(progress)}%`;
    }
}

// Навигация по теории
function nextTheory(nextId) {
    const currentCard = document.querySelector('.theory-card.active');
    const nextCard = document.getElementById(`theory-${nextId}`);
    
    if (currentCard && nextCard) {
        currentCard.classList.remove('active');
        nextCard.classList.add('active');
    }
}

function prevTheory(prevId) {
    const currentCard = document.querySelector('.theory-card.active');
    const prevCard = document.getElementById(`theory-${prevId}`);
    
    if (currentCard && prevCard) {
        currentCard.classList.remove('active');
        prevCard.classList.add('active');
    }
}

// Обновление квеста
function updateQuest(questId, completed) {
    if (gameData.quests[questId] && gameData.quests[questId].unlocked) {
        gameData.quests[questId].completed = completed;
        
        // Пересчитываем XP
        calculateXP();
        
        // Обновляем интерфейс
        updateQuestStatus(questId);
        updateUI();
        checkLevelUnlocks();
        checkAchievements();
        saveProgress();
        
        // Обновляем прогресс уровня
        updateLevelProgress();
        updateMap();
        
        // Показываем ачивку, если квест завершен
        if (completed) {
            showAchievement(`Квест завершен! +${gameData.quests[questId].xp} XP`);
        }
    }
}

// Расчет XP
function calculateXP() {
    let totalXP = 0;
    
    // Считаем XP за квесты
    Object.values(gameData.quests).forEach(quest => {
        if (quest.completed && quest.unlocked) {
            totalXP += quest.xp;
        }
    });
    
    gameData.xp = totalXP;
    updateLevel();
}

// Обновление уровня
function updateLevel() {
    let newLevel = 1;
    let newRank = "Стажер";
    
    // Находим текущий уровень на основе XP
    for (let i = levels.length - 1; i >= 0; i--) {
        if (gameData.xp >= levels[i].xpNeeded) {
            newLevel = levels[i].level;
            newRank = levels[i].rank;
            break;
        }
    }
    
    // Проверяем, изменился ли уровень
    if (newLevel !== gameData.level) {
        gameData.level = newLevel;
        gameData.rank = newRank;
        showAchievement(`Новый уровень! ${newLevel} - ${newRank}`);
    }
}

// Проверка разблокировки уровней
function checkLevelUnlocks() {
    // Уровень 2 разблокируется при 25 XP
    if (gameData.xp >= 25) {
        unlockQuests(['2.1', '2.2']);
    }
    
    // Уровень 3 разблокируется при 50 XP
    if (gameData.xp >= 50) {
        unlockQuests(['3.1', '3.2']);
    }
}

// Разблокировка квестов
function unlockQuests(questIds) {
    questIds.forEach(questId => {
        if (gameData.quests[questId]) {
            gameData.quests[questId].unlocked = true;
            updateQuestStatus(questId);
            
            // Включаем input и button для IP-квестов
            if (questId === '2.1') {
                const ipInput = document.getElementById(`ip-input-${questId}`);
                const checkButton = document.getElementById(`check-btn-${questId}`);
                if (ipInput) ipInput.disabled = false;
                if (checkButton) checkButton.disabled = false;
            }
            
            // Включаем чекбокс для обычных квестов
            const questCard = document.querySelector(`[data-quest="${questId}"]`);
            const checkbox = questCard?.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.disabled = false;
            }
        }
    });
}

// Обновление статуса квеста
function updateQuestStatus(questId) {
    const statusElement = document.getElementById(`status-${questId}`);
    const quest = gameData.quests[questId];
    
    if (statusElement && quest) {
        if (!quest.unlocked) {
            statusElement.textContent = '🔒 Заблокировано';
            statusElement.className = 'quest-status status-locked';
        } else if (quest.completed) {
            statusElement.textContent = '🟢 Завершено';
            statusElement.className = 'quest-status status-completed';
        } else {
            statusElement.textContent = '🟡 Не начато';
            statusElement.className = 'quest-status status-in-progress';
        }
    }
}

// Обновление всех статусов квестов
function updateAllQuestStatuses() {
    Object.keys(gameData.quests).forEach(questId => {
        updateQuestStatus(questId);
        
        // Обновляем состояние чекбоксов и полей ввода
        const questCard = document.querySelector(`[data-quest="${questId}"]`);
        const checkbox = questCard?.querySelector('input[type="checkbox"]');
        const quest = gameData.quests[questId];
        
        if (checkbox) {
            checkbox.checked = quest.completed;
            checkbox.disabled = !quest.unlocked;
        }
    });
}

// Улучшенное копирование команды
function copyCommand(element) {
    const command = element.textContent;
    navigator.clipboard.writeText(command).then(() => {
        // Сохраняем оригинальные стили
        const originalBg = element.style.backgroundColor;
        const originalText = element.textContent;
        
        // Визуальный фидбек
        element.style.backgroundColor = '#48bb78';
        element.style.color = 'white';
        element.textContent = '✓ Скопировано!';
        
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
            element.style.color = '';
            element.textContent = originalText;
        }, 1500);
    }).catch(err => {
        console.log('Ошибка копирования:', err);
        element.style.backgroundColor = '#e53e3e';
        element.textContent = '❌ Ошибка';
        setTimeout(() => {
            element.style.backgroundColor = '#edf2f7';
            element.textContent = command;
        }, 1500);
    });
}

// Проверка и разблокировка достижений
function checkAchievements() {
    // Первый квест
    if (gameData.quests['1.1'].completed && !achievements.firstQuest.unlocked) {
        achievements.firstQuest.unlocked = true;
        showAchievement(`🏆 ${achievements.firstQuest.name}: ${achievements.firstQuest.desc}`);
    }
    
    // Сетевой мастер
    const networkQuests = ['1.1', '1.2', '2.1', '2.2'];
    if (networkQuests.every(questId => gameData.quests[questId].completed) && !achievements.networkMaster.unlocked) {
        achievements.networkMaster.unlocked = true;
        showAchievement(`🏆 ${achievements.networkMaster.name}: ${achievements.networkMaster.desc}`);
    }
    
    // Файловый мастер
    const fileQuests = ['3.1', '3.2'];
    if (fileQuests.every(questId => gameData.quests[questId].completed) && !achievements.fileMaster.unlocked) {
        achievements.fileMaster.unlocked = true;
        showAchievement(`🏆 ${achievements.fileMaster.name}: ${achievements.fileMaster.desc}`);
    }
    
    // Все квесты
    const allQuestIds = Object.keys(gameData.quests);
    if (allQuestIds.every(questId => gameData.quests[questId].completed) && !achievements.allQuests.unlocked) {
        achievements.allQuests.unlocked = true;
        showAchievement(`🏆 ${achievements.allQuests.name}: ${achievements.allQuests.desc}`);
    }
}

// Показ достижения
function showAchievement(text) {
    const modal = document.getElementById('achievement-modal');
    const title = document.getElementById('achievement-title');
    const achievementText = document.getElementById('achievement-text');
    
    achievementText.textContent = text;
    modal.style.display = 'block';
    
    // Автоматически скрываем через 4 секунды
    setTimeout(() => {
        if (modal.style.display === 'block') {
            closeModal();
        }
    }, 4000);
}

// Закрытие модального окна
function closeModal() {
    const modal = document.getElementById('achievement-modal');
    modal.style.display = 'none';
}

// Обновление интерфейса
function updateUI() {
    // Обновляем XP и уровень
    document.getElementById('xp').textContent = gameData.xp;
    document.getElementById('level').textContent = gameData.level;
    document.getElementById('rank').textContent = gameData.rank;
    
    // Находим XP для следующего уровня
    const nextLevel = levels.find(level => level.level === gameData.level + 1);
    const xpNeeded = nextLevel ? nextLevel.xpNeeded : levels[levels.length - 1].xpNeeded;
    document.getElementById('xp-needed').textContent = xpNeeded;
    
    // Обновляем прогресс-бар
    const currentLevelData = levels.find(level => level.level === gameData.level);
    const nextLevelData = levels.find(level => level.level === gameData.level + 1);
    
    if (currentLevelData && nextLevelData) {
        const xpInLevel = gameData.xp - currentLevelData.xpNeeded;
        const xpForLevel = nextLevelData.xpNeeded - currentLevelData.xpNeeded;
        const progress = (xpInLevel / xpForLevel) * 100;
        document.getElementById('progress-fill').style.width = `${Math.min(progress, 100)}%`;
    } else {
        document.getElementById('progress-fill').style.width = '100%';
    }
    
    // Обновляем статусы квестов
    updateAllQuestStatuses();
}

// Сохранение прогресса
function saveProgress() {
    const saveData = {
        xp: gameData.xp,
        level: gameData.level,
        rank: gameData.rank,
        quests: gameData.quests,
        achievements: achievements
    };
    localStorage.setItem('sysadminGameProgress', JSON.stringify(saveData));
}

// Загрузка прогресса
function loadProgress() {
    const saved = localStorage.getItem('sysadminGameProgress');
    if (saved) {
        const saveData = JSON.parse(saved);
        gameData.xp = saveData.xp || 0;
        gameData.level = saveData.level || 1;
        gameData.rank = saveData.rank || "Стажер";
        gameData.quests = saveData.quests || gameData.quests;
        
        if (saveData.achievements) {
            Object.keys(saveData.achievements).forEach(key => {
                if (achievements[key]) {
                    achievements[key].unlocked = saveData.achievements[key].unlocked;
                }
            });
        }
        
        checkLevelUnlocks();
    }
}

// Сброс прогресса (для отладки)
function resetProgress() {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
        localStorage.removeItem('sysadminGameProgress');
        location.reload();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    
    // Кнопка сброса прогресса
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Сброс';
    resetBtn.style.position = 'fixed';
    resetBtn.style.top = '10px';
    resetBtn.style.right = '10px';
    resetBtn.style.zIndex = '1000';
    resetBtn.style.background = '#e53e3e';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.padding = '5px 10px';
    resetBtn.style.borderRadius = '5px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.onclick = resetProgress;
    document.body.appendChild(resetBtn);
});