import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-green-600 text-white",
        warning: "bg-yellow-600 text-white",
        error: "bg-destructive text-destructive-foreground",
        info: "bg-blue-600 text-white",
        dot: "w-2 h-2 p-0 bg-primary",
      },
      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  outlined?: boolean
  removable?: boolean
  onRemove?: () => void
}

function Badge({ 
  className, 
  variant, 
  size, 
  outlined,
  removable, 
  onRemove,
  onClick,
  children,
  ...props 
}: BadgeProps) {
  const isDotVariant = variant === "dot"
  const isClickable = Boolean(onClick)
  
  // Handle click for removable badges
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (removable && onRemove) {
      onRemove()
    }
    onClick?.(e)
  }

  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }),
        outlined && "border border-input bg-background text-foreground",
        isClickable && "cursor-pointer hover:opacity-80",
        className
      )}
      onClick={handleClick}
      {...(isDotVariant ? { role: "status" } : {})}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }