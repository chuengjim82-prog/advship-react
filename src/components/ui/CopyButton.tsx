import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

interface CopyButtonProps {
  text: string // The text to copy
  className?: string // Optional className for styling
  iconOnly?: boolean // Whether to show only the icon
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className, iconOnly = false }) => {
  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      toast.success('内容已复制')
    } catch {
      toast.error('复制失败')
    }
  }, [text])

  return (
    <Button variant="link" size="sm" className={`h-auto p-0 ${className}`} onClick={handleCopy}>
      {iconOnly ? (
        <Copy className="w-4 h-4" />
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          {/* 复制 */}
        </>
      )}
    </Button>
  )
}

export default CopyButton
