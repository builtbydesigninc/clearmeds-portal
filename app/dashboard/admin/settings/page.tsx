'use client'

import { useState, useEffect } from 'react'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export default function AdminSettingsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    level1: 15,
    level2: 10,
    level3: 5,
    frequency: 'biweekly',
    minimumThreshold: 50,
    dayOfWeek: 'monday'
  })

  useEffect(() => {
    const checkAuth = async () => {
      setCheckingAuth(true)
      const user = await requireAdmin()
      setCheckingAuth(false)
      if (!user) {
        return
      }
      setIsAuthorized(true)
      fetchConfig()
    }
    checkAuth()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const data = await api.getAdminConfig()
      setConfig(data)
      if (data) {
        setFormData({
          level1: data.commissionRates?.level1 || 15,
          level2: data.commissionRates?.level2 || 10,
          level3: data.commissionRates?.level3 || 5,
          frequency: data.payoutSettings?.frequency || 'biweekly',
          minimumThreshold: data.payoutSettings?.minimumThreshold || 50,
          dayOfWeek: data.payoutSettings?.dayOfWeek || 'monday'
        })
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.updateAdminConfig({
        commissionRates: {
          level1: formData.level1,
          level2: formData.level2,
          level3: formData.level3,
        },
        payoutSettings: {
          frequency: formData.frequency,
          minimumThreshold: formData.minimumThreshold,
          dayOfWeek: formData.dayOfWeek,
        }
      })
      alert('Settings saved successfully!')
      fetchConfig()
    } catch (err: any) {
      setError(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc2626] mx-auto mb-4"></div>
          <p className="text-[#6c727f]">Checking authorization...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access Denied. Admin privileges required.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <DashboardSidebar />
        <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div className="p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc2626] mx-auto mb-4"></div>
              <p className="text-[#6c727f]">Loading settings...</p>
            </div>
          </div>
        </div>
      </>
    )
  }


  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#131313] mb-2">Admin Settings</h1>
            <p className="text-[#6c727f]">Configure commission rates and payout settings</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Commission Rates */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <h2 className="text-xl font-semibold text-[#131313] mb-6">Commission Rates</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="level1" className="text-[#131313] mb-2">Level 1 Commission Rate (%)</Label>
                  <Input
                    id="level1"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.level1}
                    onChange={(e) => setFormData({ ...formData, level1: parseFloat(e.target.value) || 0 })}
                    className="bg-[#f8f8f8] border-[#e6e6e6]"
                    required
                  />
                  <p className="text-sm text-[#6c727f] mt-1">Direct referral commission rate</p>
                </div>

                <div>
                  <Label htmlFor="level2" className="text-[#131313] mb-2">Level 2 Commission Rate (%)</Label>
                  <Input
                    id="level2"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.level2}
                    onChange={(e) => setFormData({ ...formData, level2: parseFloat(e.target.value) || 0 })}
                    className="bg-[#f8f8f8] border-[#e6e6e6]"
                    required
                  />
                  <p className="text-sm text-[#6c727f] mt-1">Second-level referral commission rate</p>
                </div>

                <div>
                  <Label htmlFor="level3" className="text-[#131313] mb-2">Level 3 Commission Rate (%)</Label>
                  <Input
                    id="level3"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.level3}
                    onChange={(e) => setFormData({ ...formData, level3: parseFloat(e.target.value) || 0 })}
                    className="bg-[#f8f8f8] border-[#e6e6e6]"
                    required
                  />
                  <p className="text-sm text-[#6c727f] mt-1">Third-level referral commission rate</p>
                </div>
              </div>
            </div>

            {/* Payout Settings */}
            <div className="bg-white rounded-lg p-6 border border-[#e6e6e6] shadow-sm">
              <h2 className="text-xl font-semibold text-[#131313] mb-6">Payout Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="frequency" className="text-[#131313] mb-2">Payout Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })} required>
                    <SelectTrigger id="frequency" className="bg-[#f8f8f8] border-[#e6e6e6]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minimumThreshold" className="text-[#131313] mb-2">Minimum Payout Threshold ($)</Label>
                  <Input
                    id="minimumThreshold"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumThreshold}
                    onChange={(e) => setFormData({ ...formData, minimumThreshold: parseFloat(e.target.value) || 0 })}
                    className="bg-[#f8f8f8] border-[#e6e6e6]"
                    required
                  />
                  <p className="text-sm text-[#6c727f] mt-1">Minimum amount required before payout is processed</p>
                </div>

                <div>
                  <Label htmlFor="dayOfWeek" className="text-[#131313] mb-2">Payout Day of Week</Label>
                  <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                    <SelectTrigger id="dayOfWeek" className="bg-[#f8f8f8] border-[#e6e6e6]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

