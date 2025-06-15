import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { Upload, FileImage, File } from "lucide-react";
import { ocrService } from "@/lib/ocr";
import { googleVisionService } from "@/lib/google-vision";
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

      // Extract text using OCR - try Google Vision first, fallback to Tesseract
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files, we would need additional processing
        // For now, show a message that PDF OCR is not fully implemented
        extractedText = 'PDF text extraction is not fully implemented yet. Please use image files for OCR.';
      } else {
        try {
          // Try Google Vision API first for better accuracy
          extractedText = await googleVisionService.extractText(file);
          
          // If Google Vision fails or returns empty, fallback to Tesseract
          if (!extractedText || extractedText.trim().length === 0) {
            console.log('Google Vision returned empty text, falling back to Tesseract');
            await ocrService.initialize();
            extractedText = await ocrService.extractText(file);
          }
        } catch (visionError) {
          console.log('Google Vision failed, falling back to Tesseract:', visionError);
          try {
            await ocrService.initialize();
            extractedText = await ocrService.extractText(file);
          } catch (tesseractError) {
            console.error('Both OCR methods failed:', tesseractError);
            throw new Error('Failed to extract text from the image');
          }
        }
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
      <Card className="nepali-editor-container border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-primary" />
            {t("upload.title")}
          </h2>
          
          <div
            className={`file-upload-area rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragOver ? 'dragover' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <div className="mb-6">
              {isDragOver ? (
                <FileImage className="h-16 w-16 mx-auto text-primary animate-bounce" />
              ) : (
                <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
              )}
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("upload.dragdrop")}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {t("upload.supports")}
            </p>
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <File className="w-4 h-4 mr-2" />
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

      <Card className="nepali-editor-container border-0 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <div className="w-5 h-5 mr-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            {t("processing.title")}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className={`relative w-5 h-5 rounded-full transition-all duration-300 ${
                  processingStatus.uploading ? 'bg-blue-500 processing-indicator' : 
                  processingStatus.extracting || processingStatus.ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {(processingStatus.extracting || processingStatus.ready) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("processing.uploaded")}
                </span>
              </div>
              {(processingStatus.extracting || processingStatus.ready) && (
                <div className="text-xs font-medium text-green-600 dark:text-green-400">✓ Complete</div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className={`relative w-5 h-5 rounded-full transition-all duration-300 ${
                  processingStatus.extracting ? 'bg-blue-500 processing-indicator' : 
                  processingStatus.ready ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {processingStatus.ready && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("processing.extracting")}
                </span>
              </div>
              {processingStatus.ready && (
                <div className="text-xs font-medium text-green-600 dark:text-green-400">✓ Complete</div>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className={`relative w-5 h-5 rounded-full transition-all duration-300 ${
                  processingStatus.ready ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {processingStatus.ready && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t("processing.ready")}
                </span>
              </div>
              {processingStatus.ready && (
                <div className="text-xs font-medium text-green-600 dark:text-green-400">✓ Ready to Edit</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
