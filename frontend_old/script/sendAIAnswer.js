const sendBtn = document.getElementById('sendBtn');
const responseBox = document.getElementById('response');
const pdfInput = document.getElementById('pdfInput');
const continueContainer = document.getElementById('continueContainer');

sendBtn.addEventListener('click', async () => {
  console.log("📨 Bottone Invia cliccato");
  const file = pdfInput.files[0];

  if (file) {
    alert("Seleziona un file PDF prima di inviare.");
    return;
  }

  const formData = new FormData();
  formData.append("pdf_file", file);

  try {
    const res = await fetch("http://127.0.0.1:8000/upload_pdf", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    responseBox.value = result.message;

    // Dopo che arriva la risposta, crea il pulsante CONTINUA
    createContinueButton(result.message);

  } catch (err) {
    console.error("Errore nell'upload:", err);
    responseBox.value = "Errore durante l'elaborazione del file.";
  }
});

function createContinueButton(risposta) {
  // Rimuove il pulsante se già esiste
  const oldBtn = document.getElementById("continueBtn");
  if (oldBtn) {
    oldBtn.remove();
  }

  const continueBtn = document.createElement("button");
  continueBtn.id = "continueBtn";
  continueBtn.textContent = "Continua";
  continueBtn.style.marginTop = "1rem";
  continueBtn.style.padding = "0.6rem 1.2rem";
  continueBtn.style.backgroundColor = "#28a745";
  continueBtn.style.color = "white";
  continueBtn.style.border = "none";
  continueBtn.style.borderRadius = "6px";
  continueBtn.style.cursor = "pointer";

  continueBtn.addEventListener("click", async () => {
    const conferma = confirm("Sicura che vuoi continuare?");
    if (!conferma) return;

    try {
      const res = await fetch("http://localhost:8000/crea_excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ risposta_ai: risposta })
      });

      const result = await res.json();
      alert(result.message || "Excel creato!");
      continueBtn.remove();
    } catch (err) {
      alert("Errore durante la creazione dell'Excel.");
    }
  });

  continueContainer.appendChild(continueBtn);
}