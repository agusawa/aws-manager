"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Server, Settings, BarChart } from "lucide-react"
import { useState } from "react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Instances",
      icon: Server,
      href: "/dashboard/instances",
      active: pathname === "/dashboard/instances",
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/dashboard/analytics",
      active: pathname === "/dashboard/analytics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <MobileSidebar routes={routes} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
      <aside className={cn("hidden border-r bg-background md:flex md:w-[240px] md:flex-col", className)}>
        <ScrollArea className="flex-1 py-6">
          <div className="px-3 py-2">
            <h2 className="mb-6 px-4 text-lg font-semibold">EC2 Manager</h2>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}

function MobileSidebar({
  routes,
  setOpen,
}: {
  routes: {
    label: string
    icon: React.ElementType
    href: string
    active: boolean
  }[]
  setOpen: (open: boolean) => void
}) {
  return (
    <div className="flex h-full flex-col bg-background">
      <ScrollArea className="flex-1 py-6">
        <div className="px-3 py-2">
          <h2 className="mb-6 px-4 text-lg font-semibold">EC2 Manager</h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
