// 游戏元素
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const playerHealthDisplay = document.getElementById('player-health');
const scoreDisplay = document.getElementById('score');
const bombsDisplay = document.getElementById('bombs');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// 游戏状态
let gameState = {
    isRunning: false,
    player: {
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        speed: 5,
        health: 100
    },
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        j: false,
        k: false
    },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    bombs: 3,
    score: 0,
    lastEnemySpawn: 0,
    enemySpawnRate: 1000, // 敌人生成间隔(毫秒)
    lastShot: 0,
    fireRate: 200, // 射击间隔(毫秒)
    enemyShootInterval: 2000, // 敌人射击间隔
    lastEnemyShot: 0
};

// 初始化游戏
function initGame() {
    // 设置玩家初始位置
    gameState.player.x = (gameContainer.clientWidth - gameState.player.width) / 2;
    gameState.player.y = gameContainer.clientHeight - gameState.player.height - 20;
    player.style.left = `${gameState.player.x}px`;
    player.style.top = `${gameState.player.y}px`;
    
    // 重置游戏状态
    gameState.isRunning = true;
    gameState.bullets = [];
    gameState.enemyBullets = [];
    gameState.enemies = [];
    gameState.bombs = 3;
    gameState.score = 0;
    gameState.player.health = 100;
    
    // 更新显示
    playerHealthDisplay.textContent = gameState.player.health;
    scoreDisplay.textContent = gameState.score;
    bombsDisplay.textContent = gameState.bombs;
    gameOverScreen.style.display = 'none';
    
    // 清除所有敌人和子弹
    document.querySelectorAll('.enemy, .player-bullet, .enemy-bullet, .bomb-effect').forEach(el => {
        el.remove();
    });
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 游戏主循环
function gameLoop(timestamp) {
    if (!gameState.isRunning) return;
    
    // 处理玩家移动
    handlePlayerMovement();
    
    // 处理射击
    if (gameState.keys.j && timestamp - gameState.lastShot > gameState.fireRate) {
        fireBullet();
        gameState.lastShot = timestamp;
    }
    
    // 生成敌人
    if (timestamp - gameState.lastEnemySpawn > gameState.enemySpawnRate) {
        spawnEnemy();
        gameState.lastEnemySpawn = timestamp;
        
        // 逐渐提高难度
        if (gameState.enemySpawnRate > 300) {
            gameState.enemySpawnRate -= 5;
        }
    }
    
    // 敌人射击
    if (timestamp - gameState.lastEnemyShot > gameState.enemyShootInterval && gameState.enemies.length > 0) {
        enemiesShoot();
        gameState.lastEnemyShot = timestamp;
    }
    
    // 更新子弹
    updateBullets();
    
    // 更新敌人
    updateEnemies();
    
    // 检测碰撞
    checkCollisions();
    
    // 继续游戏循环
    requestAnimationFrame(gameLoop);
}

// 处理玩家移动
function handlePlayerMovement() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    
    if (gameState.keys.w && gameState.player.y > 0) {
        gameState.player.y -= gameState.player.speed;
    }
    if (gameState.keys.s && gameState.player.y < containerHeight - gameState.player.height) {
        gameState.player.y += gameState.player.speed;
    }
    if (gameState.keys.a && gameState.player.x > 0) {
        gameState.player.x -= gameState.player.speed;
    }
    if (gameState.keys.d && gameState.player.x < containerWidth - gameState.player.width) {
        gameState.player.x += gameState.player.speed;
    }
    
    // 更新玩家位置
    player.style.left = `${gameState.player.x}px`;
    player.style.top = `${gameState.player.y}px`;
}

// 发射子弹
function fireBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'player-bullet';
    bullet.style.left = `${gameState.player.x + gameState.player.width / 2 - 2}px`;
    bullet.style.top = `${gameState.player.y - 12}px`;
    gameContainer.appendChild(bullet);
    
    gameState.bullets.push({
        element: bullet,
        x: gameState.player.x + gameState.player.width / 2 - 2,
        y: gameState.player.y - 12,
        width: 4,
        height: 12,
        speed: 8
    });
}

// 生成敌人
function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    
    // 随机位置
    const x = Math.random() * (gameContainer.clientWidth - 30);
    enemy.style.left = `${x}px`;
    enemy.style.top = '0px';
    gameContainer.appendChild(enemy);
    
    gameState.enemies.push({
        element: enemy,
        x: x,
        y: 0,
        width: 30,
        height: 30,
        health: 50,
        speed: 1 + Math.random() * 1.5 // 随机速度
    });
}

// 敌人射击
function enemiesShoot() {
    // 随机选择一个敌人射击
    const randomEnemyIndex = Math.floor(Math.random() * gameState.enemies.length);
    const enemy = gameState.enemies[randomEnemyIndex];
    
    if (enemy) {
        const bullet = document.createElement('div');
        bullet.className = 'enemy-bullet';
        bullet.style.left = `${enemy.x + enemy.width / 2 - 2}px`;
        bullet.style.top = `${enemy.y + enemy.height}px`;
        gameContainer.appendChild(bullet);
        
        gameState.enemyBullets.push({
            element: bullet,
            x: enemy.x + enemy.width / 2 - 2,
            y: enemy.y + enemy.height,
            width: 4,
            height: 12,
            speed: 5
        });
    }
}

