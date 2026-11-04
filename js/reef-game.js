const reefObjects = [
  { label: "Botella de plástico", icon: "🧴", type: "waste" },
  { label: "Bolsa de plástico", icon: "🛍️", type: "waste" },
  { label: "Lata", icon: "🥫", type: "waste" },
  { label: "Red de pesca", icon: "🪢", type: "waste" },
  { label: "Pajilla", icon: "🥤", type: "waste" },
  { label: "Envoltura", icon: "📦", type: "waste" },
  { label: "Tortuga marina", icon: "🐢", type: "marine" },
  { label: "Pez tropical", icon: "🐠", type: "marine" },
  { label: "Coral", icon: "🪸", type: "marine" },
  { label: "Concha", icon: "🐚", type: "marine" },
];

const gameBoard = document.querySelector("#reef-game-board");
const scoreElement = document.querySelector("#reef-game-score");
const timeElement = document.querySelector("#reef-game-time");
const statusElement = document.querySelector("#reef-game-status");
const startButton = document.querySelector("#reef-game-start");

let collected = 0;
let secondsLeft = 30;
let timerId;
let gameActive = false;

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function renderBoard() {
  gameBoard.replaceChildren(
    ...shuffle(reefObjects).map((item) => {
      const button = document.createElement("button");
      button.className = "reef-game-tile";
      button.type = "button";
      button.disabled = true;
      button.setAttribute("aria-label", item.label);

      const icon = document.createElement("span");
      icon.className = "reef-game-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.icon;

      const label = document.createElement("span");
      label.textContent = item.label;
      button.append(icon, label);
      button.addEventListener("click", () => selectObject(button, item));

      return button;
    }),
  );
}

function finishGame(won) {
  gameActive = false;
  window.clearInterval(timerId);
  gameBoard.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  startButton.disabled = false;
  startButton.textContent = "Jugar de nuevo ↻";
  statusElement.textContent = won
    ? "¡Arrecife limpio! Recoger los residuos y respetar la vida marina hace la diferencia."
    : `Se acabó el tiempo. Recogiste ${collected} de 6 residuos. ¡Inténtalo de nuevo!`;
}

function selectObject(button, item) {
  if (!gameActive) {
    return;
  }

  button.disabled = true;

  if (item.type === "waste") {
    collected += 1;
    button.dataset.state = "collected";
    statusElement.textContent = `¡Bien! Retiraste: ${item.label}.`;
    scoreElement.textContent = `${collected} de 6`;

    if (collected === 6) {
      finishGame(true);
    }

    return;
  }

  button.dataset.state = "respect";
  secondsLeft = Math.max(0, secondsLeft - 3);
  timeElement.textContent = `${secondsLeft} s`;
  statusElement.textContent = `¡Respeta la vida marina! Tocaste: ${item.label}. Perdiste 3 segundos.`;

  if (secondsLeft === 0) {
    finishGame(false);
  }
}

function startGame() {
  window.clearInterval(timerId);
  collected = 0;
  secondsLeft = 30;
  gameActive = true;
  scoreElement.textContent = "0 de 6";
  timeElement.textContent = `${secondsLeft} s`;
  statusElement.textContent = "¡Vamos! Recoge los residuos y deja tranquila la vida marina.";
  startButton.disabled = true;
  startButton.textContent = "En curso…";
  renderBoard();
  gameBoard.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
  });

  timerId = window.setInterval(() => {
    secondsLeft -= 1;
    timeElement.textContent = `${secondsLeft} s`;

    if (secondsLeft <= 0) {
      finishGame(false);
    }
  }, 1000);
}

startButton.addEventListener("click", startGame);
renderBoard();
startButton.disabled = false;
