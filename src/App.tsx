import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import Navbar from './components/NavBar';
import About from './pages/About';
import Feedback from './pages/Feedback';
import Home from './pages/Home';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // scroll to top instantly when route changes
  useEffect(() => {
    window.scrollTo(0, 0);

    // ensure scrolling happens even in slower browsers
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // reset home page states
  const handleGoBack = () => {
    console.log('Voltando ao início...');
  };

  // toggle theme instantly
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950'
          : 'bg-gradient-to-br from-neutral-50 via-white to-neutral-100'
      }`}
    >
      {/* pass isDarkMode, toggleDarkMode and handleGoBack to Navbar */}
      <Navbar isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} handleGoBack={handleGoBack} />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleTheme}
              handleGoBack={handleGoBack}
            />
          }
        />
        <Route path="/about" element={<About isDarkMode={isDarkMode} />} />
        <Route path="/feedback" element={<Feedback isDarkMode={isDarkMode} />} />
      </Routes>

      {/* Footer */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default App;
