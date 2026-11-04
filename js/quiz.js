const quizQuestions = [
  {
    question: "¿En qué costa de Nicaragua se encuentran Cayos Miskitos y Corn Island?",
    options: ["En la costa del Pacífico", "En la costa Caribe", "En la zona central"],
    answer: 1,
    explanation: "¡Correcto! Ambos están en el Caribe nicaragüense.",
  },
  {
    question: "¿Qué ofrecen los arrecifes a muchas especies marinas?",
    options: ["Alimento y refugio", "Agua dulce", "Protección contra toda forma de pesca"],
    answer: 0,
    explanation: "Los arrecifes brindan alimento y refugio a numerosas especies.",
  },
  {
    question: "¿Cuál de estas acciones ayuda a cuidar los arrecifes?",
    options: ["Tocar los corales para observarlos", "Dejar basura en la playa", "Reducir los residuos y respetar la vida marina"],
    answer: 2,
    explanation: "Reducir los residuos y respetar la vida marina ayuda a proteger estos ecosistemas.",
  },
  {
    question: "¿Qué puede causar el aumento de la temperatura del mar?",
    options: ["El blanqueamiento de los corales", "Que los corales se conviertan en roca", "Que desaparezca la contaminación"],
    answer: 0,
    explanation: "El calentamiento del mar puede provocar blanqueamiento coralino.",
  },
];

const quiz = document.querySelector("#quiz");
const questionElement = document.querySelector("#quiz-question");
const optionsElement = document.querySelector("#quiz-options");
const progressElement = document.querySelector("#quiz-progress");
const progressBar = document.querySelector("#quiz-progress-bar");
const scoreElement = document.querySelector("#quiz-score");
const feedbackElement = document.querySelector("#quiz-feedback");
const nextButton = document.querySelector("#quiz-next");
const resultElement = document.querySelector("#quiz-result");
const resultTitle = document.querySelector("#quiz-result-title");
const resultMessage = document.querySelector("#quiz-result-message");
const restartButton = document.querySelector("#quiz-restart");

let currentQuestion = 0;
let score = 0;

function renderQuestion() {
  const question = quizQuestions[currentQuestion];
  progressElement.textContent = `Pregunta ${currentQuestion + 1} de ${quizQuestions.length}`;
  progressBar.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;
  scoreElement.textContent = `${score} ${score === 1 ? "punto" : "puntos"}`;
  questionElement.textContent = question.question;
  feedbackElement.textContent = "";
  feedbackElement.dataset.state = "";
  nextButton.disabled = true;
  nextButton.hidden = false;
  nextButton.textContent = "Siguiente pregunta →";
  resultElement.hidden = true;

  optionsElement.replaceChildren(
    ...question.options.map((option, index) => {
      const button = document.createElement("button");
      button.className = "quiz-option";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => selectAnswer(index));
      return button;
    }),
  );
}

function selectAnswer(selectedIndex) {
  const question = quizQuestions[currentQuestion];
  const options = [...optionsElement.querySelectorAll(".quiz-option")];
  const isCorrect = selectedIndex === question.answer;

  options.forEach((option, index) => {
    option.disabled = true;
    if (index === question.answer) {
      option.dataset.state = "correct";
    } else if (index === selectedIndex) {
      option.dataset.state = "incorrect";
    }
  });

  if (isCorrect) {
    score += 1;
    feedbackElement.textContent = question.explanation;
    feedbackElement.dataset.state = "correct";
  } else {
    feedbackElement.textContent = `No exactamente. ${question.explanation}`;
    feedbackElement.dataset.state = "incorrect";
  }

  scoreElement.textContent = `${score} ${score === 1 ? "punto" : "puntos"}`;
  nextButton.textContent =
    currentQuestion === quizQuestions.length - 1
      ? "Ver resultado"
      : "Siguiente pregunta →";
  nextButton.disabled = false;
}

function showResult() {
  const percentage = score / quizQuestions.length;
  resultTitle.textContent = `¡Obtuviste ${score} de ${quizQuestions.length} puntos!`;
  resultMessage.textContent =
    percentage === 1
      ? "¡Excelente! Ya sabes cómo los arrecifes ayudan a la vida marina y qué podemos hacer para protegerlos."
      : percentage >= 0.5
        ? "¡Buen trabajo! Repasa la página para aprender un poco más sobre los arrecifes del Caribe nicaragüense."
        : "¡Sigue aprendiendo! Revisa la página y vuelve a intentarlo: cada acción cuenta para cuidar nuestro Caribe.";

  questionElement.parentElement.hidden = true;
  feedbackElement.hidden = true;
  nextButton.hidden = true;
  resultElement.hidden = false;
}

nextButton.addEventListener("click", () => {
  if (currentQuestion === quizQuestions.length - 1) {
    showResult();
    return;
  }

  currentQuestion += 1;
  renderQuestion();
});

restartButton.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  questionElement.parentElement.hidden = false;
  feedbackElement.hidden = false;
  renderQuestion();
});

renderQuestion();
