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
      router.push(`/${subdomain}`);
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">로그인</h2>
          <p className="mt-2 text-gray-600">
            계정에 로그인하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1 bg-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
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

          <div className="text-center text-sm">
            <span className="text-gray-600">계정이 없으신가요? </span>
            <Link
              href={`/${subdomain}/signup`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              회원가입
            </Link>
          </div>

          <div className="text-center">
            <Link
              href={`/${subdomain}`}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              스토어로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
