const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");

function updateFeedbackStatus(message, type) {
  if (!feedbackStatus) {
    return;
  }

  feedbackStatus.textContent = message;
  feedbackStatus.className = "form-status";

  if (type) {
    feedbackStatus.classList.add(`is-${type}`);
  }
}

if (feedbackForm) {
  feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!feedbackForm.reportValidity()) {
      updateFeedbackStatus("Completa todos los campos antes de enviar tu feedback.", "error");
      return;
    }

    const formData = new FormData(feedbackForm);
    const businessName = String(formData.get("businessName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = encodeURIComponent(`Feedback Puesto - ${businessName}`);
    const body = encodeURIComponent(
      `Nombre del negocio: ${businessName}\nCorreo de contacto: ${email}\n\nFeedback:\n${message}`
    );

    updateFeedbackStatus(
      "Se abrirá tu correo con el mensaje listo. Si no ocurre nada, escríbeme a diegodksanchez@gmail.com.",
      "success"
    );

    window.location.href = `mailto:diegodksanchez@gmail.com?subject=${subject}&body=${body}`;
  });
}
