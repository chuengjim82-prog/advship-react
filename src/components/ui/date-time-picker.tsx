import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({ value, onChange, placeholder = '选择日期时间', className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
  const [time, setTime] = React.useState<string>(() => {
    if (value) {
      const d = new Date(value)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    }
    return '00:00'
  })

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      const [hours, minutes] = time.split(':')
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(':')
      const newDate = new Date(date)
      newDate.setHours(parseInt(hours), parseInt(minutes))
      onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"))
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className={cn('justify-start text-left font-normal', !date && 'text-muted-foreground', className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center" side="top">
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
