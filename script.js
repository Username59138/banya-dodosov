const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============ ЗАГРУЗКА РЕСУРСОВ ============

// Загрузка изображений
const IMAGES = {};
const IMAGE_SOURCES = {
    sir: 'images/sir.jpg',
    ch: 'images/ch.jpg',
    batch: 'images/batch.jpg',
    dod: 'images/dod.jpg',
    pradod: 'images/pradod.jpg',
    prapradod: 'images/prapradod.jpg',
    omegaSuper: 'images/omage-super-pradodos.jpg'
};

let imagesLoaded = 0;
const totalImages = Object.keys(IMAGE_SOURCES).length;

function loadImages() {
    for (const [key, src] of Object.entries(IMAGE_SOURCES)) {
        const img = new Image();
        img.onload = () => {
            imagesLoaded++;
            console.log(`Загружено изображение: ${key} (${imagesLoaded}/${totalImages})`);
        };
        img.onerror = () => {
            console.warn(`Ошибка загрузки изображения: ${src}`);
        };
        img.src = src;
        IMAGES[key] = img;
    }
}

// Загрузка звуков
const SOUNDS = {
    echePositim: null,
    tiblyaDolbaeb: null,
    yaYcheKrasniy: null,
    ohmygod: null
};

function loadSounds() {
    try {
        SOUNDS.echePositim = new Audio('sounds/eche-posidim.mp3');
        SOUNDS.tiblyaDolbaeb = new Audio('sounds/ti-blya-dolbaeb.mp3');
        SOUNDS.yaYcheKrasniy = new Audio('sounds/ya-yche-krasniy.mp3');
        SOUNDS.ohmygod = new Audio('sounds/ohmygod.mp3');
        
        // Предзагрузка звуков
        Object.values(SOUNDS).forEach(sound => {
            if (sound) {
                sound.load();
                sound.volume = 0.6;
            }
        });
        
        console.log('Звуки загружены');
    } catch (e) {
        console.warn('Ошибка загрузки звуков:', e);
    }
}

// Привязка звуков к фразам
function getSoundForPhrase(text) {
    if (text.includes("Ещё посидим") || text.includes("терпимо")) return SOUNDS.echePositim;
    if (text.includes("д*лбаёб") || text.includes("долбаёб")) return SOUNDS.tiblyaDolbaeb;
    if (text.includes("красный")) return SOUNDS.yaYcheKrasniy;
    if (text.includes("Омайгад")) return SOUNDS.ohmygod
    return null;
}

// Функция воспроизведения звука
function playSound(sound) {
    if (!sound) return;
    try {
        const audioClone = sound.cloneNode();
        audioClone.volume = 0.6;
        audioClone.play().catch(e => {
            // Тихо игнорируем ошибки автовоспроизведения
        });
    } catch (e) {
        console.warn('Ошибка воспроизведения звука:', e);
    }
}

// Инициализация ресурсов
loadImages();
loadSounds();

// ============ СИСТЕМА СОХРАНЕНИЙ ============

let saveData = {
    coins: 0,
    upgrades: {
        hp: 0,
        xp: 0,
        shield: 0,
        cooldown: 0
    }
};

function loadSave() {
    const saved = localStorage.getItem('banyaDodsave');
    if (saved) {
        try {
            saveData = JSON.parse(saved);
        } catch (e) {
            console.log('Save corrupted, starting fresh');
        }
    }
    updateShopUI();
}

function saveSave() {
    localStorage.setItem('banyaDodsave', JSON.stringify(saveData));
}

// ============ МАГАЗИН ============

const UPGRADE_COSTS = {
    hp: [1000, 2000, 4000, 8000, 15000],
    xp: [1500, 3000, 6000, 12000, 20000],
    shield: [2000, 4000, 8000, 16000, 30000],
    cooldown: [1750, 3500, 7000, 14000, 25000]
};

function openShop() {
    document.getElementById('shopModal').classList.remove('hidden');
    updateShopUI();
}

function closeShop() {
    document.getElementById('shopModal').classList.add('hidden');
}

function updateShopUI() {
    document.getElementById('startCoins').textContent = saveData.coins;
    document.getElementById('shopCoins').textContent = saveData.coins;
    
    const hpLevel = saveData.upgrades.hp;
    document.getElementById('hpLevel').textContent = hpLevel;
    document.getElementById('hpCost').textContent = hpLevel >= 5 ? 'MAX' : UPGRADE_COSTS.hp[hpLevel];
    document.getElementById('shopHP').classList.toggle('maxed', hpLevel >= 5);
    
    const xpLevel = saveData.upgrades.xp;
    document.getElementById('xpLevel').textContent = xpLevel;
    document.getElementById('xpCost').textContent = xpLevel >= 5 ? 'MAX' : UPGRADE_COSTS.xp[xpLevel];
    document.getElementById('shopXP').classList.toggle('maxed', xpLevel >= 5);
    
    const shieldLevel = saveData.upgrades.shield;
    document.getElementById('shieldLevel').textContent = shieldLevel;
    document.getElementById('shieldCost').textContent = shieldLevel >= 5 ? 'MAX' : UPGRADE_COSTS.shield[shieldLevel];
    document.getElementById('shopShield').classList.toggle('maxed', shieldLevel >= 5);
    
    const cooldownLevel = saveData.upgrades.cooldown;
    document.getElementById('cooldownLevel').textContent = cooldownLevel;
    document.getElementById('cooldownCost').textContent = cooldownLevel >= 5 ? 'MAX' : UPGRADE_COSTS.cooldown[cooldownLevel];
    document.getElementById('shopCooldown').classList.toggle('maxed', cooldownLevel >= 5);
}

