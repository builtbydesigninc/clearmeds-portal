export default function NetworkLoading() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#e6e6e6] border-t-[#2861a9] rounded-full animate-spin" />
        <p className="text-[#6c727f] text-sm">Loading network...</p>
      </div>
    </div>
  )
}
