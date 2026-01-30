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
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { $isReady, $language, $t, changeLanguage } from '../model'

export const LanguageSwitcher = (): ReactNode => {
  const [t, isReady, language, handleChangeLanguageFx] = useUnit([$t, $isReady, $language, changeLanguage])

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="language-switcher">{t('entities.i18next.label')}</Label>
      <Select value={language ? language : undefined} onValueChange={handleChangeLanguageFx}>
        <SelectTrigger className="min-w-45  w-fit" id="language-switcher" disabled={!isReady}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-70 select-none">
          <SelectScrollUpButton />
          <SelectGroup>
            <SelectItem value="ru" disabled={language === 'ru'}>
              Русский
            </SelectItem>
            <SelectItem value="en" disabled={language === 'en'}>
              English
            </SelectItem>
            <SelectItem value="be" disabled={language === 'be'}>
              Беларускі
            </SelectItem>
            <SelectItem value="uk" disabled={language === 'uk'}>
              Український
            </SelectItem>
            <SelectItem value="kk" disabled={language === 'kk'}>
              Қазақша
            </SelectItem>
          </SelectGroup>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
    </div>
  )
}
