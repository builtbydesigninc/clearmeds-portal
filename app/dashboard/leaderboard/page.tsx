'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Medal, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

const getBadgeColor = (badge: string | null) => {
  switch (badge) {
    case 'platinum':
      return 'bg-gradient-to-b from-[#A8C4A8] to-[#8FB08F]'
    case 'gold':
      return 'bg-gradient-to-b from-[#FFD700] to-[#FFC700]'
    case 'silver':
      return 'bg-gradient-to-b from-[#C0C0C0] to-[#A8A8A8]'
    case 'bronze':
      return 'bg-gradient-to-b from-[#CD7F32] to-[#B87333]'
    default:
      return 'bg-[#E8F0FE]'
  }
}

export default function LeaderboardPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [leaderboardData, setLeaderboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'all-time' | 'this-month' | 'last-month'>('all-time')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const data = await api.getLeaderboard(period)
        setLeaderboardData(data)
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [period])

  const tierData = leaderboardData?.tiers || [
    {
      name: 'Bronze',
      range: '$0 - $25,000',
      commission: '10% commission',
      color: 'bg-gradient-to-b from-[#CD7F32] to-[#B87333]',
      iconColor: 'text-[#CD7F32]',
    },
    {
      name: 'Silver',
      range: '$25,001 - $50,000',
      commission: '12% commission',
      color: 'bg-gradient-to-b from-[#C0C0C0] to-[#A8A8A8]',
      iconColor: 'text-[#C0C0C0]',
    },
    {
      name: 'Gold',
      range: '$50,001 - $100,000',
      commission: '15% commission',
      color: 'bg-gradient-to-b from-[#FFD700] to-[#FFC700]',
      iconColor: 'text-[#FFD700]',
    },
    {
      name: 'Platinum',
      range: '$100,001+',
      commission: '18% commission',
      color: 'bg-gradient-to-b from-[#A8C4A8] to-[#8FB08F]',
      iconColor: 'text-[#A8C4A8]',
    },
  ]

  const leaderboardList = leaderboardData?.leaderboard || []
  const userRank = leaderboardData?.userRank || { currentRank: 7, currentAmount: 25500, nextRankAmount: 50000, percentage: 51 }

  return (
    <div className="flex min-h-screen bg-[#f8f8f8]">
      <DashboardSidebar />
      
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          {/* Top Section: Current Rank and Tier Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Current Rank Card */}
            <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-sm border border-[#f8f8f8]">
              <div className="text-[#6c727f] text-sm mb-2">Your Current Rank</div>
              <div className="flex items-baseline justify-between mb-4">
                <div className="text-4xl font-bold text-[#131313]">
                  #{userRank?.currentRank || 7}
                </div>
                <span className="px-3 py-1 bg-[#E8F0FE] text-[#2861a9] text-xs font-medium rounded-full">
                  Next Rank #{userRank?.currentRank ? userRank.currentRank - 1 : 6}
                </span>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#131313] font-medium">Progress to next rank</span>
                  <span className="text-[#6c727f]">
                    ${userRank?.currentAmount?.toLocaleString() || '0'} / ${userRank?.nextRankAmount?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="w-full bg-[#f8f8f8] rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#2861a9] h-2 rounded-full" 
                    style={{ width: `${userRank?.percentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-[#6c727f]">
                  ${((userRank?.nextRankAmount || 0) - (userRank?.currentAmount || 0)).toLocaleString()} more in sales needed
                </p>
              </div>
            </div>

            {/* Tier Cards */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tierData.map((tier: { name: string; range: string; commission: string; color: string; iconColor: string }) => (
                <div key={tier.name} className="bg-white rounded-lg overflow-hidden shadow-sm border border-[#f8f8f8]">
                  <div className={`h-2 ${tier.color}`}></div>
                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Medal className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#131313] mb-1">{tier.name}</h3>
                    <p className="text-sm font-medium text-[#131313] mb-2">{tier.range}</p>
                    <p className="text-xs text-[#6c727f]">{tier.commission}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="bg-white rounded-lg shadow-sm border border-[#f8f8f8] p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-[#131313]">Leaderboard</h2>
              
              {/* Time Filter Tabs */}
              <div className="flex gap-2 border-b border-[#f8f8f8]">
                <button 
                  onClick={() => setPeriod('all-time')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    period === 'all-time' 
                      ? 'text-[#2861a9] border-[#2861a9]' 
                      : 'text-[#6c727f] border-transparent hover:text-[#2861a9]'
                  }`}
                >
                  All-Time
                </button>
                <button 
                  onClick={() => setPeriod('this-month')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    period === 'this-month' 
                      ? 'text-[#2861a9] border-[#2861a9]' 
                      : 'text-[#6c727f] border-transparent hover:text-[#2861a9]'
                  }`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => setPeriod('last-month')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    period === 'last-month' 
                      ? 'text-[#2861a9] border-[#2861a9]' 
                      : 'text-[#6c727f] border-transparent hover:text-[#2861a9]'
                  }`}
                >
                  Last Month
                </button>
              </div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-[#6c727f]">Loading leaderboard...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : leaderboardList.length === 0 ? (
                <div className="text-center py-8 text-[#6c727f]">No leaderboard data available</div>
              ) : (
                leaderboardList.map((item: any) => {
                  const initials = item.name
                    ? item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'NA'
                  
                  return (
                    <div
                      key={item.rank}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#f8f8f8] transition-colors"
                    >
                      {/* Rank Badge */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getBadgeColor(item.badge)}`}
                      >
                        {item.badge ? (
                          <Medal className="w-6 h-6 text-white" />
                        ) : (
                          <span className="text-lg font-semibold text-[#2861a9]">{item.rank}</span>
                        )}
                      </div>

                      {/* Initials */}
                      <div className="w-10 h-10 bg-[#E8F0FE] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#2861a9]">{initials}</span>
                      </div>

                      {/* Name and Email */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#131313]">{item.name}</div>
                        <div className="text-sm text-[#6c727f] truncate">{item.email}</div>
                      </div>

                      {/* Level Badge */}
                      <div className="text-sm text-[#6c727f] flex-shrink-0">{item.level}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
