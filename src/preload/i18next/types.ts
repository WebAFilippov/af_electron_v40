import { LanguageApp } from "../../shared/types"

export interface II18next {
  changeLanguage: (language: LanguageApp) => Promise<LanguageApp>
  getLanguage: () => Promise<LanguageApp>
  getResources: (lang: LanguageApp) => Promise<any>
}