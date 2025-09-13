import express from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../config/database';
import { Invoice } from '../models/Invoice';

const router = express.Router();

// GET /invoices - List invoices with optional search
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const collection = db.collection('invoices');
    
    let query = {};
    if (q && typeof q === 'string') {
      query = {
        $or: [
          { 'vendor.name': { $regex: q, $options: 'i' } },
          { 'invoice.number': { $regex: q, $options: 'i' } }
        ]
      };
    }

    const invoices = await collection.find(query).sort({ createdAt: -1 }).toArray();
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /invoices/:id - Get specific invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('invoices');
    
    const invoice = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// POST /invoices - Create new invoice
router.post('/', async (req, res) => {
  try {
    const invoiceData: Omit<Invoice, '_id'> = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    const collection = db.collection('invoices');
    const result = await collection.insertOne(invoiceData);
    
    const createdInvoice = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// PUT /invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const collection = db.collection('invoices');
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = await collection.findOne({ _id: new ObjectId(id) });
    res.json(updatedInvoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// DELETE /invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const collection = db.collection('invoices');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
