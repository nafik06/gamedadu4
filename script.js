const diceSound = new Audio("dice_roll.mp3");
const winnerModal = document.getElementById("winnerModal");
const winnerText  = document.getElementById("winnerText");
const btnOk = document.getElementById("btnOk");
const rankingList = document.getElementById("rankingList");
const rankingBox = document.getElementById("rankingBox");
const btnRollAll = document.getElementById("btnRollAll");

btnOk.onclick = () => winnerModal.classList.add("hidden");

class Dice3D {
    constructor(el) {
        this.el = el;
        this.value = 1;
        this.rx = 0; this.ry = 0; this.rz = 0;
    }

    roll(finalValue) {
        this.value = finalValue;
        diceSound.currentTime = 0;
        diceSound.play();

        const start = performance.now();
        const duration = 3000;

        const anim = (now) => {
            if (now - start < duration) {
                this.rx += 40; this.ry += 45; this.rz += 30;
                this.el.style.transform = `rotateX(${this.rx}deg) rotateY(${this.ry}deg) rotateZ(${this.rz}deg)`;
                requestAnimationFrame(anim);
            } else {
                this.el.style.transform = this.getRotation(finalValue);
            }
        };
        requestAnimationFrame(anim);
    }

    getRotation(v) {
        return {
            1: "rotateX(0deg) rotateY(0deg)",
            2: "rotateX(90deg) rotateY(0deg)",
            3: "rotateX(0deg) rotateY(-90deg)",
            4: "rotateX(0deg) rotateY(90deg)",
            5: "rotateX(-90deg) rotateY(0deg)",
            6: "rotateX(0deg) rotateY(180deg)"
        }[v];
    }
}

class Player {
    constructor(id) {
        this.name = `Player ${id}`;
        this.totalScore = 0;
        this.lastRoll = 0;
        this.dice = null;
    }
    
    addScore(val) {
        this.lastRoll = val;
        this.totalScore += val;
    }
}

class Game {
    constructor() {
        this.players = [];
        this.idCounter = 1;
        this.area = document.getElementById("diceArea");
        btnRollAll.onclick = () => this.rollAll();
        this.renderAddButton();
        // Tambahkan ini:
        const btnReset = document.getElementById("btnReset");
        if(btnReset) {
            btnReset.onclick = () => this.resetGame();}

    }
    getPips(v) {
        return { 1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9], 5:[1,3,5,7,9], 6:[1,3,4,6,7,9] }[v];
    }

    createDiceHTML() {
        const faces = ['front','bottom','right','left','top','back'];
        return faces.map((f, i) => {
            const val = i + 1;
            const pips = this.getPips(val);
            let content = "";
            for(let j=1; j<=9; j++) content += pips.includes(j) ? `<span class="pip"></span>` : `<span></span>`;
            return `<div class="face ${f}">${content}</div>`;
        }).join("");
    }

    addPlayer() {
        if (this.players.length >= 6) return;
        
        const p = new Player(this.idCounter++);
        const box = document.createElement("div");
        box.className = "player-box";
        box.innerHTML = `
            <input class="name-input" value="${p.name}">
            <div class="scene"><div class="dice">${this.createDiceHTML()}</div></div>
            <div class="total-score">Total: <span class="score-val">0</span></div>
            <button class="btnDel">Hapus</button>
        `;

        box.querySelector("input").oninput = (e) => p.name = e.target.value;
        box.querySelector(".btnDel").onclick = () => {
            box.remove();
            this.players = this.players.filter(pl => pl !== p);
            this.renderAddButton();
        };

        p.dice = new Dice3D(box.querySelector(".dice"));
        p.scoreEl = box.querySelector(".score-val");
        
        this.players.push(p);
        this.area.insertBefore(box, document.querySelector(".add-wrapper"));
        this.renderAddButton();
    }

    renderAddButton() {
        const existing = document.querySelector(".add-wrapper");
        if (existing) existing.remove();
        if (this.players.length >= 6) return;

        const wrap = document.createElement("div");
        wrap.className = "add-wrapper";
        wrap.innerHTML = `
            <div class="add-placeholder"></div>
            <div class="add-box">+</div>
            <div style="height: 60px"></div>
        `;
        wrap.onclick = () => this.addPlayer();
        this.area.appendChild(wrap);
    }

    rollAll() {
        if (this.players.length === 0) return alert("Tambah pemain dulu!");
        
        rankingBox.classList.add("hidden");
        // HIDE tombol hapus
        document.querySelectorAll(".btnDel").forEach(b => b.classList.add("hidden"));

        this.players.forEach(p => {
            const val = Math.floor(Math.random() * 6) + 1;
            p.addScore(val);
            p.dice.roll(val);
        });

        setTimeout(() => {
            this.showResults();
            // SHOW tombol hapus kembali
            document.querySelectorAll(".btnDel").forEach(b => b.classList.remove("hidden"));
        }, 3200);
    }

    showResults() {
        // Update tampilan skor di box
        this.players.forEach(p => p.scoreEl.textContent = p.totalScore);

        const sorted = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
        
        rankingList.innerHTML = sorted.map((p, i) => `
            <div class="rank-row ${i === 0 ? 'rank-top' : ''}" style="display:flex; justify-content:space-between; padding:8px">
                <span>${p.name}</span>
                <strong>${p.totalScore} poin (Dadu: ${p.lastRoll})</strong>
            </div>
        `).join("");

        const topScore = sorted[0].totalScore;
        const winners = sorted.filter(p => p.totalScore === topScore);

        if (winners.length > 1) {
            winnerText.innerHTML = `<span style="color:#f39c12">SERI!</span><br>Skor tertinggi ${topScore} oleh ${winners.map(w=>w.name).join(", ")}`;
        } else {
            winnerText.innerHTML = `<span style="color:#27ae60">JUARA!</span><br>${winners[0].name} memimpin dengan ${topScore} poin!`;
        }

        rankingBox.classList.remove("hidden");
        winnerModal.classList.remove("hidden");
    }
}

new Game();
