import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { type TemplateElement } from '../../models/template.model';
import { updateElement, selectElement } from '../../feautres/template/templateSlice';

interface ImageElementProps {
  element: TemplateElement;
  isSelected: boolean;
}

const ImageElement: React.FC<ImageElementProps> = ({ element, isSelected }) => {
  const dispatch = useDispatch();
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const imageProps = element.properties as any;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectElement(element.id));
    
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.stopPropagation();
    setResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        
        dispatch(updateElement({
          id: element.id,
          changes: {
            x: element.x + dx,
            y: element.y + dy
          }
        }));
        
        setDragStart({ x: e.clientX, y: e.clientY });
      }
      
      if (resizing) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        
        dispatch(updateElement({
          id: element.id,
          changes: {
            width: Math.max(50, resizeStart.width + dx),
            height: Math.max(30, resizeStart.height + dy)
          }
        }));
      }
    };
    
    const handleMouseUp = () => {
      setDragging(false);
      setResizing(false);
    };
    
    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, resizing, dragStart, resizeStart, dispatch, element.id, element.x, element.y]);

  return (
    <div
      className={`canvas-element image-element ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zindex,
        opacity: imageProps.opacity,
      }}
      onMouseDown={handleMouseDown}
    >
      <img src={imageProps.src} alt="Template element" />
      
      {isSelected && (
        <>
          <div className="resize-handle top-left" onMouseDown={(e) => handleResizeStart(e, 'top-left')}></div>
          <div className="resize-handle top-right" onMouseDown={(e) => handleResizeStart(e, 'top-right')}></div>
          <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}></div>
          <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}></div>
        </>
      )}
    </div>
  );
};

export default ImageElement;