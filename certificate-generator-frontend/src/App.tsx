import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TemplateDesignerPage from './pages/TemplateDesignerPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<TemplateDesignerPage />} />
          <Route path="/designer" element={<TemplateDesignerPage />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;