"use client"

import { useState } from "react"
import { useSidebar } from "@/components/dashboard-sidebar-provider"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Network, Users, UserPlus, DollarSign, ChevronDown, ChevronRight, Search, Filter, Download, Mail, Calendar } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Affiliate {
  id: string
  name: string
  initials: string
  earnings: number
  referrals: number
  level: number
  children?: Affiliate[]
}

const networkData: Affiliate = {
  id: "1",
  name: "You (Dr. Sarah Johnson)",
  initials: "Y(SJ)",
  earnings: 45820,
  referrals: 5,
  level: 1,
  children: [
    { 
      id: "2", 
      name: "Dr. James Wilson", 
      initials: "DJW", 
      earnings: 18500, 
      referrals: 2, 
      level: 2, 
      children: [
        { id: "2-1", name: "Emma Roberts", initials: "ER", earnings: 8200, referrals: 0, level: 3 },
        { id: "2-2", name: "John Davis", initials: "JD", earnings: 6400, referrals: 1, level: 3, children: [] },
      ]
    },
    { 
      id: "3", 
      name: "Lisa Anderson", 
      initials: "LA", 
      earnings: 24300, 
      referrals: 1, 
      level: 2,
      children: [
        { id: "3-1", name: "Michael Chen", initials: "MC", earnings: 12100, referrals: 0, level: 3 },
      ]
    },
    { id: "4", name: "Mark Thompson", initials: "MT", earnings: 12800, referrals: 0, level: 2 },
    { 
      id: "5", 
      name: "Dr. Rachel Kim", 
      initials: "DRK", 
      earnings: 31200, 
      referrals: 3, 
      level: 2, 
      children: [
        { id: "5-1", name: "Sarah Miller", initials: "SM", earnings: 15600, referrals: 0, level: 3 },
        { id: "5-2", name: "Tom Wilson", initials: "TW", earnings: 9800, referrals: 0, level: 3 },
        { id: "5-3", name: "Anna Lee", initials: "AL", earnings: 11400, referrals: 0, level: 3 },
      ]
    },
    { id: "6", name: "David Martinez", initials: "DM", earnings: 5600, referrals: 0, level: 2 },
  ]
}

const directReferrals = [
  { id: "1", initials: "DJW", name: "Dr. James Wilson", email: "james.wilson@clinic.com", joinDate: "Aug 12, 2025", referrals: 2, sales: 18500, commission: 2775, status: "active" },
  { id: "2", initials: "LA", name: "Lisa Anderson", email: "lisa.a@wellness.com", joinDate: "Jul 20, 2025", referrals: 1, sales: 24300, commission: 3645, status: "active" },
  { id: "3", initials: "MT", name: "Mark Thompson", email: "mark.t@healthcenter.com", joinDate: "Sep 5, 2025", referrals: 0, sales: 12800, commission: 1920, status: "active" },
  { id: "4", initials: "DRK", name: "Dr. Rachel Kim", email: "rachel.kim@medicalgroup.com", joinDate: "Jun 18, 2025", referrals: 4, sales: 31200, commission: 4680, status: "active" },
  { id: "5", initials: "DM", name: "David Martinez", email: "david.m@vitality.com", joinDate: "Oct 1, 2025", referrals: 0, sales: 5600, commission: 840, status: "new" },
  { id: "6", initials: "ER", name: "Emily Roberts", email: "emily.r@healthplus.com", joinDate: "Sep 15, 2025", referrals: 3, sales: 19400, commission: 2910, status: "new" },
  { id: "7", initials: "MC", name: "Michael Chen", email: "m.chen@wellness360.com", joinDate: "Aug 28, 2025", referrals: 2, sales: 15700, commission: 2355, status: "new" },
  { id: "8", initials: "SP", name: "Sarah Parker", email: "sarah.p@vitalclinic.com", joinDate: "Jul 3, 2025", referrals: 3, sales: 28600, commission: 4290, status: "active" },
]

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

