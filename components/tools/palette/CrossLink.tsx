import Link from 'next/link'

export default function CrossLink({ href, question, action }: { href: string; question: string; action: string }) {
  return (
    <Link
      href={href}
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm hover:border-primary-400 transition-colors"
    >
      <span className="text-gray-700 dark:text-gray-300">{question}</span>
      <span className="font-medium text-primary-700 dark:text-primary-300">{action} →</span>
    </Link>
  )
}
