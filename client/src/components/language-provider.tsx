import { useState, ReactNode } from "react";
import { Language, LanguageProviderContext } from "@/hooks/use-language";

type LanguageProviderProps = {
  children: ReactNode;
  defaultLanguage?: Language;
};

const translations = {
  en: {
    "app.title": "NepaliText Pro",
    "upload.title": "Upload Document",
    "upload.dragdrop": "Drag & drop your files here",
    "upload.supports": "Supports PNG, JPEG, PDF",
    "upload.choose": "Choose Files",
    "processing.title": "Processing Status",
    "processing.uploaded": "File uploaded",
    "processing.extracting": "Extracting text...",
    "processing.ready": "Ready to edit",
    "export.title": "Export Options",
    "export.word": "Export to Word",
    "export.pdf": "Export to PDF",
    "editor.words": "Words",
    "editor.characters": "Characters",
    "editor.traditional": "Traditional Layout: ON",
    "loading.title": "Processing Document",
    "loading.message": "Extracting text using OCR technology...",
  },
  ne: {
    "app.title": "नेपाली टेक्स्ट प्रो",
    "upload.title": "कागजात अपलोड गर्नुहोस्",
    "upload.dragdrop": "यहाँ आफ्ना फाइलहरू तान्नुहोस्",
    "upload.supports": "PNG, JPEG, PDF समर्थित",
    "upload.choose": "फाइल छान्नुहोस्",
    "processing.title": "प्रक्रिया स्थिति",
    "processing.uploaded": "फाइल अपलोड",
    "processing.extracting": "पाठ निकाल्दै...",
    "processing.ready": "सम्पादन तयार",
    "export.title": "निर्यात विकल्पहरू",
    "export.word": "वार्डमा निर्यात",
    "export.pdf": "PDF मा निर्यात",
    "editor.words": "शब्दहरू",
    "editor.characters": "अक्षरहरू",
    "editor.traditional": "परम्परागत लेआउट: चालु",
    "loading.title": "कागजात प्रक्रिया गरिँदै",
    "loading.message": "OCR प्रविधि प्रयोग गरेर पाठ निकाल्दै...",
  },
};

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("language") as Language) || defaultLanguage
  );

  const t = (key: string, fallback?: string) => {
    return translations[language][key] || fallback || key;
  };

  const value = {
    language,
    setLanguage: (newLanguage: Language) => {
      localStorage.setItem("language", newLanguage);
      setLanguage(newLanguage);
    },
    t,
  };

  return (
    <LanguageProviderContext.Provider value={value}>
      {children}
    </LanguageProviderContext.Provider>
  );
}
