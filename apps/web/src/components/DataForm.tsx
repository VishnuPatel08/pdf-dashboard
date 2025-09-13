'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save, Loader2 } from 'lucide-react';
import { Invoice, LineItem } from 'types';

interface DataFormProps {
  data: Invoice | null;
  onSave: (data: Invoice) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

const createEmptyInvoice = (): Invoice => ({
  fileId: '',
  fileName: '',
  vendor: {
    name: '',
    address: '',
    taxId: '',
  },
  invoice: {
    number: '',
    date: '',
    currency: 'USD',
    subtotal: 0,
    taxPercent: 0,
    total: 0,
    poNumber: '',
    poDate: '',
    lineItems: [],
  },
  createdAt: new Date().toISOString(),
});

export function DataForm({ data, onSave, onDelete, isSaving, isDeleting }: DataFormProps) {
  const [formData, setFormData] = useState<Invoice>(createEmptyInvoice());

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      setFormData(createEmptyInvoice());
    }
  }, [data]);

  const updateVendor = (field: keyof Invoice['vendor'], value: string) => {
    setFormData(prev => ({
      ...prev,
      vendor: {
        ...prev.vendor,
        [field]: value,
      },
    }));
  };

  /*const updateInvoice = (field: keyof Invoice['invoice'], value: any) => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        [field]: value,
      },
    }));
  };*/

  const updateInvoice = <K extends keyof Invoice["invoice"]>(
  field: K,
  value: Invoice["invoice"][K]
) => {
  setFormData(prev => ({
    ...prev,
    invoice: {
      ...prev.invoice,
      [field]: value,
    },
  }));
};

  const addLineItem = () => {
    const newItem: LineItem = {
      description: '',
      unitPrice: 0,
      quantity: 1,
      total: 0,
    };
    
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        lineItems: [...prev.invoice.lineItems, newItem],
      },
    }));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setFormData(prev => {
      const newLineItems = [...prev.invoice.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: value,
      };
      
      // Auto-calculate total for the line item
      if (field === 'unitPrice' || field === 'quantity') {
        const unitPrice = field === 'unitPrice' ? Number(value) : newLineItems[index].unitPrice;
        const quantity = field === 'quantity' ? Number(value) : newLineItems[index].quantity;
        newLineItems[index].total = unitPrice * quantity;
      }
      
      return {
        ...prev,
        invoice: {
          ...prev.invoice,
          lineItems: newLineItems,
        },
      };
    });
  };

  const removeLineItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        lineItems: prev.invoice.lineItems.filter((_, i) => i !== index),
      },
    }));
  };

  /*const calculateTotals = () => {
    const subtotal = formData.invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (formData.invoice.taxPercent || 0) / 100;
    const total = subtotal + tax;
    
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        subtotal,
        total,
      },
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.invoice.lineItems, formData.invoice.taxPercent]);*/

  // apps/web/src/components/DataForm.tsx
  // Update the useEffect near the end of the component:

  const calculateTotals = useCallback(() => {
    const subtotal = formData.invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (formData.invoice.taxPercent || 0) / 100;
    const total = subtotal + tax;
  
    setFormData(prev => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        subtotal,
        total,
      },
    }));
  }, [formData.invoice.lineItems, formData.invoice.taxPercent]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);


  const handleSave = () => {
    onSave(formData);
  };

  if (!data && !formData.fileId) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium">No data to edit</p>
          <p className="text-sm">Upload a PDF and extract data to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vendor-name">Vendor Name *</Label>
              <Input
                id="vendor-name"
                value={formData.vendor.name}
                onChange={(e) => updateVendor('name', e.target.value)}
                placeholder="Enter vendor name"
              />
            </div>
            
            <div>
              <Label htmlFor="vendor-address">Address</Label>
              <Input
                id="vendor-address"
                value={formData.vendor.address || ''}
                onChange={(e) => updateVendor('address', e.target.value)}
                placeholder="Enter vendor address"
              />
            </div>
            
            <div>
              <Label htmlFor="vendor-tax-id">Tax ID</Label>
              <Input
                id="vendor-tax-id"
                value={formData.vendor.taxId || ''}
                onChange={(e) => updateVendor('taxId', e.target.value)}
                placeholder="Enter tax ID"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-number">Invoice Number *</Label>
                <Input
                  id="invoice-number"
                  value={formData.invoice.number}
                  onChange={(e) => updateInvoice('number', e.target.value)}
                  placeholder="Enter invoice number"
                />
              </div>
              
              <div>
                <Label htmlFor="invoice-date">Invoice Date *</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={formData.invoice.date}
                  onChange={(e) => updateInvoice('date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.invoice.currency}
                  onValueChange={(value: string) => updateInvoice('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tax-percent">Tax Percentage</Label>
                <Input
                  id="tax-percent"
                  type="number"
                  step="0.01"
                  value={formData.invoice.taxPercent || 0}
                  onChange={(e) => updateInvoice('taxPercent', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="po-number">PO Number</Label>
                <Input
                  id="po-number"
                  value={formData.invoice.poNumber || ''}
                  onChange={(e) => updateInvoice('poNumber', e.target.value)}
                  placeholder="Enter PO number"
                />
              </div>
              
              <div>
                <Label htmlFor="po-date">PO Date</Label>
                <Input
                  id="po-date"
                  type="date"
                  value={formData.invoice.poDate || ''}
                  onChange={(e) => updateInvoice('poDate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Line Items</CardTitle>
              <Button onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.invoice.lineItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No line items added yet</p>
                <Button onClick={addLineItem} variant="outline" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.invoice.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <Label className="text-xs">Total</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="text-sm bg-muted"
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">
                {formData.invoice.currency} {formData.invoice.subtotal?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({formData.invoice.taxPercent || 0}%):</span>
              <span className="font-medium">
                {formData.invoice.currency} {(((formData.invoice.subtotal || 0) * (formData.invoice.taxPercent || 0)) / 100).toFixed(2)}
              </span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                {formData.invoice.currency} {formData.invoice.total?.toFixed(2) || '0.00'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleSave} 
            className="flex-1"
            disabled={isSaving || !formData.vendor.name || !formData.invoice.number}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Invoice
              </>
            )}
          </Button>
          
          {onDelete && formData._id && (
            <Button 
              onClick={onDelete} 
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
