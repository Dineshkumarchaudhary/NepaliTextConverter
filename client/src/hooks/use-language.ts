import { createContext, useContext } from "react";

export type Language = "en" | "ne";

export type LanguageProviderState = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
};

const initialState: LanguageProviderState = {
  language: "en",
  setLanguage: () => null,
  t: (key: string, fallback?: string) => fallback || key,
};

export const LanguageProviderContext = createContext<LanguageProviderState>(initialState);

export const useLanguage = () => {
  const context = useContext(LanguageProviderContext);

  if (context === undefined)
    throw new Error("useLanguage must be used within a LanguageProvider");

  return context;
};
