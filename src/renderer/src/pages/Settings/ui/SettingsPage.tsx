import type { ReactNode } from 'react'

import { AutoLaunch } from '@/entities/auto-launch'
import { StartMinimized } from '@/entities/start-minimized'
import { LanguageSwitcher } from '@/entities/i18next'
import { ThemeSwitcher } from '@/entities/theme'

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { Globe, Rocket } from 'lucide-react'
import { useGate } from 'effector-react'
import { GateSettingsPage } from '../model'
import { Card, Col, Container, Row } from '@gravity-ui/uikit'

export const SettingsPage = (): ReactNode => {
  useGate(GateSettingsPage)

  return (
    <div className="min-h-fit">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
          <p className="text-muted-foreground mt-2">Настройте приложение под свои предпочтения</p>
        </div>

        <Card size="l" theme="normal" view="filled">
          <Container spaceRow={10} gutters={10} maxWidth="l">
            <Col size={12}>
              <LanguageSwitcher />

              <ThemeSwitcher />
            </Col>
          </Container>

          {/* <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe className="h-5 w-5 " />
              Общие настройки
            </CardTitle>
            <CardDescription>Язык интерфейса и внешний вид приложения</CardDescription>
          </CardHeader> */}
          {/* <CardContent className="space-y-6"> */}
          {/* <div className="flex flex-col gap-4"> */}
          {/* <LanguageSwitcher /> */}

          {/* <ThemeSwitcher /> */}
          {/* </div> */}
          {/* </CardContent> */}
        </Card>

        {/* Startup Settings */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Rocket className="h-5 w-5" />
              Запуск
            </CardTitle>
            <CardDescription>Настройки автоматического запуска приложения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <AutoLaunch />
              <StartMinimized />
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
