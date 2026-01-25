import { $language, $t } from '@/entities/i18next/model'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/shared/ui'
import { useUnit } from 'effector-react'

import type { ReactNode } from 'react'
import { Link } from 'react-router'

export const HomePage = (): ReactNode => {
  const [t,language] = useUnit([$t, $language])

  return (
    <div className="flex h-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          {language}
          <CardTitle className="text-2xl text-center">👋 {t('home.page.welcome')}</CardTitle>
          <CardDescription>
            Это главная страница приложения. Выберите, куда перейти дальше.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
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
