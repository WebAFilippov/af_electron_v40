import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ReactNode
} from 'react'

type ToggleGroupContextType<T> = {
  value: T
  setValue: (value: T) => void
  focusedIndex: number
  setFocusedIndex: (index: number) => void
  registerItem: (value: T) => number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ToggleGroupContext = createContext<ToggleGroupContextType<any> | null>(null)

type ToggleGroupProps<T> = {
  value: T
  onChange: (value: T) => void
  children: ReactNode
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'>

export const ToggleGroupCustom = <T,>({
  value,
  onChange,
  children,

  ...props
}: ToggleGroupProps<T>): ReactNode => {
  const items = useRef<T[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number>(0)

  const registerItem = (itemValue: T): number => {
    const index = items.current.findIndex((v) => Object.is(v, itemValue))
    if (index !== -1) return index

    items.current.push(itemValue)
    return items.current.length - 1
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const max = items.current.length - 1
    if (max < 0) return

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        setFocusedIndex((i) => (i === max ? 0 : i + 1))
        break

      case 'ArrowLeft':
        e.preventDefault()
        setFocusedIndex((i) => (i === 0 ? max : i - 1))
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        onChange(items.current[focusedIndex])
        break
    }
  }

  return (
    <ToggleGroupContext.Provider
      value={{
        value,
        setValue: onChange,
        focusedIndex,
        setFocusedIndex,
        registerItem
      }}
    >
      <div
        role="radiogroup"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="flex h-10 items-center focus-visible:outline-none justify-center shadow-xs rounden-md"
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

type ToggleGroupItemProps<T> = {
  value: T
  children: ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export const ToggleGroupItemCustom = <T,>({
  value,
  children,
  ...props
}: ToggleGroupItemProps<T>): ReactNode => {
  const ctx = useContext(ToggleGroupContext) as ToggleGroupContextType<T> | null

  if (!ctx) {
    throw new Error('ToggleGroupItem must be used inside ToggleGroup')
  }

  const { value: selectedValue, setValue, focusedIndex, setFocusedIndex, registerItem } = ctx

  const buttonRef = useRef<HTMLButtonElement>(null)
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    setIndex(registerItem(value))
  }, [value, registerItem])

  useEffect(() => {
    if (index === focusedIndex) {
      buttonRef.current?.focus()
    }
  }, [focusedIndex, index])

  if (index === null) return null

  const selected = Object.is(selectedValue, value)

  return (
    <button
      ref={buttonRef}
      role="radio"
      aria-checked={selected}
      tabIndex={focusedIndex === index ? 0 : -1}
      onClick={() => setValue(value)}
      onFocus={() => setFocusedIndex(index)}
      data-selected={selected}
      className="
      w-1/3 min-w-fit h-full shrink-0 focus:z-10 focus-visible:z-10 shadow-none border border-sidebar-border text-sm font-medium select-none 
      bg-background text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground data-selected:bg-sidebar-accent data-selected:hover:bg-sidebar-accent data-selected:text-accent-foreground
      focus-visible:not-data-selected:bg-secondary focus-visible:not-data-selected:text-secondary-foreground
      rounded-none  first:rounded-l-md last:rounded-r-md border-l-0 first:border-l
      px-2.5  whitespace-nowrap transition-all
      inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2"
      {...props}
    >
      {children}
    </button>
  )
}