function buyUpgrade(type) {
    const level = saveData.upgrades[type];
    if (level >= 5) return;
    
    const cost = UPGRADE_COSTS[type][level];
    if (saveData.coins >= cost) {
        saveData.coins -= cost;
        saveData.upgrades[type]++;
        saveSave();
        updateShopUI();
        
        const elementIds = {
            hp: 'shopHP',
            xp: 'shopXP',
            shield: 'shopShield',
            cooldown: 'shopCooldown'
        };
        
        const element = document.getElementById(elementIds[type]);
        if (element) {
            element.style.transform = 'scale(1.1)';
            setTimeout(() => element.style.transform = '', 200);
        }
    }
}

function getMaxHealth() {
    return 100 + saveData.upgrades.hp * 20;
}

function getXPMultiplier() {
    return 1 + saveData.upgrades.xp * 0.25;
}

function getShieldDuration() {
    return 2 + saveData.upgrades.shield;
}

function getShieldCooldown() {
    return 15 - saveData.upgrades.cooldown * 2;
}

// ============ ДЖОЙСТИК ============

const joystickContainer = document.getElementById('joystickContainer');
const joystickHandle = document.getElementById('joystickHandle');
const joystickBase = document.getElementById('joystickBase');

let joystick = {
    active: false,
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0,
    touchId: null
};

const joystickMaxDistance = 45;

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

joystickContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    joystick.active = true;
    joystick.touchId = touch.identifier;
    
    const rect = joystickBase.getBoundingClientRect();
    joystick.startX = rect.left + rect.width / 2;
    joystick.startY = rect.top + rect.height / 2;
    
    updateJoystickPosition(touch.clientX, touch.clientY);
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!joystick.active) return;
    
    for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === joystick.touchId) {
            e.preventDefault();
            updateJoystickPosition(e.touches[i].clientX, e.touches[i].clientY);
            break;
        }
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystick.touchId) {
            resetJoystick();
            break;
        }
    }
});

document.addEventListener('touchcancel', (e) => {
    resetJoystick();
});

function updateJoystickPosition(touchX, touchY) {
    let deltaX = touchX - joystick.startX;
    let deltaY = touchY - joystick.startY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > joystickMaxDistance) {
        deltaX = (deltaX / distance) * joystickMaxDistance;
        deltaY = (deltaY / distance) * joystickMaxDistance;
    }
    
    joystickHandle.style.left = `calc(50% + ${deltaX}px)`;
    joystickHandle.style.top = `calc(50% + ${deltaY}px)`;
    
    joystick.moveX = deltaX / joystickMaxDistance;
    joystick.moveY = deltaY / joystickMaxDistance;
}

function resetJoystick() {
    joystick.active = false;
    joystick.moveX = 0;
    joystick.moveY = 0;
    joystick.touchId = null;
    
    joystickHandle.style.left = '50%';
    joystickHandle.style.top = '50%';
    joystickHandle.style.transform = 'translate(-50%, -50%)';
}

// ============ ЩИТ ============

function activateShield() {
    if (!game.running || game.paused) return;
    if (game.shieldCooldown > 0) return;
    
    game.shieldActive = getShieldDuration() * 60;
    game.shieldCooldown = getShieldCooldown() * 60;
    
    const btn = document.getElementById('shieldBtn');
    btn.classList.add('on-cooldown');
    
    showSpeechBubble(game.player.x, game.player.y, "ЩИТ АКТИВИРОВАН!", false);
}

// ============ УПРАВЛЕНИЕ ============

document.addEventListener('keydown', (e) => {
    game.keys[e.key.toLowerCase()] = true;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    if (e.key === ' ') {
        activateShield();
    }
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (game.running || game.paused) {
            togglePause();
        }
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
});

// ============ ПАУЗА ============

function togglePause() {
    if (!game.running && !game.paused) return;
    
    game.paused = !game.paused;
    
    const pauseModal = document.getElementById('pauseModal');
    
    if (game.paused) {
        game.pauseTime = Date.now();
        pauseModal.classList.remove('hidden');
        updatePauseStats();
    } else {
        pauseModal.classList.add('hidden');
        
        const pauseDuration = Date.now() - game.pauseTime;
        game.enemies.forEach(enemy => {
            enemy.lastAttack += pauseDuration;
        });
        game.lastPlayerPhrase += pauseDuration;
        game.lastEnemyPhrase += pauseDuration;
        
        gameLoop();
    }
}

