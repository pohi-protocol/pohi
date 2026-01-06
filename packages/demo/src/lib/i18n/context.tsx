'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'pohi-language'

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  // Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ja') return stored

  // Check browser language
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ja')) return 'ja'

  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setLanguageState(getInitialLanguage())
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ language: 'en', setLanguage, t: (key) => translations['en'][key] || key }}>
        {children}
      </I18nContext.Provider>
    )
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useI18n()
  return t
}
