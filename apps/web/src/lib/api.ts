import axios from 'axios';
import { Invoice } from 'types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const apiClient = {
  // Upload PDF
  uploadPDF: async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Extract data with AI
  extractData: async (fileId: string, model: 'gemini' | 'groq') => {
    const response = await api.post('/api/extract', { fileId, model });
    return response.data;
  },

  // Invoice CRUD operations
  getInvoices: async (search?: string) => {
    const response = await api.get('/api/invoices', {
      params: search ? { q: search } : {},
    });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoice: Omit<Invoice, '_id' | 'createdAt'>) => {
    const response = await api.post('/api/invoices', invoice);
    return response.data;
  },

  updateInvoice: async (id: string, invoice: Partial<Invoice>) => {
    const response = await api.put(`/api/invoices/${id}`, invoice);
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/api/invoices/${id}`);
    return response.data;
  },
};
