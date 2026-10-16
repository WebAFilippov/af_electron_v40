import type { RouteHandle } from '@/app/providers/routing'
import { $t } from '@/entities/i18next'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/shared/ui'
import { House } from 'lucide-react'
import { useUnit } from 'effector-react'
import type { ReactNode } from 'react'
import { Fragment } from 'react'
import type { UIMatch } from 'react-router'
import { NavLink, useMatches } from 'react-router'

type AppMatch = UIMatch<unknown, RouteHandle>

export const SidebarBreadcrumbs = (): ReactNode => {
  const t = useUnit($t)
  const matches = useMatches() as AppMatch[]
  const breadcrumbMatches = matches.filter((match) => match.handle?.breadcrumb)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/">
              <House size={20} />
            </NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbMatches[0].pathname !== '/' && <BreadcrumbSeparator />}

        {breadcrumbMatches.map((match, index) => {
          const isLast = index === breadcrumbMatches.length - 1

          if (match.pathname === '/') return null

          return (
            <Fragment key={match.pathname}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{match.handle!.breadcrumb && t(match.handle!.breadcrumb())}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <NavLink to={match.pathname} className={' bg-sidebar'}>
                      {match.handle!.breadcrumb && t(match.handle!.breadcrumb())}
                    </NavLink>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
