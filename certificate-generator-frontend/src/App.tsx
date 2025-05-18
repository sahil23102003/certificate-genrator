import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TemplateDesignerPage from './pages/TemplateDesignerPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<TemplateDesignerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;