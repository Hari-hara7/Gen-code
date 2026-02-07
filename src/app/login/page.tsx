"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo area */}
      <div className="flex justify-center pt-6 pb-4">
        <Link href="/" className="text-3xl font-bold tracking-tight text-[#0F1111]">
          <span className="text-[#FF9900]">a</span>mazon
          <span className="text-[#FF9900] text-sm">.clone</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-[350px]">
          <div className="border border-[#DDD] rounded-lg p-6 bg-white shadow-sm">
            <h1 className="text-[28px] font-normal text-[#0F1111] mb-5">Sign in</h1>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-[#FFF5F5] border border-[#CC0C39] rounded-md">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-[#CC0C39] shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-[#CC0C39]">There was a problem</p>
                    <p className="text-xs text-[#CC0C39]">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full h-[31px] border-[#a6a6a6] rounded-[3px] shadow-inner text-sm focus-visible:ring-[#E77600] focus-visible:ring-1 focus-visible:border-[#E77600] placeholder:text-[#AAA]"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-[#0F1111]"
                  >
                    Password
                  </label>
                  <span className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full h-[31px] border-[#a6a6a6] rounded-[3px] shadow-inner text-sm focus-visible:ring-[#E77600] focus-visible:ring-1 focus-visible:border-[#E77600] placeholder:text-[#AAA]"
                />
              </div>

              {/* Sign in button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[31px] bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-sm font-normal rounded-lg border border-[#FCD200] shadow-none disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Terms notice */}
            <p className="text-xs text-[#565959] mt-4 leading-relaxed">
              By continuing, you agree to Amazon.clone&apos;s{" "}
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                Conditions of Use
              </span>{" "}
              and{" "}
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                Privacy Notice
              </span>
              .
            </p>

            {/* Demo credentials hint */}
            <div className="mt-5 p-3 bg-[#F7FAFA] border border-[#D5D9D9] rounded-md">
              <p className="text-xs font-bold text-[#0F1111] mb-1">🧪 Demo Credentials</p>
              <p className="text-xs text-[#565959]">
                Email: <span className="font-medium text-[#0F1111]">test@example.com</span>
              </p>
              <p className="text-xs text-[#565959]">
                Password: <span className="font-medium text-[#0F1111]">password123</span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E7E7E7]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-[#767676]">New to Amazon.clone?</span>
            </div>
          </div>

          {/* Create account button */}
          <Link href="/signup">
            <Button
              variant="outline"
              className="w-full h-[31px] bg-[#E7E9EC] hover:bg-[#D5D9D9] text-[#0F1111] text-sm font-normal rounded-lg border border-[#ADB1B8] shadow-sm"
            >
              Create your Amazon.clone account
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <div className="border-t border-[#E7E7E7] mt-8">
          <div className="bg-gradient-to-b from-[#F7F7F7] to-white py-6">
            <div className="flex justify-center gap-4 text-xs text-[#007185]">
              <span className="hover:text-[#C7511F] hover:underline cursor-pointer">
                Conditions of Use
              </span>
              <span className="hover:text-[#C7511F] hover:underline cursor-pointer">
                Privacy Notice
              </span>
              <span className="hover:text-[#C7511F] hover:underline cursor-pointer">
                Help
              </span>
            </div>
            <p className="text-center text-xs text-[#565959] mt-2">
              &copy; 2024 Amazon.clone — Hackathon Demo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
