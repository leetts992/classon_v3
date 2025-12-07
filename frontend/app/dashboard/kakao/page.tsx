"use client";

import { useState, useEffect } from "react";
import { Save, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { instructorAPI } from "@/lib/api";

export default function KakaoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [settings, setSettings] = useState({
    subdomain: "",
    kakaoEnabled: false,
    kakaoClientId: "",
    kakaoClientSecret: "",
    kakaoRedirectUri: "",
    kakaoChannelId: "",
  });

  // Load instructor data on mount
  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        const instructor = await instructorAPI.getMe();
        setSettings({
          subdomain: instructor.subdomain || "",
          kakaoEnabled: (instructor as any).kakao_enabled || false,
          kakaoClientId: (instructor as any).kakao_client_id || "",
          kakaoClientSecret: "", // Never load secret from API
          kakaoRedirectUri: (instructor as any).kakao_redirect_uri || "",
          kakaoChannelId: (instructor as any).kakao_channel_id || "",
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

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData: any = {
        kakao_enabled: settings.kakaoEnabled,
        kakao_client_id: settings.kakaoClientId,
        kakao_redirect_uri: settings.kakaoRedirectUri,
      };

      // Only include secret if it was changed (not empty)
      if (settings.kakaoClientSecret) {
        updateData.kakao_client_secret = settings.kakaoClientSecret;
      }

      // Add kakao channel ID
      updateData.kakao_channel_id = settings.kakaoChannelId;

      await instructorAPI.update(updateData);
      alert("카카오 설정이 저장되었습니다!");

      // Clear the secret field after save
      setSettings({ ...settings, kakaoClientSecret: "" });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      alert(error.message || "설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyRedirectUri = () => {
    if (settings.kakaoRedirectUri) {
      navigator.clipboard.writeText(settings.kakaoRedirectUri);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
          <h1 className="text-3xl font-bold">카카오 관리</h1>
          <p className="text-muted-foreground">
            카카오 로그인 및 상담톡을 설정합니다
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={saving || loading}>
          <Save className="h-4 w-4" />
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">카카오톡 로그인</TabsTrigger>
          <TabsTrigger value="channel">카카오톡 상담톡</TabsTrigger>
        </TabsList>

        {/* 카카오톡 로그인 탭 */}
        <TabsContent value="login" className="space-y-6">

      {/* Enable/Disable Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>카카오 로그인 활성화</CardTitle>
          <CardDescription>
            카카오 로그인 기능을 활성화하거나 비활성화합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1 flex-1">
              <Label className="text-base font-semibold">카카오 로그인 사용</Label>
              <p className="text-sm text-muted-foreground">
                활성화하면 고객이 카카오 계정으로 로그인할 수 있습니다
              </p>
            </div>
            <div className="ml-4">
              <button
                type="button"
                role="switch"
                aria-checked={settings.kakaoEnabled}
                onClick={() => setSettings({ ...settings, kakaoEnabled: !settings.kakaoEnabled })}
                className={`
                  relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
                  focus-visible:ring-white focus-visible:ring-opacity-75
                  ${settings.kakaoEnabled ? 'bg-primary' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">카카오 로그인 사용</span>
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0
                    transition duration-200 ease-in-out
                    ${settings.kakaoEnabled ? 'translate-x-8' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>

          {settings.kakaoEnabled && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✓ 카카오 로그인이 활성화되었습니다
              </p>
            </div>
          )}

          {!settings.kakaoEnabled && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                카카오 로그인을 사용하려면 위의 스위치를 켜주세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>설정 가이드</CardTitle>
          <CardDescription>
            카카오 로그인을 설정하기 위한 단계별 안내
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                1
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Kakao Developers에서 앱 생성</p>
                <p className="text-sm text-muted-foreground">
                  <a
                    href="https://developers.kakao.com/console/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Kakao Developers 콘솔
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  에서 새 애플리케이션을 생성합니다.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                2
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">REST API 키 확인</p>
                <p className="text-sm text-muted-foreground">
                  앱 설정 {'>'} 앱 키에서 REST API 키를 복사하여 아래에 입력합니다.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                3
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Client Secret 생성 (선택사항)</p>
                <p className="text-sm text-muted-foreground">
                  보안 {'>'} 코드에서 Client Secret을 생성하여 입력합니다. (보안 강화 권장)
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                4
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Redirect URI 등록</p>
                <p className="text-sm text-muted-foreground">
                  제품 설정 {'>'} 카카오 로그인 {'>'} Redirect URI에 아래 URI를 등록합니다.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                5
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">카카오 로그인 활성화</p>
                <p className="text-sm text-muted-foreground">
                  제품 설정 {'>'} 카카오 로그인에서 활성화 설정을 ON으로 변경합니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle>API 설정</CardTitle>
          <CardDescription>
            카카오 개발자 콘솔에서 발급받은 정보를 입력합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="kakaoClientId">REST API 키 (Client ID) *</Label>
            <Input
              id="kakaoClientId"
              name="kakao-client-id"
              value={settings.kakaoClientId}
              onChange={(e) =>
                setSettings({ ...settings, kakaoClientId: e.target.value })
              }
              placeholder="예: 1234567890abcdef1234567890abcdef"
              className="font-mono text-sm"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <p className="text-sm text-muted-foreground">
              Kakao Developers 콘솔 {'>'} 앱 설정 {'>'} 앱 키에서 확인할 수 있습니다
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kakaoClientSecret">Client Secret (선택사항)</Label>
            <Input
              id="kakaoClientSecret"
              name="kakao-client-secret"
              type="password"
              value={settings.kakaoClientSecret}
              onChange={(e) =>
                setSettings({ ...settings, kakaoClientSecret: e.target.value })
              }
              placeholder={settings.kakaoClientId ? "변경하려면 입력하세요" : "Client Secret을 입력하세요"}
              className="font-mono text-sm"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <p className="text-sm text-muted-foreground">
              보안 강화를 위해 Client Secret 사용을 권장합니다. 설정한 경우 반드시 입력해야 합니다.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kakaoRedirectUri">Redirect URI *</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  id="kakaoRedirectUri"
                  name="kakao-redirect-uri"
                  value={settings.kakaoRedirectUri}
                  onChange={(e) =>
                    setSettings({ ...settings, kakaoRedirectUri: e.target.value })
                  }
                  placeholder={`예: https://${settings.subdomain}.class-on.kr/login`}
                  className={`font-mono text-sm pr-10 select-text cursor-text ${
                    settings.kakaoRedirectUri
                      ? 'text-foreground font-semibold'
                      : 'placeholder:text-muted-foreground placeholder:font-normal'
                  }`}
                  style={{
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    MozUserSelect: 'text',
                  }}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={handleCopyRedirectUri}
                  disabled={!settings.kakaoRedirectUri}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const uri = `https://${settings.subdomain}.class-on.kr/login`;
                  setSettings({ ...settings, kakaoRedirectUri: uri });
                }}
              >
                자동 입력
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              카카오 개발자 콘솔의 Redirect URI 설정에 이 주소를 정확히 등록해야 합니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-900">중요 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-yellow-800">
          <div className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <p>
              Redirect URI는 카카오 개발자 콘솔에 등록된 값과 정확히 일치해야 합니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <p>
              Client Secret을 설정한 경우, 분실하면 재발급해야 합니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <p>
              카카오 로그인으로 가입한 고객은 별도의 비밀번호 없이 카카오 계정으로만 로그인할 수 있습니다.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <p>
              설정을 변경한 후에는 반드시 '저장' 버튼을 클릭해야 적용됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Login */}
      {settings.kakaoEnabled && settings.kakaoClientId && settings.kakaoRedirectUri && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">테스트</CardTitle>
            <CardDescription className="text-green-700">
              설정이 완료되었습니다. 스토어에서 카카오 로그인을 테스트해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2" asChild>
              <a
                href={`https://${settings.subdomain}.class-on.kr/login`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                로그인 페이지에서 테스트하기
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        {/* 카카오톡 상담톡 탭 */}
        <TabsContent value="channel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>카카오 채널 상담톡</CardTitle>
              <CardDescription>
                고객이 쇼핑몰에서 카카오톡으로 문의할 수 있도록 상담톡 버튼을 추가합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="kakaoChannelId">카카오 채널 ID</Label>
                <Input
                  id="kakaoChannelId"
                  value={settings.kakaoChannelId}
                  onChange={(e) =>
                    setSettings({ ...settings, kakaoChannelId: e.target.value })
                  }
                  placeholder="예: _xhFxoId"
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  카카오 채널 관리자센터에서 확인할 수 있습니다 (언더바 _ 로 시작)
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <p className="text-sm font-medium">카카오 채널 ID 확인 방법:</p>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>
                      <a
                        href="https://center-pf.kakao.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        카카오 채널 관리자센터
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      에 접속합니다
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>관리 {'>'} 상세설정에서 채널 URL을 확인합니다</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>
                      URL 끝의 ID를 입력합니다 (예: http://pf.kakao.com/_xhFxoId
                      → <code className="px-1 py-0.5 bg-muted rounded text-xs">_xhFxoId</code>)
                    </span>
                  </li>
                </ol>
              </div>

              {settings.kakaoChannelId && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    ✓ 채널 ID가 입력되었습니다
                  </p>
                  <p className="text-sm text-green-700">
                    저장 후 쇼핑몰 우측 하단에 상담톡 버튼이 표시됩니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <p>
                  카카오 채널이 없는 경우, 먼저 카카오 채널을 생성해야 합니다
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <p>
                  상담톡 버튼은 모든 쇼핑몰 페이지 우측 하단에 고정으로 표시됩니다
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <p>
                  고객이 버튼을 클릭하면 카카오톡 앱 또는 웹에서 채널 채팅이 열립니다
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
