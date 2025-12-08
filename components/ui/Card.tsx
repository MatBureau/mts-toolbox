'use client'

import { HTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  href?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, href, children, ...props }, ref) => {
    const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl h-full flex flex-col border-2 border-gray-200 dark:border-gray-700'
    const hoverStyles = hover
      ? 'transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:border-[#2656D9] dark:hover:border-[#6789E4]'
      : ''

    const content = (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    )

    if (href) {
      return (
        <Link href={href} className="block h-full">
          {content}
        </Link>
      )
    }

    return content
  }
)

Card.displayName = 'Card'

export const CardHeader = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pb-4 flex-1 flex flex-col ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ className = '', children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent = ({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

export default Card
