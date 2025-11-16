'use client'

import { useState } from 'react'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Shield, CreditCard, Bell, FileText, Puzzle } from 'lucide-react'

export default function SettingsPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [activeTab, setActiveTab] = useState('profile')

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
              {activeTab === 'profile' && <ProfileSection />}
              {activeTab === 'security' && <SecuritySection />}
              {activeTab === 'payment' && <PaymentSection />}
              {activeTab === 'notifications' && <NotificationsSection />}
              {activeTab === 'tax' && <TaxSection />}
              {activeTab === 'integrations' && <IntegrationsSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Profile Information</h2>
      
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-[#f8f8f8] flex items-center justify-center text-2xl font-semibold text-[#6c727f]">
          CM
        </div>
        <div>
          <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
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
            placeholder="Enter your full name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-[#131313] mb-2">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-[#131313] mb-2">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="affiliateId" className="text-[#131313] mb-2">Affiliate ID</Label>
          <Input
            id="affiliateId"
            placeholder="Your affiliate ID"
            className="bg-[#f8f8f8] border-none"
            disabled
          />
        </div>

        <div>
          <Label htmlFor="bio" className="text-[#131313] mb-2">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself"
            rows={4}
            className="bg-[#f8f8f8] border-none resize-none"
          />
        </div>

        <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8">
          Save Changes
        </Button>
      </div>
    </div>
  )
}

function SecuritySection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Security Settings</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="currentPassword" className="text-[#131313] mb-2">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            placeholder="Enter current password"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="newPassword" className="text-[#131313] mb-2">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter new password"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-[#131313] mb-2">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
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

        <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8">
          Update Password
        </Button>
      </div>
    </div>
  )
}

function PaymentSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Payment Settings</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="bankName" className="text-[#131313] mb-2">Bank Name</Label>
          <Input
            id="bankName"
            placeholder="Enter bank name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="accountNumber" className="text-[#131313] mb-2">Account Number</Label>
          <Input
            id="accountNumber"
            placeholder="Enter account number"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="routingNumber" className="text-[#131313] mb-2">Routing Number</Label>
          <Input
            id="routingNumber"
            placeholder="Enter routing number"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="accountHolder" className="text-[#131313] mb-2">Account Holder Name</Label>
          <Input
            id="accountHolder"
            placeholder="Enter account holder name"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8">
          Save Payment Info
        </Button>
      </div>
    </div>
  )
}

function NotificationsSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Notification Preferences</h2>
      
      <div className="space-y-4">
        {[
          { label: 'Email Notifications', description: 'Receive email updates about your account' },
          { label: 'New Referral Alerts', description: 'Get notified when someone joins your network' },
          { label: 'Payment Notifications', description: 'Receive alerts about commission payments' },
          { label: 'Marketing Updates', description: 'Stay informed about new marketing materials' },
          { label: 'Monthly Reports', description: 'Receive monthly performance summaries' },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-[#f8f8f8] rounded-lg">
            <div>
              <p className="font-medium text-[#131313]">{item.label}</p>
              <p className="text-sm text-[#6c727f]">{item.description}</p>
            </div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
    </div>
  )
}

function TaxSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Tax Information</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="taxId" className="text-[#131313] mb-2">Tax ID / EIN</Label>
          <Input
            id="taxId"
            placeholder="Enter your tax ID or EIN"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="businessName" className="text-[#131313] mb-2">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Enter business name (if applicable)"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div>
          <Label htmlFor="taxAddress" className="text-[#131313] mb-2">Tax Address</Label>
          <Input
            id="taxAddress"
            placeholder="Enter tax address"
            className="bg-[#f8f8f8] border-none"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-[#131313]">
            <strong>Note:</strong> Tax forms will be sent to your registered email address at the end of the fiscal year.
          </p>
        </div>

        <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white px-8">
          Save Tax Info
        </Button>
      </div>
    </div>
  )
}

function IntegrationsSection() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#131313] mb-8">Integrations</h2>
      
      <div className="space-y-4">
        {[
          { name: 'Mailchimp', description: 'Sync your contacts with Mailchimp', connected: true },
          { name: 'Google Analytics', description: 'Track your affiliate performance', connected: false },
          { name: 'Zapier', description: 'Automate your workflow', connected: true },
          { name: 'Slack', description: 'Get notifications in Slack', connected: false },
        ].map((integration, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-[#f8f8f8] rounded-lg">
            <div>
              <p className="font-medium text-[#131313]">{integration.name}</p>
              <p className="text-sm text-[#6c727f]">{integration.description}</p>
            </div>
            <Button
              variant={integration.connected ? 'outline' : 'default'}
              className={integration.connected ? '' : 'bg-[#2861a9] hover:bg-[#1e4a7f] text-white'}
            >
              {integration.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
