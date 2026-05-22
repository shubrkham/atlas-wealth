import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { clerkDarkAppearance } from "@/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B1020] px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#D4AF37]">
        Atlas Wealth
      </h1>
      <SignIn
        appearance={clerkDarkAppearance}
        routing="hash"
        signUpUrl="/register"
        forceRedirectUrl="/dashboard"
      />
      <p className="mt-8 text-sm text-[#A3ADC2]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-[#D4AF37] hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
