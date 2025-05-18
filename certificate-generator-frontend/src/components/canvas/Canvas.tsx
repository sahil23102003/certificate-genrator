import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { A4_WIDTH, A4_HEIGHT } from '../../models/template.model';
import type { RootState } from '../../store/store';
import { selectElement } from '../../feautres/template/templateSlice';
import TextBox from './TextBox';
import ImageElement from './ImageElement';
import '../../styles/canvas.css';

const Canvas: React.FC = () => {
  const dispatch = useDispatch();
  const { currentTemplate, selectedElementId } = useSelector((state: RootState) => state.template);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only deselect if clicking directly on the canvas, not on an element
    if (e.target === canvasRef.current) {
      dispatch(selectElement(null));
    }
  };

  useEffect(() => {
    // Adjust scale based on window size
    const updateScale = () => {
      if (canvasRef.current) {
        const containerWidth = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
        const newScale = Math.min(1, (containerWidth - 80) / A4_WIDTH);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="canvas-container">
      <div
        ref={canvasRef}
        className="canvas"
        style={{
          width: `${A4_WIDTH * scale}px`,
          height: `${A4_HEIGHT * scale}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
        onClick={handleCanvasClick}
      >
        {currentTemplate.elements.map((element) => {
          const isSelected = element.id === selectedElementId;
          
          if (element.type === 'text') {
            return (
              <TextBox
                key={element.id}
                element={element}
                isSelected={isSelected}
              />
            );
          } else if (element.type === 'image') {
            return (
              <ImageElement
                key={element.id}
                element={element}
                isSelected={isSelected}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Canvas;