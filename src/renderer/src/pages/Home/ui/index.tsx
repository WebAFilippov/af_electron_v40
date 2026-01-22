import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'
import { ReactNode } from 'react'
import { Link } from 'react-router'

export const HomePage = (): ReactNode => {
  return (
    <div className="flex h-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">👋 Добро пожаловать</CardTitle>
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
      </Card>
    </div>
  )
}
