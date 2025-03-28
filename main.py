import requests
from bs4 import BeautifulSoup
from urllib.parse import urlencode
from tqdm import tqdm
import time
import json

# 所有可能的稀有度代碼與名稱對應
RARITY_FULL_MAP = {
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
}

# 通用查詢參數
COMMON_PARAMS = {
    "sortCondition": "",
    "keyword": "",
    "cardType": "all",
    "regulation": "1",
    "pokemonEnergy": "",
    "pokemonWeakness": "",
    "pokemonResistance": "",
    "pokemonMoveEnergy": "",
    "hpLowerLimit": "none",
    "hpUpperLimit": "none",
    "retreatCostLowerLimit": "0",
    "retreatCostUpperLimit": "none",
    "illustratorName": "",
    "expansionCodes": "",
}

# 目標網站
BASE_URL = "https://asia.pokemon-card.com/tw/card-search/list/"


# 抓取單一稀有度卡片
def scrape_cards_by_rarity(rarity_code, rarity_name):
    print(f"\n🔍 正在抓取「{rarity_name}」...")

    card_images = []

    params = COMMON_PARAMS.copy()
    params["rarity[]"] = rarity_code
    params_encoded = urlencode(params, doseq=True)

    first_page = requests.get(f"{BASE_URL}?{params_encoded}")
    soup = BeautifulSoup(first_page.text, "html.parser")

    try:
        page_text = soup.select_one("p.resultTotalPages").text.strip()
        total_pages = int(page_text.replace("/ 共", "").replace("頁", "").strip())
    except Exception:
        total_pages = 1

    for page in tqdm(range(1, total_pages + 1), desc=f"{rarity_name} 頁面"):
        params["pageNo"] = page
        page_html = requests.get(f"{BASE_URL}?{urlencode(params, doseq=True)}")
        soup = BeautifulSoup(page_html.text, "html.parser")

        for img in soup.select("img.lazy"):
            url = img.get("data-original")
            if url:
                card_images.append(url)

        time.sleep(0.5)

    return card_images


# 執行並分類
all_cards = {}

for rarity_code, rarity_name in RARITY_FULL_MAP.items():
    images = scrape_cards_by_rarity(rarity_code, rarity_name)
    if images:
        all_cards[rarity_name] = images

# 顯示總結
print("\n📦 全部抓取完畢！結果如下：")
for rarity, urls in all_cards.items():
    print(f"\n{rarity}（{len(urls)} 張）：")
    for u in urls:
        print(f"- {u}")

# 輸出 JSON
with open("pokemon_cards.json", "w", encoding="utf-8") as f:
    json.dump(all_cards, f, indent=2, ensure_ascii=False)

print("\n✅ 已輸出為 pokemon_cards.json")
