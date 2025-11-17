"use client"

import { useState, useEffect } from "react"
import { Copy, QrCode, Image, Video, FileText, Download, ExternalLink, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useSidebar } from "@/components/dashboard-sidebar-provider"
import { api } from "@/lib/api"
import { requireNonSuperAdmin } from "@/lib/auth"

const tabs = [
  { id: 'affiliate-links', label: 'Affiliate Links' },
  { id: 'media-assets', label: 'Media & Assets Library' },
  { id: 'promotional', label: 'Promotional Resources' },
  { id: 'integration', label: 'Marketing Integration' },
]

export default function MarketingToolsPage() {
  const { isCollapsed } = useSidebar()
  const [activeTab, setActiveTab] = useState('affiliate-links')
  const [productId, setProductId] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [defaultLink, setDefaultLink] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [marketingStats, setMarketingStats] = useState<any>(null)
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [integrations, setIntegrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      await requireNonSuperAdmin()
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [links, stats, media, res, integs] = await Promise.all([
          api.getMarketingLinks(),
          api.getMarketingStats(),
          api.getMarketingMedia(),
          api.getMarketingResources(),
          api.getMarketingIntegrations()
        ])
        setDefaultLink(links.defaultLink)
        setGeneratedLink(links.defaultLink)
        setMarketingStats(stats)
        setMediaItems(media)
        setResources(res)
        setIntegrations(integs)
      } catch (err: any) {
        console.error('Failed to load marketing data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleGenerateLink = async () => {
    try {
      const result = await api.generateMarketingLink({
        productId: productId || undefined,
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined
      })
      setGeneratedLink(result.link)
    } catch (err: any) {
      console.error('Failed to generate link:', err)
    }
  }

  useEffect(() => {
    if (productId || utmSource || utmMedium || utmCampaign) {
      handleGenerateLink()
    } else {
      setGeneratedLink(defaultLink)
    }
  }, [productId, utmSource, utmMedium, utmCampaign, defaultLink])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'image': return Image
      case 'video': return Video
      default: return FileText
    }
  }

  const handleIntegrationToggle = async (id: string, enabled: boolean) => {
    try {
      await api.updateMarketingIntegration(id, enabled)
      setIntegrations((prev) =>
        prev.map((int: any) => (int.id === id ? { ...int, enabled } : int))
      )
    } catch (err: any) {
      console.error('Failed to update integration:', err)
    }
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
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-[#e6e6e6]">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#2861a9] text-[#2861a9]'
                        : 'border-transparent text-[#6c727f] hover:text-[#131313] hover:border-[#e6e6e6]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {activeTab === 'affiliate-links' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-[#131313]">Affiliate Link Generator</h1>

                {/* Default Affiliate Link */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-sm font-medium text-[#6c727f] mb-3">Default Affiliate Link</h2>
                  <div className="flex gap-2">
                    <Input 
                      value={defaultLink} 
                      readOnly 
                      className="flex-1 bg-[#f8f8f8] border-[#e6e6e6]"
                    />
                    <Button 
                      onClick={() => copyToClipboard(defaultLink)}
                      className="bg-[#2861a9] hover:bg-[#2861a9]/90 text-white"
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#2861a9] text-[#2861a9] hover:bg-[#2861a9]/10"
                      size="icon"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* UTM Parameter Builder */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-[#131313] mb-4">UTM Parameter Builder</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productId" className="text-[#6c727f]">Product ID</Label>
                      <Input 
                        id="productId"
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="mt-1 bg-[#f8f8f8] border-[#e6e6e6]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="utmSource" className="text-[#6c727f]">UTM Source</Label>
                      <Input 
                        id="utmSource"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="mt-1 bg-[#f8f8f8] border-[#e6e6e6]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="utmMedium" className="text-[#6c727f]">UTM Medium</Label>
                      <Input 
                        id="utmMedium"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="mt-1 bg-[#f8f8f8] border-[#e6e6e6]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="utmCampaign" className="text-[#6c727f]">UTM Campaign</Label>
                      <Input 
                        id="utmCampaign"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        className="mt-1 bg-[#f8f8f8] border-[#e6e6e6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Generated Link */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-sm font-medium text-[#6c727f] mb-3">Generated Link</h2>
                  <div className="flex gap-2">
                    <Input 
                      value={generatedLink} 
                      readOnly 
                      className="flex-1 bg-[#f8f8f8] border-[#e6e6e6]"
                    />
                    <Button 
                      onClick={() => copyToClipboard(generatedLink)}
                      className="bg-[#2861a9] hover:bg-[#2861a9]/90 text-white"
                      size="icon"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#2861a9] text-[#2861a9] hover:bg-[#2861a9]/10"
                      size="icon"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Total Clicks */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#6c727f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-[#3ba321] text-sm font-medium">+33%</span>
                    </div>
                    <div>
                      <p className="text-[#6c727f] text-sm mb-1">Total Clicks</p>
                      <p className="text-3xl font-bold text-[#131313]">
                        {marketingStats?.totalClicks?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="mt-4 h-24 bg-[#f8f8f8] rounded flex items-center justify-center text-[#6c727f] text-sm">
                      chart placeholder
                    </div>
                  </div>

                  {/* Conversion Rate */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 bg-[#f8f8f8] rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#6c727f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-[#3ba321] text-sm font-medium">+33%</span>
                    </div>
                    <div>
                      <p className="text-[#6c727f] text-sm mb-1">Conversion Rate</p>
                      <p className="text-3xl font-bold text-[#131313]">
                        {marketingStats?.conversionRate?.toFixed(1) || '0'}%
                      </p>
                    </div>
                    <div className="mt-4 h-24 bg-[#f8f8f8] rounded flex items-center justify-center text-[#6c727f] text-sm">
                      chart placeholder
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media-assets' && (
              <div>
                <h1 className="text-2xl font-semibold text-[#131313] mb-6">Media Library</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mediaItems.map((item: any) => {
                    const Icon = getMediaIcon(item.type)
                    return (
                      <div 
                        key={item.id}
                        className="bg-white rounded-lg border border-[#e6e6e6] p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#f8f8f8] rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-[#2861a9]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-[#131313] mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-[#6c727f]">{item.category}</p>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-6 bg-[#2861a9] hover:bg-[#2861a9]/90 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'promotional' && (
              <div>
                <h1 className="text-2xl font-semibold text-[#131313] mb-6">Promotional Resources</h1>
                
                {/* Promotional Resources Sections */}
                <div className="space-y-6">
                  {resources.map((section: any) => {
                    const Icon = section.category === 'Email Templates' ? Mail : FileText
                    return (
                      <div 
                        key={section.category}
                        className="bg-white rounded-lg border border-[#e6e6e6] overflow-hidden"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr]">
                          {/* Category Sidebar */}
                          <div className="bg-[#f8f8f8] p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[#e6e6e6]">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3">
                              <Icon className="w-6 h-6 text-[#2861a9]" />
                            </div>
                            <p className="text-sm font-medium text-[#131313] text-center">
                              {section.category}
                            </p>
                          </div>

                          {/* Items List */}
                          <div className="divide-y divide-[#e6e6e6]">
                            {section.items?.map((item: any) => (
                              <div 
                                key={item.id}
                                className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#f8f8f8] transition-colors"
                              >
                                <div className="flex-1">
                                  <h3 className="text-base font-medium text-[#131313] mb-1">
                                    {item.title}
                                  </h3>
                                  <p className="text-sm text-[#6c727f]">
                                    {item.description}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#6c727f] hover:text-[#2861a9] hover:bg-[#2861a9]/10"
                                    onClick={() => copyToClipboard(item.title)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    className="bg-[#2861a9] hover:bg-[#2861a9]/90 text-white"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Open
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === 'integration' && (
              <div>
                <h1 className="text-2xl font-semibold text-[#131313] mb-6">Marketing Integration</h1>
                
                <div className="space-y-6">
                  {integrations.map((integration: any) => (
                    <div 
                      key={integration.id}
                      className="bg-white rounded-lg border border-[#e6e6e6] overflow-hidden"
                    >
                      {/* Integration Header */}
                      <div className="p-6 flex items-center justify-between border-b border-[#e6e6e6]">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-[#f8f8f8]">
                            <span className="text-lg font-semibold text-[#2861a9]">
                              {integration.name?.charAt(0) || 'I'}
                            </span>
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#131313]">
                              {integration.name}
                            </h2>
                            <p className="text-sm text-[#6c727f]">
                              Marketing integration
                            </p>
                          </div>
                        </div>
                        
                        <Switch 
                          checked={integration.enabled || false}
                          onCheckedChange={(checked) => handleIntegrationToggle(integration.id, checked)}
                          className="data-[state=checked]:bg-[#3ba321]"
                        />
                      </div>

                      {/* Metrics Grid - Show if enabled */}
                      {integration.enabled && (
                        <div className="p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                              { label: 'Clicks', value: '2,847', change: '+33%' },
                              { label: 'Conversions', value: '43', change: '+33%' },
                              { label: 'Cost', value: '$425', change: '+33%' },
                              { label: 'Revenue', value: '$12,890', change: '+33%' },
                            ].map((metric, index) => (
                              <div 
                                key={index}
                                className="bg-white border border-[#e6e6e6] rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-sm text-[#6c727f]">{metric.label}</p>
                                  <span className="text-xs font-medium text-[#3ba321] bg-[#e7f1e4] px-2 py-1 rounded">
                                    {metric.change}
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-[#131313] mb-3">
                                  {metric.value}
                                </p>
                                <div className="h-20 bg-[#f8f8f8] rounded flex items-center justify-center">
                                  <span className="text-xs text-[#6c727f]">chart placeholder</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
