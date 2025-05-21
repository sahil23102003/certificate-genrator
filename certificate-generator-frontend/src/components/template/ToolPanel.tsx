import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addElement } from '../../feautres/template/templateSlice';
import { uploadImage } from '../../feautres/template/templateAPI';
import { store } from '../../store/store';
import * as XLSX from 'xlsx';
import type { RootState } from '../../store/store';
import { setExcelData, setMapping } from '../../feautres/template/excelSlice';

const LAYOUTS = [
  { label: 'A4 Portrait', width: 794, height: 1123 },
  { label: 'A4 Landscape', width: 1123, height: 794 },
  { label: 'A3 Portrait', width: 1123, height: 1587 },
  { label: 'A3 Landscape', width: 1587, height: 1123 },
];

const ToolPanel: React.FC<{ onLayoutChange: (layout: { width: number; height: number; label: string }) => void }> = ({ onLayoutChange }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Excel mapping modal state
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [dynamicFields, setDynamicFields] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<{ [key: string]: string }>({});
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS[0].label);

  const currentTemplate = useSelector((state: RootState) => state.template.currentTemplate);

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
        text: 'My {name} is from {college}',
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
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        dispatch(
          addElement({
            id: uuidv4(),
            type: 'image',
            x: 150,
            y: 150,
            width: img.width > 300 ? 300 : img.width,
            height: img.height > 200 ? 200 : img.height,
            zindex: 1,
            properties: {
              src: imageUrl,
              opacity: 1,
            },
          })
        );
      };
    } catch (err) {
      alert('Image upload failed');
    }
  };

  // Extract dynamic fields from all text boxes in the template
  const extractDynamicFields = () => {
    const fields = new Set<string>();
    currentTemplate.elements.forEach((el: any) => {
      if (el.type === 'text') {
        const text = el.properties?.text || '';
        const matches = text.match(/{(.*?)}/g);
        if (matches) {
          matches.forEach((m: string) => fields.add(m.replace(/[{}]/g, '')));
        }
      }
    });
    return Array.from(fields);
  };

  // Handle Excel upload and parsing
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
    const columns = (json[0] as string[]).filter(Boolean);
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    setExcelColumns(columns);
    setDynamicFields(extractDynamicFields());
    setShowMappingModal(true);
    setFieldMapping({});
    dispatch(setExcelData({ columns, rows }));
  };

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const layout = LAYOUTS.find(l => l.label === e.target.value)!;
    setSelectedLayout(layout.label);
    onLayoutChange(layout);
  };

  return (
    <div className="tool-panel">
      <label style={{ fontWeight: 500 }}>Canvas Layout:</label>
      <select value={selectedLayout} onChange={handleLayoutChange} style={{ marginBottom: 12, marginLeft: 8 }}>
        {LAYOUTS.map(l => (
          <option key={l.label} value={l.label}>{l.label}</option>
        ))}
      </select>
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
        <button className="btn btn-secondary" onClick={() => excelInputRef.current?.click()}>
          Upload Excel
        </button>
        <input
          type="file"
          ref={excelInputRef}
          style={{ display: 'none' }}
          accept=".xlsx"
          onChange={handleExcelUpload}
        />
      </div>
      {showMappingModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h4>Map Dynamic Fields</h4>
            {dynamicFields.length === 0 && (
              <div style={{ color: 'red', marginBottom: 12 }}>
                No dynamic fields found in text boxes.
              </div>
            )}
            {dynamicFields.map((field) => (
              <div key={field} style={{ marginBottom: 8 }}>
                <label>{`{${field}}`}</label>
                <select
                  value={fieldMapping[field] || ''}
                  onChange={(e) =>
                    setFieldMapping({ ...fieldMapping, [field]: e.target.value })
                  }
                >
                  <option value="">Select column</option>
                  {excelColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button
              className="btn btn-primary"
              style={{ marginRight: 8 }}
              onClick={() => {
                dispatch(setMapping(fieldMapping));
                setShowMappingModal(false);
                alert('Mapping saved! (You can now use this mapping for generation.)');
              }}
            >
              Save Mapping
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowMappingModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <button
        className="btn btn-success"
        style={{ marginTop: 16 }}
        onClick={() => window.dispatchEvent(new Event('generate-certificates'))}
      >
        Generate Certificates
      </button>
    </div>
  );
};

export default ToolPanel;