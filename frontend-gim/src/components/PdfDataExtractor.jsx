import React from "react";
import usePdfFormHandler from "../hooks/usePdfFormHandler.jsx";
import PdfDataForm from "./forms/PdfDataExtractorForm.jsx";
import Alert from "./Alert.jsx";

export default function PdfDataExtractor() {
    const form = usePdfFormHandler();

    return (
        <main className="flex flex-col items-center justify-start p-8">
            <div className="max-w-4xl w-full">
                {form.alert.visible && (
                    <Alert
                        message={form.alert.message}
                        type={form.alert.type}
                        onClose={form.closeAlert}
                    />
                )}
                <PdfDataForm {...form} />

            </div>
        </main>
    );
}