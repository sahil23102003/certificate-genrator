import { createSlice, current } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Template, TemplateElement } from '../../models/template.model';
import { A4_WIDTH, A4_HEIGHT } from '../../models/template.model';
import { v4 as uuidv4 } from 'uuid';

interface TemplateState {
    currentTemplate: Template;
    templates: Template[];
    selectedElementId: string | null;
}

const initialState: TemplateState = {
    currentTemplate: {
        id: uuidv4(),
        name: 'Untitled Template',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Untitled',
        elements: [],
    },
    templates: [],
    selectedElementId: null,
};

export const templateSlice = createSlice({
    name: 'template',
    initialState,
    reducers: {
        setCurrentTemplate: (state, action: PayloadAction<Template>) => {
            state.currentTemplate = action.payload;
        },

        addElement: (state, action: PayloadAction<TemplateElement>) => {
            state.currentTemplate.elements.push(action.payload);
        },

        updateElement: (state, action: PayloadAction<{ id: String; changes: Partial<TemplateElement> }>) => {
            const { id, changes } = action.payload;
            const element = state.currentTemplate.elements.find(el => el.id === id);
            if (element) {
                Object.assign(element, changes);
            }
        },

        removeElement: (state, action: PayloadAction<string>) => {
            state.currentTemplate.elements = state.currentTemplate.elements.filter(
                el => el.id !== action.payload
            );
        },

        selectElement: (state, action: PayloadAction<string | null>) => {
            state.selectedElementId = action.payload;
        },

        saveTemplate: (state) => {
            state.currentTemplate.updatedAt = new Date();
            const existingIndex = state.templates.findIndex(t => t.id === state.currentTemplate.id);
            if (existingIndex >= 0) {
                state.templates[existingIndex] = state.currentTemplate;
            } else {
                 state.currentTemplate.createdAt = new Date();
                state.templates.push(state.currentTemplate);
            }
        },
    }, 
});

export const { 
  setCurrentTemplate, 
  addElement, 
  updateElement, 
  removeElement, 
  selectElement,
  saveTemplate 
} = templateSlice.actions;

export default templateSlice.reducer;

