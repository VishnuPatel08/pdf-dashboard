'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Invoice } from 'types';
import Link from 'next/link';
import { 
  Search, 
  Eye, 
  Trash2, 
  Plus, 
  ArrowLeft, 
  Calendar,
  Building,
  FileText,
  DollarSign,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch invoices with search
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices', searchQuery],
    queryFn: () => apiClient.getInvoices(searchQuery || undefined),
    refetchOnWindowFocus: false,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: apiClient.deleteInvoice,
    onSuccess: () => {
      toast.success("Invoice deleted successfully!"); // Changed usage
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete invoice. Please try again."); // Changed usage
    },
  });

  const handleDelete = (invoice: Invoice) => {
    if (invoice._id) {
      deleteMutation.mutate(invoice._id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Invoice Management</h1>
            </div>
            <Button asChild>
              <Link href="/">
                <Plus className="mr-2 h-4 w-4" />
                New Invoice
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by vendor name or invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading invoices...</span>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-destructive mb-2">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Failed to load invoices</p>
                <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && invoices.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No invoices match "${searchQuery}"`
                  : "Get started by uploading and processing your first PDF invoice"
                }
              </p>
              <Button asChild>
                <Link href="/">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Invoice
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Invoices Table */}
        {!isLoading && !error && invoices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: Invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {invoice.invoice.number || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{invoice.vendor.name || 'Unknown Vendor'}</p>
                              {invoice.vendor.taxId && (
                                <p className="text-xs text-muted-foreground">
                                  Tax ID: {invoice.vendor.taxId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {invoice.invoice.date ? formatDate(invoice.invoice.date) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {formatCurrency(invoice.invoice.total || 0, invoice.invoice.currency)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={invoice.invoice.total ? 'default' : 'secondary'}>
                            {invoice.invoice.total ? 'Processed' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Dialog open={isDialogOpen && selectedInvoice?._id === invoice._id}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Invoice Details</DialogTitle>
                                </DialogHeader>
                                {selectedInvoice && (
                                  <InvoiceDetails invoice={selectedInvoice} />
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(invoice)}
                              disabled={deleteMutation.isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Close dialog handler */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsDialogOpen(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}

// Invoice Details Component
function InvoiceDetails({ invoice }: { invoice: Invoice }) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Vendor Info */}
      <div>
        <h3 className="font-semibold mb-2">Vendor Information</h3>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p><span className="font-medium">Name:</span> {invoice.vendor.name}</p>
          {invoice.vendor.address && (
            <p><span className="font-medium">Address:</span> {invoice.vendor.address}</p>
          )}
          {invoice.vendor.taxId && (
            <p><span className="font-medium">Tax ID:</span> {invoice.vendor.taxId}</p>
          )}
        </div>
      </div>

      {/* Invoice Info */}
      <div>
        <h3 className="font-semibold mb-2">Invoice Information</h3>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p><span className="font-medium">Number:</span> {invoice.invoice.number}</p>
          <p><span className="font-medium">Date:</span> {formatDate(invoice.invoice.date)}</p>
          {invoice.invoice.poNumber && (
            <p><span className="font-medium">PO Number:</span> {invoice.invoice.poNumber}</p>
          )}
          {invoice.invoice.poDate && (
            <p><span className="font-medium">PO Date:</span> {formatDate(invoice.invoice.poDate)}</p>
          )}
        </div>
      </div>

      {/* Line Items */}
      {invoice.invoice.lineItems.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Line Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.invoice.lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice, invoice.invoice.currency)}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total, invoice.invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Totals */}
      <div>
        <h3 className="font-semibold mb-2">Summary</h3>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.invoice.subtotal || 0, invoice.invoice.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({invoice.invoice.taxPercent || 0}%):</span>
            <span>
              {formatCurrency(
                ((invoice.invoice.subtotal || 0) * (invoice.invoice.taxPercent || 0)) / 100,
                invoice.invoice.currency
              )}
            </span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(invoice.invoice.total || 0, invoice.invoice.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
