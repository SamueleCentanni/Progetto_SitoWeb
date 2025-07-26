import fitz
from backend.services.llm_service import genera_json
from backend.prompts import PROMPT_TEMPLATE

def pdf_extract_text(path):
    doc = fitz.open(path)
    text = ""
    for pagina in doc:
        testo = pagina.get_text()
        for s in [
            "​AZIENDA OSPEDALIERA UNIVERSITARIA SENESE",
            "U.O.S. DIAGNOSTICA CARDIOLOGICA",
            "Telefono e fax: 0577/585377",
        ]:
            testo = testo.replace(s, "")
        text += testo + "\n"
    return text

def pdf_extract_data(path):
    testo = pdf_extract_text(path)
    prompt = PROMPT_TEMPLATE.format(testo=testo)
    return genera_json(prompt)