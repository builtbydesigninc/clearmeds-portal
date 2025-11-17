"use client"

import { useState, useEffect } from "react"
import { useSidebar } from "@/components/dashboard-sidebar-provider"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Network, Users, UserPlus, DollarSign, ChevronDown, ChevronRight, Search, Filter, Download, Mail, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { requireNonSuperAdmin } from "@/lib/auth"

interface Affiliate {
  id: string
  name: string
  initials: string
  earnings: number
  referrals: number
  level: number
  children?: Affiliate[]
}

function NetworkTreeNode({ affiliate, isRoot = false }: { affiliate: Affiliate; isRoot?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isRoot)
  const hasChildren = affiliate.children && affiliate.children.length > 0

  return (
    <div className="relative">
      <div className={`flex items-center gap-4 bg-white rounded-lg p-4 border border-[#e6e6e6] ${isRoot ? 'shadow-sm' : ''}`}>
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 w-6 h-6 text-[#6c727f] hover:text-[#131313] hover:bg-[#f8f8f8]"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}

        <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold shrink-0 ${
          isRoot ? 'bg-[#2861a9] text-white' : 'bg-[#cfdae9] text-[#2861a9]'
        }`}>
          {affiliate.initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#131313] truncate">{affiliate.name}</h3>
          <div className="flex items-center gap-4 text-sm text-[#6c727f] mt-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              ${affiliate.earnings.toLocaleString()}
            </span>
            {affiliate.referrals > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {affiliate.referrals} referral{affiliate.referrals !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
          isRoot ? 'bg-[#2861a9] text-white' : 'bg-[#f8f8f8] text-[#6c727f]'
        }`}>
          Level {affiliate.level}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-8 mt-4 space-y-4 border-l-2 border-[#e6e6e6] pl-8">
          {affiliate.children!.map((child) => (
            <NetworkTreeNode key={child.id} affiliate={child} />
          ))}
        </div>
      )}
    </div>
  )
}

