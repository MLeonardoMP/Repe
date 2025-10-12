import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
      },
      size: {
        default: "h-10",
        sm: "h-8 text-sm",
        lg: "h-12 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  error?: boolean | string
  success?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, error, success, label, helperText, disabled, ...props }, ref) => {
    const inputId = React.useId()
    const helperTextId = React.useId()
    
    // Determine variant based on state
    let computedVariant = variant
    if (error) computedVariant = "error"
    if (success) computedVariant = "success"

    const hasError = Boolean(error)
    const errorMessage = typeof error === 'string' ? error : undefined
    const displayHelperText = errorMessage || helperText

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: computedVariant, size }),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        ref={ref}
        id={label ? inputId : undefined}
        aria-describedby={displayHelperText ? helperTextId : undefined}
        aria-invalid={hasError}
        disabled={disabled}
        {...props}
      />
    )

    if (label || displayHelperText) {
      return (
        <div className="space-y-2">
          {label && (
            <label htmlFor={inputId} className="text-sm font-medium leading-none">
              {label}
            </label>
          )}
          {inputElement}
          {displayHelperText && (
            <p id={helperTextId} className={cn(
              "text-xs",
              hasError ? "text-red-500" : "text-muted-foreground"
            )}>
              {displayHelperText}
            </p>
          )}
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = "Input"

export { Input, inputVariants }