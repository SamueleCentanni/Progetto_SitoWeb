import React, { useState } from "react";

export default function PdfDataForm({
                                        jsonData,
                                        selectedPdf,
                                        handleFileSelect,
                                        handleUploadPdf,
                                        handleExportExcel,
                                        handleSendExcel,
                                        renderEditableFields,
                                        onReset,
                                        // No need for alert, showAlert, closeAlert props here anymore
                                    }) {
    const [isUploading, setIsUploading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Processing PDF...");

    const onUploadClick = async () => {
        setIsUploading(true);
        setLoadingMessage("Uploading PDF..."); // Initial message for the overlay

        try {
            await handleUploadPdf();
        } catch (error) {
            console.error("Error in PdfDataForm's onUploadClick:", error);
            setLoadingMessage("An error occurred!");
        } finally {
            setIsUploading(false);
            setLoadingMessage("Processing PDF...");
        }
    };

    return (
        <div className="bg-background text-primary p-6 md:p-10 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8 relative"> {/* Added relative for modal positioning */}

                {/* Loading Overlay/Modal */}
                {isUploading && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50 rounded-xl animate-fade-in">
                        <div className="relative">
                            <span className="loading loading-spinner loading-lg text-primary" style={{ width: '80px', height: '80px' }}></span>
                        </div>
                        <p className="mt-4 text-xl font-semibold text-white text-center animate-pulse">
                            {loadingMessage}
                        </p>
                        <p className="text-sm text-gray-300 mt-2">Please wait, this may take a moment...</p>
                    </div>
                )}

                {/* Header */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-text_gradient bg-clip-text text-transparent mb-2">
                        PDF Data Extractor
                    </h1>
                </header>

                {/* Upload Section - show only if no data */}
                {!jsonData ? (
                    <section className="space-y-6" aria-label="PDF Upload Section">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input
                                id="pdf-upload"
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelect}
                                aria-describedby="upload-instructions"
                                className="file-input file-input-bordered file-input-primary w-full max-w-md bg-gray-700 text-primary border-gray-600 focus:border-gradientTextEnd focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={isUploading}
                            />
                            <button
                                onClick={onUploadClick}
                                disabled={!selectedPdf || isUploading}
                                className="btn bg-btngradient_primary text-white border-none min-w-[150px]
                                  hover:bg-btngradient_primary_inverted transition-all duration-300 ease-in-out
                                  disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400 flex items-center justify-center gap-2"
                                aria-disabled={!selectedPdf || isUploading}
                            >
                                Upload & Process PDF
                            </button>
                        </div>
                        {selectedPdf ? (
                            <p id="upload-instructions" className="text-textLight text-sm mt-2">
                                Selected file: <span className="font-semibold">{selectedPdf.name}</span>
                            </p>
                        ) : (
                            <p id="upload-instructions" className="text-textMuted text-sm mt-2">
                                Please select a PDF file to upload.
                            </p>
                        )}
                    </section>
                ) : (
                    <section
                        className="space-y-6"
                        aria-label="Uploaded PDF Info and Reset"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="break-words" title={selectedPdf?.name ?? ""}>
                                Current: <span className="font-mono text-2xl">{selectedPdf?.name}</span>
                            </p>
                            <button
                                type="button"
                                onClick={onReset}
                                className="btn bg-gray-500 text-white border-none min-w-[180px]
                                  hover:bg-gray-600 transition-all duration-300 ease-in-out"
                            >
                                Upload New PDF
                            </button>
                        </div>
                    </section>
                )}

                {/* Editable Data Form */}
                {jsonData && (
                    <form className="space-y-8 mt-12"
                          aria-label="Data Review and Edit Form">
                        <section>
                            <h2 className="text-2xl font-bold text-secondary mb-5">
                                Review & Edit Extracted Data
                            </h2>
                            <div
                                className="bg-gray-700 rounded-lg p-6 shadow-inner border border-gray-600 max-h-[40vh] overflow-auto">
                                {renderEditableFields(jsonData)}
                            </div>
                            <p className="text-textMuted text-sm mt-4">
                                Adjust the extracted information as needed before exporting.
                            </p>
                        </section>

                        {/* Buttons */}
                        <section className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="btn bg-btngradient_primary_inverted text-white border-none min-w-[180px]
                                  hover:bg-btngradient_primary transition-all duration-300 ease-in-out"
                            >
                                Download
                            </button>
                            <button
                                type="button"
                                onClick={handleSendExcel}
                                className="btn bg-btngradient_primary text-white border-none min-w-[180px]
             hover:bg-btngradient_primary_inverted transition-all duration-300 ease-in-out"
                            >
                                Save the Excel in the Backend
                            </button>
                        </section>
                    </form>
                )}
            </div>
        </div>
    );
}