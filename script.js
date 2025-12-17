const diceSound = new Audio("dice_roll.mp3");
const winnerModal = document.getElementById("winnerModal");
const winnerText  = document.getElementById("winnerText");
const btnOk = document.getElementById("btnOk");

btnOk.onclick = () => {
    winnerModal.classList.add("hidden");
};


/* ===== ABSTRACTION ===== */
class AbstractDice {
    roll() {
        throw new Error("roll() harus diimplementasikan");
    }
}

/* ===== INHERITANCE + POLYMORPHISM ===== */
class Dice3D extends AbstractDice {
    constructor(el) {
        super();
        this.el = el;
        this.value = 1;
        this.rx = this.ry = this.rz = 0;
    }

    roll(finalValue) {
        diceSound.currentTime = 0;
        diceSound.play();

        const start = performance.now();
        const duration = 3000;

        const anim = (now) => {
            if (now - start < duration) {
                this.rx += 40;
                this.ry += 45;
                this.rz += 30;
                this.el.style.transform =
                    `rotateX(${this.rx}deg) rotateY(${this.ry}deg) rotateZ(${this.rz}deg)`;
                requestAnimationFrame(anim);
            } else {
                this.value = finalValue;
                this.el.style.transform = Dice3D.face(finalValue);
            }
        };
        requestAnimationFrame(anim);
    }

    static face(v) {
        return {
            1: "rotateX(0deg) rotateY(0deg)",
            2: "rotateX(-90deg)",
            3: "rotateY(90deg)",
            4: "rotateY(-90deg)",
            5: "rotateX(90deg)",
            6: "rotateY(180deg)"
        }[v];
    }
}

/* ===== ENCAPSULATION ===== */
class Player {
    #name;
    #dice;

    constructor(id) {
        this.#name = `Player ${id}`;
    }

    setName(n) { this.#name = n; }
    setDice(d) { this.#dice = d; }
    roll(v) { this.#dice.roll(v); }

    get name() { return this.#name; }
    get value() { return this.#dice.value; }
}

/* ===== GAME ===== */
class Game {
    constructor() {
        this.players = [];
        this.id = 1;
        this.area = document.getElementById("diceArea");

        btnRollAll.onclick = () => this.roll();
        this.renderAddButton();
    }

    hideDeleteButtons() {
        document.querySelectorAll(".btnDel")
            .forEach(btn => btn.classList.add("hide-del"));
    }

    showDeleteButtons() {
        document.querySelectorAll(".btnDel")
            .forEach(btn => btn.classList.remove("hide-del"));
    }

    renderAddButton() {
        const old = document.querySelector(".add-wrapper");
        if (old) old.remove();

        if (this.players.length < 6) {
            const wrap = document.createElement("div");
            wrap.className = "add-wrapper";
            wrap.innerHTML = `
                <div class="add-spacer"></div>
                <div class="add-box">+</div>
                <div class="add-spacer-bottom"></div>
            `;
            wrap.querySelector(".add-box").onclick = () => this.add();
            this.area.appendChild(wrap);
        }
    }

    add() {
        if (this.players.length >= 6) return;

        const p = new Player(this.id);
        const box = document.createElement("div");
        box.className = "player-box";
        box.innerHTML = `
            <input class="name-input" value="${p.name}">
            <div class="scene">
                <div class="dice">${this.faces()}</div>
            </div>
            <button class="btnDel">Hapus</button>
        `;

        box.querySelector("input").oninput = e => p.setName(e.target.value);
        box.querySelector(".btnDel").onclick = () => {
            box.remove();
            this.players = this.players.filter(x => x !== p);
            this.renderAddButton();
        };

        p.setDice(new Dice3D(box.querySelector(".dice")));
        this.players.push(p);
        this.area.insertBefore(box, document.querySelector(".add-wrapper"));
        this.id++;

        this.renderAddButton();
    }

    roll() {
        this.hideDeleteButtons();

        if (this.players.length === 0) {
            alert("Tambahkan dadu terlebih dahulu!");
            return;
        }

        const values = [1, 2, 3, 4, 5, 6]
            .sort(() => Math.random() - 0.5)
            .slice(0, this.players.length);

        this.players.forEach((p, i) => p.roll(values[i]));

        setTimeout(() => {
            this.show();
            this.showDeleteButtons();
        }, 3100);
    }

    show() {
    // 1️⃣ Urutkan dulu
    const sorted = [...this.players].sort((a, b) => b.value - a.value);

    // 2️⃣ Tampilkan ranking
    rankingList.innerHTML = sorted.map(p => `
        <div class="rank-row">
            <div>${p.name}</div>
            <span>${p.value}</span>
        </div>
    `).join("");
    rankingBox.classList.remove("hidden");

    // 3️⃣ Pengumuman pemenang
    const winner = sorted[0];
    winnerText.textContent =
        `${winner.name} menang dengan nilai ${winner.value}`;
    winnerModal.classList.remove("hidden");
}

    faces() {
        return `
        ${this.face("front", "one", [5])}
        ${this.face("back", "six", [1, 2, 3, 4, 5, 6])}
        ${this.face("right", "three", [1, 5, 9])}
        ${this.face("left", "four", [1, 2, 3, 4])}
        ${this.face("top", "five", [1, 3, 5, 7, 9])}
        ${this.face("bottom", "two", [1, 9])}
        `;
    }

    face(pos, cls, points) {
        let html = "";

        const total = cls === "four" ? 4 : cls === "six" ? 6 : 9;
        for (let i = 1; i <= total; i++) {
            html += points.includes(i)
                ? `<span class="pip"></span>`
                : `<span></span>`;
        }
        return `<div class="face ${pos} ${cls}">${html}</div>`;
    }

}

new Game();
