// 小球物理引擎
class Ball {
    constructor(x, y, radius, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.mass = radius * radius; // 质量与半径平方成正比
    }
    
    update(width, height) {
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        
        // 边界碰撞检测（与边框反弹）
        if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
            this.vx = -this.vx;
            this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
        }
        
        if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
            this.vy = -this.vy;
            this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + other.radius) {
            // 碰撞发生
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            // 旋转坐标系
            const vx1 = this.vx * cos + this.vy * sin;
            const vy1 = this.vy * cos - this.vx * sin;
            const vx2 = other.vx * cos + other.vy * sin;
            const vy2 = other.vy * cos - other.vx * sin;
            
            // 碰撞后的速度（弹性碰撞）
            const totalMass = this.mass + other.mass;
            const newVx1 = ((this.mass - other.mass) * vx1 + 2 * other.mass * vx2) / totalMass;
            const newVx2 = ((other.mass - this.mass) * vx2 + 2 * this.mass * vx1) / totalMass;
            
            // 旋转回原坐标系
            this.vx = newVx1 * cos - vy1 * sin;
            this.vy = vy1 * cos + newVx1 * sin;
            other.vx = newVx2 * cos - vy2 * sin;
            other.vy = vy2 * cos + newVx2 * sin;
            
            // 分离小球，防止重叠
            const overlap = this.radius + other.radius - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;
            
            this.x -= separationX;
            this.y -= separationY;
            other.x += separationX;
            other.y += separationY;
        }
    }
}

