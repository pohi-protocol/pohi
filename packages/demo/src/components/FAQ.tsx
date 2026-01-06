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
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full py-4 flex justify-between items-center text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        onClick={onClick}
      >
        <span className="font-medium pr-4">{t(questionKey)}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 dark:text-gray-400">
          {t(answerKey)}
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  const t = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-semibold mb-6">{t('faqTitle')}</h2>
      <div className="space-y-0">
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
