import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { exportToWord, exportToPDF } from "@/lib/export";
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Undo,
  Redo,
  FileText,
  FileImage
} from "lucide-react";

interface TextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
}

export function TextEditor({ content, onContentChange }: TextEditorProps) {
  const [selectedFont, setSelectedFont] = useState("Mangal");
  const [selectedSize, setSelectedSize] = useState("16pt");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
      updateStats();
    }
  }, [content]);

  const updateStats = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || "";
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onContentChange(newContent);
      updateStats();
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    execCommand('fontName', font);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const sizeValue = size.replace('pt', '');
    execCommand('fontSize', sizeValue);
  };

  const handleExportToWord = async () => {
    try {
      const content = editorRef.current?.innerHTML || "";
      await exportToWord(content);
      toast({
        title: "Success",
        description: "Document exported to Word successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to Word. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportToPDF = async () => {
    try {
      const content = editorRef.current?.innerHTML || "";
      await exportToPDF(content);
      toast({
        title: "Success",
        description: "Document exported to PDF successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export to PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="nepali-editor-container border-0 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" />
            {t("export.title")}
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleExportToWord}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t("export.word")}
            </Button>
            
            <Button 
              onClick={handleExportToPDF}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FileImage className="w-4 h-4 mr-2" />
              {t("export.pdf")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="border-b p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Font Controls */}
            <div className="flex items-center space-x-2 border-r pr-4">
              <Select value={selectedFont} onValueChange={handleFontChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mangal">Mangal</SelectItem>
                  <SelectItem value="Kalimati">Kalimati</SelectItem>
                  <SelectItem value="Preeti">Preeti</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedSize} onValueChange={handleSizeChange}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12pt">12pt</SelectItem>
                  <SelectItem value="14pt">14pt</SelectItem>
                  <SelectItem value="16pt">16pt</SelectItem>
                  <SelectItem value="18pt">18pt</SelectItem>
                  <SelectItem value="20pt">20pt</SelectItem>
                  <SelectItem value="24pt">24pt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formatting Controls */}
            <div className="flex items-center space-x-1 border-r pr-4">
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('bold')}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('italic')}
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('underline')}
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>

            {/* Alignment Controls */}
            <div className="flex items-center space-x-1 border-r pr-4">
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('justifyLeft')}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('justifyCenter')}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('justifyRight')}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn active"
                onClick={() => execCommand('justifyFull')}
              >
                <AlignJustify className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('undo')}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="toolbar-btn"
                onClick={() => execCommand('redo')}
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div
            ref={editorRef}
            className="text-editor nepali-text"
            contentEditable
            onInput={handleContentChange}
            style={{ 
              fontFamily: selectedFont,
              fontSize: selectedSize 
            }}
            suppressContentEditableWarning={true}
          />
        </CardContent>

        <div className="border-t px-6 py-3">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div>
              {t("editor.words")}: {wordCount} | {t("editor.characters")}: {charCount}
            </div>
            <div className="flex items-center space-x-4">
              <span>{t("editor.traditional")}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