function updatePauseStats() {
    const form = FORMS[game.player.formIndex];
    document.getElementById('pauseTemp').textContent = Math.floor(game.temperature).toLocaleString() + '°C';
    document.getElementById('pauseForm').textContent = form.name;
    document.getElementById('pauseHealth').textContent = Math.floor(game.player.health) + '/' + game.player.maxHealth;
    document.getElementById('pauseCoins').textContent = game.sessionCoins;
    
    const playTime = Math.floor((Date.now() - game.startTime) / 1000);
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    document.getElementById('pauseTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function restartFromPause() {
    document.getElementById('pauseModal').classList.add('hidden');
    game.paused = false;
    game.running = false;
    startGame();
}

function quitToMenu() {
    document.getElementById('pauseModal').classList.add('hidden');
    game.paused = false;
    game.running = false;
    
    saveData.coins += game.sessionCoins;
    saveSave();
    
    document.getElementById('pauseBtn').classList.remove('visible');
    goToMenu();
}

// ============ ФРАЗЫ ============

// Фразы игрока (со звуками и без)
const PLAYER_PHRASES = [
    { text: "Я уже красный!", hasSound: true },
    { text: "Ещё посидим, нормально", hasSound: true },
    { text: "Нормально, терпимо!", hasSound: true },
];

// Фразы врагов (со звуками и без)
const ENEMY_PHRASES = [
    { text: "Ты бл*дь, д*лбаёб нах*й?", hasSound: true },
    { text: "Омайгад", hasSound: true },
];

// ============ ФОРМЫ С КАРТИНКАМИ ============

const FORMS = [
    { name: 'Сыр', color: '#ffff00', size: 12, targetTemp: 1000, image: 'sir' },
    { name: 'Ч', color: '#ffffff', size: 18, targetTemp: 5000, image: 'ch' },
    { name: 'Батч', color: '#ffffaa', size: 20, targetTemp: 10000, image: 'batch' },
    { name: 'Дод', color: '#ffa500', size: 22, targetTemp: 50000, image: 'dod' },
    { name: 'Прадод', color: '#ff6b35', size: 24, targetTemp: 150000, image: 'pradod' },
    { name: 'Прапрадод', color: '#ff4500', size: 26, targetTemp: 400000, image: 'prapradod' },
    { name: 'Супер Прапрадод', color: '#ff0000', size: 28, targetTemp: 800000, image: 'omegaSuper' },
    { name: 'Додос', color: '#ff00ff', size: 30, targetTemp: 1500000, image: 'omegaSuper' },
    { name: 'Ультрадодос', color: '#00ffff', size: 32, targetTemp: 3000000, image: 'omegaSuper' },
    { name: 'Ультра Омега Супер Прапрапрадодос', color: '#ffd700', size: 35, targetTemp: Infinity, image: 'omegaSuper' }
];

const DIFFICULTY = [
    { enemies: 1, attackSpeed: 2000, projectileSpeed: 2, projectilesPerAttack: 1, damage: 3, patterns: ['aimed'], specialAttackChance: 0, enemyMoveSpeed: 0.01 },
    { enemies: 1, attackSpeed: 1600, projectileSpeed: 2.5, projectilesPerAttack: 2, damage: 5, patterns: ['aimed', 'spread3'], specialAttackChance: 0.1, enemyMoveSpeed: 0.015 },
    { enemies: 2, attackSpeed: 1400, projectileSpeed: 3, projectilesPerAttack: 2, damage: 7, patterns: ['aimed', 'spread3', 'circle'], specialAttackChance: 0.15, enemyMoveSpeed: 0.02 },
    { enemies: 2, attackSpeed: 1200, projectileSpeed: 3.5, projectilesPerAttack: 3, damage: 8, patterns: ['aimed', 'spread5', 'circle', 'wave'], specialAttackChance: 0.2, enemyMoveSpeed: 0.025 },
    { enemies: 3, attackSpeed: 1000, projectileSpeed: 4, projectilesPerAttack: 3, damage: 10, patterns: ['spread5', 'circle', 'wave', 'spiral'], specialAttackChance: 0.25, enemyMoveSpeed: 0.03 },
    { enemies: 3, attackSpeed: 800, projectileSpeed: 4.5, projectilesPerAttack: 4, damage: 12, patterns: ['spread5', 'circle', 'wave', 'spiral', 'cross'], specialAttackChance: 0.3, enemyMoveSpeed: 0.035 },
    { enemies: 4, attackSpeed: 600, projectileSpeed: 5, projectilesPerAttack: 4, damage: 15, patterns: ['circle', 'wave', 'spiral', 'cross', 'burst'], specialAttackChance: 0.35, enemyMoveSpeed: 0.04 },
    { enemies: 4, attackSpeed: 450, projectileSpeed: 5.5, projectilesPerAttack: 5, damage: 18, patterns: ['spiral', 'cross', 'burst', 'chaos'], specialAttackChance: 0.4, enemyMoveSpeed: 0.045 },
    { enemies: 5, attackSpeed: 300, projectileSpeed: 6, projectilesPerAttack: 6, damage: 21, patterns: ['chaos', 'apocalypse'], specialAttackChance: 0.5, enemyMoveSpeed: 0.05 }
];

const ENEMY_TYPES = [
    { name: 'Дод', image: 'dod', color: '#8b4513' },
    { name: 'Прадод', image: 'pradod', color: '#654321' },
    { name: 'Прапрадод', image: 'prapradod', color: '#4a3520' },
    { name: 'Супер Прапрадод', image: 'omegaSuper', color: '#3d2914' },
    { name: 'Додос', image: 'dod', color: '#2d1f0f' },
    { name: 'Ультрадодос', image: 'pradod', color: '#1a1209' },
    { name: 'Ультра Омега', image: 'prapradod', color: '#0a0604' },
    { name: 'БОСС БАНИ', image: 'omegaSuper', color: '#000000' },
    { name: 'БОГ ПАРА', image: 'omegaSuper', color: '#220000' }
];

let game = {
    running: false,
    paused: false,
    player: null,
    temperature: 0,
    enemies: [],
    projectiles: [],
    particles: [],
    keys: {},
    tempRate: 10,
    screenShake: 0,
    lastPlayerPhrase: 0,
    lastEnemyPhrase: 0,
    sessionCoins: 0,
    shieldActive: 0,
    shieldCooldown: 0,
    startTime: 0,
    pauseTime: 0
};

// ============ РЕЧЕВЫЕ ПУЗЫРИ СО ЗВУКОМ ============

function showSpeechBubble(x, y, text, isEnemy = false) {
    const container = document.getElementById('speechContainer');
    const bubble = document.createElement('div');
    bubble.className = `speech-bubble ${isEnemy ? 'enemy' : ''}`;
    bubble.textContent = text;
    
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    bubble.style.left = `${x / scaleX - 30}px`;
    bubble.style.top = `${y / scaleY - 50}px`;
    
    container.appendChild(bubble);
    
    // Воспроизведение звука для фразы
    const sound = getSoundForPhrase(text);
    if (sound) {
        playSound(sound);
    }
    
    setTimeout(() => {
        bubble.style.animation = 'bubbleFade 0.5s ease-out forwards';
        setTimeout(() => bubble.remove(), 500);
    }, 2000);
}

function showCoinPopup(x, y, amount) {
    const container = document.getElementById('coinContainer');
    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.textContent = `+${amount} 💰`;
    
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    popup.style.left = `${x / scaleX}px`;
    popup.style.top = `${y / scaleY}px`;
    
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function playerSpeak() {
    if (!game.running || game.paused) return;
    const phraseObj = PLAYER_PHRASES[Math.floor(Math.random() * PLAYER_PHRASES.length)];
    showSpeechBubble(game.player.x, game.player.y, phraseObj.text, false);
}

function enemySpeak(enemy) {
    if (!game.running || game.paused) return;
    const phraseObj = ENEMY_PHRASES[Math.floor(Math.random() * ENEMY_PHRASES.length)];
    showSpeechBubble(enemy.x, enemy.y, phraseObj.text, true);
}

function goToMenu() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    document.getElementById('pauseBtn').classList.remove('visible');
    updateShopUI();
}

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    document.getElementById('gameScreen').classList.add('flex');
    document.getElementById('pauseBtn').classList.add('visible');
    
    document.getElementById('speechContainer').innerHTML = '';
    document.getElementById('coinContainer').innerHTML = '';
    
    const maxHP = getMaxHealth();
    
    game = {
        running: true,
        paused: false,
        player: { x: 100, y: 250, vx: 0, vy: 0, health: maxHP, maxHealth: maxHP, formIndex: 0, invincible: 0 },
        temperature: 0,
        enemies: [],
        projectiles: [],
        particles: [],
        keys: {},
        tempRate: 50,
        screenShake: 0,
        lastPlayerPhrase: Date.now(),
        lastEnemyPhrase: Date.now(),
        sessionCoins: 0,
        shieldActive: 0,
        shieldCooldown: 0,
        startTime: Date.now(),
        pauseTime: 0
    };
    
    document.getElementById('shieldBtn').classList.remove('on-cooldown');
    
    spawnEnemies();
    updateUI();
    gameLoop();
    
    setTimeout(() => playerSpeak(), 1000);
}

