'use client'

import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { useSidebarCollapse } from '@/components/dashboard-sidebar-provider'
import { Button } from '@/components/ui/button'
import { Check, Loader2, FileText, Download, ChevronDown, MessageCircle, Mail, BookOpen } from 'lucide-react'
import { useState } from 'react'

const checklistItems = [
  { id: 1, text: 'Complete your profile', completed: true },
  { id: 2, text: 'Add payment method', completed: true },
  { id: 3, text: 'Generate your affiliate link', completed: true },
  { id: 4, text: 'Share your first referral', completed: false },
  { id: 5, text: 'Make your first sale', completed: false },
]

const tutorials = [
  {
    title: 'Getting Started: Your First Week as an Affiliate',
    description: 'Welcome to Our Premium Wellness Program',
    category: 'Sales'
  },
  {
    title: 'How to Use Marketing Tools Effectively',
    description: 'Welcome to Our Premium Wellness Program',
    category: 'Sales'
  },
  {
    title: 'Complete Affiliate Guide 2025',
    description: 'Welcome to Our Premium Wellness Program',
    category: 'Sales'
  },
]

const bestPractices = Array(6).fill('Sales Script')

const faqs = [
  'How do I receive my commission payments?',
  'How do I receive my commission payments?',
  'How do I receive my commission payments?',
  'How do I receive my commission payments?',
  'How do I receive my commission payments?',
  'How do I receive my commission payments?',
]

export default function GuidesPage() {
  const { isCollapsed } = useSidebarCollapse()
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const completedCount = checklistItems.filter(item => item.completed).length
  const totalCount = checklistItems.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <>
      <DashboardSidebar />
      <div className={`min-h-screen bg-[#f8f8f8] transition-all duration-300 lg:${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 lg:p-8">
          {/* Onboarding Checklist */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#131313]">Onboarding Checklist</h2>
              <span className="text-[#6c727f]">{completedCount}/{totalCount} Completed</span>
            </div>

            <div className="space-y-3 mb-6">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-4 rounded-lg ${
                    item.completed ? 'bg-[#e7f1e4]' : 'bg-[#f8f8f8]'
                  }`}
                >
                  {item.completed ? (
                    <Check className="w-5 h-5 text-[#3ba321]" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-[#6c727f]" />
                  )}
                  <span className={item.completed ? 'text-[#3ba321]' : 'text-[#131313]'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-[#2861a9] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Tutorials & Training */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-[#131313] mb-6">Tutorials & Training</h2>
            
            <div className="space-y-4">
              {tutorials.map((tutorial, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-[#f8f8f8] rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
                    <FileText className="w-6 h-6 text-[#2861a9]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#6c727f] mb-1">{tutorial.category}</p>
                    <h3 className="font-medium text-[#131313]">{tutorial.title}</h3>
                    <p className="text-sm text-[#6c727f]">{tutorial.description}</p>
                  </div>
                  <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Promotional Best Practices */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-[#131313] mb-6">Promotional Best Practices</h2>
              
              <div className="space-y-3">
                {bestPractices.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#f8f8f8] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#2861a9]" />
                      <span className="text-[#131313]">{item}</span>
                    </div>
                    <Button size="sm" className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Asked Questions */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-[#131313] mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-[#e5e7eb] rounded-lg">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#f8f8f8] transition-colors"
                    >
                      <span className="text-[#131313]">{faq}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#6c727f] transition-transform ${
                          openFaqIndex === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-4 pb-4 text-sm text-[#6c727f]">
                        Commission payments are processed on the 15th of each month for the previous month's sales. You can receive payments via bank transfer, PayPal, or other methods you've set up in the Payments section.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Need More Help? */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#131313] mb-6">Need More Help?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Live Chat */}
              <div className="flex flex-col items-center text-center p-6 bg-[#f8f8f8] rounded-lg">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg mb-4">
                  <MessageCircle className="w-6 h-6 text-[#2861a9]" />
                </div>
                <h3 className="font-semibold text-[#131313] mb-2">Live Chat</h3>
                <p className="text-sm text-[#6c727f] mb-4">Chat with our team</p>
                <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
                  Start Chat
                </Button>
              </div>

              {/* Email Support */}
              <div className="flex flex-col items-center text-center p-6 bg-[#f8f8f8] rounded-lg">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg mb-4">
                  <Mail className="w-6 h-6 text-[#2861a9]" />
                </div>
                <h3 className="font-semibold text-[#131313] mb-2">Email Support</h3>
                <p className="text-sm text-[#6c727f] mb-4">support@yoursite.com</p>
                <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
                  Send Email
                </Button>
              </div>

              {/* Knowledge Base */}
              <div className="flex flex-col items-center text-center p-6 bg-[#f8f8f8] rounded-lg">
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg mb-4">
                  <BookOpen className="w-6 h-6 text-[#2861a9]" />
                </div>
                <h3 className="font-semibold text-[#131313] mb-2">Knowledge Base</h3>
                <p className="text-sm text-[#6c727f] mb-4">Browse articles</p>
                <Button className="bg-[#2861a9] hover:bg-[#1e4a7f] text-white">
                  Visit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
