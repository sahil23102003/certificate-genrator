import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <h1>Certificate Generator</h1>
          <p>Create customized certificates for thousands of recipients with ease.</p>
          <Link to="/designer" className="btn btn-primary">
            Start Designing
          </Link>
        </div>
        
        <div className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Custom Templates</h3>
              <p>Design your own certificate templates with an easy-to-use interface.</p>
            </div>
            <div className="feature-card">
              <h3>Bulk Generation</h3>
              <p>Generate thousands of certificates at once with personalized fields.</p>
            </div>
            <div className="feature-card">
              <h3>Dynamic Fields</h3>
              <p>Add dynamic fields that change for each recipient.</p>
            </div>
            <div className="feature-card">
              <h3>PDF Export</h3>
              <p>Export certificates in standard PDF format.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;