import React, { useState } from "react";
import * as XLSX from "xlsx";
import pkg from "file-saver";
const { saveAs } = pkg;

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
interface JsonObject {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

export default function MyContainer() {
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [jsonData, setJsonData] = useState<JsonObject | null>(null);
  const [fileName, setFileName] = useState("");

  const handleUploadPdf = async () => {
    if (!selectedPdf) return;

    const formData = new FormData();
    formData.append("pdf_file", selectedPdf);

    const response = await fetch("http://127.0.0.1:8000/upload_pdf", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setAiResponse(data.risposta_ai);
    setJsonData(data.dati_json);
    setFileName(data.nome_file);
  };

  const handleInputChange = (keys: string[], newVal: string | number) => {
    if (!jsonData) return;

    setJsonData((prev) => {
      const updated = { ...prev } as any;
      let ref = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = isNaN(Number(newVal))
        ? newVal
        : Number(newVal);
      return updated;
    });
  };

  const renderEditableData = (data: JsonValue, parentKeys: string[] = []) => {
    if (typeof data !== "object" || data === null) return null;

    return Object.entries(data).map(([key, value]) => {
      const keys = [...parentKeys, key];
      const depth = keys.length - 1;
      const indentStyle = { paddingLeft: `${depth * 20}px` };

      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        value !== null
      ) {
        return (
          <div key={keys.join("-")} className="mb-2">
            <div
              className="font-semibold text-gray-700 dark:text-gray-200 mb-1"
              style={indentStyle}
            >
              {key}
            </div>
            {renderEditableData(value, keys)}
          </div>
        );
      }

      return (
        <div
          key={keys.join("-")}
          className="flex items-center space-x-4 mb-2"
          style={indentStyle}
        >
          <label className="w-48 text-gray-700 dark:text-gray-200 font-medium">
            {key}
          </label>
          <input
            type="text"
            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-800 dark:text-gray-100"
            value={value as string | number}
            onChange={(e) => handleInputChange(keys, e.target.value)}
          />
        </div>
      );
    });
  };

  const flattenData = () => {
    const flatArray: {
      Sezione: string;
      Parametro: string;
      Valore: string | number | boolean;
    }[] = [];
    if (!jsonData) return flatArray;

    const recurse = (obj: JsonObject, section: string) => {
      for (const [key, value] of Object.entries(obj)) {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          value !== null
        ) {
          recurse(value as JsonObject, `${section} - ${key}`);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            flatArray.push({
              Sezione: `${section} - ${key}`,
              Parametro: `Medicinale ${idx + 1}`,
              Valore: item as string | number | boolean,
            });
          });
        } else {
          flatArray.push({
            Sezione: section,
            Parametro: key,
            Valore: value as string | number | boolean,
          });
        }
      }
    };

    recurse(jsonData, "Dati");
    return flatArray;
  };

  const autoWidth = (ws: XLSX.WorkSheet, data: any[]) => {
    const colWidths = data[0]
      ? Object.keys(data[0]).map(() => ({ wch: 10 }))
      : [];

    data.forEach((row) => {
      Object.values(row).forEach((val, idx) => {
        const length = val ? val.toString().length : 10;
        if (length > (colWidths[idx]?.wch ?? 10)) {
          colWidths[idx].wch = length + 2;
        }
      });
    });

    ws["!cols"] = colWidths;
  };

  const handleExportExcel = () => {
    const flatData = flattenData();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(flatData);
    autoWidth(ws, flatData);
    XLSX.utils.book_append_sheet(wb, ws, "Dati_Completi");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    const suggestedName = fileName?.replace(/\.pdf$/i, "") || "dati_medici";
    saveAs(blob, `${suggestedName}.xlsx`);
  };

  const handleSendExcel = async () => {
    if (!jsonData || !fileName) {
      alert("Dati JSON o nome file mancanti.");
      return;
    }

    const payload = {
      // risposta_ai: aiResponse,
      dati_json: jsonData,
      nome_file: fileName,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/crea_excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || "✅ Excel creato con successo!");
      } else {
        console.error(data);
        alert("❌ Errore nella creazione del file Excel.");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("❌ Errore nella connessione al server.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Estrazione dati da PDF clinico
        </h1>

        <div className="mb-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setSelectedPdf(e.target.files?.[0] || null)}
            className="mb-2"
          />
          <button
            onClick={handleUploadPdf}
            disabled={!selectedPdf}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Invia PDF al backend
          </button>
        </div>

        {jsonData ? (
          <>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
              Dati modificabili
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              {renderEditableData(jsonData)}
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Esporta in Excel
              </button>
              <button
                onClick={handleSendExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Salva Excel
              </button>
            </div>
          </>
        ) : (
          <textarea
            id="response"
            placeholder="Qui apparirà la risposta..."
            className="w-full min-h-[300px] p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 resize-y overflow-auto mb-4 text-sm leading-relaxed"
            value={aiResponse}
            readOnly
            disabled
          />
        )}
      </div>
    </main>
  );
}
