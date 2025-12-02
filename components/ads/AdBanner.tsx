'use client'

interface AdBannerProps {
  id: string
  width: number
  height: number
  className?: string
}

export default function AdBanner({ id, width, height, className = '' }: AdBannerProps) {
  return (
    <div
      id={id}
      className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded ${className}`}
      style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
    >
      <span className="text-sm text-gray-500 dark:text-gray-400">Publicité {width}x{height}</span>
    </div>
  )
}
