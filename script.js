const stages = [
  { title: "🌊 せせらぎの川", type: "line" },
  { title: "🌳 目盛りの森", type: "scale" },
  { title: "🌰 どんぐりの丘", type: "ten" }
];

const shopItems = [
  { id: "silk_hat", category: "hat", name: "シルクハット", emoji: "🎩", cost: 5 },
  { id: "cap", category: "hat", name: "青いキャップ", emoji: "🧢", cost: 8 },
  { id: "straw_hat", category: "hat", name: "麦わらぼうし", emoji: "👒", cost: 10 },
  { id: "crown", category: "hat", name: "王冠", emoji: "👑", cost: 30 },

  { id: "glasses", category: "face", name: "まるめがね", emoji: "👓", cost: 8 },
  { id: "sunglasses", category: "face", name: "サングラス", emoji: "🕶️", cost: 12 },

  { id: "scarf", category: "neck", name: "マフラー", emoji: "🧣", cost: 10 },
  { id: "ribbon", category: "neck", name: "リボン", emoji: "🎀", cost: 10 },

  { id: "backpack", category: "bag", name: "リュック", emoji: "🎒", cost: 15 }
];

const categoryNames = {
  hat: "ぼうし",
  face: "めがね",
  neck: "くび",
  bag: "もちもの"
};

let data = JSON.parse(localStorage.getItem("kuma_number_world") || `
{
  "stage": 0,
  "acorn": 0,
  "equip": "なし",
  "ownedItems": [],
  "wearing": {
    "hat": "",
    "face": "",
    "neck": "",
    "bag": ""
  }
}
`);

if (!data.ownedItems) data.ownedItems = [];
if (!data.wearing) data.wearing = { hat: "", face: "", neck: "", bag: "" };
if (data.star !== undefined) delete data.star;

let question = {};
let selected = null;
let solved = false;

function saveData() {
  localStorage.setItem("kuma_number_world", JSON.stringify(data));
  updateStatus();
}

function updateStatus() {
  document.getElementById("acornCount").textContent = data.acorn;
  document.getElementById("equipText").textContent = getWearingText();
  renderBearPreview();
}

function getWearingText() {
  const worn = Object.values(data.wearing).filter(Boolean);
  if (worn.length === 0) return "なし";

  return worn
    .map(id => shopItems.find(item => item.id === id)?.name)
    .filter(Boolean)
    .join("・");
}

function makeBear() {
  const parts = [];
  const hat = getItemEmoji(data.wearing.hat);
  const face = getItemEmoji(data.wearing.face);
  const neck = getItemEmoji(data.wearing.neck);
  const bag = getItemEmoji(data.wearing.bag);

  if (hat) parts.push(hat);
  parts.push("🐻");
  if (face) parts.push(face);
  if (neck) parts.push(neck);
  if (bag) parts.push(bag);

  return parts.join(" ");
}

function getItemEmoji(id) {
  if (!id) return "";
  const item = shopItems.find(item => item.id === id);
  return item ? item.emoji : "";
}

function renderBearPreview() {
  const bear = makeBear();
  const preview = document.getElementById("bearPreview");
  const shopPreview = document.getElementById("shopBearPreview");

  if (preview) preview.innerHTML = bear;
  if (shopPreview) shopPreview.innerHTML = bear;
}

function chooseStage(stageNumber) {
  data.stage = stageNumber;
  saveData();
}

function startGame() {
  showScreen("game");
  newQuestion();
}

function goHome() {
  showScreen("home");
  updateStatus();
}

