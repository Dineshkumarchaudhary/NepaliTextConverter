import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { TextEditor } from "@/components/text-editor";
import { DocumentHistory } from "@/components/document-history";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Languages } from "lucide-react";

export default function Home() {
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ne" : "en");
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  const handleContentChange = (content: string) => {
    setExtractedText(content);
  };

  const handleDocumentSelect = (document: any) => {
    setExtractedText(document.editedText || document.originalText || '');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="gradient-header bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Languages className="h-8 w-8 text-white dark:text-white" />
                </div>
                <h1 className={`text-2xl font-bold text-white dark:text-white ${language === 'ne' ? 'nepali-text' : ''}`}>
                  {t("app.title")}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Language Toggle */}
              <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
                <span className="text-sm font-medium text-white/80">
                  {language === "en" ? "EN" : "ने"}
                </span>
                <Switch
                  checked={language === "ne"}
                  onCheckedChange={toggleLanguage}
                  className="data-[state=checked]:bg-white/30"
                />
                <span className="text-sm font-medium text-white/80">
                  {language === "en" ? "NE" : "अं"}
                </span>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-0"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload
              onTextExtracted={handleTextExtracted}
              onProcessingChange={setIsProcessing}
            />
            <DocumentHistory
              onDocumentSelect={handleDocumentSelect}
            />
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <TextEditor
              content={extractedText}
              onContentChange={handleContentChange}
            />
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("loading.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("loading.message")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
