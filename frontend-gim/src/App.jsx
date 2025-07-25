import './App.css'
import {Route, Routes} from "react-router";
import {BasicLayout, DefaultRoute} from "./components/Layout.jsx";
import HeroSection from "./components/HeroSection.jsx";
import PdfDataExtractor from "./components/PdfDataExtractor.jsx";

function App() {

    return (
        <Routes>

            <Route path="/" element={<BasicLayout />}>
                <Route index element={<HeroSection/>}/>
                <Route path="extract/" element={<PdfDataExtractor/>}/>
                <Route path="*" element={<DefaultRoute/>}/>
            </Route>
        </Routes>
    )
}

export default App
