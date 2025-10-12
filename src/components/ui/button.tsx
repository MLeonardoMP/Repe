import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90", 
        primary: "bg-primary text-primary-foreground hover:bg-primary/90", 
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm", // Matching test expectations
        lg: "h-12 px-8", // Matching test expectations  
        icon: "h-10 w-10",
        mobile: "h-12 px-6 py-3 text-base font-semibold", 
        mobileLg: "h-14 px-8 py-4 text-lg font-semibold", 
      },
      loading: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  as?: React.ElementType
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    disabled,
    children,
    fullWidth,
    as,
    ...props 
  }, ref) => {
    // Handle different element types
    let Comp: React.ElementType = "button"
    
    if (as) {
      Comp = as
    } else if (asChild) {
      Comp = Slot
    }
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              data-testid="loading-spinner"
            />
            <span>{loadingText}</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

// Workout-specific button variants
export const WorkoutButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "mobile", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "font-semibold tracking-wide shadow-lg",
          "touch-manipulation", // Optimize for touch
          "active:scale-95 transition-transform duration-150", // Touch feedback
          className
        )}
        size={size}
        {...props}
      />
    )
  }
)
WorkoutButton.displayName = "WorkoutButton"

// Primary action button for starting workouts, adding exercises
export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="primary"
        className={className}
        {...props}
      />
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

// Secondary action button for cancel, back actions
export const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "mobile", ...props }, ref) => {
    return (
      <WorkoutButton
        ref={ref}
        className={cn(
          "border-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          className
        )}
        variant={variant}
        size={size}
        {...props}
      />
    )
  }
)
SecondaryButton.displayName = "SecondaryButton"

// Danger button for delete actions
export const DangerButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "destructive", size = "mobile", ...props }, ref) => {
    return (
      <WorkoutButton
        ref={ref}
        className={cn(
          "bg-red-600 text-white hover:bg-red-700",
          "border-2 border-red-600",
          className
        )}
        variant={variant}
        size={size}
        {...props}
      />
    )
  }
)
DangerButton.displayName = "DangerButton"

// Floating Action Button for quick actions
export const FAB = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full", // 56px FAB size
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "shadow-lg hover:shadow-xl",
          "border-2 border-primary",
          "touch-manipulation",
          "active:scale-95 transition-all duration-200",
          className
        )}
        size={size}
        {...props}
      />
    )
  }
)
FAB.displayName = "FAB"

export { Button, buttonVariants }