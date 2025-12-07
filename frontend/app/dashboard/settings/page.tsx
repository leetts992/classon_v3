"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Eye, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { instructorAPI } from "@/lib/api";

export default function SettingsPage() {
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "",
    subdomain: "",
    bio: "",
    email: "",
    fullName: "",
    profileImage: "",
    coverImage: "",
    notificationsEnabled: true,
    marketingEnabled: false,

    // Footer info
    footerCompanyName: "",
    footerCeoName: "",
    footerPrivacyOfficer: "",
    footerBusinessNumber: "",
    footerSalesNumber: "",
    footerContact: "",
    footerBusinessHours: "",
    footerAddress: "",
  });

  // Load instructor data on mount
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        const instructor = await instructorAPI.getMe();
        setSettings({
          storeName: instructor.store_name || "",
          subdomain: instructor.subdomain || "",
          bio: instructor.bio || "",
          email: instructor.email || "",
          fullName: instructor.full_name || "",
          profileImage: instructor.profile_image || "",
          coverImage: "",
          notificationsEnabled: true,
          marketingEnabled: false,

          // Footer info
          footerCompanyName: instructor.footer_company_name || "",
          footerCeoName: instructor.footer_ceo_name || "",
          footerPrivacyOfficer: instructor.footer_privacy_officer || "",
          footerBusinessNumber: instructor.footer_business_number || "",
          footerSalesNumber: instructor.footer_sales_number || "",
          footerContact: instructor.footer_contact || "",
          footerBusinessHours: instructor.footer_business_hours || "",
          footerAddress: instructor.footer_address || "",
        });
      } catch (error) {
        console.error("Failed to fetch instructor data:", error);
        alert("강사 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  // 환경에 따라 다른 URL 생성
  const getStoreUrl = () => {
    if (typeof window === 'undefined') return '';

    const hostname = window.location.hostname;
    const port = window.location.port;

    // 로컬 개발 환경
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:${port || '3000'}/${settings.subdomain}`;
    }

    // 배포 환경 (서브도메인 방식)
    return `https://${settings.subdomain}.class-on.kr`;
  };

  const storeUrl = getStoreUrl();

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await instructorAPI.update({
        full_name: settings.fullName,
        store_name: settings.storeName,
        subdomain: settings.subdomain,
        bio: settings.bio,
        email: settings.email,
        profile_image: settings.profileImage,

        // Footer info
        footer_company_name: settings.footerCompanyName,
        footer_ceo_name: settings.footerCeoName,
        footer_privacy_officer: settings.footerPrivacyOfficer,
        footer_business_number: settings.footerBusinessNumber,
        footer_sales_number: settings.footerSalesNumber,
        footer_contact: settings.footerContact,
        footer_business_hours: settings.footerBusinessHours,
        footer_address: settings.footerAddress,
      });
      alert("설정이 저장되었습니다!");
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      alert(error.message || "설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">스토어 설정</h1>
          <p className="text-muted-foreground">
            스토어의 정보와 설정을 관리합니다
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={saving || loading}>
          <Save className="h-4 w-4" />
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* Subdomain Settings */}
      <Card>
        <CardHeader>
          <CardTitle>서브도메인 설정</CardTitle>
          <CardDescription>
            고객들이 접속할 수 있는 스토어 주소를 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subdomain Input */}
          <div className="space-y-2">
            <Label htmlFor="subdomain-input">서브도메인</Label>
            <div className="flex items-center gap-2">
              <Input
                id="subdomain-input"
                value={settings.subdomain}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setSettings({
                    ...settings,
                    subdomain: value,
                  });
                }}
                placeholder="yourname"
                pattern="[a-z0-9-]+"
                className="font-mono"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                  ? `(로컬: /서브도메인)`
                  : `.class-on.kr`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              영문 소문자, 숫자, 하이픈(-) 사용 가능
            </p>
          </div>

          {/* Preview URL */}
          <div className="space-y-2">
            <Label>미리보기 URL</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={storeUrl}
                  readOnly
                  className="pr-20 font-mono text-sm bg-muted"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleCopyUrl}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  미리보기
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? '개발 환경: 경로 기반 라우팅 (localhost:3000/서브도메인)'
                : '배포 환경: 서브도메인 기반 라우팅 (서브도메인.class-on.kr)'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>
            스토어의 기본 정보를 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">이름</Label>
            <Input
              id="fullName"
              value={settings.fullName}
              onChange={(e) =>
                setSettings({ ...settings, fullName: e.target.value })
              }
              placeholder="이름을 입력하세요"
            />
            <p className="text-sm text-muted-foreground">
              강사님의 이름입니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeName">스토어 이름</Label>
            <Input
              id="storeName"
              value={settings.storeName}
              onChange={(e) =>
                setSettings({ ...settings, storeName: e.target.value })
              }
              placeholder="스토어 이름을 입력하세요"
            />
            <p className="text-sm text-muted-foreground">
              고객에게 표시되는 스토어의 이름입니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">소개</Label>
            <Textarea
              id="bio"
              value={settings.bio}
              onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
              placeholder="자기소개를 입력하세요"
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              스토어 메인 페이지에 표시되는 소개글입니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
              placeholder="your@email.com"
            />
            <p className="text-sm text-muted-foreground">
              문의 및 알림을 받을 이메일 주소입니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>이미지</CardTitle>
          <CardDescription>
            프로필 이미지와 커버 이미지를 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>프로필 이미지</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {settings.profileImage ? (
                  <img
                    src={settings.profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {settings.storeName.charAt(0)}
                  </span>
                )}
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                업로드
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              권장 크기: 400x400px (JPG, PNG, 최대 2MB)
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>커버 이미지</Label>
            <div className="space-y-4">
              <div className="h-40 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {settings.coverImage ? (
                  <img
                    src={settings.coverImage}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">커버 이미지</span>
                )}
              </div>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                업로드
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              권장 크기: 1920x480px (JPG, PNG, 최대 5MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Information */}
      <Card>
        <CardHeader>
          <CardTitle>푸터 정보</CardTitle>
          <CardDescription>
            스토어 푸터에 표시될 사업자 정보를 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footerCompanyName">회사명</Label>
              <Input
                id="footerCompanyName"
                value={settings.footerCompanyName}
                onChange={(e) =>
                  setSettings({ ...settings, footerCompanyName: e.target.value })
                }
                placeholder="(주)래피드글로벌"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerCeoName">대표이사</Label>
              <Input
                id="footerCeoName"
                value={settings.footerCeoName}
                onChange={(e) =>
                  setSettings({ ...settings, footerCeoName: e.target.value })
                }
                placeholder="김수현, 김수준"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footerPrivacyOfficer">개인정보관리책임자</Label>
              <Input
                id="footerPrivacyOfficer"
                value={settings.footerPrivacyOfficer}
                onChange={(e) =>
                  setSettings({ ...settings, footerPrivacyOfficer: e.target.value })
                }
                placeholder="김수준"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerBusinessNumber">사업자등록번호</Label>
              <Input
                id="footerBusinessNumber"
                value={settings.footerBusinessNumber}
                onChange={(e) =>
                  setSettings({ ...settings, footerBusinessNumber: e.target.value })
                }
                placeholder="899-88-02750"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footerSalesNumber">통신판매업신고번호</Label>
              <Input
                id="footerSalesNumber"
                value={settings.footerSalesNumber}
                onChange={(e) =>
                  setSettings({ ...settings, footerSalesNumber: e.target.value })
                }
                placeholder="2023-서울강남-03841"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerContact">고객센터</Label>
              <Input
                id="footerContact"
                value={settings.footerContact}
                onChange={(e) =>
                  setSettings({ ...settings, footerContact: e.target.value })
                }
                placeholder="카카오톡 래피드클래스 채널톡"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerBusinessHours">영업시간</Label>
            <Textarea
              id="footerBusinessHours"
              value={settings.footerBusinessHours}
              onChange={(e) =>
                setSettings({ ...settings, footerBusinessHours: e.target.value })
              }
              placeholder="평일 9:00 ~ 17:00&#10;점심시간 12~13시 / 주말 및 공휴일 휴무"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footerAddress">주소</Label>
            <Textarea
              id="footerAddress"
              value={settings.footerAddress}
              onChange={(e) =>
                setSettings({ ...settings, footerAddress: e.target.value })
              }
              placeholder="본사: 서울특별시 강남구 테헤란로 82길 15, 6층 (대치동, 디아이타워)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>이메일 알림 수신 여부를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>주문 알림</Label>
              <p className="text-sm text-muted-foreground">
                새로운 주문이 발생하면 이메일로 알림을 받습니다
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notificationsEnabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>마케팅 알림</Label>
              <p className="text-sm text-muted-foreground">
                새로운 기능 및 이벤트 소식을 이메일로 받습니다
              </p>
            </div>
            <Switch
              checked={settings.marketingEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, marketingEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">위험 영역</CardTitle>
          <CardDescription>
            신중하게 진행해야 하는 작업들입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">스토어 삭제</p>
              <p className="text-sm text-muted-foreground">
                스토어와 모든 데이터가 영구적으로 삭제됩니다
              </p>
            </div>
            <Button variant="destructive" disabled>
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
