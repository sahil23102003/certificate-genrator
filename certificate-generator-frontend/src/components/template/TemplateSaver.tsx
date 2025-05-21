import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { saveTemplate, saveTemplate as saveTemplateAction, setCurrentTemplate } from '../../feautres/template/templateSlice';
import { saveTemplate as saveTemplateAPI } from '../../feautres/template/templateAPI';

const TemplateSaver: React.FC = () => {
  const dispatch = useDispatch();
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const { currentTemplate } = useSelector((state: RootState) => state.template);

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setSaving(true);
    
    try {
      console.log("Template before saving:", currentTemplate);
      // Update template name and save to Redux
      const updatedTemplate = {
        ...currentTemplate,
        name: templateName,
      };
      dispatch(setCurrentTemplate(updatedTemplate));
      // dispatch(saveTemplateAction());
     dispatch(saveTemplate());
      
      // Save to backend
      await saveTemplateAPI(updatedTemplate);
      console.log("Template after saving:", updatedTemplate);
      alert('Template saved successfully!');
      setTemplateName('');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="template-saver">
      <div className="form-group">
        <label htmlFor="template-name">Template Name</label>
        <input
          type="text"
          id="template-name"
          className="form-control"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Enter template name"
        />
      </div>
      <button 
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Template'}
      </button>
    </div>
  );
};

export default TemplateSaver;