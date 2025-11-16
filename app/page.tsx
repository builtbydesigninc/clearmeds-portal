import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Section - Full width on mobile, left side on desktop */}
      <div className="w-full lg:w-1/2 bg-white">
        <SignupForm />
      </div>

      {/* Image Section - Hidden on mobile, right side on desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-rTIU8MBuN1iogGUGUmtjwSN0CLgxeH.png"
          alt="Smiling patient in healthcare consultation"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
