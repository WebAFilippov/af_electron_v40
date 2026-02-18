import { useRouteError, isRouteErrorResponse, Link } from 'react-router'
import { useUnit } from 'effector-react'
import { $t } from '@/entities/i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/shared/ui'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'

export const ErrorPage = (): ReactNode => {
  const t = useUnit($t)
  const error = useRouteError()

  let errorMessage = t('page.error.default_message', 'Что-то пошло не так')
  let errorStatus = ''

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status.toString()
    if (error.status === 404) {
      errorMessage = t('page.error.404_message', 'Страница не найдена')
    } else if (error.status === 500) {
      errorMessage = t('page.error.500_message', 'Внутренняя ошибка сервера')
    } else {
      errorMessage = error.statusText || errorMessage
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold">{errorStatus || 'Oops!'}</CardTitle>
          <CardDescription className="text-lg mt-2">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error instanceof Error && error.stack && (
            <div className="p-4 bg-muted rounded-lg overflow-auto max-h-40">
              <code className="text-xs text-muted-foreground whitespace-pre-wrap">{error.stack}</code>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={handleReload} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('page.error.reload', 'Обновить страницу')}
            </Button>

            <Link to="/" className="w-full">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                {t('page.error.go_home', 'На главную')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