export default function NetworkPage() {
  const { isCollapsed } = useSidebar()

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
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded">
                  +33%
                </span>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Total Affiliates</p>
              <p className="text-3xl font-bold text-[#131313]">23</p>
            </div>

            {/* Direct Referrals */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-[#2861a9]" />
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded">
                  +33%
                </span>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Direct Referrals</p>
              <p className="text-3xl font-bold text-[#131313]">8</p>
            </div>

            {/* Indirect Referrals */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#2861a9]" />
                </div>
                <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded">
                  -24%
                </span>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Indirect Referrals</p>
              <p className="text-3xl font-bold text-[#131313]">15</p>
            </div>

            {/* Network Sales */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#2861a9]" />
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-medium rounded">
                  +33%
                </span>
              </div>
              <p className="text-sm text-[#6c727f] mb-1">Network Sales</p>
              <p className="text-3xl font-bold text-[#131313]">$156,340</p>
            </div>
          </div>

          {/* Network Tree */}
          <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] mb-8">
            <h2 className="text-2xl font-bold text-[#131313] mb-6">Network Tree</h2>
            <NetworkTreeNode affiliate={networkData} isRoot={true} />
          </div>

          {/* Direct Referral List */}
          <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-[#131313]">Direct Referral List</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 lg:flex-none lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c727f]" />
                  <Input
                    placeholder="Search"
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
                  {directReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-[#e6e6e6] hover:bg-[#f8f8f8]">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f8f8f8] rounded-full flex items-center justify-center text-sm font-semibold text-[#6c727f] shrink-0">
                            {referral.initials}
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
                          <span className="text-sm">{referral.joinDate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#131313]">{referral.referrals}</td>
                      <td className="py-4 px-4 text-[#131313] font-medium">
                        ${referral.sales.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-[#3ba321] font-semibold">
                        ${referral.commission.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          referral.status === 'active' 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-blue-50 text-blue-600'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Multi-Level Commission Breakdown */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#131313] mb-6">Multi-Level Commission Breakdown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Direct Referrals Card */}
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-[#2861a9]" />
                  </div>
                  <span className="text-sm text-[#6c727f]">Level 2</span>
                </div>
                
                <h3 className="text-xl font-bold text-[#131313] mb-1">Direct Referrals</h3>
                <p className="text-sm text-[#6c727f] mb-6">8 active affiliates</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">Commission Rate</span>
                    <span className="text-sm font-semibold text-[#2861a9]">15%</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">Total Sales</span>
                    <span className="text-sm font-semibold text-[#2861a9]">$156,340</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">You Earned</span>
                    <span className="text-sm font-semibold text-[#3ba321]">$23,451</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-[#6c727f] mb-2">Referral sales in total</p>
                  <div className="h-32 bg-[#f8f8f8] rounded-lg flex items-center justify-center">
                    <span className="text-sm text-[#6c727f]">chart placeholder</span>
                  </div>
                </div>
              </div>

              {/* Indirect Referrals Card */}
              <div className="bg-white rounded-lg p-6 border border-[#e6e6e6]">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#2861a9]" />
                  </div>
                  <span className="text-sm text-[#6c727f]">Level 2</span>
                </div>
                
                <h3 className="text-xl font-bold text-[#131313] mb-1">Indirect Referrals</h3>
                <p className="text-sm text-[#6c727f] mb-6">8 active affiliates</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">Commission Rate</span>
                    <span className="text-sm font-semibold text-[#2861a9]">15%</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">Total Sales</span>
                    <span className="text-sm font-semibold text-[#2861a9]">$156,340</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">You Earned</span>
                    <span className="text-sm font-semibold text-[#3ba321]">$23,451</span>
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
                  <span className="text-sm text-[#6c727f]">Level 2</span>
                </div>
                
                <h3 className="text-xl font-bold text-[#131313] mb-1">Extended Network</h3>
                <p className="text-sm text-[#6c727f] mb-6">8 active affiliates</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">Commission Rate</span>
                    <span className="text-sm font-semibold text-[#2861a9]">15%</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">Total Sales</span>
                    <span className="text-sm font-semibold text-[#2861a9]">$156,340</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#e6e6e6]">
                    <span className="text-sm text-[#6c727f]">You Earned</span>
                    <span className="text-sm font-semibold text-[#3ba321]">$23,451</span>
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
        </div>
      </div>
    </>
  )
}
