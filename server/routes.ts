import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPEG, and PDF files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload file endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const document = await storage.createDocument({
        fileName: req.file.originalname,
        originalText: null,
        editedText: null,
        userId: null, // For now, not implementing user auth
      });

      res.json({ 
        success: true, 
        documentId: document.id,
        fileName: document.fileName,
        filePath: req.file.path
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Save OCR text
  app.post("/api/documents/:id/ocr", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { extractedText } = req.body;

      if (!extractedText) {
        return res.status(400).json({ message: "No extracted text provided" });
      }

      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Update document with OCR text
      const updatedDocument = await storage.updateDocument(documentId, extractedText);
      
      res.json({ 
        success: true, 
        document: updatedDocument 
      });
    } catch (error) {
      console.error('OCR save error:', error);
      res.status(500).json({ message: "Failed to save OCR text" });
    }
  });

  // Update document text
  app.put("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const { editedText } = req.body;

      if (!editedText) {
        return res.status(400).json({ message: "No edited text provided" });
      }

      const updatedDocument = await storage.updateDocument(documentId, editedText);
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ 
        success: true, 
        document: updatedDocument 
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Get document
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({ document });
    } catch (error) {
      console.error('Get document error:', error);
      res.status(500).json({ message: "Failed to get document" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      // For now, get all documents (without user filtering since we don't have auth)
      const documents = await storage.getUserDocuments(0); // This will return all documents
      res.json({ documents });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
