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

const form = document.getElementById("surveyForm");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const successMessage = document.getElementById("successMessage");
const newResponseButton = document.getElementById("newResponseButton");

const menuButton = document.getElementById("menuButton");
const nav = document.querySelector(".nav");
const toast = document.getElementById("toast");


// ================================
// ACTUALIZAR PROGRESO
// ================================

function updateProgress() {

  const answered = questions.filter(({ key }) =>
    form.querySelector(`input[name="${key}"]:checked`)
  ).length;

  const percentage = (answered / questions.length) * 100;

  progressBar.style.width = `${percentage}%`;

  progressText.textContent =
    `${answered} de ${questions.length}`;
}


// ================================
// MOSTRAR MENSAJE
// ================================

function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  window.clearTimeout(showToast.timer);

  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}


// ================================
// VALIDAR ENCUESTA
// ================================

function validateForm() {

  let isValid = true;

  let firstInvalid = null;

  questions.forEach(({ key }) => {

    const questionElement =
      document.querySelector(
        `[data-question="${key}"]`
      );

    const checked =
      form.querySelector(
        `input[name="${key}"]:checked`
      );

    questionElement.classList.toggle(
      "invalid",
      !checked
    );

    if (!checked) {

      isValid = false;

      if (!firstInvalid) {
        firstInvalid = questionElement;
      }
    }
  });


  if (firstInvalid) {

    firstInvalid.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  }

  return isValid;
}


// ================================
// ENVIAR RESPUESTAS A PHP
// ================================

form.addEventListener("submit", async event => {

  event.preventDefault();


  // Primero verificamos que todas
  // las preguntas estén respondidas

  if (!validateForm()) {

    showToast(
      "Completá todas las preguntas antes de enviar."
    );

    return;
  }


  // Obtenemos las respuestas del formulario

  const formData = new FormData(form);


  try {

    // Enviamos los datos a guardar.php

    const response = await fetch(
      "guardar.php",
      {
        method: "POST",
        body: formData
      }
    );


    // PHP devuelve un texto

    const resultado = await response.text();


    // Si PHP respondió OK,
    // significa que se guardó correctamente

    if (resultado.trim() === "OK") {

      form.style.display = "none";

      successMessage.classList.add("show");

      showToast(
        "Tu respuesta fue guardada correctamente."
      );

    } else {

      console.error(
        "Respuesta de PHP:",
        resultado
      );

      showToast(
        "Ocurrió un error al guardar la respuesta."
      );
    }


  } catch (error) {

    console.error(
      "Error de conexión:",
      error
    );

    showToast(
      "No se pudo conectar con el servidor."
    );
  }

});


// ================================
// NUEVA RESPUESTA
// ================================

newResponseButton.addEventListener(
  "click",
  () => {

    form.reset();

    document
      .querySelectorAll(".question")
      .forEach(question => {

        question.classList.remove("invalid");

      });


    updateProgress();


    successMessage.classList.remove("show");

    form.style.display = "block";


    document
      .getElementById("encuesta")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


// ================================
// MENÚ
// ================================

menuButton.addEventListener(
  "click",
  () => {

    const isOpen =
      nav.classList.toggle("open");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  }
);


nav.querySelectorAll("a").forEach(link => {

  link.addEventListener(
    "click",
    () => {

      nav.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

    }
  );

});


// ================================
// INICIAR
// ================================

updateProgress();
