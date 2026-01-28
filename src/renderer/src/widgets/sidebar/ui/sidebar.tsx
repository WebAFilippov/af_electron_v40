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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/shared/ui'

import { cn } from '@/shared/lib'
import type { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { NAVIGATION_LIST } from '../model/navigation-list'
import { useUnit } from 'effector-react'
import { $windowFullscreen } from '@/widgets/window-control-panel/model'
import { SidebarBreadcrumbs } from './sidebar-bredcrumb'
import { HugeiconsIcon } from '@hugeicons/react'
import { Notification } from '@hugeicons/core-free-icons'
import { $t } from '@/entities/i18next'

export function SidebarWidget(): ReactNode {
  const t = useUnit($t)
  const [windowFullscreen] = useUnit([$windowFullscreen])

  return (
    <SidebarProvider className="flex flex-1 flex-col w-screen h-screen">
      <div className="flex flex-1">
        <Sidebar variant="inset" className="top-9 h-[calc(100svh-36px)] ">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAVIGATION_LIST.navMain.map((item) => (
                    <NavLink to={item.url} end key={item.title} draggable={false} tabIndex={-1}>
                      {({ isActive }) => {
                        return (
                          <SidebarMenuItem className="select-none">
                            <SidebarMenuButton
                              size="default"
                              variant={'default'}
                              isActive={isActive}
                            >
                              <>
                                {item.icon}
                                <span>{t(item.title)}</span>
                              </>
                            </SidebarMenuButton>
                            <SidebarMenuSub>
                              {item.children?.map((subItem) => (
                                <SidebarMenuSubItem>
                                  <NavLink to={subItem.url} end key={subItem.title}>
                                    {({ isActive: isActive2 }) => (
                                      <SidebarMenuSubButton
                                        className="select-none"
                                        size="sm"
                                        isActive={isActive2}
                                        key={subItem.title}
                                      >
                                        <>
                                          <span>{t(subItem.title)}</span>
                                        </>
                                      </SidebarMenuSubButton>
                                    )}
                                  </NavLink>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </SidebarMenuItem>
                        )
                      }}
                    </NavLink>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset
          className={cn(
            windowFullscreen && 'h-[calc(100svh-15px)]!',
            'h-[calc(100svh-36px)] md:peer-data-[variant=inset]:h-[calc(100svh-53px)]'
          )}
        >
          <header
            className={cn(
              'flex h-16 shrink-0 bg-background items-center justify-between gap-2 border-b px-4 sticky'
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
          <div className="overflow-x-hidden overflow-y-auto h-full px-8 py-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
