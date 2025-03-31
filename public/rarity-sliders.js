export class RaritySliders extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.resizeListener = this.handleResize.bind(this);
    this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
              font-family: "Microsoft JhengHei", sans-serif;
              background-color: #f5f5f5;
              padding: 16px;
              border-radius: 8px;
            }
            .toggle-btn {
              display: none;
              width: 100%;
              padding: 8px;
              margin-bottom: 8px;
              font-size: 16px;
              border: none;
              background-color: #007acc;
              color: #fff;
              border-radius: 4px;
              cursor: pointer;
            }
            @media screen and (max-width: 600px) {
              .toggle-btn {
                display: block;
              }
            }
            .slider-container {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
              gap: 16px;
              justify-items: center;
            }
            .slider-item {
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              padding: 12px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
              box-sizing: border-box;
            }
            .slider-item label {
              font-size: 14px;
              margin-bottom: 8px;
              font-weight: bold;
              color: #333;
            }
            .range-wrapper {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              box-sizing: border-box;
            }
            input[type="range"] {
              -webkit-appearance: none;
              width: 70%;
              height: 6px;
              background: #ddd;
              border-radius: 3px;
              outline: none;
              cursor: pointer;
              margin: 0 8px;
            }
            input[type="range"]::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 16px;
              height: 16px;
              background: #007acc;
              border-radius: 50%;
              box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
              cursor: pointer;
            }
            input[type="range"]::-moz-range-thumb {
              width: 16px;
              height: 16px;
              background: #007acc;
              border-radius: 50%;
              box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
              cursor: pointer;
            }
            .percentage {
              min-width: 45px;
              text-align: right;
              font-weight: bold;
              color: #007acc;
            }
            @media screen and (max-width: 600px) {
              .slider-container {
                grid-template-columns: 1fr;
              }
              input[type="range"] {
                width: 60%;
              }
            }
          </style>
          <button class="toggle-btn">展開機率設定</button>
          <div class="slider-container"></div>
        `;
    this.container = this.shadowRoot.querySelector(".slider-container");
    this.toggleBtn = this.shadowRoot.querySelector(".toggle-btn");
    this.rarityList = [];
    this._isCollapsed = true;
    this.toggleBtn.addEventListener("click", () => {
      this._isCollapsed = !this._isCollapsed;
      this.updateVisibility();
    });
  }

  connectedCallback() {
    if (window.innerWidth <= 600) {
      this._isCollapsed = true;
    } else {
      this._isCollapsed = false;
    }
    this.updateVisibility();
    window.addEventListener("resize", this.resizeListener);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.resizeListener);
  }

  handleResize() {
    if (window.innerWidth > 600) {
      this._isCollapsed = false;
    } else {
      this._isCollapsed = true;
    }
    this.updateVisibility();
  }

  updateVisibility() {
    if (this._isCollapsed) {
      this.container.style.display = "none";
      this.toggleBtn.textContent = "展開機率設定";
    } else {
      this.container.style.display = "grid";
      this.toggleBtn.textContent = "收起機率設定";
    }
  }

  setRarities(rarities) {
    this.rarityList = JSON.parse(JSON.stringify(rarities));
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    this.rarityList.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("slider-item");
      const label = document.createElement("label");
      label.textContent = item.name;
      const rangeWrapper = document.createElement("div");
      rangeWrapper.classList.add("range-wrapper");
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = item.prob;
      const span = document.createElement("span");
      span.classList.add("percentage");
      span.textContent = `${item.prob}%`;
      slider.addEventListener("input", (e) => {
        let newVal = parseInt(e.target.value, 10);
        this.rarityList[index].prob = newVal;
        span.textContent = `${newVal}%`;
        this.handleSumLimit(index);
        this.dispatchRarityUpdated();
      });
      rangeWrapper.appendChild(slider);
      rangeWrapper.appendChild(span);
      div.appendChild(label);
      div.appendChild(rangeWrapper);
      this.container.appendChild(div);
    });
  }

  handleSumLimit(changedIndex) {
    let total = this.rarityList.reduce((sum, r) => sum + r.prob, 0);
    if (total > 100) {
      let diff = total - 100;
      this.rarityList[changedIndex].prob -= diff;
      if (this.rarityList[changedIndex].prob < 0) {
        this.rarityList[changedIndex].prob = 0;
      }
    }
    this.render();
  }

  dispatchRarityUpdated() {
    const detail = JSON.parse(JSON.stringify(this.rarityList));
    this.dispatchEvent(
      new CustomEvent("rarity-updated", {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("rarity-sliders", RaritySliders);
