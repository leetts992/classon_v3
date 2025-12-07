"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerAuthAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CustomerLoginPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await customerAuthAPI.login(subdomain, {
        email,
        password,
      });

      // Store customer token
      localStorage.setItem("customer_token", response.access_token);
      localStorage.setItem("customer_subdomain", subdomain);

      // Redirect to store home
      router.push("/");
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Logo/Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">RapidClass</h1>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
          {/* Kakao Login Button */}
          <button
            type="button"
            className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black font-medium py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
            onClick={() => alert("카카오 로그인은 준비 중입니다")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.477 0 0 3.58 0 8c0 2.86 1.889 5.37 4.716 6.767-.196.72-.729 2.697-.835 3.116-.127.502.184.496.388.36.17-.113 2.716-1.818 3.745-2.51.635.088 1.289.134 1.986.134 5.523 0 10-3.58 10-8s-4.477-8-10-8z" fill="#000"/>
            </svg>
            카카오로 시작하기
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">이메일로 로그인</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-normal">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="이메일을 입력해 주세요"
                className="mt-1 bg-gray-50 border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-normal">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="비밀번호를 입력해 주세요"
                className="mt-1 bg-gray-50 border-gray-300"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#FF8547] hover:bg-[#FF7035] text-white py-6 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="flex items-center justify-center gap-3 text-sm">
            <Link href="/signup" className="text-[#FF8547] hover:underline font-medium">
              회원가입
            </Link>
            <span className="text-gray-300">|</span>
            <button className="text-gray-600 hover:underline">
              아이디 찾기
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-gray-600 hover:underline">
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
