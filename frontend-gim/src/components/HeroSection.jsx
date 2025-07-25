import React from "react";
import { Link } from "react-router"; // Assuming you're using react-router-dom v6 for Link

export default function HeroSection() {
    return (
        <section
            className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center"
        >
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-bg_gradient_pastel drop-shadow-lg">
                Welcome to our beautiful Web application!
            </h1>
            <p className="mt-4 text-lg md:text-xl text-textLight max-w-2xl">
                Crafted with care, styled with elegance. Dive in and explore.
            </p>
            <Link to="/extract">
                <button className="mt-8 px-6 py-3 rounded-xl text-primary font-semibold bg-bg_gradient_text_focus hover:opacity-90 transition">
                    Go to the Extractor
                </button>
            </Link>
        </section>
    );
}