import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Upload, FileImage, File } from "lucide-react";
import { ocrService } from "@/lib/ocr";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadProps {
  onTextExtracted: (text: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
}

export function FileUpload({ onTextExtracted, onProcessingChange }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState({
    uploading: false,
    extracting: false,
    ready: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPEG, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    try {
      onProcessingChange(true);
      setProcessingStatus({ uploading: true, extracting: false, ready: false });

      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const { documentId } = await uploadResponse.json();
      setProcessingStatus({ uploading: false, extracting: true, ready: false });

      // Extract text using OCR
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files, we would need additional processing
        // For now, show a message that PDF OCR is not fully implemented
        extractedText = 'PDF text extraction is not fully implemented yet. Please use image files for OCR.';
      } else {
        // Process image files with Tesseract
        await ocrService.initialize();
        extractedText = await ocrService.extractText(file);
      }

      // Save extracted text to server
      await apiRequest('POST', `/api/documents/${documentId}/ocr`, {
        extractedText
      });

      setProcessingStatus({ uploading: false, extracting: false, ready: true });
      onTextExtracted(extractedText);
      onProcessingChange(false);

      toast({
        title: "Success",
        description: "Text extracted successfully!",
      });

    } catch (error) {
      console.error('File processing error:', error);
      setProcessingStatus({ uploading: false, extracting: false, ready: false });
      onProcessingChange(false);
      
      toast({
        title: "Error",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("upload.title")}
          </h2>
          
          <div
            className={`file-upload-area rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragOver ? 'dragover' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              {t("upload.dragdrop")}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {t("upload.supports")}
            </p>
            <Button>
              {t("upload.choose")}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-md font-medium mb-3">
            {t("processing.title")}
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                processingStatus.uploading ? 'bg-blue-500 animate-pulse' : 
                processingStatus.extracting || processingStatus.ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span className="text-sm text-muted-foreground">
                {t("processing.uploaded")}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                processingStatus.extracting ? 'bg-blue-500 animate-pulse' : 
                processingStatus.ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span className="text-sm text-muted-foreground">
                {t("processing.extracting")}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                processingStatus.ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
              <span className="text-sm text-muted-foreground">
                {t("processing.ready")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
