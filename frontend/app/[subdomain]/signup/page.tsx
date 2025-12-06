"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerAuthAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CustomerSignupPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setIsLoading(false);
      return;
    }

    try {
      await customerAuthAPI.signup(subdomain, {
        email,
        password,
        full_name: fullName,
        phone: phone || undefined,
      });

      // Auto login after signup
      const loginResponse = await customerAuthAPI.login(subdomain, {
        email,
        password,
      });

      // Store customer token
      localStorage.setItem("customer_token", loginResponse.access_token);
      localStorage.setItem("customer_subdomain", subdomain);

      // Redirect to store home
      router.push(`/${subdomain}`);
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">회원가입</h2>
          <p className="mt-2 text-gray-600">
            새 계정을 만드세요
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
              <Label htmlFor="fullName">이름 *</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="홍길동"
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="email">이메일 *</Label>
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
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="최소 6자 이상"
                className="mt-1 bg-white"
              />
            </div>

            <div>
              <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                placeholder="비밀번호를 다시 입력하세요"
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
                가입 중...
              </>
            ) : (
              "회원가입"
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">이미 계정이 있으신가요? </span>
            <Link
              href={`/${subdomain}/login`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              로그인
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