function spawnEnemies() {
    game.enemies = [];
    const diff = DIFFICULTY[Math.min(game.player.formIndex, DIFFICULTY.length - 1)];
    const enemyType = ENEMY_TYPES[Math.min(game.player.formIndex, ENEMY_TYPES.length - 1)];
    document.getElementById('enemyInfo').textContent = "Текущий враг: " + enemyType.name;
    for (let i = 0; i < diff.enemies; i++) {
        game.enemies.push({
            x: canvas.width - 80,
            y: 100 + (i * (canvas.height - 200) / Math.max(1, diff.enemies - 1)),
            targetY: 100 + Math.random() * (canvas.height - 200),
            lastAttack: Date.now() + i * 500,
            type: enemyType,
            size: 35 + game.player.formIndex * 3,
            angle: 0
        });
    }
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
    startGame();
}

function updateUI() {
    const form = FORMS[game.player.formIndex];
    document.getElementById('playerForm').textContent = form.name;
    document.getElementById('temperature').textContent = Math.floor(game.temperature).toLocaleString();
    document.getElementById('health').textContent = Math.max(0, Math.floor(game.player.health));
    document.getElementById('coins').textContent = game.sessionCoins;
    
    const shieldStatus = document.getElementById('shieldStatus');
    const shieldBtn = document.getElementById('shieldBtn');
    if (game.shieldActive > 0) {
        shieldStatus.textContent = `${Math.ceil(game.shieldActive / 60)}с`;
        shieldStatus.className = 'text-green-300';
    } else if (game.shieldCooldown > 0) {
        shieldStatus.textContent = `${Math.ceil(game.shieldCooldown / 60)}с`;
        shieldStatus.className = 'text-gray-500';
        shieldBtn.classList.add('on-cooldown');
    } else {
        shieldStatus.textContent = 'Готов';
        shieldStatus.className = 'text-cyan-300';
        shieldBtn.classList.remove('on-cooldown');
    }
    
    const progress = (game.temperature / form.targetTemp) * 100;
    document.getElementById('tempBar').style.width = Math.min(100, progress) + '%';
    document.getElementById('nextForm').textContent = form.targetTemp === Infinity ? '∞' : form.targetTemp.toLocaleString() + '°C';
    
    const maxStars = DIFFICULTY.length;
    const filledStars = Math.min(game.player.formIndex + 1, maxStars);
    const emptyStars = Math.max(0, maxStars - filledStars);
    const stars = '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
    
    document.getElementById('difficultyInfo').textContent = `Сложность: ${stars}`;
}

