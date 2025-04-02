import { RaritySliders } from "./rarity-sliders.js";

const RARITY_FULL_MAP = {
  1: "C",
  2: "U",
  3: "R",
  4: "RR",
  5: "RRR",
  6: "PR",
  7: "TR",
  8: "SR",
  9: "HR",
  10: "UR",
  11: "無標記",
  12: "K",
  13: "A",
  14: "AR",
  15: "SAR",
  16: "S",
  17: "SSR",
  18: "ACE",
};

class DrawCardApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: #fff;
          font-family: "Microsoft JhengHei", sans-serif;
        }
        .app {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        h1 {
          margin: 20px 0 10px;
          font-size: 32px;
          color: #4b2e06;
        }
        .intro-text {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .intro-text a {
          color: #007acc;
          text-decoration: none;
        }
        .intro-text a:hover {
          text-decoration: underline;
        }
        .btn-container {
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        button {
          width: 150px;
          height: 50px;
          font-size: 18px;
          margin: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
        }
        button:hover {
          transform: scale(1.05);
          box-shadow: 3px 3px 10px rgba(0,0,0,0.3);
        }
        #card-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        .card {
          width: 184px;
          height: 256px;
          margin: 10px;
          cursor: pointer;
          list-style: none;
          padding: 0;
          background: transparent;
          border-radius: 10px;
          box-sizing: border-box;
          transform-style: preserve-3d;
          perspective: 1000px;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        /* 浮動效果：只有在翻開後且 hover 時觸發 */
        .card.flipped:hover {
          transform: translateY(-20px) rotateX(5deg) rotateY(5deg) scale(1.4);
          box-shadow: 0 25px 40px rgba(0, 0, 0, 0.5);
          z-index: 10000;
        }
        .card-inner {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .card-face img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        /* 卡背背景 */
        .card-back {
          background: linear-gradient(to right bottom, #eee 8%, #ddd 18%, #eee 33%);
        }
        .card-front {
          transform: rotateY(180deg);
          background: #fff;
        }
        .rarity-text {
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(255,255,255,0.8);
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
        }
        /* 閃光動畫 keyframes */
        @keyframes flash {
          0%, 100% {
            filter: brightness(1);
          }
          50% {
            filter: brightness(1.5);
          }
        }
        /* 當卡片為 SSR 且翻開後啟用閃光動畫 */
        .card.flipped.flash {
          animation: flash 1s infinite;
        }
      </style>
      <div class="app">
        <h1>抽卡練習所</h1>
        <p class="intro-text">
          抽卡練習所：給抽不到 SSR 的人一點慰藉（笑）<br />
          部落格連結：
          <a href="https://blog.walle4561.com/" target="_blank">https://blog.walle4561.com/</a>
        </p>
        <rarity-sliders id="raritySliders"></rarity-sliders>
        <div class="btn-container">
          <button id="drawOneBtn">抽 1 次</button>
          <button id="drawTenBtn">抽 10 次 (不重複)</button>
          <button id="randomProbBtn">隨機機率</button>
          <button id="clearProbBtn">清除機率</button>
        </div>
        <div id="card-container"></div>
      </div>
    `;

    this.rarityList = Object.entries(RARITY_FULL_MAP).map(([key, name]) => ({
      id: parseInt(key),
      name,
      prob: 0,
    }));
  }

  connectedCallback() {
    this.raritySliders = this.shadowRoot.getElementById("raritySliders");
    this.cardContainer = this.shadowRoot.getElementById("card-container");
    this.drawOneBtn = this.shadowRoot.getElementById("drawOneBtn");
    this.drawTenBtn = this.shadowRoot.getElementById("drawTenBtn");
    this.randomProbBtn = this.shadowRoot.getElementById("randomProbBtn");
    this.clearProbBtn = this.shadowRoot.getElementById("clearProbBtn");

    fetch("./pokemon_cards.json")
      .then((res) => res.json())
      .then((data) => {
        this.cardData = data;
        this.randomizeProbabilities();
        this.raritySliders.setRarities(this.rarityList);
      })
      .catch((err) => {
        console.error("載入卡片資料失敗：", err);
        alert("載入卡片資料失敗，請確認檔案路徑和格式。");
      });

    this.drawOneBtn.addEventListener("click", () => {
      this.clearCards();
      this.drawOne();
    });
    this.drawTenBtn.addEventListener("click", () => {
      this.clearCards();
      this.drawTen();
    });
    this.randomProbBtn.addEventListener("click", () => {
      this.randomizeProbabilities();
      this.raritySliders.setRarities(this.rarityList);
    });
    this.clearProbBtn.addEventListener("click", () => {
      this.clearProbabilities();
      this.raritySliders.setRarities(this.rarityList);
    });

    this.raritySliders.addEventListener("rarity-updated", (e) => {
      const updated = e.detail;
      this.rarityList = updated;
    });
  }

  clearCards() {
    this.cardContainer.innerHTML = "";
  }

  clearProbabilities() {
    this.rarityList.forEach((r) => {
      r.prob = 0;
    });
  }

  randomizeProbabilities() {
    const eligible = this.rarityList.filter((r) => {
      return this.cardData[r.name] && this.cardData[r.name].length >= 10;
    });
    if (eligible.length === 0) {
      alert("沒有任何卡池有足夠的卡可以抽 10 張！");
      return;
    }
    const m = eligible.length;
    let cuts = [];
    for (let i = 0; i < m - 1; i++) {
      cuts.push(Math.floor(Math.random() * 101));
    }
    cuts.push(0);
    cuts.push(100);
    cuts.sort((a, b) => a - b);

    this.rarityList.forEach((r) => {
      if (this.cardData[r.name] && this.cardData[r.name].length >= 10) {
        const index = eligible.indexOf(r);
        let prob = cuts[index + 1] - cuts[index];
        r.prob = prob;
      } else {
        r.prob = 0;
      }
    });
  }

  drawOne() {
    const totalProb = this.rarityList.reduce((sum, r) => sum + r.prob, 0);
    if (totalProb <= 0) {
      alert("機率總和為 0，請先調整滑桿再抽卡！");
      return;
    }
    const rarityName = this.getRarityByProb();
    if (!rarityName) return;
    const cardPool = this.cardData[rarityName] || [];
    if (cardPool.length === 0) {
      alert(`「${rarityName}」卡池沒有卡或找不到，抽卡失敗！`);
      return;
    }
    const randomIndex = Math.floor(Math.random() * cardPool.length);
    const cardImageUrl = cardPool[randomIndex];
    this.createCard(rarityName, cardImageUrl);
  }

  drawTen() {
    const totalProb = this.rarityList.reduce((sum, r) => sum + r.prob, 0);
    if (totalProb <= 0) {
      alert("機率總和為 0，請先調整滑桿再抽卡！");
      return;
    }
    const tempData = JSON.parse(JSON.stringify(this.cardData));
    let emptyPoolAlertShown = false;

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const rarityName = this.getRarityByProb();
        if (!rarityName) return;
        const cardPool = tempData[rarityName];
        if (!cardPool || cardPool.length === 0) {
          if (!emptyPoolAlertShown) {
            emptyPoolAlertShown = true;
            alert(
              `「${rarityName}」卡池已經沒有可抽的卡了，無法抽到第 ${
                i + 1
              } 張。`
            );
          }
          return;
        }
        const randomIndex = Math.floor(Math.random() * cardPool.length);
        const cardImageUrl = cardPool.splice(randomIndex, 1)[0];
        this.createCard(rarityName, cardImageUrl);
      }, i * 120);
    }
  }

  getRarityByProb() {
    const totalProb = this.rarityList.reduce((sum, r) => sum + r.prob, 0);
    if (totalProb <= 0) return null;
    const rand = Math.floor(Math.random() * totalProb) + 1;
    let cumulative = 0;
    for (const r of this.rarityList) {
      cumulative += r.prob;
      if (rand <= cumulative) return r.name;
    }
    return null;
  }

  createCard(rarityName, cardImageUrl) {
    const card = document.createElement("div");
    card.classList.add("card");
    if (rarityName === "SSR") {
      card.classList.add("flash");
    }
    const cardInner = document.createElement("div");
    cardInner.classList.add("card-inner");

    const cardBack = document.createElement("div");
    cardBack.classList.add("card-face", "card-back");
    const backImg = document.createElement("img");
    backImg.src = "./card_back_img.png";
    backImg.alt = "Card Back";
    cardBack.appendChild(backImg);

    const cardFront = document.createElement("div");
    cardFront.classList.add("card-face", "card-front");
    const frontImg = document.createElement("img");
    frontImg.src = cardImageUrl;
    frontImg.alt = `${rarityName} Card`;
    cardFront.appendChild(frontImg);

    const rarityText = document.createElement("div");
    rarityText.classList.add("rarity-text");
    rarityText.textContent = rarityName;
    cardFront.appendChild(rarityText);

    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFront);
    card.appendChild(cardInner);

    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
    this.cardContainer.appendChild(card);
  }
}

customElements.define("draw-card-app", DrawCardApp);
