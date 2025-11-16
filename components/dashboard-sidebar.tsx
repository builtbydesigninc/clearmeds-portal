"use client"

import Link from "next/link"
import { Home, Megaphone, Users, Receipt, CreditCard, BookOpen, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSidebar } from "./dashboard-sidebar-provider"
import { usePathname } from 'next/navigation'

export function DashboardSidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Megaphone, label: "Marketing Tools", href: "/dashboard/marketing-tools" },
    { icon: Users, label: "Network", href: "/dashboard/network" },
    { icon: Receipt, label: "Transactions", href: "/dashboard/transactions" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
    { icon: BookOpen, label: "Guides", href: "/dashboard/guides" },
    { icon: BarChart3, label: "Leaderboard", href: "/dashboard/leaderboard" },
  ]

  return (
    <>
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-[#e6e6e6] fixed left-0 top-0 h-screen transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo with collapse button adjacent */}
        <div className="p-6 border-b border-[#e6e6e6] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2861a9] rounded flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            {!isCollapsed && <span className="font-semibold text-[#131313]">ClearMeds</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] shrink-0"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} ${
                    isActive 
                      ? 'bg-[#2861a9] text-white hover:bg-[#2861a9]/90 hover:text-white'
                      : 'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#e6e6e6] space-y-1">
          <Button variant="ghost" className={`w-full text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}>
            <Settings className="w-5 h-5" />
            {!isCollapsed && "Settings"}
          </Button>
          <Button variant="ghost" className={`w-full text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}>
            <LogOut className="w-5 h-5" />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </aside>

      <header className="lg:hidden bg-white border-b border-[#e6e6e6] sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-[#6c727f]"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2861a9] rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-semibold text-[#131313]">ClearMeds</span>
            </Link>
          </div>
        </div>
      </header>

      {isMobileOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#e6e6e6] z-50 flex flex-col">
            {/* Logo & Close Button */}
            <div className="p-6 border-b border-[#e6e6e6] flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileOpen(false)}>
                <div className="w-8 h-8 bg-[#2861a9] rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="font-semibold text-[#131313]">ClearMeds</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="text-[#6c727f]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start gap-3 ${
                        isActive 
                          ? 'bg-[#2861a9] text-white hover:bg-[#2861a9]/90 hover:text-white'
                          : 'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]'
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#e6e6e6] space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3 text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]" onClick={() => setIsMobileOpen(false)}>
                <Settings className="w-5 h-5" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]" onClick={() => setIsMobileOpen(false)}>
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

export default DashboardSidebar