function gameLoop() {
    if (!game.running || game.paused) return;
    
    update();
    render();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

function createAttackPattern(enemy, pattern, diff) {
    const angle = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x);
    
    switch(pattern) {
        case 'aimed':
            game.projectiles.push(createProjectile(enemy.x, enemy.y, angle, diff));
            break;
        case 'spread3':
            for (let i = -1; i <= 1; i++) {
                game.projectiles.push(createProjectile(enemy.x, enemy.y, angle + i * 0.3, diff));
            }
            break;
        case 'spread5':
            for (let i = -2; i <= 2; i++) {
                game.projectiles.push(createProjectile(enemy.x, enemy.y, angle + i * 0.25, diff));
            }
            break;
        case 'circle':
            for (let i = 0; i < 8; i++) {
                game.projectiles.push(createProjectile(enemy.x, enemy.y, (Math.PI * 2 / 8) * i, diff));
            }
            break;
        case 'wave':
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (game.running && !game.paused) {
                        game.projectiles.push(createProjectile(enemy.x, enemy.y, angle + Math.sin(Date.now() / 100) * 0.5, diff));
                    }
                }, i * 100);
            }
            break;
        case 'spiral':
            enemy.angle = (enemy.angle || 0) + 0.5;
            for (let i = 0; i < 3; i++) {
                game.projectiles.push(createProjectile(enemy.x, enemy.y, enemy.angle + (Math.PI * 2 / 3) * i, diff));
            }
            break;
        case 'cross':
            for (let i = 0; i < 4; i++) {
                const crossAngle = (Math.PI / 2) * i;
                for (let j = 0; j < 3; j++) {
                    setTimeout(() => {
                        if (game.running && !game.paused) {
                            game.projectiles.push(createProjectile(enemy.x, enemy.y, crossAngle, diff));
                        }
                    }, j * 150);
                }
            }
            break;
        case 'burst':
            for (let i = 0; i < 12; i++) {
                game.projectiles.push(createProjectile(enemy.x, enemy.y, (Math.PI * 2 / 12) * i, diff));
            }
            setTimeout(() => {
                if (game.running && !game.paused) {
                    for (let i = 0; i < 12; i++) {
                        game.projectiles.push(createProjectile(enemy.x, enemy.y, (Math.PI * 2 / 12) * i + 0.26, diff));
                    }
                }
            }, 200);
            break;
        case 'chaos':
            for (let i = 0; i < 8; i++) {
                const chaosAngle = Math.random() * Math.PI * 2;
                game.projectiles.push(createProjectile(enemy.x, enemy.y, chaosAngle, diff));
            }
            break;
        case 'apocalypse':
            for (let i = 0; i < 16; i++) {
                game.projectiles.push(createProjectile(enemy.x, enemy.y, (Math.PI * 2 / 16) * i, diff));
            }
            for (let wave = 1; wave <= 3; wave++) {
                setTimeout(() => {
                    if (game.running && !game.paused) {
                        for (let i = 0; i < 16; i++) {
                            game.projectiles.push(createProjectile(enemy.x, enemy.y, (Math.PI * 2 / 16) * i + wave * 0.2, diff));
                        }
                    }
                }, wave * 150);
            }
            break;
    }
}

