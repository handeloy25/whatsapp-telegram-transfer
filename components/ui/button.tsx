import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    let classes = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 "
    
    // Add variant classes
    if (variant === "default") classes += "bg-blue-600 text-white hover:bg-blue-700 "
    if (variant === "destructive") classes += "bg-red-600 text-white hover:bg-red-700 "
    if (variant === "outline") classes += "border border-gray-300 bg-white hover:bg-gray-50 "
    if (variant === "secondary") classes += "bg-gray-100 text-gray-900 hover:bg-gray-200 "
    if (variant === "ghost") classes += "hover:bg-gray-100 "
    if (variant === "link") classes += "text-blue-600 underline-offset-4 hover:underline "
    
    // Add size classes
    if (size === "default") classes += "h-10 px-4 py-2 "
    if (size === "sm") classes += "h-9 px-3 "
    if (size === "lg") classes += "h-11 px-8 "
    if (size === "icon") classes += "h-10 w-10 "
    
    classes += className
    
    return (
      <Comp
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
