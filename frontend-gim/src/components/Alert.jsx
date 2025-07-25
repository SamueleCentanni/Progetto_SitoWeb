import React from "react";

export default function Alert({ message, type = "info", onClose }) {
    if (!message) return null;

    const typeClass = {
        info: "alert-info",    // DaisyUI info color
        success: "alert-success",  // DaisyUI success color
        error: "alert-error",    // DaisyUI error color
        warning: "alert-warning",  // DaisyUI warning color
    };

    return (
        <div
            className={`alert ${typeClass[type]} p-4 shadow-md w-full rounded-lg my-6`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <span className="font-medium text-lg text-left flex-grow">{message}</span>
            <button
                type="button"
                className="btn btn-sm btn-circle btn-ghost text-xl font-light ml-auto"
                onClick={onClose}
                aria-label="Close alert"
            >
                ×
            </button>
        </div>
    );
}