import React from 'react'

interface AlertProps {
  variant?: 'success' | 'warning' | 'error'
  className?: string
  children: React.ReactNode
}

const Alert: React.FC<AlertProps> = ({ variant = 'warning', className = '', children }) => {
  const variantStyles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
  }

  return (
    <div className={`p-4 border rounded-lg ${variantStyles[variant]} ${className}`} role="alert">
      {children}
    </div>
  )
}

export { Alert }
