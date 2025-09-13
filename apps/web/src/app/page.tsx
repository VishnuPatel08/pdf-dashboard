// apps/web/src/app/page.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PDFViewer } from '@/components/PDFViewer';
import { DataForm } from '@/components/DataForm';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner'; // Changed import
import { apiClient } from '@/lib/api';
import { Invoice } from 'types';
import Link from 'next/link';
import { List } from 'lucide-react';

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<Invoice | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string>('');
  const [extractModel, setExtractModel] = useState<'gemini' | 'groq'>('gemini');
  
  const queryClient = useQueryClient();

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: apiClient.uploadPDF,
    onSuccess: (data) => {
      setCurrentFileId(data.fileId);
      toast.success("PDF uploaded successfully!"); // Changed usage
    },
    onError: () => {
      toast.error("Failed to upload PDF. Please try again."); // Changed usage
    },
  });

  // Extract mutation
  const extractMutation = useMutation({
    mutationFn: ({ fileId, model }: { fileId: string; model: 'gemini' | 'groq' }) =>
      apiClient.extractData(fileId, model),
    onSuccess: (data) => {
      const invoiceData: Invoice = {
        ...data,
        fileId: currentFileId,
        fileName: selectedFile?.name || '',
        createdAt: new Date().toISOString(),
      };
      setExtractedData(invoiceData);
      toast.success("Data extracted successfully!"); // Changed usage
    },
    onError: () => {
      toast.error("Failed to extract data. Please try again."); // Changed usage
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (invoice: Invoice) => {
      if (invoice._id) {
        return apiClient.updateInvoice(invoice._id, invoice);
      } else {
        return apiClient.createInvoice(invoice);
      }
    },
    onSuccess: () => {
      toast.success("Invoice saved successfully!"); // Changed usage
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: () => {
      toast.error("Failed to save invoice. Please try again."); // Changed usage
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteInvoice(id),
    onSuccess: () => {
      toast.success("Invoice deleted successfully!"); // Changed usage
      setExtractedData(null);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: () => {
      toast.error("Failed to delete invoice. Please try again."); // Changed usage
    },
  });

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setExtractedData(null);
    
    // Auto-upload the file
    uploadMutation.mutate(file);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setCurrentFileId('');
  };

  const handleExtract = () => {
    if (!currentFileId) {
      toast.error("Please upload a PDF file first."); // Changed usage
      return;
    }

    extractMutation.mutate({ fileId: currentFileId, model: extractModel });
  };

  const handleSave = (data: Invoice) => {
    saveMutation.mutate(data);
  };

  const handleDelete = () => {
    if (extractedData?._id) {
      deleteMutation.mutate(extractedData._id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">PDF Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">AI Model:</label>
                <Select value={extractModel} onValueChange={(value: 'gemini' | 'groq') => setExtractModel(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button asChild variant="outline">
                <Link href="/invoices">
                  <List className="mr-2 h-4 w-4" />
                  View All Invoices
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!selectedFile ? (
          <div className="max-w-md mx-auto">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={handleClear}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Left Panel - PDF Viewer */}
            <div className="lg:col-span-1">
              <PDFViewer
                file={selectedFile}
                onExtract={handleExtract}
                isExtracting={extractMutation.isPending}
              />
            </div>

            {/* Right Panel - Data Form */}
            <div className="lg:col-span-1">
              <DataForm
                data={extractedData}
                onSave={handleSave}
                onDelete={extractedData?._id ? handleDelete : undefined}
                isSaving={saveMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
