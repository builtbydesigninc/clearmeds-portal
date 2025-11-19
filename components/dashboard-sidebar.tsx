"use client"

import Link from "next/link"
import { Home, Megaphone, Users, Receipt, CreditCard, BookOpen, BarChart3, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight, Shield, DollarSign, UserCog, Clock, User, ShoppingBag } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useSidebar } from "./dashboard-sidebar-provider"
import { usePathname } from 'next/navigation'
import Image from "next/image"
import { api } from "@/lib/api"

interface UserData {
  id: number
  displayName?: string
  firstName?: string
  lastName?: string
  email: string
  role: 'affiliate' | 'admin' | 'super_admin'
  affiliate_id?: string
}

export function DashboardSidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [userRole, setUserRole] = useState<'affiliate' | 'admin' | 'super_admin'>('affiliate')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loadingShop, setLoadingShop] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await api.getCurrentUser()
        setUserRole(user.role)
        setUserData(user)
      } catch (err) {
        // User not logged in or error
      }
    }
    fetchUser()
  }, [])

  const isAdmin = userRole === 'admin' || userRole === 'super_admin'
  const isSuperAdmin = userRole === 'super_admin'

  // Get user display name
  const getUserDisplayName = (user?: UserData) => {
    if (!user) return 'User'
    if (user.displayName) return user.displayName
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return user.email.split('@')[0]
  }

  // Get user initials for avatar
  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  // Get role badge color
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-red-100 text-red-700' }
      case 'admin':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-700' }
      default:
        return { label: 'Affiliate', color: 'bg-blue-100 text-blue-700' }
    }
  }

  const handleShopClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoadingShop(true)
    try {
      const response = await api.getSSOUrl()
      if (response.sso_url) {
        window.open(response.sso_url, '_blank')
      }
    } catch (error) {
      console.error('Failed to get SSO URL:', error)
      // Fallback to shop URL without SSO
      window.open('https://clearmeds.advait.site', '_blank')
    } finally {
      setLoadingShop(false)
    }
  }

  const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: ShoppingBag, label: "Shop", href: "#", isShop: true },
    { icon: Megaphone, label: "Marketing Tools", href: "/dashboard/marketing-tools" },
    { icon: Users, label: "Network", href: "/dashboard/network" },
    { icon: Receipt, label: "Transactions", href: "/dashboard/transactions" },
    { icon: Clock, label: "Pending Commissions", href: "/dashboard/commissions/pending" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
    { icon: BookOpen, label: "Guides", href: "/dashboard/guides" },
    { icon: BarChart3, label: "Leaderboard", href: "/dashboard/leaderboard" },
  ]

  const leaderboardItem = { icon: BarChart3, label: "Leaderboard", href: "/dashboard/leaderboard" }

  const adminNavItems = [
    { icon: Shield, label: "Admin Dashboard", href: "/dashboard/admin" },
    { icon: ShoppingBag, label: "Shop", href: "#", isShop: true },
    { icon: DollarSign, label: "Commissions", href: "/dashboard/admin/commissions" },
    { icon: Clock, label: "Pending Commissions", href: "/dashboard/admin/commissions/pending" },
    { icon: UserCog, label: "Users", href: "/dashboard/admin/users" },
    { icon: CreditCard, label: "Payouts", href: "/dashboard/admin/payouts" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
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
          <Link href="/dashboard" className="flex items-center">
            {isCollapsed ? (
              <Image
                src="/logo-clearmeds.png"
                alt="ClearMeds"
                width={48}
                height={48}
                className="h-10 w-auto"
                priority
              />
            ) : (
              <Image
                src="/logo-clearmeds.png"
                alt="ClearMeds"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            )}
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
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Admin Section - First for admins */}
          {isAdmin && adminNavItems.map((item) => {
            const Icon = item.icon
            const isShop = (item as any).isShop
            
            if (isShop) {
              return (
                <Button
                  key="shop-admin"
                  variant="ghost"
                  onClick={handleShopClick}
                  disabled={loadingShop}
                  className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} ${
                    'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] disabled:opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                </Button>
              )
            }
            
            // Highlight if exact match, or if pathname starts with this href + '/' (child route)
            // But don't highlight if another admin item is a more specific match
            const isExactMatch = pathname === item.href
            const isChildRoute = pathname?.startsWith(item.href + '/')
            const hasMoreSpecificMatch = adminNavItems.some(otherItem => 
              otherItem.href !== item.href && 
              otherItem.href.length > item.href.length &&
              pathname?.startsWith(otherItem.href)
            )
            const isActive = (isExactMatch || isChildRoute) && !hasMoreSpecificMatch
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} ${
                    isActive 
                      ? 'bg-[#dc2626] text-white hover:bg-[#dc2626]/90 hover:text-white'
                      : 'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                </Button>
              </Link>
            )
          })}
          
          {/* Regular user nav items - hidden for super_admin */}
          {!isSuperAdmin && navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isShop = (item as any).isShop
            
            if (isShop) {
              return (
                <Button
                  key="shop"
                  variant="ghost"
                  onClick={handleShopClick}
                  disabled={loadingShop}
                  className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} ${
                    'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] disabled:opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                </Button>
              )
            }
            
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
          
          {/* Leaderboard - visible for super_admin only, after admin items */}
          {isSuperAdmin && (() => {
            const Icon = leaderboardItem.icon
            const isActive = pathname === leaderboardItem.href
                return (
              <Link key={leaderboardItem.href} href={leaderboardItem.href}>
                    <Button 
                      variant="ghost" 
                      className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'} ${
                        isActive 
                      ? 'bg-[#2861a9] text-white hover:bg-[#2861a9]/90 hover:text-white'
                          : 'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                  {!isCollapsed && leaderboardItem.label}
                    </Button>
                  </Link>
                )
          })()}
        </nav>

        {/* User Profile Card */}
        {userData && (
          <div className="p-3 border-t border-[#e6e6e6]">
            <div className={`bg-gradient-to-br from-[#2861a9] to-[#1e4a7f] rounded-lg ${
              isCollapsed ? 'p-2' : 'p-4'
            } mb-3`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                {/* Avatar */}
                <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0`}>
                  <span className={`${isCollapsed ? 'text-xs' : 'text-sm'} font-semibold text-white`}>
                    {getUserInitials(getUserDisplayName(userData))}
                  </span>
                </div>
                
                {/* User Info */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {getUserDisplayName(userData)}
                    </p>
                    <p className="text-xs text-white/80 truncate">
                      {userData.email}
                    </p>
                    {userData.affiliate_id && (
                      <p className="text-xs text-white/60 mt-1">
                        {userData.affiliate_id}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Role Badge */}
              {!isCollapsed && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    getRoleBadge(userData.role).color
                  }`}>
                    {getRoleBadge(userData.role).label}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[#e6e6e6] space-y-1">
          <Link href="/dashboard/settings">
            <Button variant="ghost" className={`w-full text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}>
              <Settings className="w-5 h-5" />
              {!isCollapsed && "Settings"}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className={`w-full text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] ${isCollapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}
            onClick={() => {
              api.logout()
            }}
          >
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
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {/* Admin Section - First for admins */}
              {isAdmin && adminNavItems.map((item) => {
                const Icon = item.icon
                const isShop = (item as any).isShop
                
                if (isShop) {
                  return (
                    <Button
                      key="shop-admin-mobile"
                      variant="ghost"
                      onClick={(e) => {
                        setIsMobileOpen(false)
                        handleShopClick(e)
                      }}
                      disabled={loadingShop}
                      className={`w-full justify-start gap-3 ${
                        'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] disabled:opacity-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  )
                }
                
                // Highlight if exact match, or if pathname starts with this href + '/' (child route)
                // But don't highlight if another admin item is a more specific match
                const isExactMatch = pathname === item.href
                const isChildRoute = pathname?.startsWith(item.href + '/')
                const hasMoreSpecificMatch = adminNavItems.some(otherItem => 
                  otherItem.href !== item.href && 
                  otherItem.href.length > item.href.length &&
                  pathname?.startsWith(otherItem.href)
                )
                const isActive = (isExactMatch || isChildRoute) && !hasMoreSpecificMatch
                return (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start gap-3 ${
                        isActive 
                          ? 'bg-[#dc2626] text-white hover:bg-[#dc2626]/90 hover:text-white'
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
              
              {/* Regular user nav items - hidden for super_admin */}
              {!isSuperAdmin && navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isShop = (item as any).isShop
                
                if (isShop) {
                  return (
                    <Button
                      key="shop"
                      variant="ghost"
                      onClick={(e) => {
                        setIsMobileOpen(false)
                        handleShopClick(e)
                      }}
                      disabled={loadingShop}
                      className={`w-full justify-start gap-3 ${
                        'text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8] disabled:opacity-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  )
                }
                
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
              
              {/* Leaderboard - visible for super_admin only, after admin items */}
              {isSuperAdmin && (() => {
                const Icon = leaderboardItem.icon
                const isActive = pathname === leaderboardItem.href
                    return (
                  <Link key={leaderboardItem.href} href={leaderboardItem.href}>
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
                      {leaderboardItem.label}
                        </Button>
                      </Link>
                    )
              })()}
            </nav>

            {/* User Profile Card */}
            {userData && (
              <div className="p-3 border-t border-[#e6e6e6]">
                <div className="bg-gradient-to-br from-[#2861a9] to-[#1e4a7f] rounded-lg p-4 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-white">
                        {getUserInitials(getUserDisplayName(userData))}
                      </span>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {getUserDisplayName(userData)}
                      </p>
                      <p className="text-xs text-white/80 truncate">
                        {userData.email}
                      </p>
                      {userData.affiliate_id && (
                        <p className="text-xs text-white/60 mt-1">
                          {userData.affiliate_id}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Role Badge */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      getRoleBadge(userData.role).color
                    }`}>
                      {getRoleBadge(userData.role).label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#e6e6e6] space-y-1">
              <Link href="/dashboard/settings" onClick={() => setIsMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3 text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]">
                  <Settings className="w-5 h-5" />
                  Settings
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]"
                onClick={() => {
                  setIsMobileOpen(false)
                  api.logout()
                }}
              >
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
