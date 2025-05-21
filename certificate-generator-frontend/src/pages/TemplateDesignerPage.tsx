import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import KonvaCanvas from '../components/canvas/KonvaCanvas';
import TemplateSaver from '../components/template/TemplateSaver';
import ToolPanel from '../components/template/ToolPanel';
import CertificateGenerator from '../components/template/CertificateGenerator';
import '../styles/components.css';
import jsPDF from 'jspdf';

// Extend the Window interface to include _exportPdf
declare global {
  interface Window {
    _exportPdf?: any;
  }
}

const DEFAULT_LAYOUT = { label: 'A4 Portrait', width: 794, height: 1123 };

function getSamplePreviewData(template: any): Record<string, string> {
  // Find all dynamic fields in all text elements
  const fields = new Set<string>();
  template.elements.forEach((el: any) => {
    if (el.type === 'text') {
      const matches = (el.properties?.text || '').match(/{(.*?)}/g);
      if (matches) (matches as string[]).forEach((m: string) => fields.add(m.replace(/[{}]/g, '')));
    }
  });
  // Return an object with sample values
  const obj: { [key: string]: string } = {};
  Array.from(fields).forEach((field, idx) => {
    obj[field] = `Sample${idx + 1}`;
  });
  return obj;
}

const TemplateDesignerPage: React.FC = () => {
  const stageRef = useRef<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [canvasLayout, setCanvasLayout] = useState(DEFAULT_LAYOUT);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportRowIndex, setExportRowIndex] = useState(0);

  const currentTemplate = useSelector((state: RootState) => state.template.currentTemplate);

  // TODO: Replace this with your actual data source for rows
  // For now, we'll use a placeholder empty array to avoid errors
  const [rows, setRows] = useState<any[]>([]);

  const handleExport = async () => {
    setExporting(true);
    setExportRowIndex(0);
  };

  useEffect(() => {
    if (!exporting || !rows || exportRowIndex >= rows.length) return;

    setTimeout(async () => {
      const pdf =
        exportRowIndex === 0
          ? new jsPDF({
              orientation: canvasLayout.width > canvasLayout.height ? 'landscape' : 'portrait',
              unit: 'px',
              format: [canvasLayout.width, canvasLayout.height],
            })
          : window._exportPdf;

      const uri = stageRef.current?.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
      if (uri) {
        if (exportRowIndex > 0) pdf.addPage([canvasLayout.width, canvasLayout.height], canvasLayout.width > canvasLayout.height ? 'landscape' : 'portrait');
        pdf.addImage(uri, 'PNG', 0, 0, canvasLayout.width, canvasLayout.height);
      }

      if (exportRowIndex === rows.length - 1) {
        pdf.save('certificates.pdf');
        setExporting(false);
        window._exportPdf = null;
      } else {
        window._exportPdf = pdf;
        setExportRowIndex(exportRowIndex + 1);
      }
    }, 400); // Give time for canvas to render
  }, [exporting, exportRowIndex, rows, canvasLayout]);

  return (
    <div className="template-designer-page">
      <div className="flex justify-between items-center">
        <h1>Certificate Template Designer</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-secondary"
            title="Preview Certificate"
            onClick={() => setShowPreview(true)}
            style={{ fontSize: 20, padding: '4px 10px' }}
          >
            👁️
          </button>
          <TemplateSaver />
        </div>
      </div>
      <div className="designer-container">
        <div className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(open => !open)}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? '<' : '>'}
          </button>
          {sidebarOpen && <ToolPanel onLayoutChange={setCanvasLayout} />}
        </div>
        <div className="canvas-wrapper">
          <KonvaCanvas ref={stageRef} canvasLayout={canvasLayout} />
        </div>
      </div>
      <CertificateGenerator stageRef={stageRef} canvasLayout={canvasLayout} />
      {showPreview && (
        <div className="modal-backdrop" onClick={() => setShowPreview(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Certificate Preview</h3>
            <div style={{ border: '1px solid #ccc', background: '#fff', padding: 16 }}>
              <KonvaCanvas
                ref={null}
                canvasLayout={canvasLayout}
                previewData={getSamplePreviewData(currentTemplate)}
                isPreview
              />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowPreview(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {exporting && rows && rows.length > 0 && (
        <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
          <KonvaCanvas
            ref={stageRef}
            canvasLayout={canvasLayout}
            previewData={rows[exportRowIndex]}
            isPreview
          />
        </div>
      )}
    </div>
  );
};

export default TemplateDesignerPage;

function replaceDynamicFields(text: string, previewData: Record<string, string>): string {
  return text.replace(/{(.*?)}/g, (_: string, field: string) => previewData[field] ?? `{${field}}`);
}