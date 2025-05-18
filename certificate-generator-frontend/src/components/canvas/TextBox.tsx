import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { TemplateElement } from '../../models/template.model';
import { updateElement, selectElement } from '../../feautres/template/templateSlice';

interface TextBoxProps {
  element: TemplateElement;
  isSelected: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({ element, isSelected }) => {
  const dispatch = useDispatch();
  const textBoxRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const textBoxProps = element.properties as any;
  const isEmpty = !textBoxProps.text || textBoxProps.text.trim() === '';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(selectElement(element.id));

    if (!editing) {
      setDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
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

  const handleDoubleClick = () => {
    setEditing(true);
    setTimeout(() => {
      if (textBoxRef.current) {
        textBoxRef.current.focus();

        // If empty, clear the placeholder and set cursor at the beginning
        // if (isEmpty) {
        //   textBoxRef.current.textContent = '';
        // }

        // // Set cursor position at the end for all alignments
        // const range = document.createRange();
        // const selection = window.getSelection();

        // if (selection && textBoxRef.current.firstChild) {
        //   // Always put cursor at the end
        //   range.setStart(textBoxRef.current.firstChild, textBoxRef.current.textContent?.length || 0);
        //   range.collapse(true);
        //   selection.removeAllRanges();
        //   selection.addRange(range);
        // }
      }
    }, 10);
  };

  const handleBlur = () => {
    setEditing(false);

    // If the content becomes empty after editing, we keep it empty
    // The placeholder will be shown by CSS
    if (textBoxRef.current) {
      const content = textBoxRef.current.textContent || '';
      dispatch(updateElement({
        id: element.id,
        changes: {
          properties: {
            ...element.properties,
            text: content
          }
        }
      }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    // const content = e.target.textContent || '';
    // dispatch(updateElement({
    //   id: element.id,
    //   changes: {
    //     properties: {
    //       ...element.properties,
    //       text: content
    //     }
    //   }
    // }));
  };

  const handleFocus = () => {
    // Clear placeholder when focusing
  if (
    textBoxRef.current &&
    textBoxRef.current.textContent === 'Click to edit'
  ) {
    textBoxRef.current.textContent = '';
  }
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
      className={`canvas-element text-box ${isSelected ? 'selected' : ''} ${editing ? 'editing' : ''} ${isEmpty ? 'empty' : ''}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zindex,
        fontSize: `${textBoxProps.fontSize}px`,
        fontFamily: textBoxProps.fontFamily,
        fontWeight: textBoxProps.fontWeight,
        color: textBoxProps.color,
        backgroundColor: textBoxProps.backgroundColor,
        textAlign: textBoxProps.alignment as any,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div
        ref={textBoxRef}
        className="text-content"
        contentEditable={editing}
        suppressContentEditableWarning={true}
        onBlur={handleBlur}
        onInput={handleTextChange}
        // onFocus={handleFocus}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          cursor: editing ? 'text' : 'inherit',
        }}
      >
        {/* {isEmpty && !editing ? '' : textBoxProps.text} */}
        {!editing && textBoxProps.text}
      </div>

      {/* Placeholder text */}
      {isEmpty && !editing && (
        <div className="placeholder-text">
          Click to edit
        </div>
      )}

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

export default TextBox;