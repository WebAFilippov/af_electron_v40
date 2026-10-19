import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
  Avatar,
  AvatarFallback,
  Separator,
  Card,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/ui'

import { cn } from '@/shared/lib'
import { useRef, type ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { NAVIGATION_LIST } from '../model/navigation-list'
import { useUnit } from 'effector-react'
import { SidebarBreadcrumbs } from './sidebar-bredcrumb'
import { Bell, CloudSun } from 'lucide-react'
import { $t } from '@/entities/i18next'
import { $isFullscreen } from '@/widgets/window-control-panel/model'
import { useScrollRestoration } from '@/shared/hooks'

/**
 * Application shell.
 *
 * Elements that would do nothing are shown disabled with an explanation rather than
 * as live-looking controls: a bell that does nothing on click and an account menu
 * with placeholder entries both read as bugs. They are kept visible so the layout
 * still matches the intended product, and marked clearly as not available yet.
 */

interface DisabledHintProps {
  label: string
  children: ReactNode
}

/** Wraps an inert control with a tooltip explaining why it does nothing. */
const DisabledHint = ({ label, children }: DisabledHintProps): ReactNode => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span tabIndex={0} aria-disabled className="cursor-not-allowed">
        {children}
      </span>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
)

export function SidebarWidget(): ReactNode {
  const t = useUnit($t)
  const [isFullscreen] = useUnit([$isFullscreen])
  const refInset = useRef<HTMLDivElement>(null)
  useScrollRestoration(refInset)

  return (
    <SidebarProvider className="flex flex-1 flex-col w-screen h-screen">
      <div className="flex flex-1">
        <Sidebar variant="inset" className="top-9 h-[calc(100svh-36px)] flex flex-col">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CloudSun size={24} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">Effectory</span>
                <span className="text-xs text-muted-foreground">{t('app.tagline')}</span>
              </div>
            </div>
          </SidebarHeader>

          <Separator className="mx-4 w-[calc(100%-32px)]" />

          <SidebarContent className="flex-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAVIGATION_LIST.navMain.map((item) => (
                    <NavLink to={item.url} end key={item.title} draggable={false} tabIndex={-1}>
                      {({ isActive }) => {
                        return (
                          <SidebarMenuItem className="select-none">
                            <SidebarMenuButton size="default" variant={'default'} isActive={isActive}>
                              <>
                                {item.icon}
                                <span>{t(item.title)}</span>
                              </>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      }}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <Separator className="mx-4 w-[calc(100%-32px)]" />

          <SidebarFooter className="p-4">
            <DisabledHint label={t('app.account_soon')}>
              <Card className="w-full px-2 py-3 flex items-center gap-3 select-none opacity-60">
                <Avatar size="lg" className="rounded-md">
                  <AvatarFallback>AF</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">{t('app.local_user')}</span>
                  <span className="truncate text-xs text-muted-foreground">{t('app.account_soon')}</span>
                </div>
              </Card>
            </DisabledHint>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset
          className={cn(
            isFullscreen && 'h-[calc(100svh-15px)]!',
            'h-[calc(100svh-36px)] md:peer-data-[variant=inset]:h-[calc(100svh-53px)] relative'
          )}
        >
          <header
            className={cn(
              'flex sticky top-0 h-16 shrink-0 bg-background items-center justify-between gap-2 border-b px-4 z-30'
            )}
          >
            <div className="flex gap-5 items-center justify-between w-full">
              <div className="flex items-center gap-5">
                <SidebarTrigger />
                <SidebarBreadcrumbs />
              </div>

              <DisabledHint label={t('app.notifications_soon')}>
                <span className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/50">
                  <Bell size={20} />
                </span>
              </DisabledHint>
            </div>
          </header>
          <div
            ref={refInset}
            className="overflow-x-hidden overflow-y-auto h-full no-scrollbar scroll-smooth relative px-8"
          >
            <div className=" sticky top-0 h-8 bg-linear-to-b from-background from-45% to-transparent z-10" />
            <Outlet />
            <div className=" sticky bottom-0 h-8 bg-linear-to-t from-background from-45% to-transparent z-10" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
