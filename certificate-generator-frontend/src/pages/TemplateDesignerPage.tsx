import React from 'react';
import Canvas from '../components/canvas/Canvas';
import TemplateSaver from '../components/template/TemplateSaver';
import ToolPanel from '../components/template/ToolPanel';

const TemplateDesignerPage: React.FC = () => {
  return (
    <div className="template-designer-page">
      <div className="flex justify-between items-center">
        <h1>Certificate Template Designer</h1>
        <TemplateSaver />
      </div>
      
      <div className="designer-container">
        <div className="sidebar">
          <ToolPanel />
        </div>
        <div className="canvas-wrapper">
          <Canvas />
        </div>
      </div>
    </div>
  );
};

export default TemplateDesignerPage;