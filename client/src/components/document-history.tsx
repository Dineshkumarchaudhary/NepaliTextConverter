import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { History, FileText, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Document {
  id: number;
  fileName: string;
  originalText: string | null;
  editedText: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DocumentHistoryProps {
  onDocumentSelect: (document: Document) => void;
}

export function DocumentHistory({ onDocumentSelect }: DocumentHistoryProps) {
  const { t } = useLanguage();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      return data.documents as Document[];
    },
  });

  const handleDocumentClick = (document: Document) => {
    onDocumentSelect(document);
  };

  const getPreviewText = (document: Document) => {
    const text = document.editedText || document.originalText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  if (isLoading) {
    return (
      <Card className="nepali-editor-container border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="nepali-editor-container border-0 shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center">
          <History className="w-5 h-5 mr-2 text-primary" />
          Document History
        </h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No documents yet</p>
            <p className="text-sm">Upload a file to get started</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {documents.map((document) => (
              <div
                key={document.id}
                className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                onClick={() => handleDocumentClick(document)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText className="w-4 h-4 mt-1 text-blue-500 group-hover:text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                        {document.fileName}
                      </p>
                      {getPreviewText(document) && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {getPreviewText(document)}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(document.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle delete functionality here if needed
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}