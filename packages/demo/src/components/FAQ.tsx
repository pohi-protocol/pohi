'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What is Proof of Human Intent (PoHI)?',
    answer:
      'PoHI is a protocol that creates cryptographically verifiable proof that a real human approved a specific software action (like merging a PR or deploying code). It answers three questions: Who approved it? (a unique human), What was approved? (specific commit), and When? (immutable timestamp).',
  },
  {
    question: 'Why do I need PoHI?',
    answer:
      'As AI agents increasingly automate software development, there\'s no way to prove a human reviewed and approved changes before deployment. PoHI provides cryptographic proof of human authorization, creating an audit trail for compliance, security, and accountability.',
  },
  {
    question: 'What is World ID?',
    answer:
      'World ID is a privacy-preserving proof-of-personhood system. It uses zero-knowledge proofs to verify you\'re a unique human without revealing your identity. Orb verification (iris scan) provides the highest level of assurance, while Device verification uses your phone.',
  },
  {
    question: 'Is my identity stored or tracked?',
    answer:
      'No. PoHI uses zero-knowledge proofs, which means your identity is never revealed or stored. Only a unique "nullifier hash" is recorded, which proves you\'re a unique human without identifying who you are.',
  },
  {
    question: 'Can the same person approve the same commit twice?',
    answer:
      'No. The nullifier hash is unique per human per action. If you try to approve the same commit again, the system will detect it as a duplicate and reject it. This prevents Sybil attacks.',
  },
  {
    question: 'What happens if I lose access to my World ID?',
    answer:
      'Your World ID is tied to your biometric data (for Orb) or phone (for Device). If you lose your phone, you can recover Device verification with a new phone. Orb verification is permanent as long as you can re-verify at an Orb.',
  },
  {
    question: 'How do I integrate PoHI with GitHub Actions?',
    answer:
      'Add the PoHI GitHub Action to your workflow, configure your World ID credentials, and set up a trigger (like adding a label). When triggered, the action will request human approval via QR code before proceeding.',
  },
  {
    question: 'What does PoHI NOT guarantee?',
    answer:
      'PoHI proves a human approved an action, but it does NOT guarantee: (1) the human understood the code, (2) the human is authorized by your organization, (3) the code is correct or safe. PoHI should be combined with code review and access controls.',
  },
]

function FAQItemComponent({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full py-4 flex justify-between items-center text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        onClick={onClick}
      >
        <span className="font-medium pr-4">{item.question}</span>
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
          {item.answer}
        </div>
      )}
    </div>
  )
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
      <div className="space-y-0">
        {FAQ_ITEMS.map((item, index) => (
          <FAQItemComponent
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
      <div className="mt-6 text-center">
        <a
          href="https://github.com/pohi-protocol/pohi/blob/main/docs/faq.md"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          View full FAQ documentation
        </a>
      </div>
    </div>
  )
}
