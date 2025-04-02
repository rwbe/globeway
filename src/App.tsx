import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import { Footer } from "./components/Footer";


function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Função para resetar estados na Home
  const handleGoBack = () => {
    console.log("Voltando ao início...");
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-neutral-900" : "bg-gray-50"}`}>
      {/* Passa isDarkMode, toggleDarkMode e handleGoBack para Navbar */}
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        handleGoBack={handleGoBack} 
      />

      <Routes>
        <Route 
          path="/" 
          element={<Home 
            isDarkMode={isDarkMode} 
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
            handleGoBack={handleGoBack} 
          />} 
        />
        <Route path="/about" element={<About isDarkMode={isDarkMode} />} />
        <Route path="/feedback" element={<Feedback isDarkMode={isDarkMode} />} />
      </Routes>
      {/* Footer*/}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
