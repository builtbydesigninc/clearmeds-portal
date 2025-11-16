export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#2861a9]" />
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    </div>
  )
}
