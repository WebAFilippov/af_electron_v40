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
import { $instance, $isReady, $language, $t, changeLanguageFx } from '../model'

export const LanguageSwitcher = (): ReactNode => {
  const [t, isReady, instance, language, handleChangeLanguageFx] = useUnit([
    $t,
    $isReady,
    $instance,
    $language,
    changeLanguageFx
  ])

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="language-switcher">{t('entities.i18next.label')}</Label>
      <Select value={language} onValueChange={handleChangeLanguageFx}>
        <SelectTrigger className="min-w-45  w-fit" id="language-switcher">
          <SelectValue>{}</SelectValue>
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
          </SelectGroup>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
    </div>
  )
}
