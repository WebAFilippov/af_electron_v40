import { RouteHandle } from '@/app/routing'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/shared/ui'
import { Home05Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Fragment, ReactNode } from 'react'
import { NavLink, UIMatch, useMatches } from 'react-router'

type AppMatch = UIMatch<unknown, RouteHandle>

export const SidebarBreadcrumbs = (): ReactNode => {
  const matches = useMatches() as AppMatch[]
  const breadcrumbMatches = matches.filter((match) => match.handle?.breadcrumb)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <NavLink to="/">
              <HugeiconsIcon icon={Home05Icon} size={20} />
            </NavLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbMatches[0].pathname !== '/' && <BreadcrumbSeparator />}

        {breadcrumbMatches.map((match, index) => {
          const isLast = index === breadcrumbMatches.length - 1

          if (match.pathname === '/') return null

          const breadcrumb = match.handle!.breadcrumb && match.handle!.breadcrumb()

          return (
            <Fragment key={match.pathname}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <NavLink to={match.pathname}>
                      {match.handle!.breadcrumb && match.handle!.breadcrumb()}
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
