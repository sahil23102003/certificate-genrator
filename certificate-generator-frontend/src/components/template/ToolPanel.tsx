import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addElement } from '../../feautres/template/templateSlice';
import { uploadImage } from '../../feautres/template/templateAPI';

const ToolPanel: React.FC = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTextBox = () => {
    const newTextBox = {
      id: uuidv4(),
      type: 'text' as const,
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      zindex: 1,
      properties: {
        text: 'Edit this text',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        alignment: 'left' as const,
      },
    };
    
    dispatch(addElement(newTextBox));
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      const imageUrl = await uploadImage(file);
      
      // Create a temporary image to get the dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        // Calculate dimensions while maintaining aspect ratio
        const maxWidth = 400;
        const maxHeight = 400;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        const newImage = {
          id: uuidv4(),
          type: 'image' as const,
          x: 100,
          y: 100,
          width,
          height,
          zindex: 0,
          properties: {
            src: imageUrl,
            opacity: 1,
          },
        };
        
        dispatch(addElement(newImage));
        
        // Revoke the temporary object URL
        URL.revokeObjectURL(img.src);
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="tool-panel">
      <h3>Tools</h3>
      <div className="tool-buttons">
        <button className="btn btn-primary" onClick={handleAddTextBox}>
          Add Text Box
        </button>
        <button className="btn btn-secondary" onClick={handleImageUploadClick}>
          Upload Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
};

export default ToolPanel;