from pydantic import BaseModel

class ExcelRequest(BaseModel):
    dati_json: dict
    nome_file: str