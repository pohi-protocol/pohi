'use client'

import { useI18n, Language } from '@/lib/i18n'

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'ja', label: 'JA', flag: '🇯🇵' },
  ]

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
            language === lang.code
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          title={lang.code === 'en' ? 'English' : '日本語'}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  )
}
