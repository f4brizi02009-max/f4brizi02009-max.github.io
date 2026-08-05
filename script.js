const questions = [
  {
    key: "q1",
    text: "¿Consideras que las inundaciones son un problema importante en tu comunidad?",
    options: ["Sí", "No"]
  },
  {
    key: "q2",
    text: "¿Crees que un sistema de detección de inundaciones sería útil para prevenir daños?",
    options: ["Sí", "No", "Tal vez"]
  },
  {
    key: "q3",
    text: "¿Utilizarías una aplicación móvil para recibir alertas de inundación?",
    options: ["Sí", "No"]
  },
  {
    key: "q4",
    text: "¿Piensas que reutilizar el agua de lluvia es una buena idea?",
    options: ["Sí", "No"]
  },
  {
    key: "q5",
    text: "¿Crees que la tecnología puede ayudar a reducir los efectos de las inundaciones?",
    options: ["Sí", "No"]
  },
  {
    key: "q6",
    text: "¿Consideras necesario invertir en sistemas de prevención de inundaciones?",
    options: ["Sí", "No"]
  },
  {
    key: "q7",
    text: "¿Crees que detectar una inundación a tiempo puede reducir los daños?",
    options: ["Sí", "No"]
  }
];

const STORAGE_KEY = "sapi_respuestas_v1";

const form = document.getElementById("surveyForm");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const successMessage = document.getElementById("successMessage");
const newResponseButton = document.getElementById("newResponseButton");
const resultsGrid = document.getElementById("resultsGrid");
const responseCount = document.getElementById("responseCount");
const downloadButton = document.getElementById("downloadButton");
const clearButton = document.getElementById("clearButton");
const menuButton = document.getElementById("menuButton");
const nav = document.querySelector(".nav");
const toast = document.getElementById("toast");

function getResponses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function updateProgress() {
  const answered = questions.filter(({ key }) =>
    form.querySelector(`input[name="${key}"]:checked`)
  ).length;

  const percentage = (answered / questions.length) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${answered} de ${questions.length}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function validateForm() {
  let isValid = true;
  let firstInvalid = null;

  questions.forEach(({ key }) => {
    const questionElement = document.querySelector(`[data-question="${key}"]`);
    const checked = form.querySelector(`input[name="${key}"]:checked`);

    questionElement.classList.toggle("invalid", !checked);

    if (!checked) {
      isValid = false;
      firstInvalid ??= questionElement;
    }
  });

  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return isValid;
}

function renderResults() {
  const responses = getResponses();
  responseCount.textContent = responses.length;

  if (responses.length === 0) {
    resultsGrid.innerHTML = `
      <div class="empty-state">
        <strong>Todavía no hay respuestas.</strong>
        <p>Completá la encuesta para ver el resumen de resultados.</p>
      </div>
    `;
    return;
  }

  resultsGrid.innerHTML = questions.map((question, index) => {
    const counts = Object.fromEntries(question.options.map(option => [option, 0]));

    responses.forEach(response => {
      const value = response.answers[question.key];
      if (value in counts) counts[value] += 1;
    });

    const rows = question.options.map(option => {
      const count = counts[option];
      const percentage = Math.round((count / responses.length) * 100);

      return `
        <div class="result-row">
          <div class="result-label">
            <span>${option}</span>
            <strong>${count} · ${percentage}%</strong>
          </div>
          <div class="result-track">
            <span style="width:${percentage}%"></span>
          </div>
        </div>
      `;
    }).join("");

    return `
      <article class="result-card">
        <h3>${String(index + 1).padStart(2, "0")}. ${question.text}</h3>
        ${rows}
      </article>
    `;
  }).join("");
}

form.addEventListener("change", event => {
  if (event.target.matches('input[type="radio"]')) {
    const parentQuestion = event.target.closest(".question");
    parentQuestion.classList.remove("invalid");
    updateProgress();
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!validateForm()) {
    showToast("Completá todas las preguntas antes de enviar.");
    return;
  }

  const formData = new FormData(form);
  const answers = Object.fromEntries(questions.map(({ key }) => [key, formData.get(key)]));

  const responses = getResponses();
  responses.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    answers
  });

  saveResponses(responses);
  form.style.display = "none";
  successMessage.classList.add("show");
  renderResults();
  showToast("Tu respuesta fue guardada correctamente.");
});

newResponseButton.addEventListener("click", () => {
  form.reset();
  document.querySelectorAll(".question").forEach(question => question.classList.remove("invalid"));
  updateProgress();
  successMessage.classList.remove("show");
  form.style.display = "block";
  document.getElementById("encuesta").scrollIntoView({ behavior: "smooth" });
});

downloadButton.addEventListener("click", () => {
  const responses = getResponses();

  if (responses.length === 0) {
    showToast("No hay respuestas para descargar.");
    return;
  }

  const headers = ["Fecha", ...questions.map((_, index) => `Pregunta ${index + 1}`)];
  const rows = responses.map(response => [
    new Date(response.createdAt).toLocaleString("es-PY"),
    ...questions.map(question => response.answers[question.key])
  ]);

  const escapeCsv = value => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [headers, ...rows].map(row => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "respuestas_sapi.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  showToast("Archivo CSV descargado.");
});

clearButton.addEventListener("click", () => {
  const responses = getResponses();

  if (responses.length === 0) {
    showToast("No hay datos guardados.");
    return;
  }

  const confirmed = window.confirm("¿Seguro que querés borrar todas las respuestas guardadas en este dispositivo?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  renderResults();
  showToast("Las respuestas fueron eliminadas.");
});

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

updateProgress();
renderResults();
