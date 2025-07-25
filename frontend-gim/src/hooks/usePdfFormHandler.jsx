import { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { uploadPdf, sendExcel } from "../APIs";

export default function usePdfFormHandler() {
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [aiResponse, setAiResponse] = useState("");
    const [jsonData, setJsonData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [alert, setAlert] = useState({ message: "", type: "info", visible: false });

    const showAlert = (message, type = "info") => {
        setAlert({ message, type, visible: true });
    };
    const closeAlert = () => setAlert({ message: "", type: "info", visible: false });

    const handleFileSelect = (e) => {
        setSelectedPdf(e.target.files?.[0] || null);
    };

    const handleUploadPdf = async () => {
        if (!selectedPdf) return;
        try {
            const data = await uploadPdf(selectedPdf);
            setAiResponse(data.risposta_ai);
            setJsonData(data.dati_json);
            setFileName(data.nome_file);
        } catch (err) {
            console.error(err);
            showAlert("❌ Error uploading PDF.", "error");
        }
    };

    const handleFieldChange = (keys, newVal) => {
        if (!jsonData) return;

        setJsonData((prev) => {
            const updated = { ...prev };
            let ref = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                ref = ref[keys[i]];
            }
            ref[keys[keys.length - 1]] = isNaN(Number(newVal)) ? newVal : Number(newVal);
            return updated;
        });
    };

    const renderEditableFields = (data, parentKeys = []) => {
        if (typeof data !== "object" || data === null) return null;

        return Object.entries(data).map(([key, value]) => {
            const keys = [...parentKeys, key];
            const depth = keys.length - 1;
            const indentStyle = { paddingLeft: `${depth * 20}px` };

            if (typeof value === "object" && !Array.isArray(value) && value !== null) {
                return (
                    <div key={keys.join("-")} className="mb-2">
                        <div
                            className="font-semibold text-gray-700 dark:text-gray-200 mb-1"
                            style={indentStyle}
                        >
                            {key}
                        </div>
                        {renderEditableFields(value, keys)}
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
                        value={value}
                        onChange={(e) => handleFieldChange(keys, e.target.value)}
                    />
                </div>
            );
        });
    };

    const flattenJsonToArray = () => {
        const flatArray = [];
        if (!jsonData) return flatArray;

        const traverse = (obj, section) => {
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === "object" && !Array.isArray(value) && value !== null) {
                    traverse(value, `${section} - ${key}`);
                } else if (Array.isArray(value)) {
                    value.forEach((item, idx) => {
                        flatArray.push({
                            Section: `${section} - ${key}`,
                            Parameter: `Medicine ${idx + 1}`,
                            Value: item,
                        });
                    });
                } else {
                    flatArray.push({
                        Section: section,
                        Parameter: key,
                        Value: value,
                    });
                }
            }
        };

        traverse(jsonData, "Data");
        return flatArray;
    };

    const adjustColumnWidths = (ws, data) => {
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
        const flatData = flattenJsonToArray();
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(flatData);
        adjustColumnWidths(ws, flatData);
        XLSX.utils.book_append_sheet(wb, ws, "Full_Data");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        const suggestedName = fileName?.replace(/\.pdf$/i, "") || "medical_data";
        saveAs(blob, `${suggestedName}.xlsx`);
    };

    const handleSendExcel = async () => {
        if (!jsonData || !fileName) {
            showAlert("Missing JSON data or file name.", "error");
            return;
        }

        try {
            const data = await sendExcel(jsonData, fileName);
            showAlert(data.message || "✅ Excel created successfully!", "success");
        } catch (err) {
            console.error(err);
            showAlert("❌ Error creating Excel file.", "error");
        }
    };

    return {
        aiResponse,
        jsonData,
        fileName,
        selectedPdf,
        alert,
        closeAlert,
        handleFileSelect,
        handleUploadPdf,
        handleSendExcel,
        handleExportExcel,
        renderEditableFields,
    };
}