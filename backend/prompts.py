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