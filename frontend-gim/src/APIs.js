// src/APIs.js

async function uploadPdf(pdfFile) {
    const formData = new FormData();
    formData.append("pdf_file", pdfFile);

    const response = await fetch("http://127.0.0.1:8000/upload_pdf", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Error during PDF upload");
    }

    return await response.json();
}

async function sendExcel(jsonData, fileName) {
    const payload = {
        dati_json: jsonData,
        nome_file: fileName,
    };

    const response = await fetch("http://127.0.0.1:8000/create_excel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error creating the Excel file");
    }

    return data;
}

export { sendExcel, uploadPdf };