// Helper component to render percent change badge
function PercentChangeBadge({ change }: { change?: string }) {
  if (!change) return null;
  
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      isPositive ? 'bg-green-50 text-green-600' :
      isNegative ? 'bg-red-50 text-red-600' :
      'bg-gray-50 text-gray-600'
    }`}>
      {change}
    </span>
  );
}

export default function NetworkPage() {
  const { isCollapsed } = useSidebar()
  const [networkData, setNetworkData] = useState<any>(null)
  const [directReferrals, setDirectReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      await requireNonSuperAdmin()
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchNetwork = async () => {
      setLoading(true)
      try {
        const data = await api.getNetworkFull()
        setNetworkData(data)
        setDirectReferrals(data.directReferrals || [])
      } catch (err: any) {
        setError(err.message || "Failed to load network data")
      } finally {
        setLoading(false)
      }
    }
    fetchNetwork()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const fetchFiltered = async () => {
        try {
          const referrals = await api.getDirectReferrals({ search: searchQuery })
          setDirectReferrals(referrals)
        } catch (err: any) {
          setError(err.message || "Failed to search referrals")
        }
      }
      fetchFiltered()
    } else if (networkData) {
      setDirectReferrals(networkData.directReferrals || [])
    }
  }, [searchQuery, networkData])

  if (loading) {
    return (
      <>
        <DashboardSidebar />
        <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="p-4 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2861a9] mx-auto mb-4"></div>
              <p className="text-[#6c727f]">Loading network...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <DashboardSidebar />
        <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="p-4 lg:p-8 flex items-center justify-center">
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
        </div>
      </>
    )
  }

  // Convert API data to component format
  const convertToAffiliate = (node: any): Affiliate => ({
    id: node.id,
    name: node.name,
    initials: node.initials,
    earnings: node.earnings,
    referrals: node.referrals,
    level: node.level,
    children: node.children ? node.children.map(convertToAffiliate) : undefined
  })

  const networkTree = networkData?.networkTree ? convertToAffiliate(networkData.networkTree) : null

  return (
    <>
      <DashboardSidebar />
      <div
        className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="p-4 lg:p-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Affiliates */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <Network className="w-5 h-5 text-[#2861a9]" />
                </div>
                <PercentChangeBadge change={networkData?.stats?.changes?.totalAffiliates} />
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Affiliates</p>
              <p className="text-3xl font-bold text-[#131313]">{networkData?.stats?.totalAffiliates || 0}</p>
            </div>

            {/* Direct Referrals */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#2861a9]" />
                </div>
                <PercentChangeBadge change={networkData?.stats?.changes?.directReferrals} />
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Direct Referrals</p>
              <p className="text-3xl font-bold text-[#131313]">{networkData?.stats?.directReferrals || 0}</p>
            </div>

            {/* Indirect Referrals */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#2861a9]" />
                </div>
                <PercentChangeBadge change={networkData?.stats?.changes?.indirectReferrals} />
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Indirect Referrals</p>
              <p className="text-3xl font-bold text-[#131313]">{networkData?.stats?.indirectReferrals || 0}</p>
            </div>

            {/* Network Sales */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#2861a9]" />
                </div>
                <PercentChangeBadge change={networkData?.stats?.changes?.networkSales} />
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Network Sales</p>
              <p className="text-3xl font-bold text-[#131313]">${networkData?.stats?.networkSales?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Network Tree */}
          {networkTree && (
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] mb-8">
              <h2 className="text-2xl font-bold text-[#131313] mb-6">Network Tree</h2>
              <NetworkTreeNode affiliate={networkTree} isRoot={true} />
            </div>
          )}

          {/* Direct Referral List */}
          <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-[#131313]">Direct Referral List</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c727f]" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#f8f8f8] border-[#e6e6e6]"
                  />
                </div>
                <Button variant="outline" className="border-[#e6e6e6] text-[#6c727f]">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e6e6e6]">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Affiliate</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Email</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Join Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Referrals</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Sales</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Your Commission</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[#131313]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {directReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 px-4 text-center text-[#6c727f]">No referrals found</td>
                    </tr>
                  ) : (
                    directReferrals.map((referral: any) => {
                      const initials = referral.name
                        ? referral.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                        : referral.initials || 'NA'
                      const joinDate = referral.join_date 
                        ? new Date(referral.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : referral.joinDate || 'N/A'
                      
                      return (
                        <tr key={referral.id || referral.ID} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#f8f8f8] rounded-full flex items-center justify-center text-sm font-semibold text-[#6c727f] shrink-0">
                                {initials}
                              </div>
                              <span className="text-[#131313] font-medium">{referral.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-[#6c727f]">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{referral.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-[#6c727f]">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{joinDate}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[#131313]">{referral.referrals || 0}</td>
                          <td className="py-4 px-4 text-[#131313] font-medium">
                            ${typeof referral.sales === 'number' ? referral.sales.toLocaleString() : (referral.sales || '0')}
                          </td>
                          <td className="py-4 px-4 text-[#3ba321] font-semibold">
                            ${typeof referral.commission === 'number' ? referral.commission.toLocaleString() : (referral.commission || '0')}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              (referral.status || 'active') === 'active' 
                                ? 'bg-green-50 text-green-600' 
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                              {referral.status || 'active'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

              {/* Multi-Level Commission Breakdown */}
          {networkData?.breakdown && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#131313] mb-6">Multi-Level Commission Breakdown</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Direct Referrals Card (Level 2) */}
                <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-[#2861a9]" />
                    </div>
                    <span className="text-sm text-[#6c727f]">Level 2</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#131313] mb-1">Direct Referrals</h3>
                  <p className="text-sm text-[#6c727f] mb-6">{networkData.stats?.directReferrals || 0} active affiliates</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">Commission Rate</span>
                      <span className="text-sm font-semibold text-[#2861a9]">{networkData.breakdown.level2?.commissionRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">Total Sales</span>
                      <span className="text-sm font-semibold text-[#2861a9]">${networkData.breakdown.level2?.totalSales?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">You Earned</span>
                      <span className="text-sm font-semibold text-[#3ba321]">${networkData.breakdown.level2?.earned?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-[#6c727f] mb-2">Referral sales in total</p>
                    <div className="h-32 bg-[#f8f8f8] rounded-lg flex items-center justify-center">
                      <span className="text-sm text-[#6c727f]">chart placeholder</span>
                    </div>
                  </div>
                </div>

                {/* Indirect Referrals Card (Level 3) */}
                <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#2861a9]" />
                    </div>
                    <span className="text-sm text-[#6c727f]">Level 3</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#131313] mb-1">Indirect Referrals</h3>
                  <p className="text-sm text-[#6c727f] mb-6">{networkData.stats?.indirectReferrals || 0} active affiliates</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">Commission Rate</span>
                      <span className="text-sm font-semibold text-[#2861a9]">{networkData.breakdown.level3?.commissionRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">Total Sales</span>
                      <span className="text-sm font-semibold text-[#2861a9]">${networkData.breakdown.level3?.totalSales?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">You Earned</span>
                      <span className="text-sm font-semibold text-[#3ba321]">${networkData.breakdown.level3?.earned?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-[#6c727f] mb-2">Referral sales in total</p>
                    <div className="h-32 bg-[#f8f8f8] rounded-lg flex items-center justify-center">
                      <span className="text-sm text-[#6c727f]">chart placeholder</span>
                    </div>
                  </div>
                </div>

                {/* Extended Network Card */}
                <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                      <Network className="w-5 h-5 text-[#2861a9]" />
                    </div>
                    <span className="text-sm text-[#6c727f]">All Levels</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#131313] mb-1">Extended Network</h3>
                  <p className="text-sm text-[#6c727f] mb-6">{networkData.stats?.totalAffiliates || 0} active affiliates</p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">Commission Rate</span>
                      <span className="text-sm font-semibold text-[#2861a9]">{networkData.breakdown.extended?.commissionRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">Total Sales</span>
                      <span className="text-sm font-semibold text-[#2861a9]">${networkData.breakdown.extended?.totalSales?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                      <span className="text-sm text-[#6c727f]">You Earned</span>
                      <span className="text-sm font-semibold text-[#3ba321]">${networkData.breakdown.extended?.earned?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-[#6c727f] mb-2">Referral sales in total</p>
                    <div className="h-32 bg-[#f8f8f8] rounded-lg flex items-center justify-center">
                      <span className="text-sm text-[#6c727f]">chart placeholder</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
