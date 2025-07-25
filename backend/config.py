import os
from dotenv import load_dotenv
import google.generativeai as genai

def setup_environment():
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))