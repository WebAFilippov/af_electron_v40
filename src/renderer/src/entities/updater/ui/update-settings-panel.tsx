import { RadioGroup, RadioGroupItem, Label, Switch, Separator, Badge } from '@/shared/ui'
import {
  $autoUpdateMode,
  $checkForUpdatesOnStartup,
  setAutoUpdateMode,
  toggleCheckForUpdatesOnStartup,
  type AutoUpdateMode
} from '../model/model-updater'
import { useUnit } from 'effector-react'
import { cn } from '@/shared/lib'
import { Search, Download, Zap, Bell, Info } from 'lucide-react'

const AUTO_UPDATE_MODES: { value: AutoUpdateMode; label: string; description: string; icon: typeof Search }[] = [
  {
    value: 'check-only',
    label: 'Только проверка',
    description: 'Приложение будет только проверять наличие обновлений и уведомлять вас',
    icon: Search
  },
  {
    value: 'check-and-download',
    label: 'Проверка и скачивание',
    description: 'Автоматически скачивать обновления, но спрашивать перед установкой',
    icon: Download
  },
  {
    value: 'full-auto',
    label: 'Полностью автоматически',
    description: 'Автоматически проверять, скачивать и устанавливать обновления',
    icon: Zap
  }
]

export const UpdateSettingsPanel = () => {
  const [checkOnStartup, toggleCheckOnStartup, autoMode, setMode] = useUnit([
    $checkForUpdatesOnStartup,
    toggleCheckForUpdatesOnStartup,
    $autoUpdateMode,
    setAutoUpdateMode
  ])

  return (
    <div className="space-y-6">
      {/* Check on Startup Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <Label htmlFor="check-on-startup" className="text-base font-medium cursor-pointer">
              Проверять при запуске
            </Label>
            <p className="text-sm text-muted-foreground">Автоматически проверять обновления при старте приложения</p>
          </div>
        </div>
        <Switch id="check-on-startup" checked={checkOnStartup} onCheckedChange={toggleCheckOnStartup} />
      </div>

      <Separator />

      {/* Auto Update Mode Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium">Режим автоматического обновления</p>
        </div>

        <RadioGroup value={autoMode} onValueChange={(value) => setMode(value as AutoUpdateMode)} className="space-y-3">
          {AUTO_UPDATE_MODES.map((mode) => {
            const Icon = mode.icon
            const isSelected = autoMode === mode.value

            return (
              <div
                key={mode.value}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 transition-all cursor-pointer',
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                )}
                onClick={() => setMode(mode.value)}
              >
                <RadioGroupItem value={mode.value} id={mode.value} className="mt-1" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <Label
                      htmlFor={mode.value}
                      className={cn('font-medium cursor-pointer', isSelected ? 'text-primary' : 'text-foreground')}
                    >
                      {mode.label}
                    </Label>
                    {mode.value === 'full-auto' && (
                      <Badge variant="default" className="text-xs">
                        Рекомендуется
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{mode.description}</p>
                </div>
              </div>
            )
          })}
        </RadioGroup>
      </div>
    </div>
  )
}
