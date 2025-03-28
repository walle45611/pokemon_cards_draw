# 抽卡系統 - 多稀有度版本

本專案為一個使用 Web Component (Custom Element) 實作的寶可夢抽卡系統，並提供多稀有度抽卡機率設定及「十連抽不重複」機制。

## 📁 專案結構

```
.
├── index.html            # 主要 HTML，包含抽卡系統 (Web Component) 程式碼
├── pokemon_cards.json    # 卡牌資料 (各稀有度對應的卡圖連結)
├── card_back_img.png     # 卡牌背面圖片
└── README.md             # 啟動 & 使用說明
```

## 🚀 如何啟動專案

### 使用 VSCode Live Server 外掛

1. 安裝 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 外掛。
2. 開啟 `index.html`，右鍵選擇「**Open with Live Server**」。
3. 頁面將於瀏覽器自動開啟，例如 `http://127.0.0.1:5500/`。

### 或使用其他本機伺服器

使用 Node.js 開發者可執行以下命令：

```bash
npm install -g http-server
http-server
```

預設會啟動在 `http://127.0.0.1:8080/`，用瀏覽器打開即可。

> ⚠️ **注意：** 請勿直接以 `file://` 開啟 HTML，否則會遇到 CORS 錯誤導致 JSON 無法載入。

## 🎮 功能介紹

- ✅ **多稀有度機率調整：**

  - 內建 18 種稀有度，每種都有獨立滑桿調整機率。
  - 機率總和不得超過 100%，超出時會自動修正。

- ✅ **單抽 / 十連抽：**

  - 單抽：從機率中決定稀有度並隨機抽一張。
  - 十連抽：每次抽 10 張卡，**不會重複**抽到相同卡圖（同一次抽卡中）。

- ✅ **卡片翻轉動畫：**

  - 初始為卡背圖，點擊卡片會翻轉顯示抽到的卡圖與稀有度。

## 🛠 客製化說明

- 修改卡片樣式請至 `index.html` 中 `<style>` 區塊調整。
- 更換卡片圖片請編輯 `pokemon_cards.json`。
- 若想要抽卡後永久移除卡圖，可將十連抽邏輯改為直接操作 `this.cardData`。

## 🖼 範例卡圖來源

本專案所使用之卡牌圖片皆取自：

🔗 [寶可夢官方卡牌查詢系統（台灣）]\([https://asia.pokemon-card.com/tw/card-search/list/](https://asia.pokemon-card.com/tw/card-search/list/))

圖片僅用於學術研究、非商業用途之展示與開發練習，若需正式使用或商用請依寶可夢官方授權規範處理。

---

如有建議或需求，歡迎提出 issue 或 fork 後自行擴充。

祝你抽到 SSR！🎉