// 初始化Canvas和动画
function initBalls() {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 创建两个小球：低饱和度橙色和青色
    const orangeBall = new Ball(
        canvas.width * 0.3,
        canvas.height * 0.4,
        40,
        'rgba(255, 165, 100, 0.6)', // 低饱和度橙色
        2 + Math.random() * 2,
        1 + Math.random() * 2
    );
    
    const cyanBall = new Ball(
        canvas.width * 0.7,
        canvas.height * 0.6,
        40,
        'rgba(100, 200, 220, 0.6)', // 低饱和度青色
        -2 - Math.random() * 2,
        -1 - Math.random() * 2
    );
    
    const balls = [orangeBall, cyanBall];
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 更新所有小球
        balls.forEach(ball => {
            ball.update(canvas.width, canvas.height);
        });
        
        // 检测小球之间的碰撞
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                balls[i].checkCollision(balls[j]);
            }
        }
        
        // 绘制所有小球
        balls.forEach(ball => {
            ball.draw(ctx);
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// 页面加载时启动动画
window.addEventListener('DOMContentLoaded', function() {
    // 初始化小球动画
    initBalls();
    
    const hiText = document.getElementById('hiText');
    const imText = document.getElementById('imText');
    const isoText = document.getElementById('isoText');
    const typewriterCursor = document.getElementById('typewriterCursor');
    const textIm = "I'm";
    const textIso = "ISO.Hi";
    
    // 开始呼吸闪烁动画
    hiText.classList.add('breathing');
    
    // 1秒一次，总共两次 = 总共2秒
    // 闪烁完成后先移动"Hi, "再开始打字
    setTimeout(() => {
        // 停止闪烁
        hiText.classList.remove('breathing');
        
        // 移动"Hi, "位置
        const lineOne = document.querySelector('.line-one');
        lineOne.classList.add('moved-up');
        
        // 等待移动动画完成后再开始打字（0.6秒动画时间）
        setTimeout(() => {
            // 显示光标
            if (typewriterCursor) {
                typewriterCursor.classList.remove('hidden');
            }
            // 开始打字动画 - 先打 "I'm "
            let index = 0;
            const typeInterval = setInterval(() => {
                if (index < textIm.length) {
                    imText.textContent += textIm[index];
                    index++;
                } else {
                    clearInterval(typeInterval);
                    // 开始打 "ISO.Hi"
                    index = 0;
                    const isoInterval = setInterval(() => {
                        if (index < textIso.length) {
                            isoText.textContent += textIso[index];
                            index++;
                        } else {
                            clearInterval(isoInterval);
                            // 隐藏光标
                            if (typewriterCursor) {
                                typewriterCursor.classList.add('hidden');
                            }
                            // 显示滚动指示器并启用滚动
                            const scrollIndicator = document.getElementById('scrollIndicator');
                            setTimeout(() => {
                                scrollIndicator.classList.add('visible');
                                // 启用页面滚动
                                document.body.classList.add('scroll-enabled');
                            }, 300);
                        }
                    }, 150); // 每个字符间隔150ms
                }
            }, 150); // 每个字符间隔150ms
        }, 600); // 等待移动动画完成
    }, 2000); // 2秒后开始移动（匹配闪烁动画时间）
    
    // 滚动速率限制（50%）
    const scrollSpeedFactor = 0.5;
    let targetScrollTop = 0;
    
    // 在滚动启用前阻止所有滚动尝试
    const preventScroll = (e) => {
        if (!document.body.classList.contains('scroll-enabled')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };
    
    // 限制滚动速率
    let lastTouchY = 0;
    let isTouching = false;
    
    const handleWheel = (e) => {
        if (!document.body.classList.contains('scroll-enabled')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        // 计算目标滚动位置（50%速率）
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const deltaY = e.deltaY;
        const reducedDelta = deltaY * scrollSpeedFactor;
        targetScrollTop = Math.max(0, Math.min(
            document.documentElement.scrollHeight - window.innerHeight,
            currentScroll + reducedDelta
        ));
        
        e.preventDefault();
        window.scrollTo({
            top: targetScrollTop,
            behavior: 'auto'
        });
    };
    
    // 处理触摸滚动
    const handleTouchStart = (e) => {
        if (!document.body.classList.contains('scroll-enabled')) {
            e.preventDefault();
            return false;
        }
        lastTouchY = e.touches[0].clientY;
        isTouching = true;
    };
    
    const handleTouchMove = (e) => {
        if (!document.body.classList.contains('scroll-enabled')) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        
        if (!isTouching) return;
        
        const currentTouchY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentTouchY;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        const reducedDelta = deltaY * scrollSpeedFactor;
        
        targetScrollTop = Math.max(0, Math.min(
            document.documentElement.scrollHeight - window.innerHeight,
            currentScroll + reducedDelta
        ));
        
        e.preventDefault();
        window.scrollTo({
            top: targetScrollTop,
            behavior: 'auto'
        });
        
        lastTouchY = currentTouchY;
    };
    
    const handleTouchEnd = () => {
        isTouching = false;
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // 滚动时逐渐隐藏所有文字（Hi, I'm ISO.Hi），然后在左上角显示 ISO.Hi
    const isoCorner = document.getElementById('isoCorner');
    const thirdLine = document.getElementById('thirdLine');
    const backgroundImageLayer = document.getElementById('backgroundImageLayer');
    const fadeStart = 100; // 开始淡出的滚动位置（像素）
    const fadeEnd = 400; // 完全消失的滚动位置（像素）
    const cornerShowStart = 300; // 开始显示左上角ISO.Hi的滚动位置（像素）
    
    const handleScroll = () => {
        if (!document.body.classList.contains('scroll-enabled')) {
            return; // 如果滚动未启用，直接返回
        }
        
        if (!thirdLine) {
            return; // 如果 thirdLine 元素不存在，直接返回
        }
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            windowHeight * 2
        );
        // 使用实际的文档高度来计算滚动百分比
        const totalScrollableHeight = documentHeight - windowHeight;
        const scrollPercent = totalScrollableHeight > 0 ? scrollTop / totalScrollableHeight : 0;
        
        // 背景图片透明度：滚动到第二页（50%）时完全透明
        if (backgroundImageLayer) {
            if (scrollPercent >= 0.5) {
                // 滚动到50%及以上时，图片完全透明
                backgroundImageLayer.style.opacity = 0;
            } else {
                // 滚动在50%以下时，保持透明度（可以根据滚动位置调整）
                const imageOpacity = Math.max(0, 0.3 * (1 - scrollPercent * 2)); // 从0.3逐渐减少到0
                backgroundImageLayer.style.opacity = imageOpacity;
            }
        }
        
        if (scrollTop >= fadeStart) {
            // 计算 opacity（从 1 逐渐变为 0）
            const scrollProgress = Math.min((scrollTop - fadeStart) / (fadeEnd - fadeStart), 1);
            const opacity = 1 - scrollProgress;
            
            // 所有文字一起消失
            hiText.style.opacity = opacity;
            imText.style.opacity = opacity;
            isoText.style.opacity = opacity;
        } else {
            // 滚动回到顶部时恢复
            hiText.style.opacity = 1;
            imText.style.opacity = 1;
            isoText.style.opacity = 1;
            isoCorner.classList.remove('visible');
        }
        
        // 显示左上角的 ISO.Hi
        if (scrollTop >= cornerShowStart) {
            isoCorner.classList.add('visible');
        } else {
            isoCorner.classList.remove('visible');
        }
        
        // 在滚动到10%的位置开始显示第三行文字（从最底部过渡到目标位置）
        // 调试信息（可在控制台查看）
        // console.log('scrollTop:', scrollTop, 'totalHeight:', totalHeight, 'scrollPercent:', scrollPercent.toFixed(2));
        
        if (scrollPercent >= 0.1) {
            // 计算淡入进度（从10%到100%之间逐渐显示）
            const fadeInProgress = Math.min((scrollPercent - 0.1) / 0.9, 1);
            // 使用非线性缓动函数（ease-in-out cubic-bezier效果）
            const easedProgress = fadeInProgress < 0.5
                ? 4 * fadeInProgress * fadeInProgress * fadeInProgress
                : 1 - Math.pow(-2 * fadeInProgress + 2, 3) / 2;
            
            if (thirdLine) {
                thirdLine.style.opacity = easedProgress;
                // 从最底部（视口高度+100px）移动到目标位置（0）
                const windowHeight = window.innerHeight;
                const startOffset = windowHeight + 100; // 从视口下方100px开始
                const endOffset = 0; // 目标位置
                const currentOffset = startOffset * (1 - easedProgress);
                thirdLine.style.transform = `translateY(${currentOffset}px)`;
                thirdLine.style.transition = 'none'; // 禁用transition，让动画跟随滚动
            }
        } else {
            // 如果滚动回到10%以下，隐藏第三行（回到最底部）
            if (thirdLine) {
                thirdLine.style.opacity = 0;
                const windowHeight = window.innerHeight;
                thirdLine.style.transform = `translateY(${windowHeight + 100}px)`;
                thirdLine.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll);
});

