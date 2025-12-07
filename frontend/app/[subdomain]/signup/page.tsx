"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerAuthAPI, publicStoreAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";

export default function CustomerSignupPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("");

  // 약관 동의
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  useEffect(() => {
    // Fetch store info to get store name
    const fetchStoreInfo = async () => {
      try {
        const storeInfo = await publicStoreAPI.getStoreInfo(subdomain);
        setStoreName(storeInfo.store_name || storeInfo.full_name || "");
      } catch (err) {
        console.error("Failed to fetch store info:", err);
      }
    };

    if (subdomain) {
      fetchStoreInfo();
    }
  }, [subdomain]);

  // 전체 동의 처리
  useEffect(() => {
    if (agreeAge && agreeTerms && agreePrivacy && agreeMarketing) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreeAge, agreeTerms, agreePrivacy, agreeMarketing]);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeAge(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  const handleSendVerificationCode = async () => {
    if (!phone) {
      setError("휴대폰 번호를 입력해주세요.");
      return;
    }
    // TODO: 실제 인증번호 발송 API 연동
    setIsCodeSent(true);
    alert("인증번호가 발송되었습니다.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // 필수 약관 동의 확인
    if (!agreeAge) {
      setError("만 14세 이상만 가입할 수 있습니다.");
      setIsLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("서비스 이용약관에 동의해주세요.");
      setIsLoading(false);
      return;
    }

    if (!agreePrivacy) {
      setError("개인정보처리방침에 동의해주세요.");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("비밀번호는 영문·숫자·특수문자 혼합 8~20자이어야 합니다.");
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
      router.push("/");
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold mx-auto pr-10">회원가입</h1>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-6 max-w-md mx-auto w-full">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 휴대폰 번호 */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            휴대폰 번호
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="- 없이 숫자만 입력해 주세요"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleSendVerificationCode}
              className="whitespace-nowrap px-4"
            >
              인증번호 전송
            </Button>
          </div>
        </div>

        {/* 인증번호 확인 */}
        {isCodeSent && (
          <div>
            <Label htmlFor="verificationCode" className="text-sm font-medium text-gray-700">
              인증번호 확인
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="숫자만 입력해 주세요"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="whitespace-nowrap px-4"
              >
                인증번호 확인
              </Button>
            </div>
          </div>
        )}

        {/* 이메일 */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일 *
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="이메일을 입력해 주세요"
            className="mt-1"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호 *
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="영문 · 숫자 · 특수문자 혼합 8~20자"
            className="mt-1"
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <Label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">
            비밀번호 확인 *
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            placeholder="영문 · 숫자 · 특수문자 혼합 8~20자"
            className="mt-1"
          />
        </div>

        {/* 이름 */}
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            이름 *
          </Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="한글로 공백 없이 입력해 주세요"
            className="mt-1"
          />
        </div>

        {/* 약관 동의 */}
        <div className="pt-4">
          <h3 className="text-base font-semibold mb-4">약관동의가 필요해요</h3>

          {/* 전체동의 */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-3">
            <Checkbox
              id="agreeAll"
              checked={agreeAll}
              onCheckedChange={handleAgreeAll}
              className="w-5 h-5"
            />
            <label
              htmlFor="agreeAll"
              className="text-base font-semibold flex-1 cursor-pointer"
            >
              전체동의
            </label>
          </div>

          {/* 개별 약관 */}
          <div className="space-y-3">
            {/* 만 14세 이상 */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="agreeAge"
                checked={agreeAge}
                onCheckedChange={(checked) => setAgreeAge(checked as boolean)}
                className="w-5 h-5"
              />
              <label htmlFor="agreeAge" className="flex-1 cursor-pointer">
                만 14세 이상입니다 <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 서비스 이용약관 */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="agreeTerms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="w-5 h-5"
              />
              <label htmlFor="agreeTerms" className="flex-1 cursor-pointer">
                서비스 이용약관 <span className="text-red-500">*</span>
              </label>
              <Link href="/info/terms" target="_blank" className="text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 개인정보처리방침 */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="agreePrivacy"
                checked={agreePrivacy}
                onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
                className="w-5 h-5"
              />
              <label htmlFor="agreePrivacy" className="flex-1 cursor-pointer">
                개인정보처리방침 <span className="text-red-500">*</span>
              </label>
              <Link href="/info/privacy" target="_blank" className="text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* 마케팅 수신 동의 */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="agreeMarketing"
                checked={agreeMarketing}
                onCheckedChange={(checked) => setAgreeMarketing(checked as boolean)}
                className="w-5 h-5"
              />
              <label htmlFor="agreeMarketing" className="flex-1 cursor-pointer">
                마케팅 수신 동의
              </label>
              <Link href="/info/marketing" target="_blank" className="text-gray-400">
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 확인 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              가입 중...
            </>
          ) : (
            "확인"
          )}
        </Button>
      </form>
    </div>
  );
}
