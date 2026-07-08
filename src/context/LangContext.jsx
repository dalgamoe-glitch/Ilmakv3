import { createContext, useContext, useMemo, useState } from 'react'

// Scoped localization: the audience is Arabic-speaking Tawjihi students, but
// the site was English-only. This translates the highest-traffic copy (nav,
// hero, CTAs, feature summary, footer tagline) rather than pulling in a full
// i18n framework for a single-page site. Deeper sections (proof/pricing/FAQ)
// stay English-first for now — a natural next translation pass once this
// scaffold is in place.
const STRINGS = {
  en: {
    dir: 'ltr',
    navLinks: ['Features', 'Proof', 'Pricing', 'FAQ'],
    navLabel: 'ORIGIN',
    signIn: 'Sign in',
    navCta: 'Start studying free',
    eyebrow: 'A new way to study',
    heroHeadline: [
      'Upload your book.',
      'Understand your lessons.',
    ],
    heroSub:
      'Upload the exact textbook you study in Jordan and it becomes your personal AI teacher for every exam.',
    ctaPrimary: 'Start studying free',
    ctaSecondary: 'See how it works',
    featuresEyebrow: 'What you get',
    featuresHeadline: 'One textbook. A full study system.',
    featuresSub:
      'Every ILMAK tool below is built around the exact book you already study from.',
    footerTagline:
      'Upload your book. Understand your lessons. Study with confidence.',
    langToggleLabel: 'العربية',
  },
  ar: {
    dir: 'rtl',
    navLinks: ['المزايا', 'الإثبات', 'الأسعار', 'الأسئلة الشائعة'],
    navLabel: 'البداية',
    signIn: 'تسجيل الدخول',
    navCta: 'ابدأ الدراسة مجانًا',
    eyebrow: 'طريقة جديدة للدراسة',
    heroHeadline: ['ارفع كتابك.', 'افهم دروسك.'],
    heroSub:
      'ارفع نفس الكتاب المدرسي الذي تدرس منه في الأردن، ليتحول إلى معلمك الخاص المدعوم بالذكاء الاصطناعي لكل امتحان.',
    ctaPrimary: 'ابدأ الدراسة مجانًا',
    ctaSecondary: 'شاهد كيف يعمل',
    featuresEyebrow: 'ماذا ستحصل عليه',
    featuresHeadline: 'كتاب واحد. نظام دراسة متكامل.',
    featuresSub: 'كل أداة من أدوات علمك مبنية حول نفس الكتاب الذي تدرس منه.',
    footerTagline: 'ارفع كتابك. افهم دروسك. وادرس بثقة.',
    langToggleLabel: 'English',
  },
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const value = useMemo(
    () => ({
      lang,
      t: STRINGS[lang],
      toggleLang: () => setLang((l) => (l === 'en' ? 'ar' : 'en')),
    }),
    [lang],
  )
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
