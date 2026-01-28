'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
  color?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  maxDisplayed?: number
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Select items',
  maxDisplayed = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue]
    onValueChange(newValue)
  }

  const handleClearAll = () => {
    onValueChange([])
  }

  const getDisplayText = () => {
    if (value.length === 0) {
      return placeholder
    }

    if (value.length === 1) {
      const option = options.find((opt) => opt.value === value[0])
      return option?.label || value[0]
    }

    if (value.length <= maxDisplayed) {
      return value
        .map((v) => options.find((opt) => opt.value === v)?.label || v)
        .join(', ')
    }

    return `${value.length} selected`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{getDisplayText()}</span>
          {value.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {value.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-medium">Select items</span>
          {value.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-auto p-1 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {options.map((option) => {
            const isSelected = value.includes(option.value)
            return (
              <div
                key={option.value}
                onClick={() => handleToggle(option.value)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 hover:bg-accent',
                  isSelected && 'bg-accent/50'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-sm border',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-input'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                {option.color && (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="flex-1 text-sm">{option.label}</span>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
