"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { customerAuthAPI, publicStoreAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ChevronRight, ChevronLeft, X } from "lucide-react";

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

  // 모달 상태
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);

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
      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4 max-w-sm mx-auto w-full">
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
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
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
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
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
              <button
                type="button"
                onClick={() => setShowMarketingModal(true)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
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

      {/* 서비스 이용약관 모달 */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 border-b z-10">
            <div className="flex items-center">
              <button
                onClick={() => setShowTermsModal(false)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <DialogTitle className="text-xl">서비스 이용약관</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-6 text-sm text-gray-700">
            <TermsContent />
          </div>
        </DialogContent>
      </Dialog>

      {/* 개인정보처리방침 모달 */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 border-b z-10">
            <div className="flex items-center">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <DialogTitle className="text-xl">개인정보처리방침</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-6 text-sm text-gray-700">
            <PrivacyContent />
          </div>
        </DialogContent>
      </Dialog>

      {/* 마케팅 수신 동의 모달 */}
      <Dialog open={showMarketingModal} onOpenChange={setShowMarketingModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white pb-4 border-b z-10">
            <div className="flex items-center">
              <button
                onClick={() => setShowMarketingModal(false)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <DialogTitle className="text-xl">마케팅 수신 동의</DialogTitle>
            </div>
          </DialogHeader>
          <div className="py-4 space-y-6 text-sm text-gray-700">
            <MarketingContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 서비스 이용약관 컨텐츠 컴포넌트
function TermsContent() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-2">제1조 목적</h3>
        <p>본 이용약관은 "클래스온"(이하 "사이트")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.</p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제2조 용어의 정의</h3>
        <p className="mb-2">본 약관에서 사용되는 주요한 용어의 정의는 다음과 같습니다.</p>
        <p className="mb-2">본 이용약관은 "클래스온"(이하 "사이트")의 서비스의 이용조건과 운영에 관한 제반 사항 규정을 목적으로 합니다.</p>
        <div className="ml-4 space-y-1">
          <p>① 회원 : 사이트의 약관에 동의하고 개인정보를 제공하여 회원등록을 한 자로서, 사이트와의 이용계약을 체결하고 사이트를 이용하는 이용자를 말합니다.</p>
          <p>② 이용계약 : 사이트 이용과 관련하여 사이트와 회원간에 체결 하는 계약을 말합니다.</p>
          <p>③ 회원 아이디(이하 "ID") : 회원의 식별과 회원의 서비스 이용을 위하여 회원별로 부여하는 고유한 문자와 숫자의 조합을 말합니다.</p>
          <p>④ 비밀번호 : 회원이 부여받은 ID와 일치된 회원임을 확인하고 회원의 권익 보호를 위하여 회원이 선정한 문자와 숫자의 조합을 말합니다.</p>
          <p>⑤ 운영자 : 서비스에 홈페이지를 개설하여 운영하는 운영자를 말합니다.</p>
          <p>⑥ 해지 : 회원이 이용계약을 해약하는 것을 말합니다.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제3조 약관 외 준칙</h3>
        <p>운영자는 필요한 경우 별도로 운영정책을 공지 안내할 수 있으며, 본 약관과 운영정책이 중첩될 경우 운영정책이 우선 적용됩니다.</p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제4조 이용계약 체결</h3>
        <p className="mb-1">① 이용계약은 회원으로 등록하여 사이트를 이용하려는 자의 본 약관 내용에 대한 동의와 가입신청에 대하여 운영자의 이용승낙으로 성립합니다.</p>
        <p>② 회원으로 등록하여 서비스를 이용하려는 자는 사이트 가입신청 시 본 약관을 읽고 아래에 있는 "동의합니다"를 선택하는 것으로 본 약관에 대한 동의 의사 표시를 합니다.</p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제5조 서비스 이용 신청</h3>
        <p className="mb-1">① 회원으로 등록하여 사이트를 이용하려는 이용자는 사이트에서 요청하는 제반정보(이용자ID,비밀번호, 닉네임 등)를 제공해야 합니다.</p>
        <p>② 타인의 정보를 도용하거나 허위의 정보를 등록하는 등 본인의 진정한 정보를 등록하지 않은 회원은 사이트 이용과 관련하여 아무런 권리를 주장할 수 없으며, 관계 법령에 따라 처벌받을 수 있습니다.</p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제6조 개인정보처리방침</h3>
        <p className="mb-1">사이트 및 운영자는 회원가입 시 제공한 개인정보 중 비밀번호를 가지고 있지 않으며 이와 관련된 부분은 사이트의 개인정보처리방침을 따릅니다.운영자는 관계 법령이 정하는 바에 따라 회원등록정보를 포함한 회원의 개인정보를 보호하기 위하여 노력합니다.</p>
        <p className="mb-1">회원의 개인정보보호에 관하여 관계법령 및 사이트가 정하는 개인정보처리방침에 정한 바에 따릅니다.</p>
        <p>단, 회원의 귀책 사유로 인해 노출된 정보에 대해 운영자는 일체의 책임을 지지 않습니다.운영자는 회원이 미풍양속에 저해되거나 국가안보에 위배되는 게시물 등 위법한 게시물을 등록 · 배포할 경우 관련 기관의 요청이 있을 시 회원의 자료를 열람 및 해당 자료를 관련 기관에 제출할 수 있습니다.</p>
      </section>

      <p className="text-xs text-gray-500 pt-4">... 이하 약관 전문은 별도 페이지에서 확인하실 수 있습니다.</p>
    </>
  );
}

// 개인정보처리방침 컨텐츠 컴포넌트
function PrivacyContent() {
  return (
    <>
      <section>
        <p className="mb-4">
          클래스온(이하 '회사'라 한다)은 개인정보 보호법 제30조에 따라 정보 주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리지침을 수립, 공개합니다.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제1조 (개인정보의 처리목적)</h3>
        <p className="mb-2">
          회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
        </p>
        <div className="ml-4 space-y-2">
          <div>
            <p className="font-medium">1. 홈페이지 회원 가입 및 관리</p>
            <p className="ml-4">회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별․인증, 회원자격 유지․관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정 이용 방지, 만 14세 미만 아동의 개인정보처리 시 법정대리인의 동의 여부 확인, 각종 고지․통지, 고충 처리 등을 목적으로 개인정보를 처리합니다.</p>
          </div>
          <div>
            <p className="font-medium">2. 재화 또는 서비스 제공</p>
            <p className="ml-4">물품 배송, 서비스 제공, 계약서 및 청구서 발송, 콘텐츠 제공, 맞춤서비스 제공, 본인인증, 연령인증, 요금 결제 및 정산, 채권추심 등을 목적으로 개인정보를 처리합니다.</p>
          </div>
          <div>
            <p className="font-medium">3. 고충 처리</p>
            <p className="ml-4">민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락․통지, 처리 결과 통보 등의 목적으로 개인정보를 처리합니다.</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-2">제2조 (개인정보의 처리 및 보유기간)</h3>
        <p className="mb-2">① 회사는 법령에 따른 개인정보 보유, 이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유, 이용 기간 내에서 개인정보를 처리, 보유합니다.</p>
        <p className="mb-2">② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
        <div className="ml-4 space-y-2">
          <p className="font-medium">홈페이지 회원 가입 및 관리 : 사업자/단체 홈페이지 탈퇴 시까지</p>
          <p className="ml-4">다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지</p>
          <p className="ml-8">1. 관계 법령 위반에 따른 수사, 조사 등이 진행 중인 경우에는 해당 수사, 조사 종료 시까지</p>
          <p className="ml-8">2. 홈페이지 이용에 따른 채권 및 채무관계 잔존 시에는 해당 채권, 채무 관계 정산 시까지</p>
        </div>
      </section>

      <p className="text-xs text-gray-500 pt-4">... 이하 방침 전문은 별도 페이지에서 확인하실 수 있습니다.</p>
    </>
  );
}

// 마케팅 수신 동의 컨텐츠 컴포넌트
function MarketingContent() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-base mb-3">목적</h3>
        <p>
          클래스온이 제공하는 이용자 맞춤형 서비스 및 상품 추천, 각종 경품 행사, 이벤트 등의 광고성 정보를 전자우편이나 서신우편, 문자(SMS 또는 카카오 알림톡), 푸시, 전화 등을 통해 이용자에게 제공합니다.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">항목</h3>
        <p>이름, 이메일주소, 휴대전화번호, 마케팅 수신 동의 여부</p>
      </section>

      <section>
        <h3 className="font-semibold text-base mb-3">보유 기간</h3>
        <p className="mb-3">회원 탈퇴 후 30일 또는 동의 철회 시까지</p>
        <p className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
          마케팅 수신 동의는 거부하실 수 있으며 동의 이후에라도 고객의 의사에 따라 동의를 철회할 수 있습니다. 동의를 거부하시더라도 클래스온이 제공하는 서비스의 이용에 제한이 되지 않습니다. 단, 할인, 이벤트 및 이용자 맞춤형 상품 추천 등의 마케팅 정보 안내 서비스가 제한됩니다.
        </p>
      </section>
    </>
  );
}