function openShop() {
  showScreen("shop");
  renderShop();
  renderBearPreview();
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

function renderShop() {
  const area = document.getElementById("shopArea");
  let html = "";

  Object.keys(categoryNames).forEach(category => {
    html += `<div class="shop-category">`;
    html += `<h3>${categoryNames[category]}</h3>`;
    html += `<div class="item-grid">`;

    shopItems
      .filter(item => item.category === category)
      .forEach(item => {
        const owned = data.ownedItems.includes(item.id);
        const equipped = data.wearing[item.category] === item.id;

        html += `
          <div class="shop-item ${owned ? "owned" : ""} ${equipped ? "equipped" : ""}"
               onclick="handleItem('${item.id}')">
            <div class="shop-emoji">${item.emoji}</div>
            <div class="shop-name">${item.name}</div>
            <div class="shop-cost">🌰${item.cost}こ</div>
            <div class="shop-status">
              ${
                equipped
                  ? "いま着ている"
                  : owned
                  ? "クリックで着る"
                  : "クリックで買う"
              }
            </div>
          </div>
        `;
      });

    html += `</div></div>`;
  });

  area.innerHTML = html;
}

function handleItem(id) {
  const item = shopItems.find(item => item.id === id);
  if (!item) return;

  const owned = data.ownedItems.includes(id);

  if (!owned) {
    if (data.acorn < item.cost) {
      document.getElementById("shopMessage").textContent =
        "どんぐりがまだ足りないよ。問題に挑戦して集めよう！";
      return;
    }

    data.acorn -= item.cost;
    data.ownedItems.push(id);
    data.wearing[item.category] = id;
    document.getElementById("shopMessage").textContent =
      `${item.name}を手に入れたよ！`;
  } else {
    if (data.wearing[item.category] === id) {
      data.wearing[item.category] = "";
      document.getElementById("shopMessage").textContent =
        `${item.name}を外したよ。`;
    } else {
      data.wearing[item.category] = id;
      document.getElementById("shopMessage").textContent =
        `${item.name}を着たよ！`;
    }
  }

  saveData();
  renderShop();
  renderBearPreview();
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[rand(0, list.length - 1)];
}

function newQuestion() {
  selected = null;
  solved = false;

  document.getElementById("resultBox").classList.add("hidden");
  document.getElementById("resultBox").innerHTML = "";
  document.getElementById("bearTalk").textContent = "まずは考えてみよう！";

  const stage = stages[data.stage];
  document.getElementById("stageTitle").textContent = stage.title;

  if (stage.type === "line") makeLineQuestion();
  if (stage.type === "scale") makeScaleQuestion();
  if (stage.type === "ten") makeTenQuestion();
}

function makeLineQuestion() {
  const base = rand(220, 780);
  const change = pickRandom([-10, 10]);
  const answer = base + change;

  question = {
    type: "line",
    base,
    answer,
    start: base - 12,
    end: base + 12,
    text: `${base}より <b>10</b> ${change < 0 ? "小さい" : "大きい"}数は？`
  };

  document.getElementById("questionText").innerHTML = question.text;
  renderLine();
}

function renderLine() {
  const area = document.getElementById("gameArea");
  const total = question.end - question.start;

  let html = `<div class="number-line"><div class="axis"></div>`;

  for (let i = 0; i <= total; i++) {
    const num = question.start + i;
    const left = 6 + (i / total) * 88;

    let tickClass = "small";
    if (num % 10 === 0) tickClass = "large";
    else if (num % 5 === 0) tickClass = "medium";

    const showLabel =
      num === question.base ||
      num % 10 === 0 ||
      num % 5 === 0 ||
      num === selected;

    html += `<div class="hit" style="left:${left}%" onclick="selectLineNumber(${num})"></div>`;
    html += `<div class="tick ${tickClass}" style="left:${left}%"></div>`;

    if (showLabel) {
      html += `
        <div class="num ${selected === num ? "selected" : ""}"
             style="left:${left}%"
             onclick="selectLineNumber(${num})">
          ${num}
        </div>
      `;
    }
  }

  html += `<div class="base-mark" style="left:${getLinePosition(question.base)}%">▼</div>`;

  const kumaPosition = selected === null ? question.base : selected;
  html += `<div class="kuma" style="left:${getLinePosition(kumaPosition)}%">${makeBear()}</div>`;

  html += `</div>`;
  area.innerHTML = html;
}

function getLinePosition(num) {
  return 6 + ((num - question.start) / (question.end - question.start)) * 88;
}

function selectLineNumber(num) {
  if (solved) return;

  selected = num;
  const distance = Math.abs(selected - question.base);
  const direction =
    selected === question.base
      ? "同じ場所"
      : selected > question.base
      ? "右"
      : "左";

  document.getElementById("bearTalk").textContent =
    `${num}を選んだよ。${direction}に${distance}目盛り動いたね。`;

  renderLine();
}

function makeScaleQuestion() {
  const unit = pickRandom([1, 5, 10]);
  let start;

  if (unit === 1) start = rand(120, 240);
  if (unit === 5) start = rand(20, 70) * 5;
  if (unit === 10) start = rand(20, 70) * 10;

  question = {
    type: "scale",
    unit,
    answer: unit,
    start,
    text: `この数直線の <b>ひと目盛り</b> はいくつ？`
  };

  document.getElementById("questionText").innerHTML = question.text;
  renderScale();
}

function renderScale() {
  const area = document.getElementById("gameArea");
  let html = `<div class="number-line"><div class="axis"></div>`;

  for (let i = 0; i <= 10; i++) {
    const num = question.start + i * question.unit;
    const left = 6 + i * 8.8;

    html += `<div class="tick large" style="left:${left}%"></div>`;
    html += `<div class="num" style="left:${left}%">${num}</div>`;
  }

  html += `</div>
    <div class="choice-grid">
      <button class="choice" onclick="selectChoice(1, this)">1ずつ</button>
      <button class="choice" onclick="selectChoice(5, this)">5ずつ</button>
      <button class="choice" onclick="selectChoice(10, this)">10ずつ</button>
    </div>`;

  area.innerHTML = html;
}

function selectChoice(num, button) {
  if (solved) return;

  selected = num;

  document.querySelectorAll(".choice").forEach(btn => {
    btn.classList.remove("selected");
  });

  button.classList.add("selected");

  const label = num === 1 ? "1ずつ" : `${num}ずつ`;
  document.getElementById("bearTalk").textContent = `${label}を選んだよ`;
}

function makeTenQuestion() {
  const mode = pickRandom(["numberToTens", "tensToNumber"]);
  const tens = rand(12, 45);
  const number = tens * 10;

  question = {
    type: "ten",
    mode,
    tens,
    number,
    answer: mode === "numberToTens" ? tens : number,
    text:
      mode === "numberToTens"
        ? `${number}は <b>10</b> がいくつ分？`
        : `10が <b>${tens}こ</b> でいくつ？`
  };

  document.getElementById("questionText").innerHTML = question.text;
  renderTen();
}

function renderTen() {
  const area = document.getElementById("gameArea");

  let html = "";

  html += `<div class="visual-text">`;
  html +=
    question.mode === "numberToTens"
      ? `${question.number}は、10この袋がいくつかな？`
      : `10この袋が${question.tens}こあるよ。全部でいくつ？`;
  html += `</div>`;

  html += `<div class="bag-area"><div class="bag-grid">`;

  for (let i = 0; i < question.tens; i++) {
    html += `
      <div class="bag">
        <div class="bag-icon">👜</div>
        <div>10</div>
      </div>
    `;
  }

  html += `</div></div>`;

  const choices = makeTenChoices();

  html += `<div class="choice-grid">`;
  choices.forEach(num => {
    html += `<button class="choice" onclick="selectChoice(${num}, this)">${num}</button>`;
  });
  html += `</div>`;

  area.innerHTML = html;
}

function makeTenChoices() {
  const answers = new Set([question.answer]);

  while (answers.size < 3) {
    let wrong;

    if (question.mode === "numberToTens") {
      wrong = question.answer + pickRandom([-10, -5, -1, 1, 5, 10]);
    } else {
      wrong = question.answer + pickRandom([-100, -50, -10, 10, 50, 100]);
    }

    if (wrong > 0) answers.add(wrong);
  }

  return [...answers].sort(() => Math.random() - 0.5);
}

function checkAnswer() {
  if (solved) return;

  solved = true;

  const resultBox = document.getElementById("resultBox");
  resultBox.classList.remove("hidden");

  if (selected === question.answer) {
    data.acorn += 1;
    saveData();

    resultBox.innerHTML = `
      せいかい！<br>
      🌰どんぐりゲット！
    `;
  } else {
    const correctLabel =
      question.type === "scale"
        ? question.answer === 1
          ? "1ずつ"
          : `${question.answer}ずつ`
        : question.answer;

    resultBox.innerHTML = `
      おしい！<br>
      答えは <b>${correctLabel}</b> だよ。
    `;
  }
}

updateStatus();
