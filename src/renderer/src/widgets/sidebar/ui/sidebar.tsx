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
  SidebarTrigger
} from '@/shared/ui'

import { cn } from '@/shared/lib'
import { ReactNode } from 'react'
import { NavLink, Outlet } from 'react-router'
import { NAVIGATION_LIST } from '../model/navigation-list'
import { useUnit } from 'effector-react'
import { $windowFullscreen } from '@/shared/model/window-header-model'

export function SidebarWidget(): ReactNode {
  const [windowFullscreen] = useUnit([$windowFullscreen])

  return (
    <SidebarProvider className="flex flex-1 flex-col w-screen h-screen">
      <div className="flex flex-1">
        <Sidebar variant="inset" className="top-9 h-[calc(100svh-36px)] ">
          <SidebarContent>
            <SidebarGroup>
              {/* <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarMenu>
                {NAVIGATION_LIST.navMain.map((item) => (
                  <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                        <a href={item.url}>
                          {item.icon}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                      {item.items?.length ? (
                        <>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                              <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <a href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </>
                      ) : null}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu> */}
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAVIGATION_LIST.navSecondary.map((item) => (
                    <NavLink to={item.url} key={item.title} draggable={false} tabIndex={-1}>
                      {({ isActive }) => {
                        return (
                          <SidebarMenuItem className="select-none">
                            <SidebarMenuButton size="default" isActive={isActive}>
                              <>
                                {item.icon}
                                <span>{item.title}</span>
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
        </Sidebar>
        <SidebarInset
          className={cn(
            windowFullscreen && 'h-[calc(100svh-15px)]!',
            'h-[calc(100svh-36px)] md:peer-data-[variant=inset]:h-[calc(100svh-53px)]'
          )}
        >
          <header
            className={cn(
              'flex h-16 shrink-0 bg-background items-center justify-between gap-2 border-b px-4 sticky '
            )}
          >
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="overflow-x-hidden overflow-y-auto px-8 py-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
