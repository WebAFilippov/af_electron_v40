import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ModeToggle,
  SidebarFooter,
  SidebarHeader,

} from '@/shared/ui'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger
} from '@/shared/ui'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Home01Icon,
  ChartIcon,
  ShoppingBag01Icon,
  ShoppingCart01Icon,
  File01Icon,
  UserIcon,
  Settings05Icon,
  ChartRingIcon,
  SentIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons'
import { cn } from '@/shared/lib'

export function SidebarInsetExample() {


  const data = {
    navMain: [
      {
        title: 'Dashboard',
        url: '#',
        icon: <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />,
        isActive: true,
        items: [
          {
            title: 'Overview',
            url: '#'
          },
          {
            title: 'Analytics',
            url: '#'
          }
        ]
      },
      {
        title: 'Analytics',
        url: '#',
        icon: <HugeiconsIcon icon={ChartIcon} strokeWidth={2} />,
        items: [
          {
            title: 'Reports',
            url: '#'
          },
          {
            title: 'Metrics',
            url: '#'
          }
        ]
      },
      {
        title: 'Orders',
        url: '#',
        icon: <HugeiconsIcon icon={ShoppingBag01Icon} strokeWidth={2} />,
        items: [
          {
            title: 'All Orders',
            url: '#'
          },
          {
            title: 'Pending',
            url: '#'
          },
          {
            title: 'Completed',
            url: '#'
          }
        ]
      },
      {
        title: 'Products',
        url: '#',
        icon: <HugeiconsIcon icon={ShoppingCart01Icon} strokeWidth={2} />,
        items: [
          {
            title: 'фыввввввввввфывфыв',
            url: '#'
          },
          {
            title: 'Categories',
            url: '#'
          }
        ]
      },
      {
        title: 'Invoices',
        url: '#',
        icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />
      },
      {
        title: 'Customers',
        url: '#',
        icon: <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
      },
      {
        title: 'Settings',
        url: '#',
        icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      }
    ],
    navSecondary: [
      {
        title: 'Support',
        url: '#',
        icon: <HugeiconsIcon icon={ChartRingIcon} strokeWidth={2} />
      },
      {
        title: 'Feedback',
        url: '#',
        icon: <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
      }
    ]
  }

  return (
    <SidebarProvider>
      <Sidebar variant='inset'>
        <SidebarHeader>
          <ModeToggle />
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
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
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="sm">
                      <a href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ModeToggle />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className=''>
        <header
          className={cn(
            'flex h-16  shrink-0 bg-background items-center justify-between gap-2 border-b px-4 sticky'
          )}
        >
          <SidebarTrigger className="-ml-1" />
          <ModeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
