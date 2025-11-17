import { ShoppingCart, DollarSign, TrendingUp, Building2 } from 'lucide-react'

interface StatsGridProps {
  data?: {
    totalOrders: number;
    totalSales: number;
    commissionsEarned: number;
    clinicsOnboarded: number;
    changes: {
      orders: string;
      sales: string;
      commissions: string;
      clinics: string;
    };
  };
}

export function StatsGrid({ data }: StatsGridProps) {
  const stats = [
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: data?.totalOrders?.toString() || "367",
      change: data?.changes?.orders || "+64%",
      positive: (data?.changes?.orders || "+64%").startsWith('+'),
    },
    {
      icon: DollarSign,
      label: "Total Sales",
      value: `$${data?.totalSales?.toLocaleString() || "73,321"}`,
      change: data?.changes?.sales || "-14%",
      positive: (data?.changes?.sales || "-14%").startsWith('+'),
    },
    {
      icon: TrendingUp,
      label: "Commissions Earned",
      value: `$${data?.commissionsEarned?.toLocaleString() || "16,712"}`,
      change: data?.changes?.commissions || "+33%",
      positive: (data?.changes?.commissions || "+33%").startsWith('+'),
    },
    {
      icon: Building2,
      label: "Clinics Onboarded",
      value: data?.clinicsOnboarded?.toString() || "64",
      change: data?.changes?.clinics || "-16%",
      positive: (data?.changes?.clinics || "-16%").startsWith('+'),
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
