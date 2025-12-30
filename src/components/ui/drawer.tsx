import { cn } from '@/lib/utils'
import type React from 'react'

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  position?: 'left' | 'right'
  className?: string
  children: React.ReactNode
}

export const Drawer: React.FC<DrawerProps> = ({ open, onOpenChange, position = 'right', className, children }) => {
  return (
    <div
      className={cn(
        'fixed top-0 h-full bg-white shadow-lg transition-transform',
        position === 'right' ? 'right-0' : 'left-0',
        open ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full',
        className
      )}
    >
      <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)}>
        关闭
      </button>
      {children}
    </div>
  )
}

interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

export const DrawerContent: React.FC<DrawerContentProps> = ({ children, className }) => {
  return <div className={cn("p-4", className)}>{children}</div>
}

interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

export const DrawerHeader: React.FC<DrawerHeaderProps> = ({ children, className }) => {
  return <div className={cn("border-b p-4 font-semibold text-lg", className)}>{children}</div>
}

interface DrawerTitleProps {
  children: React.ReactNode
  className?: string // 添加className属性
}

export const DrawerTitle: React.FC<DrawerTitleProps> = ({ children, className }) => {
  return <h2 className={`text-xl font-bold ${className}`}>{children}</h2>
}
