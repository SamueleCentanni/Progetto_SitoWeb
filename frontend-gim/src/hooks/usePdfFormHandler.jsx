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
        setTimeout(() => {
            setAlert({ message: "", type: "info", visible: false });
        }, 2000);
    };
    const closeAlert = () => setAlert({ message: "", type: "info", visible: false });

    const handleFileSelect = (e) => {
        setSelectedPdf(e.target.files?.[0] || null);
        // Clear previous data and alerts when a new file is selected
        setJsonData(null);
        setAiResponse("");
        setFileName("");
        closeAlert();
    };

    const handleUploadPdf = async () => {
        if (!selectedPdf) {
            showAlert("Please select a PDF file first.", "warning");
            return;
        }
        closeAlert();
        try {
            const data = await uploadPdf(selectedPdf);
            setAiResponse(data.risposta_ai);

            const processedJsonData = { ...data.dati_json };

            // Normalize the "Terapia domiciliare" field if present
            if (typeof processedJsonData["Terapia domiciliare"] === "string") {
                processedJsonData["Terapia domiciliare"] = processedJsonData["Terapia domiciliare"]
                    .split(",")
                    .map(item => item.trim())
                    .filter(item => item !== "");
            }

            setFileName(data.nome_file);

            const isEmpty = !processedJsonData || Object.keys(processedJsonData).length === 0;
            setJsonData(isEmpty ? null : processedJsonData);

            if (isEmpty) {
                showAlert("The PDF was processed, but no data was extracted.", "warning");
            } else {
                showAlert("✅ PDF processed successfully!", "success");
            }
        } catch (err) {
            console.error("Error during PDF upload and processing:", err);
            showAlert("❌ Error processing PDF. Please try again.", "error");
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
            const lastKey = keys[keys.length - 1];
            if (Array.isArray(ref) && !isNaN(Number(lastKey))) {
                ref[Number(lastKey)] = newVal;
            } else {
                ref[lastKey] = isNaN(Number(newVal)) ? newVal : Number(newVal);
            }
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
                            className="font-semibold text-secondary mb-1"
                            style={indentStyle}
                        >
                            {key}
                        </div>
                        {renderEditableFields(value, keys)}
                    </div>
                );
            } else if (Array.isArray(value)) {
                return (
                    <div key={keys.join("-")} className="mb-2">
                        <div
                            className="font-semibold text-secondary mb-1"
                            style={indentStyle}
                        >
                            {key}
                        </div>
                        {value.map((item, index) => (
                            <div
                                key={`${keys.join("-")}-${index}`}
                                className="flex items-center space-x-4 mb-2"
                                style={{ paddingLeft: `${(depth + 1) * 20}px` }}
                            >
                                <label className="w-48 text-textLight font-medium">
                                    Medicine {index + 1}
                                </label>
                                <input
                                    type="text"
                                    className="flex-1 bg-background border border-gray-600 rounded px-2 py-1 text-primary placeholder-textLight"
                                    value={item}
                                    onChange={(e) => handleFieldChange([...keys, String(index)], e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <div
                    key={keys.join("-")}
                    className="flex items-center space-x-4 mb-2"
                    style={indentStyle}
                >
                    <label className="w-48 text-textLight font-medium">
                        {key}
                    </label>
                    <input
                        type="text"
                        className="flex-1 bg-background border border-gray-600 rounded px-2 py-1 text-primary placeholder-textLight"
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
        if (flatData.length === 0) {
            showAlert("No data to export.", "warning");
            return;
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(flatData);
        adjustColumnWidths(ws, flatData);
        XLSX.utils.book_append_sheet(wb, ws, "Full_Data");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        const suggestedName = fileName?.replace(/\.pdf$/i, "") || "medical_data";
        saveAs(blob, `${suggestedName}.xlsx`);
        showAlert("✅ Data exported to Excel!", "success");
    };

    const handleSendExcel = async () => {
        if (!jsonData || !fileName) {
            showAlert("Missing JSON data or file name.", "error");
            return;
        }
        closeAlert();
        try {
            const data = await sendExcel(jsonData, fileName);
            showAlert(data.message || "Excel saved successfully in backend!", "success");
        } catch (err) {
            console.error("Error sending Excel to backend:", err);
            showAlert("❌ Error saving Excel file to backend.", "error");
        }
    };

    const handleReset = () => {
        setSelectedPdf(null);
        setAiResponse("");
        setJsonData(null);
        setFileName("");
        closeAlert();
    };

    return {
        aiResponse,
        jsonData,
        fileName,
        selectedPdf,
        alert,
        closeAlert,
        showAlert,
        handleFileSelect,
        handleUploadPdf,
        handleSendExcel,
        handleExportExcel,
        renderEditableFields,
        handleReset,
    };
}