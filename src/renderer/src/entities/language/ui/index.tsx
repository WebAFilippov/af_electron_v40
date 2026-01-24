import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue
} from '@/shared/ui'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { ISettings } from '../../../../../shared/types'

const countries = { france: '🇫🇷', 'united-kingdom': '🇬🇧', spain: '🇪🇸' }

export const LanguageSwitcher = (): ReactNode => {
  const [lang, setLang] = useState('ru')
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="language-switcher">Язык</Label>
      <Select
        value={lang}
        onValueChange={(language: ISettings['language']) => {
          window.api.settingsSetLanguage(language)
          setLang(language)
        }}
      >
        <SelectTrigger className="min-w-45  w-fit" id="language-switcher">
          <SelectValue>{countries[lang]}</SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-70 select-none">
          <SelectScrollUpButton />
          <SelectGroup>
            <SelectItem value="ru" disabled={lang === 'ru'}>
              Русский
            </SelectItem>
            <SelectItem value="en" disabled={lang === 'en'}>
              English
            </SelectItem>
          </SelectGroup>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
    </div>
  )
}
