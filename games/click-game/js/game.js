// 初始化分数
let score = 0;

// 获取DOM元素
const clickBtn = document.getElementById('clickBtn');
const resetBtn = document.getElementById('resetBtn');
const scoreDisplay = document.getElementById('score');

// 点击按钮计分
clickBtn.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = score;
    // 添加点击动画效果
    clickBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        clickBtn.style.transform = 'scale(1)';
    }, 100);
});

// 重置分数
resetBtn.addEventListener('click', () => {
    score = 0;
    scoreDisplay.textContent = score;
});
