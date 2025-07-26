import ast
import google.generativeai as genai
import requests

def genera_json(prompt, model_name="gemini-1.5-flash"):
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        text = response.text.strip()
        if "data =" in text:
            text = text.split("data =", 1)[1].strip()
        return ast.literal_eval(text)
    except Exception as e:
        print("❌ Errore Gemini:", e)
        return None

def genera_mistral(prompt, model="mistral"):
    response = requests.post("http://localhost:11434/api/generate", json={
        "model": model,
        "prompt": prompt,
        "stream": False
    })
    text = response.json()["response"]
    try:
        if "data =" in text:
            text = text.split("data =", 1)[1].strip()
        return ast.literal_eval(text)
    except Exception as e:
        print("❌ Errore Mistral:", e)
        return None