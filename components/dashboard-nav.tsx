"use client"

import Link from "next/link"
import { Home, Megaphone, Users, Receipt, CreditCard, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function DashboardNav() {
  return (
    <nav className="bg-white border-b border-[#e6e6e6] sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo-clearmeds.png"
              alt="ClearMeds"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Button variant="ghost" className="gap-2 bg-[#2861a9] text-white hover:bg-[#2861a9]/90 hover:text-white">
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button variant="ghost" className="gap-2 text-[#6c727f] hover:text-[#131313]">
              <Megaphone className="w-4 h-4" />
              Marketing Tools
            </Button>
            <Button variant="ghost" className="gap-2 text-[#6c727f] hover:text-[#131313]">
              <Users className="w-4 h-4" />
              Network
            </Button>
            <Button variant="ghost" className="gap-2 text-[#6c727f] hover:text-[#131313]">
              <Receipt className="w-4 h-4" />
              Transactions
            </Button>
            <Button variant="ghost" className="gap-2 text-[#6c727f] hover:text-[#131313]">
              <CreditCard className="w-4 h-4" />
              Payments
            </Button>
            <Button variant="ghost" className="gap-2 text-[#6c727f] hover:text-[#131313]">
              <BookOpen className="w-4 h-4" />
              Guides
            </Button>
            <Button variant="ghost" className="gap-2 text-[#6c727f] hover:text-[#131313]">
              <BarChart3 className="w-4 h-4" />
              Leaderboard
            </Button>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[#6c727f] hover:text-[#131313]">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#6c727f] hover:text-[#131313]">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
