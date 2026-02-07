"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const signup = api.auth.signup.useMutation({
    onSuccess: async () => {
      // Auto sign in after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please log in manually.");
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    signup.mutate({ name, email, password });
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

      {/* Signup Card */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-[350px]">
          <div className="border border-[#DDD] rounded-lg p-6 bg-white shadow-sm">
            <h1 className="text-[28px] font-normal text-[#0F1111] mb-5">
              Create account
            </h1>

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
                    <p className="text-sm font-bold text-[#CC0C39]">
                      There was a problem
                    </p>
                    <p className="text-xs text-[#CC0C39]">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Your name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="First and last name"
                  className="w-full h-[31px] border-[#a6a6a6] rounded-[3px] shadow-inner text-sm focus-visible:ring-[#E77600] focus-visible:ring-1 focus-visible:border-[#E77600] placeholder:text-[#AAA]"
                />
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="w-full h-[31px] border-[#a6a6a6] rounded-[3px] shadow-inner text-sm focus-visible:ring-[#E77600] focus-visible:ring-1 focus-visible:border-[#E77600] placeholder:text-[#AAA]"
                />
                <p className="text-xs text-[#565959] mt-1 flex items-center gap-1">
                  <svg
                    className="w-3 h-3 text-[#2B2B2B]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords must be at least 6 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-[#0F1111] mb-1"
                >
                  Re-enter password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full h-[31px] border-[#a6a6a6] rounded-[3px] shadow-inner text-sm focus-visible:ring-[#E77600] focus-visible:ring-1 focus-visible:border-[#E77600] placeholder:text-[#AAA]"
                />
              </div>

              {/* Create account button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[31px] bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-sm font-normal rounded-lg border border-[#FCD200] shadow-none disabled:opacity-70"
              >
                {isLoading ? "Creating account..." : "Create your Amazon.clone account"}
              </Button>
            </form>

            {/* Terms notice */}
            <p className="text-xs text-[#565959] mt-4 leading-relaxed">
              By creating an account, you agree to Amazon.clone&apos;s{" "}
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                Conditions of Use
              </span>{" "}
              and{" "}
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                Privacy Notice
              </span>
              .
            </p>

            {/* Divider */}
            <div className="mt-6 pt-4 border-t border-[#E7E7E7]">
              <p className="text-sm text-[#0F1111]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#007185] hover:text-[#C7511F] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Business account link */}
          <div className="mt-5 text-center">
            <p className="text-sm text-[#565959]">
              Buying for work?{" "}
              <span className="text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer">
                Create a free business account
              </span>
            </p>
          </div>
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
