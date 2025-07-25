const pdfInput = document.getElementById('pdfInput');
const fileNameDisplay = document.getElementById('fileName');

pdfInput.addEventListener('change', () => {
  const file = pdfInput.files[0];
  if (file) {
    fileNameDisplay.textContent = `Hai selezionato: ${file.name}`;
  } else {
    fileNameDisplay.textContent = "Nessun file selezionato";
  }
});