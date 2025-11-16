import { ShoppingCart, DollarSign, TrendingUp, Building2 } from 'lucide-react'

export function StatsGrid() {
  const stats = [
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: "367",
      change: "+64%",
      positive: true,
    },
    {
      icon: DollarSign,
      label: "Total Sales",
      value: "$73,321",
      change: "-14%",
      positive: false,
    },
    {
      icon: TrendingUp,
      label: "Commissions Earned",
      value: "$16,712",
      change: "+33%",
      positive: true,
    },
    {
      icon: Building2,
      label: "Clinics Onboarded",
      value: "64",
      change: "-16%",
      positive: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white rounded-lg p-6 shadow-sm border-2 border-[#2861a9]"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-[#cfdae9] rounded flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-[#2861a9]" />
            </div>
            <span className={`text-sm font-semibold ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </span>
          </div>
          
          <p className="text-sm text-[#6c727f] mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-[#131313]">{stat.value}</p>
          
          {/* Chart Placeholder */}
          <div className="mt-4 h-12 flex items-end gap-1">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="flex-1 bg-[#e6e6e6] rounded-sm"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
