import { $language, $t } from '@/entities/i18next/model'
import { WeatherWidget } from '@/widgets/weather-widget'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui'
import { useUnit } from 'effector-react'

import type { ReactNode } from 'react'
import { Link } from 'react-router'

export const HomePage = (): ReactNode => {
  const [t, language] = useUnit([$t, $language])

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-background p-6">
      {/* Weather Widget */}
      <div className="w-full max-w-md">
        <Link to="/weather" className="block">
          <WeatherWidget />
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          {language}
          <CardTitle className="text-2xl text-center">👋 {t('home.page.welcome')}</CardTitle>
          <CardDescription>Это главная страница приложения. Выберите, куда перейти дальше.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Link to="/weather">
            <Button variant="outline" className="w-full">
              🌤️ Погода
            </Button>
          </Link>
          <Link to="/update">
            <Button className="w-full">Обновления</Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full">
              Настройки
            </Button>
          </Link>
        </CardContent>

        <CardFooter>
          <img src="image.jpg" />
        </CardFooter>
      </Card>
    </div>
  )
}
