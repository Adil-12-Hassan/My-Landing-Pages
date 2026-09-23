import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

export default function App() {
    return (
        <>
            <Navbar />
            <main id="top">
                <Home />
            </main>
            <Footer />
        </>
    )
}