import type { ReactNode } from 'react'

export const NotFound404Page = (): ReactNode => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-foreground mb-4">404</div>
        <h1 className="text-3xl font-medium text-foreground/80 mb-4">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8">
          К сожалению, запрошенная страница не существует или была перемещена.
        </p>
      </div>
    </div>
  )
}
