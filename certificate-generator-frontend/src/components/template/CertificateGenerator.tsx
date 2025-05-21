import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import jsPDF from 'jspdf';
import { A4_WIDTH, A4_HEIGHT, type Template, type TemplateElement, type TextProperties } from '../../models/template.model';
import type { RootState } from '../../store/store';

function replaceFields(
  text: string,
  mapping?: { [key: string]: string },
  row?: Record<string, any>
) {
  if (!mapping || !row) return text;
  return text.replace(/{(.*?)}/g, (_, field) => {
    const col = mapping[field];
    return col ? (row[col] ?? '') : '';
  });
}

function getTemplateWithRow(template: Template, mapping: any, row: any) {
  // Deep clone the template to avoid mutating the original
  const newTemplate = JSON.parse(JSON.stringify(template));
  newTemplate.elements = newTemplate.elements.map((el: TemplateElement) => {
    if (el.type === 'text') {
      const textProps = el.properties as TextProperties;
      return {
        ...el,
        properties: {
          ...textProps,
          text: replaceFields(textProps.text ?? '', mapping, row),
        },
      };
    }
    return el;
  });
  return newTemplate;
}

const CertificateGenerator: React.FC<{ stageRef: any, canvasLayout: { width: number; height: number; label: string } }> = ({ stageRef, canvasLayout }) => {
  const template = useSelector((state: RootState) => state.template.currentTemplate) as Template;
  const { mapping, rows } = useSelector((state: RootState) => state.excel);
  const dispatch = useDispatch();

  useEffect(() => {
    const handler = async () => {
      const pdf = new jsPDF({
        orientation: canvasLayout.width > canvasLayout.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvasLayout.width, canvasLayout.height],
      });

      if (mapping && rows && rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          // Update template with replaced text for this row
          const newTemplate = getTemplateWithRow(template, mapping, rows[i]);
          dispatch({ type: 'template/setCurrentTemplate', payload: newTemplate });

          // Wait for the UI to update
          await new Promise(res => setTimeout(res, 300));

          const uri = stageRef.current?.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
          if (!uri) continue;
          if (i > 0) pdf.addPage([canvasLayout.width, canvasLayout.height], canvasLayout.width > canvasLayout.height ? 'landscape' : 'portrait');
          pdf.addImage(uri, 'PNG', 0, 0, canvasLayout.width, canvasLayout.height);
        }
        // Restore original template after export
        dispatch({ type: 'template/setCurrentTemplate', payload: template });
      } else {
        // No Excel/mapping: just export the current canvas as-is
        const uri = stageRef.current?.toDataURL({ pixelRatio: 1, mimeType: 'image/png' });
        if (uri) pdf.addImage(uri, 'PNG', 0, 0, A4_WIDTH, A4_HEIGHT);
      }

      pdf.save('certificates.pdf');
      alert('Certificates downloaded!');
    };

    window.addEventListener('generate-certificates', handler);
    return () => window.removeEventListener('generate-certificates', handler);
  }, [stageRef, canvasLayout]);

  return null;
};

export default CertificateGenerator;