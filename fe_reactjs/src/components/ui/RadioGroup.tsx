import React from 'react'

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup({ value, onValueChange, children, className = '' }: RadioGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            ...child.props
          })
        }
        return child
      })}
    </div>
  )
}

interface RadioGroupItemProps {
  value: string
  id: string
  children?: React.ReactNode
}

export function RadioGroupItem({ value, id, children }: RadioGroupItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={id}
        value={value}
        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
      />
      {children}
    </div>
  )
}