// 更新子弹位置
function updateBullets() {
    // 更新玩家子弹
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        bullet.y -= bullet.speed;
        bullet.element.style.top = `${bullet.y}px`;
        
        // 移除超出屏幕的子弹
        if (bullet.y < 0) {
            bullet.element.remove();
            gameState.bullets.splice(i, 1);
        }
    }
    
    // 更新敌人子弹
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        bullet.y += bullet.speed;
        bullet.element.style.top = `${bullet.y}px`;
        
        // 移除超出屏幕的子弹
        if (bullet.y > gameContainer.clientHeight) {
            bullet.element.remove();
            gameState.enemyBullets.splice(i, 1);
        }
    }
}

// 更新敌人位置
function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        enemy.y += enemy.speed;
        enemy.element.style.top = `${enemy.y}px`;
        
        // 移除超出屏幕的敌人
        if (enemy.y > gameContainer.clientHeight) {
            enemy.element.remove();
            gameState.enemies.splice(i, 1);
            
            // 敌人逃脱，减少玩家生命值
            gameState.player.health -= 10;
            playerHealthDisplay.textContent = gameState.player.health;
            
            checkGameOver();
        }
    }
}

// 检测碰撞
function checkCollisions() {
    // 玩家子弹与敌人碰撞
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.bullets[i];
        
        for (let j = gameState.enemies.length - 1; j >= 0; j--) {
            const enemy = gameState.enemies[j];
            
            if (isColliding(bullet, enemy)) {
                // 敌人受伤
                enemy.health -= 20;
                
                // 敌人生命值为0时消灭敌人
                if (enemy.health <= 0) {
                    enemy.element.remove();
                    gameState.enemies.splice(j, 1);
                    
                    // 增加分数
                    gameState.score += 100;
                    scoreDisplay.textContent = gameState.score;
                    
                    // 随机掉落炸弹
                    if (Math.random() < 0.1) {
                        gameState.bombs++;
                        bombsDisplay.textContent = gameState.bombs;
                    }
                }
                
                // 移除子弹
                bullet.element.remove();
                gameState.bullets.splice(i, 1);
                break;
            }
        }
    }
    
    // 敌人子弹与玩家碰撞
    for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
        const bullet = gameState.enemyBullets[i];
        
        if (isColliding(bullet, gameState.player)) {
            // 玩家受伤
            gameState.player.health -= 20;
            playerHealthDisplay.textContent = gameState.player.health;
            
            // 移除子弹
            bullet.element.remove();
            gameState.enemyBullets.splice(i, 1);
            
            checkGameOver();
            break;
        }
    }
}

// 碰撞检测函数
function isColliding(a, b) {
    return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
}

// 使用炸弹
function useBomb() {
    if (gameState.bombs > 0 && gameState.isRunning) {
        gameState.bombs--;
        bombsDisplay.textContent = gameState.bombs;
        
        // 创建炸弹效果
        const bombEffect = document.createElement('div');
        bombEffect.className = 'bomb-effect';
        bombEffect.style.left = `${gameState.player.x + gameState.player.width / 2}px`;
        bombEffect.style.top = `${gameState.player.y + gameState.player.height / 2}px`;
        gameContainer.appendChild(bombEffect);
        
        // 移除炸弹范围内的所有敌人
        for (let i = gameState.enemies.length - 1; i >= 0; i--) {
            const enemy = gameState.enemies[i];
            const distance = Math.hypot(
                enemy.x + enemy.width / 2 - (gameState.player.x + gameState.player.width / 2),
                enemy.y + enemy.height / 2 - (gameState.player.y + gameState.player.height / 2)
            );
            
            if (distance < 100) { // 炸弹范围
                enemy.element.remove();
                gameState.enemies.splice(i, 1);
                
                // 增加分数
                gameState.score += 100;
                scoreDisplay.textContent = gameState.score;
            }
        }
        
        // 移除炸弹范围内的敌人子弹
        for (let i = gameState.enemyBullets.length - 1; i >= 0; i--) {
            const bullet = gameState.enemyBullets[i];
            const distance = Math.hypot(
                bullet.x + bullet.width / 2 - (gameState.player.x + gameState.player.width / 2),
                bullet.y + bullet.height / 2 - (gameState.player.y + gameState.player.height / 2)
            );
            
            if (distance < 100) { // 炸弹范围
                bullet.element.remove();
                gameState.enemyBullets.splice(i, 1);
            }
        }
        
        // 一段时间后移除炸弹效果元素
        setTimeout(() => {
            bombEffect.remove();
        }, 500);
    }
}

// 检查游戏是否结束
function checkGameOver() {
    if (gameState.player.health <= 0) {
        gameState.isRunning = false;
        finalScoreDisplay.textContent = gameState.score;
        gameOverScreen.style.display = 'block';
    }
}

// 键盘事件监听
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w':
            gameState.keys.w = true;
            break;
        case 'a':
            gameState.keys.a = true;
            break;
        case 's':
            gameState.keys.s = true;
            break;
        case 'd':
            gameState.keys.d = true;
            break;
        case 'j':
            gameState.keys.j = true;
            break;
        case 'k':
            gameState.keys.k = true;
            useBomb();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
        case 'w':
            gameState.keys.w = false;
            break;
        case 'a':
            gameState.keys.a = false;
            break;
        case 's':
            gameState.keys.s = false;
            break;
        case 'd':
            gameState.keys.d = false;
            break;
        case 'j':
            gameState.keys.j = false;
            break;
        case 'k':
            gameState.keys.k = false;
            break;
    }
});

// 重新开始按钮事件
restartBtn.addEventListener('click', initGame);

// 初始化游戏
initGame();