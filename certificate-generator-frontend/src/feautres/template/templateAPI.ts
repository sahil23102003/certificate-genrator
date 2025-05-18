import axios from "axios";
import type { Template } from "../../models/template.model";

const API_URL = "http://localhost:8081/api";

export const saveTemplate = async (template: Template) => {
    const response = await axios.post(`${API_URL}/templates`, template);
    return response.data;
};

export const getTemplates = async () => {
    const response = await axios.get(`${API_URL}/templates`);
    return response.data;
};

export const getTemplateById = async (id: String) => {
    const response = await axios.get(`${API_URL}/templates/${id}`);
    return response.data;
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data.url;

};