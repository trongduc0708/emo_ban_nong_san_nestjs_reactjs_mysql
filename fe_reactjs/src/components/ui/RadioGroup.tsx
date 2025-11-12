import React, { useId } from 'react'

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
  name?: string
}

export function RadioGroup({ value, onValueChange, children, className = '', name }: RadioGroupProps) {
  const generatedName = useId()
  const groupName = name || generatedName

  return (
    <div className={`space-y-3 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const childValue = child.props.value
          return React.cloneElement(child, {
            ...child.props,
            name: groupName,
            checked: childValue === value,
            onValueChange,
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
  name?: string
  checked?: boolean
  onValueChange?: (value: string) => void
}

export function RadioGroupItem({ value, id, children, name, checked = false, onValueChange }: RadioGroupItemProps) {
  return (
    <label className="flex items-center space-x-2" htmlFor={id}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onValueChange?.(value)}
        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
      />
      {children}
    </label>
  )
}
