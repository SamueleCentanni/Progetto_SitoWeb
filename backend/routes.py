import os
import shutil
from fastapi import APIRouter, UploadFile, File
from backend.services.pdf_service import pdf_extract_data
from backend.services.excel_service import salva_excel
from backend.schemas import ExcelRequest

router = APIRouter()

def get_unique_path(directory: str, filename: str) -> str:
    base, ext = os.path.splitext(filename)
    counter = 1
    unique_filename = filename
    while os.path.exists(os.path.join(directory, unique_filename)):
        unique_filename = f"{base}_{counter}{ext}"
        counter += 1
    return os.path.join(directory, unique_filename)

@router.post("/upload_pdf")
async def upload_pdf(pdf_file: UploadFile = File(...)):
    upload_dir = "backend/uploaded"
    os.makedirs(upload_dir, exist_ok=True)

    unique_path = get_unique_path(upload_dir, pdf_file.filename)
    with open(unique_path, "wb") as buffer:
        shutil.copyfileobj(pdf_file.file, buffer)

    dati = pdf_extract_data(unique_path)
    filename_saved = os.path.basename(unique_path)
    return {"dati_json": dati, "nome_file": filename_saved}

@router.post("/create_excel")
def create_excel(request: ExcelRequest):
    output_dir = "backend/excel_outputs"
    os.makedirs(output_dir, exist_ok=True)

    desired_filename = request.nome_file.replace('.pdf', '.xlsx')
    unique_output_path = get_unique_path(output_dir, desired_filename)

    print(f"Saving Excel to: {unique_output_path}")
    print(f"Data received: {request.dati_json}")

    salva_excel(request.dati_json, unique_output_path)

    if os.path.isfile(unique_output_path):
        print(f"File saved successfully: {unique_output_path}")
    else:
        print(f"Error saving file: {unique_output_path}")

    return {"message": "📁 Excel saved successfully in backend!", "excel_file": os.path.basename(unique_output_path)}