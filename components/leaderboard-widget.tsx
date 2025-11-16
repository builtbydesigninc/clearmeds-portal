import { Badge } from "@/components/ui/badge"

export function LeaderboardWidget() {
  const leaderboardData = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    name: "Live Harder LLC",
    sales: "$89,500 sales",
    email: "doug@liveharderhealth.com"
  }))

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#131313]">Leaderboard</h3>
        <Badge variant="secondary" className="bg-[#cfdae9] text-[#2861a9] hover:bg-[#cfdae9]">
          Your Rank: #7
        </Badge>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((entry) => (
          <div 
            key={entry.rank}
            className={`flex items-start gap-3 py-3 px-3 rounded-lg transition-colors ${
              entry.rank === 7 ? 'bg-[#cfdae9]/30' : 'hover:bg-[#f8f8f8]'
            }`}
          >
            <span className={`text-sm font-semibold ${
              entry.rank === 7 ? 'text-[#2861a9]' : 'text-[#6c727f]'
            }`}>
              {entry.rank.toString().padStart(2, '0')}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#131313] text-sm">{entry.name}</p>
              <p className="text-xs text-[#6c727f]">{entry.sales}</p>
            </div>
            <p className="text-xs text-[#6c727f] hidden sm:block truncate">{entry.email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
