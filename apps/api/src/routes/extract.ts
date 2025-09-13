import express from 'express';
import { ObjectId } from 'mongodb';
import { gridFS } from '../config/database';
import { extractWithGemini, extractWithGroq } from '../utils/aiExtraction';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { fileId, model } = req.body;

    if (!fileId || !model) {
      return res.status(400).json({ 
        error: 'fileId and model are required' 
      });
    }

    if (!['gemini', 'groq'].includes(model)) {
      return res.status(400).json({ 
        error: 'model must be either "gemini" or "groq"' 
      });
    }

    // Download PDF from GridFS
    const downloadStream = gridFS.openDownloadStream(new ObjectId(fileId));
    const chunks: Buffer[] = [];

    downloadStream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    downloadStream.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);

        let extractedData;
        if (model === 'gemini') {
          extractedData = await extractWithGemini(pdfBuffer);
        } else {
          extractedData = await extractWithGroq(pdfBuffer);
        }

        res.json(extractedData);
      } catch (error) {
        console.error('Extraction processing error:', error);
        res.status(500).json({ error: 'Extraction processing failed' });
      }
    });

    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      res.status(404).json({ error: 'File not found' });
    });

  } catch (error) {
    console.error('Extract route error:', error);
    res.status(500).json({ error: 'Extraction failed' });
  }
});

export default router;
