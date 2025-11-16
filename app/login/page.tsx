import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Section - Full width on mobile, left side on desktop */}
      <div className="w-full lg:w-1/2 bg-white">
        <LoginForm />
      </div>

      {/* Image Section - Hidden on mobile, right side on desktop */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nurse-smiling-31cXsqnfT0K77b48hkHUObSe618DK1.png"
          alt="Smiling healthcare professional in lab coat"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