function createProjectile(x, y, angle, diff) {
    return {
        x: x,
        y: y,
        vx: Math.cos(angle) * diff.projectileSpeed,
        vy: Math.sin(angle) * diff.projectileSpeed,
        size: 6 + game.player.formIndex,
        damage: diff.damage
    };
}

function update() {
    const form = FORMS[game.player.formIndex];
    const diff = DIFFICULTY[Math.min(game.player.formIndex, DIFFICULTY.length - 1)];
    
    if (game.shieldActive > 0) game.shieldActive--;
    if (game.shieldCooldown > 0) game.shieldCooldown--;
    
    const speed = 5 + game.player.formIndex * 0.3;
    
    let inputX = 0;
    let inputY = 0;
    
    if (game.keys['w'] || game.keys['arrowup']) inputY = -1;
    else if (game.keys['s'] || game.keys['arrowdown']) inputY = 1;
    
    if (game.keys['a'] || game.keys['arrowleft']) inputX = -1;
    else if (game.keys['d'] || game.keys['arrowright']) inputX = 1;
    
    if (joystick.active || Math.abs(joystick.moveX) > 0.1 || Math.abs(joystick.moveY) > 0.1) {
        inputX = joystick.moveX;
        inputY = joystick.moveY;
    }
    
    if (Math.abs(inputX) > 0.1) {
        game.player.vx = inputX * speed;
    } else {
        game.player.vx *= 0.85;
    }
    
    if (Math.abs(inputY) > 0.1) {
        game.player.vy = inputY * speed;
    } else {
        game.player.vy *= 0.85;
    }
    
    game.player.x += game.player.vx;
    game.player.y += game.player.vy;
    
    game.player.x = Math.max(form.size, Math.min(canvas.width - form.size - 150, game.player.x));
    game.player.y = Math.max(form.size, Math.min(canvas.height - form.size, game.player.y));
    
    const xpBonus = getXPMultiplier();
    game.temperature += ((game.tempRate + game.player.formIndex * 25) / 60) * xpBonus;
    
    if (Math.random() < 0.02 + game.player.formIndex * 0.01) {
        const coinAmount = 1 + game.player.formIndex;
        game.sessionCoins += coinAmount;
        showCoinPopup(game.player.x + (Math.random() - 0.5) * 30, game.player.y - 20, coinAmount);
    }
    
    if (Date.now() - game.lastPlayerPhrase > 3000 + Math.random() * 3000) {
        game.lastPlayerPhrase = Date.now();
        playerSpeak();
    }
    
    if (game.temperature >= form.targetTemp) {
        if (game.player.formIndex < FORMS.length - 1) {
            game.player.formIndex++;
            game.player.invincible = 180;
            game.player.health = Math.min(game.player.maxHealth, game.player.health + 30);
            game.tempRate *= 1.8;
            
            const bonusCoins = 20 + game.player.formIndex * 15;
            game.sessionCoins += bonusCoins;
            showCoinPopup(game.player.x, game.player.y - 40, bonusCoins);
            
            spawnEnemies();
            
            for (let i = 0; i < 50; i++) {
                game.particles.push({
                    x: game.player.x,
                    y: game.player.y,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    life: 90,
                    color: FORMS[game.player.formIndex].color
                });
            }
            
            game.screenShake = 20;
            
            setTimeout(() => {
                if (game.running) {
                    showSpeechBubble(game.player.x, game.player.y, "Ч ЭВОЛЮЦИОНИРУЮ!", false);
                }
            }, 100);
            
            if (game.player.formIndex === FORMS.length - 1) {
                setTimeout(() => {
                    game.running = false;
                    game.sessionCoins += 500;
                    saveData.coins += game.sessionCoins;
                    saveSave();
                    document.getElementById('gameScreen').classList.add('hidden');
                    document.getElementById('victoryScreen').classList.remove('hidden');
                }, 2000);
            }
        }
    }
    
    game.enemies.forEach((enemy, idx) => {
        if (Math.abs(enemy.y - enemy.targetY) < 10) {
            enemy.targetY = 50 + Math.random() * (canvas.height - 100);
        }
        enemy.y += (enemy.targetY - enemy.y) * diff.enemyMoveSpeed;
        
        if (game.player.formIndex >= 4) {
            enemy.x = canvas.width - 80 + Math.sin(Date.now() / 500 + idx) * 30;
        }
        
        if (Date.now() - enemy.lastAttack > diff.attackSpeed) {
            enemy.lastAttack = Date.now();
            
            const patterns = diff.patterns;
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            createAttackPattern(enemy, pattern, diff);
            
            if (Math.random() < 0.15 && Date.now() - game.lastEnemyPhrase > 2000) {
                game.lastEnemyPhrase = Date.now();
                enemySpeak(enemy);
            }
            
            if (Math.random() < diff.specialAttackChance) {
                setTimeout(() => {
                    if (game.running) {
                        const specialPattern = patterns[patterns.length - 1];
                        createAttackPattern(enemy, specialPattern, diff);
                    }
                }, 300);
            }
        }
    });
    
    game.projectiles = game.projectiles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (game.player.invincible <= 0 && game.shieldActive <= 0) {
            const dx = p.x - game.player.x;
            const dy = p.y - game.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < form.size + p.size) {
                if (game.player.health - p.damage >= 0) {
                    game.player.health -= p.damage;
                } else {
                    game.player.health = 0;
                }
                game.player.invincible = 20;
                game.screenShake = 10;
                
                if (Math.random() < 0.25) {
                    const hitPhrases = ["Ай, бл*ть!", "Сука!", "Больно!", "П*здец!"];
                    showSpeechBubble(game.player.x, game.player.y, hitPhrases[Math.floor(Math.random() * hitPhrases.length)], false);
                }
                
                for (let i = 0; i < 15; i++) {
                    game.particles.push({
                        x: game.player.x,
                        y: game.player.y,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 30,
                        color: '#ff0000'
                    });
                }
                
                if (game.player.health <= 0) {
                    gameOver();
                }
                return false;
            }
        } else if (game.shieldActive > 0) {
            const dx = p.x - game.player.x;
            const dy = p.y - game.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < form.size + 20) {
                for (let i = 0; i < 5; i++) {
                    game.particles.push({
                        x: p.x,
                        y: p.y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 20,
                        color: '#00bfff'
                    });
                }
                return false;
            }
        }
        
        return p.x > -50 && p.x < canvas.width + 50 && p.y > -50 && p.y < canvas.height + 50;
    });
    
    game.particles = game.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;
        return p.life > 0;
    });
    
    if (game.player.invincible > 0) game.player.invincible--;
    if (game.screenShake > 0) game.screenShake--;
}

