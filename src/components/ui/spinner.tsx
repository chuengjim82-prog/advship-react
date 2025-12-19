import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: "sm" | "default" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-6 w-6",
  lg: "h-8 w-8",
}

export function Spinner({ size = "default", className }: SpinnerProps) {
  return (
    <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
  )
}

interface LoadingProps {
  children?: React.ReactNode
  loading?: boolean
  tip?: string
  className?: string
}

export function Loading({ children, loading = true, tip, className }: LoadingProps) {
  if (!loading) return <>{children}</>

  if (children) {
    return (
      <div className={cn("relative", className)}>
        <div className="pointer-events-none opacity-50">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
          <Spinner size="lg" />
          {tip && <span className="mt-2 text-sm text-muted-foreground">{tip}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Spinner size="lg" />
      {tip && <span className="mt-2 text-sm text-muted-foreground">{tip}</span>}
    </div>
  )
}
