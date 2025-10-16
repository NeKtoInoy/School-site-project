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

// Инициализация игры
function initGame() {
    loadProgress();
    updateUI();
    showSection('theory');
    updateAllQuestStatuses();
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
    } else if (sectionName === 'quests') {
        document.getElementById('quests-section').classList.add('active');
        document.querySelector('.nav-btn[onclick="showSection(\'quests\')"]').classList.add('active');
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
        saveProgress();
        
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
    const level2 = document.getElementById('level-2');
    const level3 = document.getElementById('level-3');
    
    // Уровень 2 разблокируется при 25 XP
    if (gameData.xp >= 25) {
        level2.style.display = 'block';
        unlockQuests(['2.1', '2.2']);
    }
    
    // Уровень 3 разблокируется при 50 XP
    if (gameData.xp >= 50) {
        level3.style.display = 'block';
        unlockQuests(['3.1', '3.2']);
    }
}

// Разблокировка квестов
function unlockQuests(questIds) {
    questIds.forEach(questId => {
        if (gameData.quests[questId]) {
            gameData.quests[questId].unlocked = true;
            updateQuestStatus(questId);
            
            // Включаем чекбокс и поле ввода
            const questCard = document.querySelector(`[data-quest="${questId}"]`);
            const checkbox = questCard?.querySelector('input[type="checkbox"]');
            const textInput = questCard?.querySelector('input[type="text"]');
            
            if (checkbox) {
                checkbox.disabled = false;
            }
            if (textInput) {
                textInput.disabled = false;
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
        const textInput = questCard?.querySelector('input[type="text"]');
        const quest = gameData.quests[questId];
        
        if (checkbox) {
            checkbox.checked = quest.completed;
            checkbox.disabled = !quest.unlocked;
        }
        if (textInput) {
            textInput.disabled = !quest.unlocked;
        }
    });
}

// Валидация IP-адреса
function validateIP(questId, ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const checkbox = document.querySelector(`[data-quest="${questId}"] input[type="checkbox"]`);
    
    if (ipRegex.test(ip) && gameData.quests[questId].unlocked) {
        checkbox.disabled = false;
        return true;
    } else {
        checkbox.disabled = true;
        return false;
    }
}

// Копирование команды
function copyCommand(element) {
    const command = element.textContent;
    navigator.clipboard.writeText(command).then(() => {
        // Временная подсветка
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#c6f6d5';
        setTimeout(() => {
            element.style.backgroundColor = originalBg;
        }, 500);
    });
}

// Показ достижения
function showAchievement(text) {
    const modal = document.getElementById('achievement-modal');
    const title = document.getElementById('achievement-title');
    const achievementText = document.getElementById('achievement-text');
    
    achievementText.textContent = text;
    modal.style.display = 'block';
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
        quests: gameData.quests
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
    
    // Добавляем кнопку сброса для удобства (можно удалить в продакшене)
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