'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1B3C98',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#2656D9',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
