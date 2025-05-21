import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { useSelector, useDispatch } from 'react-redux';
import { A4_WIDTH, A4_HEIGHT, type TemplateElement, type TextProperties, type ImageProperties } from '../../models/template.model';
import type { RootState } from '../../store/store';
import useImage from 'use-image';
import { updateElement, selectElement } from '../../feautres/template/templateSlice';

interface KonvaTextElementProps {
  el: TemplateElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (el: TemplateElement) => void;
  onDblClick: () => void;
  shapeRef: React.RefObject<any>;
  trRef: React.RefObject<any>;
  isPreview?: boolean;
  previewData?: Record<string, string>;
}

interface KonvaImageElementProps {
  el: TemplateElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (el: TemplateElement) => void;
  shapeRef: React.RefObject<any>;
  trRef: React.RefObject<any>;
  isPreview?: boolean;
  previewData?: Record<string, string>;
}

// Image element with resize/move
const KonvaImageElement = ({
  el,
  isSelected,
  onSelect,
  onChange,
  shapeRef,
  trRef,
}: KonvaImageElementProps) => {
  const imageProps = el.properties as ImageProperties;
  // For images
  const [image] = useImage(imageProps.src ?? '', 'anonymous');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, trRef, shapeRef]);

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        opacity={imageProps.opacity}
        image={image}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => {
          onChange({
            ...el,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          onChange({
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.max(30, node.width() * node.scaleX()),
            height: Math.max(30, node.height() * node.scaleY()),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 30 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Text element with resize/move, but editing handled in parent
const KonvaTextElement = ({
  el,
  isSelected,
  onSelect,
  onChange,
  onDblClick,
  shapeRef,
  trRef,
  isPreview,
  previewData,
}: KonvaTextElementProps) => {
  const textProps = el.properties as TextProperties;

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, trRef, shapeRef]);

  const getDisplayText = (text: string) => {
    if (!isPreview || !previewData) return text;
    return text.replace(/{(.*?)}/g, (_, field) => previewData[field] ?? `{${field}}`);
  };

  return (
    <>
      <Text
        ref={shapeRef}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        // For text
        text={getDisplayText(textProps.text ?? '')}
        fontSize={textProps.fontSize}
        fontFamily={textProps.fontFamily}
        fontStyle={textProps.fontWeight}
        fill={textProps.color}
        align={textProps.alignment}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={onDblClick}
        onDragEnd={e => {
          onChange({
            ...el,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={e => {
          const node = shapeRef.current;
          onChange({
            ...el,
            x: node.x(),
            y: node.y(),
            width: Math.max(50, node.width() * node.scaleX()),
            height: Math.max(30, node.height() * node.scaleY()),
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center',
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

interface KonvaCanvasProps {
  canvasLayout: { width: number; height: number; label: string };
  isPreview?: boolean;
  previewData?: Record<string, string>;
}

const KonvaCanvas = forwardRef<any, KonvaCanvasProps>(({ canvasLayout, isPreview, previewData }, ref) => {
  const dispatch = useDispatch();
  const { currentTemplate, selectedElementId } = useSelector((state: RootState) => state.template);

  // Editing state for textarea
  const [isEditing, setIsEditing] = useState(false);
  const [editingElement, setEditingElement] = useState<TemplateElement | null>(null);
  const [editingText, setEditingText] = useState('');
  const [textareaStyle, setTextareaStyle] = useState<React.CSSProperties>({});

  // Refs for each element
  const shapeRefs = useRef<{ [id: string]: React.RefObject<any> }>({});
  const trRefs = useRef<{ [id: string]: React.RefObject<any> }>({});

  useEffect(() => {
    if (
      selectedElementId &&
      trRefs.current[selectedElementId] &&
      shapeRefs.current[selectedElementId]
    ) {
      trRefs.current[selectedElementId].current?.nodes([shapeRefs.current[selectedElementId].current]);
      trRefs.current[selectedElementId].current?.getLayer().batchDraw();
    }
  }, [selectedElementId, currentTemplate]);

  const handleSelect = (id: string) => {
    dispatch(selectElement(id));
  };

  const handleChange = (updatedEl: TemplateElement) => {
    dispatch(updateElement({ id: updatedEl.id, changes: updatedEl }));
  };

  // Double click to edit text
  const handleTextDblClick = (el: TemplateElement) => {
    const ref = shapeRefs.current[el.id];
    if (!ref?.current) return;
    const absPos = ref.current.getAbsolutePosition();
    const textProps = el.properties as TextProperties;
    setTextareaStyle({
      position: 'absolute',
      top: absPos.y,
      left: absPos.x,
      width: el.width,
      height: el.height,
      fontSize: textProps.fontSize,
      fontFamily: textProps.fontFamily,
      fontWeight: textProps.fontWeight,
      color: textProps.color,
      textAlign: textProps.alignment as any,
      background: 'rgba(255,255,255,0.9)',
      border: '1px solid #3498db',
      resize: 'none',
      zIndex: 10,
      padding: 0,
      margin: 0,
      overflow: 'hidden',
    });
    setEditingElement(el);
    setEditingText(textProps.text ?? '');
    setIsEditing(true);
  };

  // Save text on blur
  const handleTextareaBlur = () => {
    setIsEditing(false);
    if (editingElement) {
      handleChange({
        ...editingElement,
        properties: {
          ...(editingElement.properties as TextProperties),
          text: editingText,
        },
      });
    }
    setEditingElement(null);
    setEditingText('');
  };

  const handleStageMouseDown = (e: any) => {
    // Only deselect if clicked on empty canvas (the stage itself) or the background Rect
    const isStage = e.target === e.target.getStage();
    const isBackground = e.target.className === 'Rect';

    // Prevent deselect if clicking on a Transformer or a selected shape
    const isTransformer = e.target.getParent() && e.target.getParent().className === 'Transformer';
    const isShape = e.target.className === 'Text' || e.target.className === 'Image';

    if ((isStage || isBackground) && !isTransformer && !isShape) {
      if (isEditing) {
        setIsEditing(false);
        setEditingElement(null);
        setEditingText('');
      }
      dispatch(selectElement(null));
    }
  };

  return (
    <div style={{ position: 'relative', width: canvasLayout.width, height: canvasLayout.height, margin: '0 auto' }}>
      <Stage
        width={canvasLayout.width}
        height={canvasLayout.height}
        style={{
          background: '#f8f8f8',
          margin: '0 auto',
          border: '2px solid #bbb',
          boxShadow: '0 0 16px #aaa',
          display: 'block',
        }}
        ref={ref}
        onMouseDown={handleStageMouseDown}
      >
        <Layer>
          {/* A4 white sheet */}
          <Rect
            x={0}
            y={0}
            width={canvasLayout.width}
            height={canvasLayout.height}
            fill="#fff"
            shadowBlur={10}
            cornerRadius={8}
          />
          {/* Render elements */}
          {currentTemplate.elements.map((el: TemplateElement) =>
            el.type === 'text' ? (
              <KonvaTextElement
                key={el.id}
                el={el}
                isSelected={selectedElementId === el.id}
                onSelect={() => handleSelect(el.id)}
                onChange={handleChange}
                onDblClick={() => handleTextDblClick(el)}
                shapeRef={
                  shapeRefs.current[el.id] ?? (shapeRefs.current[el.id] = React.createRef())
                }
                trRef={
                  trRefs.current[el.id] ?? (trRefs.current[el.id] = React.createRef())
                }
                isPreview={isPreview}
                previewData={previewData}
              />
            ) : (
              <KonvaImageElement
                key={el.id}
                el={el}
                isSelected={selectedElementId === el.id}
                onSelect={() => handleSelect(el.id)}
                onChange={handleChange}
                shapeRef={
                  shapeRefs.current[el.id] ?? (shapeRefs.current[el.id] = React.createRef())
                }
                trRef={
                  trRefs.current[el.id] ?? (trRefs.current[el.id] = React.createRef())
                }
                isPreview={isPreview}
                previewData={previewData}
              />
            )
          )}
        </Layer>
      </Stage>
      {/* Absolutely positioned textarea for editing */}
      {isEditing && (
        // For textarea
        <textarea
          style={textareaStyle}
          value={editingText ?? ''}
          autoFocus
          onChange={e => setEditingText(e.target.value)}
          onBlur={handleTextareaBlur}
        />
      )}
    </div>
  );
});

export default KonvaCanvas;