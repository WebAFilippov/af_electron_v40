import { WeatherWidget } from '@/widgets/weather-widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { CloudSun, Settings, ArrowRight, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

export const HomePage = (): ReactNode => {
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать</h1>
          <p className="text-muted-foreground mt-2">Ваше приложение для погоды и настроек</p>
        </div>

        {/* Weather Widget Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CloudSun className="h-5 w-5 text-primary" />
              Погода
            </CardTitle>
            <CardDescription>Актуальная информация о погоде в вашем городе</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/weather" className="block">
              <WeatherWidget />
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Weather Action */}
          <Link to="/weather">
            <Card className="h-full cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <CloudSun className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Погода</CardTitle>
                      <CardDescription>Прогноз и текущая погода</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Узнайте прогноз погоды на 7 дней, текущую температуру, влажность и ветер.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Settings Action */}
          <Link to="/settings">
            <Card className="h-full cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Настройки</CardTitle>
                      <CardDescription>Настройте приложение</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Измените язык, тему оформления и другие параметры приложения.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features Highlight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              Возможности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Прогноз на 7 дней</p>
                  <p className="text-sm text-muted-foreground">Подробный прогноз погоды</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Мультиязычность</p>
                  <p className="text-sm text-muted-foreground">5 языков интерфейса</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Автоопределение</p>
                  <p className="text-sm text-muted-foreground">Определение города по IP</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Автообновление</p>
                  <p className="text-sm text-muted-foreground">Каждый час автоматически</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Светлая и тёмная тема</p>
                  <p className="text-sm text-muted-foreground">Адаптация под систему</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">Без API ключа</p>
                  <p className="text-sm text-muted-foreground">Open-Meteo - бесплатно</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
