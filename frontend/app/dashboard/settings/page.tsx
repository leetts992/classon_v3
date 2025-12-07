"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Eye, Copy, Check, ExternalLink, Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { instructorAPI, BannerSlide, uploadAPI } from "@/lib/api";

export default function SettingsPage() {
  const [isCopied, setIsCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBannerId, setUploadingBannerId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    storeName: "",
    subdomain: "",
    bio: "",
    email: "",
    fullName: "",
    profileImage: "",

    // Footer info
    footerCompanyName: "",
    footerCeoName: "",
    footerPrivacyOfficer: "",
    footerBusinessNumber: "",
    footerSalesNumber: "",
    footerContact: "",
    footerBusinessHours: "",
    footerAddress: "",

    // Kakao Channel
    kakaoChannelId: "",
  });

  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>([]);

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

          // Footer info
          footerCompanyName: instructor.footer_company_name || "",
          footerCeoName: instructor.footer_ceo_name || "",
          footerPrivacyOfficer: instructor.footer_privacy_officer || "",
          footerBusinessNumber: instructor.footer_business_number || "",
          footerSalesNumber: instructor.footer_sales_number || "",
          footerContact: instructor.footer_contact || "",
          footerBusinessHours: instructor.footer_business_hours || "",
          footerAddress: instructor.footer_address || "",

          // Kakao Channel
          kakaoChannelId: instructor.kakao_channel_id || "",
        });

        // Load banner slides
        setBannerSlides(instructor.banner_slides || []);
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

        // Banner slides
        banner_slides: bannerSlides,

        // Kakao Channel
        kakao_channel_id: settings.kakaoChannelId,
      });
      alert("설정이 저장되었습니다!");
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      alert(error.message || "설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // Banner management functions
  const addBannerSlide = () => {
    const newSlide: BannerSlide = {
      id: `banner-${Date.now()}`,
      image_url: "",
      title: "",
      subtitle: "",
      link_url: "",
      order: bannerSlides.length,
    };
    setBannerSlides([...bannerSlides, newSlide]);
  };

  const removeBannerSlide = async (id: string) => {
    const slide = bannerSlides.find((s) => s.id === id);

    // S3에 업로드된 이미지라면 삭제
    if (slide?.image_url && slide.image_url.includes('classon-storage.s3')) {
      try {
        await uploadAPI.deleteFile(slide.image_url);
      } catch (error) {
        console.error('Failed to delete image from S3:', error);
        // 이미지 삭제 실패해도 배너는 삭제
      }
    }

    setBannerSlides(bannerSlides.filter((slide) => slide.id !== id));
  };

  const updateBannerSlide = (id: string, field: keyof BannerSlide, value: string) => {
    setBannerSlides(
      bannerSlides.map((slide) =>
        slide.id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  const moveBannerSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...bannerSlides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];

    // Update order
    newSlides.forEach((slide, idx) => {
      slide.order = idx;
    });

    setBannerSlides(newSlides);
  };

  const handleImageUpload = async (bannerId: string, file: File) => {
    try {
      setUploadingBannerId(bannerId);

      // 기존 이미지가 S3에 있다면 삭제
      const existingSlide = bannerSlides.find((s) => s.id === bannerId);
      if (existingSlide?.image_url && existingSlide.image_url.includes('classon-storage.s3')) {
        try {
          await uploadAPI.deleteFile(existingSlide.image_url);
        } catch (error) {
          console.error('Failed to delete old image:', error);
          // 기존 이미지 삭제 실패해도 새 이미지 업로드는 진행
        }
      }

      const response = await uploadAPI.uploadImage(file);
      updateBannerSlide(bannerId, "image_url", response.url);
      alert("이미지 업로드 완료!");
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      alert(error.message || "이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingBannerId(null);
    }
  };

  const handleFileSelect = (bannerId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      handleImageUpload(bannerId, file);
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

      {/* Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">기본정보</TabsTrigger>
          <TabsTrigger value="footer">상하단</TabsTrigger>
          <TabsTrigger value="banner">배너관리</TabsTrigger>
        </TabsList>

        {/* 기본정보 탭 */}
        <TabsContent value="basic" className="space-y-6">
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">이름</Label>
                  <Input
                    id="fullName"
                    value={settings.fullName}
                    onChange={(e) =>
                      setSettings({ ...settings, fullName: e.target.value })
                    }
                    placeholder="김철수"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">스토어 이름</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) =>
                      setSettings({ ...settings, storeName: e.target.value })
                    }
                    placeholder="철수의 강의"
                  />
                </div>
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
                  placeholder="instructor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">소개</Label>
                <Textarea
                  id="bio"
                  value={settings.bio}
                  onChange={(e) =>
                    setSettings({ ...settings, bio: e.target.value })
                  }
                  placeholder="스토어 소개를 입력하세요"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">프로필 이미지 URL</Label>
                <Input
                  id="profileImage"
                  value={settings.profileImage}
                  onChange={(e) =>
                    setSettings({ ...settings, profileImage: e.target.value })
                  }
                  placeholder="https://example.com/profile.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 상하단 탭 (푸터 정보) */}
        <TabsContent value="footer" className="space-y-6">
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
                  placeholder="평일 09:00 - 18:00&#10;토·일요일, 공휴일 휴무"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerAddress">주소</Label>
                <Input
                  id="footerAddress"
                  value={settings.footerAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, footerAddress: e.target.value })
                  }
                  placeholder="서울특별시 강남구 테헤란로 427, 10층 1020호(삼성동, 위워크타워)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 배너관리 탭 */}
        <TabsContent value="banner" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>배너 관리</CardTitle>
                  <CardDescription>
                    스토어 메인 페이지에 표시될 배너를 관리합니다
                  </CardDescription>
                </div>
                <Button onClick={addBannerSlide} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  배너 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bannerSlides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    배너가 없습니다
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    배너를 추가하여 스토어를 더욱 매력적으로 꾸며보세요
                  </p>
                  <Button onClick={addBannerSlide} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    첫 번째 배너 추가
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bannerSlides.map((slide, index) => (
                    <Card key={slide.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">배너 {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {index > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBannerSlide(index, "up")}
                              >
                                ↑
                              </Button>
                            )}
                            {index < bannerSlides.length - 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveBannerSlide(index, "down")}
                              >
                                ↓
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBannerSlide(slide.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>배너 이미지 *</Label>
                          <p className="text-sm font-medium text-[#FF8547]">
                            💡 최적 이미지 크기: 1200 x 400px (3:1 비율)
                          </p>
                          <div className="flex gap-2">
                            <Input
                              value={slide.image_url}
                              onChange={(e) =>
                                updateBannerSlide(slide.id, "image_url", e.target.value)
                              }
                              placeholder="https://example.com/banner.jpg 또는 파일 업로드"
                              className="flex-1"
                            />
                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(slide.id, e)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploadingBannerId === slide.id}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                disabled={uploadingBannerId === slide.id}
                                className="gap-2 whitespace-nowrap"
                              >
                                <Upload className="h-4 w-4" />
                                {uploadingBannerId === slide.id ? "업로드 중..." : "파일 선택"}
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            권장 크기: 1920x600px (JPG, PNG, 최대 5MB)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>링크 URL (선택)</Label>
                          <Input
                            value={slide.link_url || ""}
                            onChange={(e) =>
                              updateBannerSlide(slide.id, "link_url", e.target.value)
                            }
                            placeholder="#courses 또는 https://example.com"
                          />
                          <p className="text-sm text-muted-foreground">
                            배너 클릭 시 이동할 주소 (비어있으면 클릭 불가)
                          </p>
                        </div>

                        {/* 미리보기 */}
                        {slide.image_url && (
                          <div className="space-y-2">
                            <Label>미리보기</Label>
                            <div className="relative aspect-[16/5] rounded-lg overflow-hidden border">
                              <img
                                src={slide.image_url}
                                alt="배너 미리보기"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "https://via.placeholder.com/1920x600?text=Image+Not+Found";
                                }}
                              />
                              {(slide.title || slide.subtitle) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-8">
                                  <div className="text-white space-y-2">
                                    {slide.title && (
                                      <h3 className="text-2xl font-bold">{slide.title}</h3>
                                    )}
                                    {slide.subtitle && (
                                      <p className="text-lg text-white/90">{slide.subtitle}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
