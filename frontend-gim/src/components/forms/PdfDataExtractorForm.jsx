import React from "react";

export default function PdfDataForm({
                                        jsonData,
                                        selectedPdf,
                                        handleFileSelect,
                                        handleUploadPdf,
                                        handleExportExcel,
                                        handleSendExcel,
                                        handleFormSubmit,
                                        renderEditableFields,
                                    }) {
    return (
        <div className=" bg-background text-primary p-6 md:p-10 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8">

                {/* Header Section */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-text_gradient bg-clip-text text-transparent mb-2">
                        PDF Data Extractor
                    </h1>
                </header>

                {/* PDF Upload Section */}
                <section className="space-y-6">
                    <label htmlFor="pdf-upload" className="block text-secondary text-lg font-semibold">
                        Upload Your PDF Document
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileSelect}
                            className="file-input file-input-bordered file-input-primary w-full max-w-md bg-gray-700 text-primary border-gray-600 focus:border-gradientTextEnd"
                        />
                        <button
                            onClick={handleUploadPdf}
                            disabled={!selectedPdf}
                            className="btn bg-btngradient_primary text-white border-none min-w-[150px]
               hover:bg-btngradient_primary_inverted transition-all duration-300 ease-in-out
               disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
                        >
                            Elaborate PDF
                        </button>
                    </div>
                    {selectedPdf && (
                        <p className="text-textLight text-sm mt-2">
                            Selected: <span className="font-semibold">{selectedPdf.name}</span>
                        </p>
                    )}
                </section>

                {/* Data Display and Edit Section */}
                {jsonData && (
                    <form onSubmit={handleFormSubmit} className="space-y-8 mt-12">
                        <section>
                            <h2 className="text-2xl font-bold text-secondary mb-5">
                                Review & Edit Data
                            </h2>
                            <div className="bg-gray-700 rounded-lg p-6 shadow-inner border border-gray-600">
                                {renderEditableFields(jsonData)}
                            </div>
                            <p className="text-textMuted text-sm mt-4">
                                Make any necessary adjustments to the extracted information above.
                            </p>
                        </section>

                        {/* Action Buttons Section */}
                        <section className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="btn bg-btngradient_secondary text-white border-none min-w-[180px]
                 hover:bg-btngradient_secondary transition-all duration-300 ease-in-out
                 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Export to Excel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSendExcel}
                                className="btn bg-btngradient_primary text-white border-none min-w-[180px]
                 hover:bg-btngradient_primary_inverted transition-all duration-300 ease-in-out
                 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Download Excel File
                            </button>
                        </section>
                    </form>
                )}
            </div>
        </div>
    );
}