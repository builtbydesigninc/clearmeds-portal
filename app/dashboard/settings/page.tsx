'use client'

import { useState, useEffect } from 'react'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Shield, CreditCard, Bell, FileText, Puzzle } from 'lucide-react'
import { api } from '@/lib/api'
import { requireNonSuperAdmin } from '@/lib/auth'

export default function SettingsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [taxData, setTaxData] = useState<any>(null)
  const [notificationSettings, setNotificationSettings] = useState<any>(null)
  const [integrationSettings, setIntegrationSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      await requireNonSuperAdmin()
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      try {
        const [profile, payment, tax, notifications, integrations] = await Promise.all([
          api.getProfile(),
          api.getPaymentDetails(),
          api.getTaxInfo(),
          api.getNotificationSettings(),
          api.getIntegrationSettings()
        ])
        setProfileData(profile)
        setPaymentData(payment)
        setTaxData(tax)
        setNotificationSettings(notifications)
        setIntegrationSettings(integrations)
      } catch (err: any) {
        setError(err.message || "Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleProfileSave = async (data: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.updateProfile(data)
      setProfileData((prev: any) => ({ ...prev, ...data }))
    } catch (err: any) {
      setError(err.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (data: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.updatePassword(data)
    } catch (err: any) {
      setError(err.message || "Failed to update password")
    } finally {
      setSaving(false)
    }
  }

  const handlePaymentSave = async (data: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.updatePaymentDetails(data)
      setPaymentData((prev: any) => ({ ...prev, ...data }))
    } catch (err: any) {
      setError(err.message || "Failed to save payment details")
    } finally {
      setSaving(false)
    }
  }

  const handleTaxSave = async (data: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.updateTaxInfo(data)
      setTaxData((prev: any) => ({ ...prev, ...data }))
    } catch (err: any) {
      setError(err.message || "Failed to save tax information")
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationsSave = async (data: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.updateNotificationSettings(data)
      setNotificationSettings((prev: any) => ({ ...prev, ...data }))
    } catch (err: any) {
      setError(err.message || "Failed to save notification settings")
    } finally {
      setSaving(false)
    }
  }

  const handleIntegrationsSave = async (data: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.updateIntegrationSettings(data)
      setIntegrationSettings(data)
    } catch (err: any) {
      setError(err.message || "Failed to save integration settings")
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tax', label: 'Tax', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
  ]

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <DashboardSidebar />
      
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8">
          <div className="flex gap-6">
            {/* Settings Sidebar */}
            <div className="hidden lg:block w-64 bg-white rounded-lg p-4 h-fit">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#f8f8f8] text-[#2861a9]'
                          : 'text-[#6c727f] hover:bg-[#f8f8f8]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden w-full mb-6">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-lg p-6 lg:p-8">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2861a9] mx-auto mb-4"></div>
                  <p className="text-[#6c727f]">Loading settings...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : (
                <>
                  {activeTab === 'profile' && <ProfileSection data={profileData} onSave={handleProfileSave} saving={saving} />}
                  {activeTab === 'security' && <SecuritySection onSave={handlePasswordSave} saving={saving} />}
                  {activeTab === 'payment' && <PaymentSection data={paymentData} onSave={handlePaymentSave} saving={saving} />}
                  {activeTab === 'notifications' && <NotificationsSection data={notificationSettings} onSave={handleNotificationsSave} saving={saving} />}
                  {activeTab === 'tax' && <TaxSection data={taxData} onSave={handleTaxSave} saving={saving} />}
                  {activeTab === 'integrations' && <IntegrationsSection data={integrationSettings} onSave={handleIntegrationsSave} saving={saving} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ data, onSave, saving }: { data: any; onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState({
    name: data?.name || '',
    email: data?.email || '',
    phone: data?.phone || '',
    company: data?.company || '',
    bio: data?.bio || ''
  })

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        bio: data.bio || ''
      })
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const initials = formData.name
    ? formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CM'

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Profile Information</h2>
      
      <div className="flex items-start gap-6 mb-8">
        {data?.avatar ? (
          <img src={data.avatar} alt={formData.name} className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#f8f8f8] flex items-center justify-center text-2xl font-semibold text-[#6c727f]">
            {initials}
          </div>
        )}
        <div>
          <Button type="button" className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
            Upload Photo
          </Button>
          <p className="text-sm text-[#6c727f] mt-2">JPG, PNG or GIF. Max size 2MB.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="fullName" className="text-[#131313] mb-2">Full Name</Label>
          <Input
            id="fullName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-[#131313] mb-2">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-[#131313] mb-2">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter your phone number"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="company" className="text-[#131313] mb-2">Company</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Enter your company name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="affiliateId" className="text-[#131313] mb-2">Affiliate ID</Label>
          <Input
            id="affiliateId"
            value={data?.affiliateId || ''}
            placeholder="Your affiliate ID"
            className="bg-[#f8f8f8] border-none"
            disabled
          />
        </div>

        <div>
          <Label htmlFor="bio" className="text-[#131313] mb-2">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Tell us about yourself"
            rows={4}
            className="bg-[#f8f8f8] border-none resize-none"
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

function SecuritySection({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Security Settings</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="currentPassword" className="text-[#131313] mb-2">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            placeholder="Enter current password"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="newPassword" className="text-[#131313] mb-2">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="Enter new password"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-[#131313] mb-2">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-semibold text-[#131313] mb-4">Two-Factor Authentication</h3>
          <div className="flex items-center justify-between p-4 bg-[#f8f8f8] rounded-lg">
            <div>
              <p className="font-medium text-[#131313]">Enable 2FA</p>
              <p className="text-sm text-[#6c727f]">Add an extra layer of security to your account</p>
            </div>
            <Switch />
          </div>
        </div>

        <Button type="submit" disabled={saving} className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8 disabled:opacity-50">
          {saving ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </form>
  )
}

function PaymentSection({ data, onSave, saving }: { data: any; onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState({
    bankName: data?.bankName || '',
    accountNumber: data?.accountNumber || '',
    routingNumber: data?.routingNumber || '',
    accountHolder: data?.accountHolder || ''
  })

  useEffect(() => {
    if (data) {
      setFormData({
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        routingNumber: data.routingNumber || '',
        accountHolder: data.accountHolder || ''
      })
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Payment Settings</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="bankName" className="text-[#131313] mb-2">Bank Name</Label>
          <Input
            id="bankName"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="Enter bank name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="accountNumber" className="text-[#131313] mb-2">Account Number</Label>
          <Input
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="Enter account number"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="routingNumber" className="text-[#131313] mb-2">Routing Number</Label>
          <Input
            id="routingNumber"
            value={formData.routingNumber}
            onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
            placeholder="Enter routing number"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="accountHolder" className="text-[#131313] mb-2">Account Holder Name</Label>
          <Input
            id="accountHolder"
            value={formData.accountHolder}
            onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
            placeholder="Enter account holder name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <Button type="submit" disabled={saving} className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Payment Info'}
        </Button>
      </div>
    </form>
  )
}

function NotificationsSection({ data, onSave, saving }: { data: any; onSave: (data: any) => void; saving: boolean }) {
  const [settings, setSettings] = useState({
    emailNotifications: data?.emailNotifications ?? true,
    referralAlerts: data?.referralAlerts ?? true,
    paymentNotifications: data?.paymentNotifications ?? true,
    marketingUpdates: data?.marketingUpdates ?? true,
    monthlyReports: data?.monthlyReports ?? true
  })

  useEffect(() => {
    if (data) {
      setSettings({
        emailNotifications: data.emailNotifications ?? true,
        referralAlerts: data.referralAlerts ?? true,
        paymentNotifications: data.paymentNotifications ?? true,
        marketingUpdates: data.marketingUpdates ?? true,
        monthlyReports: data.monthlyReports ?? true
      })
    }
  }, [data])

  const handleToggle = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    onSave(newSettings)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Notification Preferences</h2>
      
      <div className="space-y-4">
        {[
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive email updates about your account' },
          { key: 'referralAlerts', label: 'New Referral Alerts', description: 'Get notified when someone joins your network' },
          { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Receive alerts about commission payments' },
          { key: 'marketingUpdates', label: 'Marketing Updates', description: 'Stay informed about new marketing materials' },
          { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly performance summaries' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-[#f8f8f8] rounded-lg">
            <div>
              <p className="font-medium text-[#131313]">{item.label}</p>
              <p className="text-sm text-[#6c727f]">{item.description}</p>
            </div>
            <Switch 
              checked={settings[item.key as keyof typeof settings] as boolean}
              onCheckedChange={(checked) => handleToggle(item.key, checked)}
              disabled={saving}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function TaxSection({ data, onSave, saving }: { data: any; onSave: (data: any) => void; saving: boolean }) {
  const [formData, setFormData] = useState({
    taxId: data?.taxId || '',
    taxIdType: data?.taxIdType || '',
    businessName: data?.businessName || '',
    taxAddress: data?.taxAddress || ''
  })

  useEffect(() => {
    if (data) {
      setFormData({
        taxId: data.taxId || '',
        taxIdType: data.taxIdType || '',
        businessName: data.businessName || '',
        taxAddress: data.taxAddress || ''
      })
    }
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Tax Information</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="taxId" className="text-[#131313] mb-2">Tax ID / EIN</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            placeholder="Enter your tax ID or EIN"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="businessName" className="text-[#131313] mb-2">Business Name</Label>
          <Input
            id="businessName"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="Enter business name (if applicable)"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="taxAddress" className="text-[#131313] mb-2">Tax Address</Label>
          <Input
            id="taxAddress"
            value={formData.taxAddress}
            onChange={(e) => setFormData({ ...formData, taxAddress: e.target.value })}
            placeholder="Enter tax address"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-[#131313]">
            <strong>Note:</strong> Tax forms will be sent to your registered email address at the end of the fiscal year.
          </p>
        </div>

        <Button type="submit" disabled={saving} className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Tax Info'}
        </Button>
      </div>
    </form>
  )
}

function IntegrationsSection({ data, onSave, saving }: { data: any; onSave: (data: any) => void; saving: boolean }) {
  const [integrations, setIntegrations] = useState(data || [
    { name: 'Mailchimp', description: 'Sync your contacts with Mailchimp', connected: false },
    { name: 'Google Analytics', description: 'Track your affiliate performance', connected: false },
    { name: 'Zapier', description: 'Automate your workflow', connected: false },
    { name: 'Slack', description: 'Get notifications in Slack', connected: false },
  ])

  useEffect(() => {
    if (data) {
      setIntegrations(data)
    }
  }, [data])

  const handleToggle = (index: number) => {
    const newIntegrations = [...integrations]
    newIntegrations[index].connected = !newIntegrations[index].connected
    setIntegrations(newIntegrations)
    onSave(newIntegrations)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Integrations</h2>
      
      <div className="space-y-4">
        {integrations.map((integration: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-4 bg-[#f8f8f8] rounded-lg">
            <div>
              <p className="font-medium text-[#131313]">{integration.name}</p>
              <p className="text-sm text-[#6c727f]">{integration.description}</p>
            </div>
            <Button
              type="button"
              variant={integration.connected ? 'outline' : 'default'}
              onClick={() => handleToggle(index)}
              disabled={saving}
              className={integration.connected ? '' : 'bg-[#2861a9] hover:bg-[#1e4a7f] text-white disabled:opacity-50'}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
