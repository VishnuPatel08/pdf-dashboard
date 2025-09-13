// apps/api/src/routes/upload.ts
import express from 'express';
import multer from 'multer';
import { gridFS } from '../config/database';
import { Readable } from 'stream';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }

    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const uploadStream = gridFS.openUploadStream(req.file.originalname, {
      contentType: 'application/pdf'
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      res.json({
        fileId: uploadStream.id.toString(),
        fileName: req.file!.originalname,
        size: req.file!.size
      });
    });

    uploadStream.on('error', (error) => {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'File upload failed' });
    });

  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Route to serve/download PDF files
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const downloadStream = gridFS.openDownloadStreamByName(fileId);
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', () => {
      res.status(404).json({ error: 'File not found' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router;