// ============ РЕНДЕРИНГ С КАРТИНКАМИ ============

function render() {
    ctx.save();
    if (game.screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * game.screenShake,
            (Math.random() - 0.5) * game.screenShake
        );
    }
    
    const heat = Math.min(1, game.temperature / 1000000);
    const formHeat = game.player.formIndex / 8;
    ctx.fillStyle = `rgb(${40 + (heat + formHeat) * 80}, ${20 - heat * 15}, ${20 - heat * 15})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = `rgba(255, 0, 0, ${0.05 + formHeat * 0.1})`;
    ctx.fillRect(canvas.width - 200, 0, 200, canvas.height);
    
    const steamCount = 3 + game.player.formIndex * 2;
    for (let i = 0; i < steamCount; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + heat * 0.08})`;
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            15 + Math.random() * 40,
            0, Math.PI * 2
        );
        ctx.fill();
    }
    
    game.particles.forEach(p => {
        ctx.globalAlpha = p.life / 90;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + (90 - p.life) / 20, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    game.projectiles.forEach(p => {
        ctx.shadowColor = '#ff4500';
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    });
    
    // ============ ОТРИСОВКА ВРАГОВ С КАРТИНКАМИ ============
    game.enemies.forEach((enemy, idx) => {
        const pulseSize = Math.sin(Date.now() / 200 + idx) * 3;
        
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20 + game.player.formIndex * 3;
        
        // Фоновый круг/аура врага
        ctx.fillStyle = enemy.type.color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size + pulseSize + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Внутренний огненный круг
        ctx.fillStyle = `rgba(255, 100, 0, 0.6)`;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size + pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Отрисовка изображения врага
        const enemyImage = IMAGES[enemy.type.image];
        
        if (enemyImage && enemyImage.complete && enemyImage.naturalWidth > 0) {
            const imgSize = enemy.size * 2.2;
            
            // Круглая маска для картинки
            ctx.save();
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size - 3, 0, Math.PI * 2);
            ctx.clip();
            
            ctx.drawImage(
                enemyImage,
                enemy.x - imgSize / 2,
                enemy.y - imgSize / 2,
                imgSize,
                imgSize
            );
            ctx.restore();
            
            // Огненная обводка вокруг картинки
            ctx.strokeStyle = '#ff4500';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size - 2, 0, Math.PI * 2);
            ctx.stroke();
            
            // Дополнительное свечение для высоких уровней
            if (game.player.formIndex >= 4) {
                ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size + 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        } else {
            // Fallback - рисуем круг с именем если картинка не загружена
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${12 + game.player.formIndex}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(enemy.type.name.charAt(0), enemy.x, enemy.y);
        }
        
        ctx.shadowBlur = 0;
    });
    
    const form = FORMS[game.player.formIndex];
    
    if (game.player.invincible <= 0 || Math.floor(game.player.invincible / 4) % 2 === 0) {
        // Эффект щита
        if (game.shieldActive > 0) {
            ctx.shadowColor = '#00bfff';
            ctx.shadowBlur = 30;
            ctx.strokeStyle = '#00bfff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, form.size + 15 + Math.sin(Date.now() / 50) * 3, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, form.size + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.shadowColor = form.color;
        ctx.shadowBlur = 20 + game.player.formIndex * 5;
        
        // Аура для высоких форм
        if (game.player.formIndex >= 3) {
            ctx.strokeStyle = form.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, form.size + 8 + Math.sin(Date.now() / 100) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // ============ ОТРИСОВКА ПЕРСОНАЖА С КАРТИНКОЙ ============
        const playerImage = IMAGES[form.image];
        
        if (playerImage && playerImage.complete && playerImage.naturalWidth > 0) {
            // Рисуем картинку
            const imgSize = form.size * 3;
            
            // Круглая маска для картинки
            ctx.save();
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, form.size + 5, 0, Math.PI * 2);
            ctx.clip();
            
            ctx.drawImage(
                playerImage,
                game.player.x - imgSize / 2,
                game.player.y - imgSize / 2,
                imgSize,
                imgSize
            );
            ctx.restore();
            
            // Обводка вокруг картинки
            ctx.strokeStyle = form.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, form.size + 5, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Fallback - рисуем круг если картинка не загружена
            ctx.fillStyle = form.color;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, form.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.font = `bold ${Math.min(form.size - 4, 12)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const displayName = form.name.length > 8 ? form.name.substring(0, 7) + '..' : form.name;
            ctx.fillText(displayName, game.player.x, game.player.y);
        }
        
        ctx.shadowBlur = 0;
    }
    
    // Полоса здоровья
    ctx.fillStyle = '#333';
    ctx.fillRect(10, 10, 150, 15);
    const healthColor = game.player.health > game.player.maxHealth * 0.5 ? '#00ff00' : game.player.health > game.player.maxHealth * 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(10, 10, Math.max(0, (game.player.health / game.player.maxHealth) * 150), 15);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 150, 15);
    
    ctx.fillStyle = '#fff';
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(game.player.health)}/${game.player.maxHealth}`, 85, 22);
    
    ctx.textAlign = 'left';
    ctx.font = '10px "Press Start 2P"';
    ctx.fillText(`🌡️ ${Math.floor(game.temperature).toLocaleString()}°C`, 10, 42);
    
    ctx.fillStyle = form.color;
    ctx.fillText(`${form.name}`, 10, 58);
    
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`💰 ${game.sessionCoins}`, 10, 74);
    
    if (game.shieldCooldown > 0 && game.shieldActive <= 0) {
        ctx.fillStyle = '#888';
        ctx.fillText(`🛡️ ${Math.ceil(game.shieldCooldown / 60)}с`, canvas.width - 100, 20);
    } else if (game.shieldActive > 0) {
        ctx.fillStyle = '#00bfff';
        ctx.fillText(`🛡️ ${Math.ceil(game.shieldActive / 60)}с`, canvas.width - 100, 20);
    } else {
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`🛡️ ГОТОВ`, canvas.width - 100, 20);
    }
    
    ctx.restore();
}

function gameOver() {
    game.running = false;
    
    showSpeechBubble(game.player.x, game.player.y, "Ч СГОРЕЛ!!!", false);
    
    saveData.coins += game.sessionCoins;
    saveSave();
    
    setTimeout(() => {
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalForm').textContent = FORMS[game.player.formIndex].name;
        document.getElementById('finalTemp').textContent = Math.floor(game.temperature).toLocaleString();
        document.getElementById('earnedCoins').textContent = game.sessionCoins;
        document.getElementById('finalLevel').textContent = `${game.player.formIndex + 1}/${FORMS.length}`;
    }, 500);
}

// Steam effects
function createSteam() {
    if (!game.running) return;
    
    const container = document.getElementById('steamContainer');
    const steam = document.createElement('div');
    steam.className = 'steam';
    steam.style.left = Math.random() * 100 + '%';
    steam.style.bottom = '0';
    steam.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(steam);
    
    setTimeout(() => steam.remove(), 2000);
}

setInterval(createSteam, 300);

// Load save on start
loadSave();

document.body.addEventListener('touchstart', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        // Don't prevent default for buttons
    }
}, { passive: true });