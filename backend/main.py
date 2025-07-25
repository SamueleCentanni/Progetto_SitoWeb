from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import fitz  # PyMuPDF
import requests
import ast
import google.generativeai as genai
import os
from dotenv import load_dotenv
import pandas as pd

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-1.5-flash")

app = FastAPI()

# CORS per permettere chiamate dal frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # oppure ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Prompt base
PROMPT_TEMPLATE = """
Sei un medico cardiologo. Leggi attentamente il seguente referto ecocardiografico e restituisci
**esclusivamente** un oggetto JSON valido (senza testo introduttivo, senza codice Python, senza spiegazioni).
La struttura deve rispettare esattamente il seguente formato annidato:
Rispondi esclusivamente con un oggetto JSON valido, senza usare blocchi di codice (niente ```json o simili), né prefissi come 'data ='.

{{
  "Esami_ematochimici": {{
    "Hb": <numero>,
    "creatinemia": <numero>,
    "eGFR": <numero>
  }},
  "Terapia domiciliare": [<lista di farmaci come stringhe>],
  "ECOCARDIOGRAMMA": {{
    "Ventricolo sinistro": {{
      "DTD": <numero>,
      "DTS": <numero>,
      "VTD": <numero>,
      "VTS": <numero>,
      "FE": <numero>
    }},
    "Ventricolo destro": {{
      "DTDm": <numero>,
      "TAPSE": <numero>,
      "s": <numero>
    }},
    "Atrio sinistro": {{
      "Area in 4C": <numero>,
      "vol": <numero>,
      "LAVi": <numero>
    }},
    "Aorta": {{
      "insufficienza": "<formato tipo '2+/3+'>",
      "Gmed": <numero>
    }},
    "Mitrale": {{
      "insufficienza": "<formato tipo '3+/4+'>"
    }},
    "Tricuspide": {{
      "insufficienza": "<formato tipo '2+/4+'>",
      "PAPs": <numero>
    }}
  }}
}}

Referto:
---
{testo}
"""


PROMPT_TEMPLATE_EASY_VIEW = """
Agisci come un assistente medico. Il tuo collega ha raccolto i seguenti dati clinici. Il tuo compito è renderli leggibili e comprensibili,
in modo che chiunque possa verificarli facilmente e capire se il tuo collega ha operato correttamente.

Il tuo output deve contenere:
1. Una descrizione chiara, sintetica ed esaustiva dei dati forniti.
2. Alla fine, una diagnosi dettagliata basata sui dati analizzati.

Regole:
- Non usare formattazioni speciali (come asterischi o markdown).
- Non aggiungere nulla oltre alla descrizione dei dati e alla diagnosi.
- La diagnosi deve essere preceduta dalla dicitura: DIAGNOSI

Il tuo output deve essere una stringa Python semplice, adatta a essere usata direttamente in uno script (non includere ```python o altre delimitazioni).

Dati da analizzare:
{testo}
"""

def estrai_testo_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for pagina in doc:
        testo = pagina.get_text()

        testo = testo.replace("​AZIENDA OSPEDALIERA UNIVERSITARIA SENESE", "")
        testo = testo.replace("U.O.S. DIAGNOSTICA CARDIOVASCOLARE​", "")
        testo = testo.replace("U.O.C. CARDIOLOGIA​", "")
        testo = testo.replace("Telefono e fax: 0577/585377", "")
        testo = testo.replace("​VISITA CARDIOLOGICA-ECG-ECOCARDIOGRAMMA", "")

        text += testo + "\n" 

    return text

def chiama_llm_gemini_testuale(prompt, model_name="gemini-1.5-flash"):
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("❌ Errore nella generazione del testo:", e)
        return None

def chiama_llm_gemini_json(prompt, model_name="gemini-1.5-flash"):
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        risp = response.text
        
        if "data =" in risp:
            risp = risp.split("data =", 1)[1].strip()
        
        dizionario = ast.literal_eval(risp)
        if isinstance(dizionario, dict):
            return dizionario
        else:
            raise ValueError("La risposta non è un dizionario.")
    except Exception as e:
        print("❌ Errore nella valutazione della risposta:", e)
        print("Risposta ricevuta:", risp)
        return None

def chiama_llm_mistral(prompt, model="mistral"):
    url = "http://localhost:11434/api/generate"
    response = requests.post(url, json={
        "model": model,
        "prompt": prompt,
        "stream": False
    })
    risp = response.json()["response"]
    try:
        if "data =" in risp:
            risp = risp.split("data =", 1)[1].strip()
        
        dizionario = ast.literal_eval(risp)
        if isinstance(dizionario, dict):
            return dizionario
        else:
            raise ValueError("La risposta non è un dizionario.")
    except Exception as e:
        print("Errore nella valutazione della risposta:", e)
        print("Risposta ricevuta:", risp)
        return None


def estrai_e_salva(pdf_path):
    print(pdf_path + " from estrai e salva")
    testo = estrai_testo_pdf(pdf_path)
    
    prompt_json = PROMPT_TEMPLATE.format(testo=testo)
    dati_json = chiama_llm_gemini_json(prompt_json)
    
    if not dati_json:
        return {"errore": "Impossibile estrarre dati JSON dal referto"}
    else:
        print(dati_json)
    
    prompt_clear = PROMPT_TEMPLATE_EASY_VIEW.format(testo=dati_json)
    dati_clear = chiama_llm_gemini_testuale(prompt_clear)
    # dati = chiama_llm_mistral(prompt)
    if dati_clear:
        print(dati_clear)
    
    return {
        #"dati_clear": dati_clear, 
        "dati_json": dati_json    
    }

    
@app.post("/upload_pdf")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    file_path = f"uploaded/{pdf_file.filename}"
    print(file_path + " from upload pdf")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(pdf_file.file, buffer)

    # Simula risposta AI
    testo_estratto = estrai_e_salva(file_path)
    
    print(testo_estratto)
    return {
        #"dati_clear": testo_estratto["dati_clear"], 
        "dati_json": testo_estratto["dati_json"],
        "nome_file": pdf_file.filename
    }

def flatten_dict(d, parent_keys=[]):
    items = []
    for k, v in d.items():
        new_keys = parent_keys + [k]
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_keys))
        elif isinstance(v, list):
            for i, val in enumerate(v):
                items.append((tuple(new_keys + [f'item_{i+1}']), val))
        else:
            items.append((tuple(new_keys), v))
    return items

def salva_in_excel(dati, excel_path):
    flat_data = flatten_dict(dati)

    # Crea lista di righe: ogni chiave diventa una riga
    rows = []
    for keys, value in flat_data:
        # Completa con "-" se ci sono meno di 3 livelli
        while len(keys) < 3:
            keys += ('-',)
        rows.append((*keys, value))

    df = pd.DataFrame(rows, columns=["Categoria", "Sottocategoria", "Dettaglio", "Valore"])
    df.to_excel(excel_path, index=False)

class RichiestaExcel(BaseModel):
    #risposta_ai: str
    dati_json: dict
    nome_file: str

@app.post("/crea_excel")
def crea_excel(richiesta: RichiestaExcel):
    output_excel_path = f"excel_outputs/{richiesta.nome_file.replace('.pdf', '.xlsx')}"
    os.makedirs("excel_outputs", exist_ok=True)

    #print(richiesta.risposta_ai)
    salva_in_excel(richiesta.dati_json, output_excel_path)

    return {"message": "📄 File Excel creato con successo!"}