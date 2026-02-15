import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from '@/shared/ui'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate, Link } from 'react-router'

export const NotFound404Page = (): ReactNode => {
  const navigate = useNavigate()

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
          <CardDescription className="text-lg mt-2">Страница не найдена</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">К сожалению, запрашиваемая страница не существует или была удалена.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <Link to="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
