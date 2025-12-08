'use client'

import { HTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'
import ElectricBorder from './ElectricBorder'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  href?: string
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, href, children, ...props }, ref) => {
    const baseStyles = 'bg-white dark:bg-gray-800 rounded-lg h-full flex flex-col'
    const hoverStyles = hover ? 'transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-[#2656D9]/20 dark:hover:shadow-[#6789E4]/20' : ''

    const content = (
      <ElectricBorder
        color="#2656D9"
        speed={0.8}
        chaos={0.4}
        thickness={1.5}
        style={{ borderRadius: 12, height: '100%' }}
      >
        <div
          ref={ref}
          className={`${baseStyles} ${hoverStyles} ${className}`}
          {...props}
        >
          {children}
        </div>
      </ElectricBorder>
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
