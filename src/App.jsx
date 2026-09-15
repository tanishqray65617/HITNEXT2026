import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Quiz from './pages/Quiz';
import Winners from './pages/Winners';
import './index.css';

// --- Security Overrides ---
document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.key === 'F12') {
        e.preventDefault();
    }
    // Disable Ctrl+Shift+I, J, C and Mac equivalents
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
    }
    // Disable Ctrl+U / Cmd+U (View Source)
    if ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key)) {
        e.preventDefault();
    }
});
// --------------------------

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/winners" element={<Winners />} />
      </Routes>
    </Router>
  );
}

export default App;
