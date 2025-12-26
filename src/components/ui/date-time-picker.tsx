import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

// 添加 disabled 属性到 DateTimePickerProps
interface DateTimePickerProps {
  value?: string | null // 支持 null
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean // 新增 disabled 属性
}

export function DateTimePicker({ value, onChange, placeholder = '选择日期时间', className, disabled }: DateTimePickerProps) {
  // 内部状态：日期和时间字符串
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState<string>('00:00')

  // 关键：监听外部 value 变化，同步内部状态
  useEffect(() => {
    if (value) {
      try {
        const parsed = parseISO(value) // 安全解析 ISO 字符串
        if (!isNaN(parsed.getTime())) {
          setDate(parsed)
          setTime(`${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`)
        }
      } catch (e) {
        console.warn('无效的日期字符串:', value)
      }
    } else {
      setDate(undefined)
      setTime('00:00')
    }
  }, [value])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) {
      const [hours, minutes] = time.split(':')
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10))
      onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    } else {
      onChange?.('')
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':')
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10))
      onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    }
  }

  // 显示文本：即使是 00:00 也要显示出来
  const displayText = date ? format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN }) : placeholder

  // 禁用逻辑
  const handleDisabled = disabled ? { disabled: true } : {}

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('justify-start text-left font-normal w-full', !date && 'text-muted-foreground', className)}
          {...handleDisabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus locale={zhCN} />
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">时间:</span>
            <Input type="time" value={time} onChange={handleTimeChange} className="w-32" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
