import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  let classes = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors "
  
  if (variant === "default") classes += "border-transparent bg-blue-600 text-white hover:bg-blue-700 "
  if (variant === "secondary") classes += "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200 "
  if (variant === "destructive") classes += "border-transparent bg-red-600 text-white hover:bg-red-700 "
  if (variant === "outline") classes += "text-gray-900 "
  
  classes += className
  
  return (
    <div className={classes} {...props} />
  )
}

export { Badge }
