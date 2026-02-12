'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'

interface FAQItem {
  questionKey: 'faq1Question' | 'faq2Question' | 'faq3Question' | 'faq4Question'
  answerKey: 'faq1Answer' | 'faq2Answer' | 'faq3Answer' | 'faq4Answer'
}

const FAQ_ITEMS: FAQItem[] = [
  { questionKey: 'faq1Question', answerKey: 'faq1Answer' },
  { questionKey: 'faq2Question', answerKey: 'faq2Answer' },
  { questionKey: 'faq3Question', answerKey: 'faq3Answer' },
  { questionKey: 'faq4Question', answerKey: 'faq4Answer' },
]

function FAQItemComponent({
  questionKey,
  answerKey,
  isOpen,
  onClick,
}: {
  questionKey: FAQItem['questionKey']
  answerKey: FAQItem['answerKey']
  isOpen: boolean
  onClick: () => void
}) {
  const t = useTranslation()

  return (
    <div className="border border-gray-200/60 dark:border-gray-800/60 rounded-xl overflow-hidden transition-all duration-200">
      <button
        className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
        onClick={onClick}
      >
        <span className="font-medium pr-4">{t(questionKey)}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 text-gray-400 dark:text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {t(answerKey)}
        </div>
      </div>
    </div>
  )
}

export function FAQ() {
  const t = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">{t('faqTitle')}</h2>
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => (
          <FAQItemComponent
            key={index}
            questionKey={item.questionKey}
            answerKey={item.answerKey}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  )
}
