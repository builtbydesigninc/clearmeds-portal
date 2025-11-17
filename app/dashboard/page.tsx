"use client"

import { useEffect, useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProfileCard } from "@/components/profile-card"
import { ReferralCard } from "@/components/referral-card"
import { StatsGrid } from "@/components/stats-grid"
import { RankCard } from "@/components/rank-card"
import { QuickLinks } from "@/components/quick-links"
import { LeaderboardWidget } from "@/components/leaderboard-widget"
import { DetailsTable } from "@/components/details-table"
import { useSidebar } from "@/components/dashboard-sidebar-provider"
import { api } from "@/lib/api"
import { requireNonSuperAdmin } from "@/lib/auth"

export default function DashboardPage() {
  const { isCollapsed } = useSidebar()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await requireNonSuperAdmin()
      // If user is null, they were redirected (super_admin)
      if (!user) {
        return
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getDashboard()
        setDashboardData(data)
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2861a9] mx-auto mb-4"></div>
          <p className="text-[#6c727f]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#2861a9] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <DashboardSidebar />
      
      <div 
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ProfileCard data={dashboardData?.profile} />
              <ReferralCard data={dashboardData?.referralLink} />
              
              {/* Video Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <button className="shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                    <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  <div>
                    <h3 className="font-semibold text-[#131313] mb-2">What is Lorem Ipsum?</h3>
                    <p className="text-sm text-[#6c727f] leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
              </div>

              <StatsGrid data={dashboardData?.stats} />
              <RankCard data={dashboardData?.rank} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <QuickLinks />
              <LeaderboardWidget data={dashboardData?.leaderboard} />
            </div>
          </div>

          {/* Full Width Details Table */}
          <div className="mt-6">
            <DetailsTable data={dashboardData?.recentTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}
