import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui'
import { ReactNode, useState } from 'react'
import { Language } from '../../../../../shared/types'

export const LanguageSwitcher = (): ReactNode => {
  const [lang, setLang] = useState('ru')
  return (
    <div className="flex items-center justify-between">
      <span>Язык</span>
      <Select
        value={lang}
        onValueChange={(state: Language) => {
          window.api.i18nSetLanguage(state)
          setLang(state)
        }}
      >
        <SelectTrigger className="w-45">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ru">Русский</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
