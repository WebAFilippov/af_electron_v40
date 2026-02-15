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
  AvatarImage,
  Separator,
  Card,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/shared/ui'

import { cn } from '@/shared/lib'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { NAVIGATION_LIST } from '../model/navigation-list'
import { useUnit } from 'effector-react'
import { SidebarBreadcrumbs } from './sidebar-bredcrumb'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification, AiCloud01Icon, Trash } from '@hugeicons/core-free-icons'
import { $t } from '@/entities/i18next'
import { $isFullscreen } from '@/widgets/window-control-panel/model'

export function SidebarWidget(): ReactNode {
  const t = useUnit($t)
  const [isFullscreen] = useUnit([$isFullscreen])

  return (
    <SidebarProvider className="flex flex-1 flex-col w-screen h-screen">
      <div className="flex flex-1">
        <Sidebar variant="inset" className="top-9 h-[calc(100svh-36px)] flex flex-col">
          {/* Header with Logo */}
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HugeiconsIcon icon={AiCloud01Icon} size={24} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-none">Effectory</span>
                <span className="text-xs text-muted-foreground">Weather App</span>
              </div>
            </div>
          </SidebarHeader>

          <Separator className="mx-4 w-[calc(100%-32px)]" />

          {/* Navigation Menu */}
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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Card className="px-2 py-3 flex items-center gap-3 select-none cursor-pointer hover:bg-muted transition-all">
                  <Avatar size="lg" className=" rounded-md">
                    <AvatarImage src="avatar.jpg" alt="UserAvatar" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">Пользователь</span>
                    <span className="truncate text-xs text-muted-foreground">user@example.com</span>
                  </div>
                </Card>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem>Option</DropdownMenuItem>
                  <DropdownMenuItem>Option</DropdownMenuItem>
                  <DropdownMenuItem>Option</DropdownMenuItem>
                  <DropdownMenuItem>Option</DropdownMenuItem>
                  <DropdownMenuItem>Option</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <HugeiconsIcon icon={Trash} />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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

              <div>
                <HugeiconsIcon icon={Notification} size={22} />
              </div>
            </div>
          </header>
          <div className="overflow-x-hidden overflow-y-auto h-full no-scrollbar scroll-smooth relative px-8">
            <div className=" sticky top-0 h-8 bg-linear-to-b from-background from-45% to-transparent z-10" />
            <Outlet />
            <div className=" sticky bottom-0 h-8 bg-linear-to-t from-background from-45% to-transparent z-10" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
