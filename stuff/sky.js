const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let width, height;
let stars = [];
let comets = [];

function rndrange(min, max) { return Math.random() * (max - min) + min; }

function sucanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

class star {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 1.2 + 0.3;
        this.alpha = rndrange(0.5, 0.9);
        this.alphaspeed = rndrange(0.001, 0.007);
        this.alphadirection = Math.random() > 0.5 ? 1 : -1;
    }
    update() {
        this.alpha += this.alphaspeed * this.alphadirection;
        if (this.alpha <= 0.5) {
            this.alpha = 0.5;
            this.alphadirection = 1;
        } else if (this.alpha >= 0.9) {
            this.alpha = 0.9;
            this.alphadirection = -1;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.shadowColor = 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 4;
        ctx.fill();
    }
}

class comet {
    constructor() { this.reset(); }
    reset() {
        this.x = rndrange(-150, 50);
        this.y = rndrange(0, height * 0.5);
        this.length = rndrange(80, 150);
        this.speed = rndrange(3, 6);
        this.size = rndrange(1, 3);
        this.traillength = this.length;
        this.active = true;
    }
    update() {
        this.x += this.speed;
        this.y += this.speed * 0.2;
    }
    draw() {
        let grad = ctx.createLinearGradient(this.x, this.y, this.x - this.traillength, this.y - this.traillength * 0.2);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.traillength, this.y - this.traillength * 0.2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.shadowColor = 'rgba(255,255,255,0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
    }
}

function inistars(count = 150) {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push(new star());
    }
}

function inicomets(count = 1) {
    comets = [];
    for (let i = 0; i < count; i++) {
        comets.push(new comet());
    }
}

let lcomet = 0; const cometi = 5000;

function anim(timestamp) {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => {
        s.update();
        s.draw();
    });

    if (timestamp - lcomet > cometi && comets.length < 2) {
        comets.push(new comet());
        lcomet = timestamp;
    }

    for (let i = comets.length - 1; i >= 0; i--) {
        let c = comets[i];
        c.update();
        c.draw();
        if (c.x > width + 100 || c.y > height + 100) {
            comets.splice(i, 1);
        }
    }
    requestAnimationFrame(anim);
}

function onresz() {
    sucanvas();
    inistars();
    inicomets();
}

window.addEventListener('resize', onresz);
onresz();
requestAnimationFrame(anim);
