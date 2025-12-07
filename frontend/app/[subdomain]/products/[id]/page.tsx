"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import KakaoChannelButton from "@/components/store/KakaoChannelButton";
import PurchaseModal from "@/components/purchase-modal";
import { publicStoreAPI, Product as APIProduct, StoreInfo } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const productId = params.id as string;

  const [product, setProduct] = useState<APIProduct | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'curriculum' | 'schedule'>('description');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // 카운트다운 타이머 상태
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (subdomain && productId) {
      fetchProductData();
    }
  }, [subdomain, productId]);

  // modal_end_time 기준으로 실시간 카운트다운
  useEffect(() => {
    if (!product?.modal_end_time) return;

    const calculateTimeLeft = () => {
      const endTime = new Date(product.modal_end_time!).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [product?.modal_end_time]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productData, storeData] = await Promise.all([
        publicStoreAPI.getProduct(subdomain, productId),
        publicStoreAPI.getStoreInfo(subdomain),
      ]);

      setProduct(productData);
      setStoreInfo(storeData);
    } catch (err: any) {
      console.error('Error fetching product data:', err);
      setError(err.message || '상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    // Check if desktop (lg breakpoint is 1024px)
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      // Desktop: Go directly to checkout
      // TODO: Replace with actual checkout page when ready
      router.push(`/checkout?product_id=${productId}`);
    } else {
      // Mobile: Show modal
      setIsPurchaseModalOpen(true);
    }
  };

  const handlePurchase = (selectedOption: string, selectedAdditional: string[]) => {
    console.log("Selected option:", selectedOption);
    console.log("Selected additional:", selectedAdditional);
    alert("결제 기능은 곧 추가될 예정입니다!");
    setIsPurchaseModalOpen(false);
  };

  const scrollToSection = (sectionId: string, tab: 'description' | 'curriculum' | 'schedule') => {
    setActiveTab(tab);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 스크롤 위치에 따라 활성 탭 업데이트
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'description-section', tab: 'description' as const },
        { id: 'curriculum-section', tab: 'curriculum' as const },
        { id: 'schedule-section', tab: 'schedule' as const },
        { id: 'mobile-description', tab: 'description' as const },
        { id: 'mobile-curriculum', tab: 'curriculum' as const },
        { id: 'mobile-schedule', tab: 'schedule' as const },
      ];

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveTab(section.tab);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()}원`;
  };

  const calculateDiscountRate = (price: number, discountPrice: number) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <StoreHeader storeName="" />
        <main className="flex-1 py-8">
          <div className="container max-w-7xl">
            <div className="space-y-4 animate-pulse">
              <div className="w-full h-96 bg-gray-300 rounded" />
              <div className="h-12 bg-gray-300 rounded w-1/3" />
              <div className="h-64 bg-gray-300 rounded" />
            </div>
          </div>
        </main>
        <footer className="bg-gray-100 h-64 animate-pulse" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            스토어로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const displayPrice = product.discount_price || product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32 lg:pb-0">
      <StoreHeader storeName={storeInfo?.store_name || "내 스토어"} />

      <main className="flex-1 py-4 lg:py-8">
        <div className="container max-w-7xl px-4">
          {/* 모바일: 배너 이미지 */}
          {(product.banner_image || product.thumbnail) && (
            <div className="w-full mb-4 lg:hidden">
              <img
                src={product.banner_image || product.thumbnail}
                alt={product.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* 모바일: 상품 정보 */}
          <div className="lg:hidden mb-6 space-y-4">
            {/* NEW 뱃지 */}
            {product.is_new && (
              <div className="inline-block bg-[#FF8547] text-white text-xs font-bold px-3 py-1 rounded">
                NEW
              </div>
            )}

            {/* 상품명 */}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            {/* 가격 정보 */}
            <div className="space-y-1">
              {hasDiscount && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-base">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#FF8547] font-bold text-3xl">
                      {calculateDiscountRate(product.price, product.discount_price!)}%
                    </span>
                    <span className="text-2xl font-bold text-[#FF8547]">
                      {formatPrice(product.discount_price!)}
                    </span>
                  </div>
                </>
              )}
              {!hasDiscount && (
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>
          </div>

          {/* 데스크톱: 2단 레이아웃 */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {/* 왼쪽: 메인 컨텐츠 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 배너 이미지 또는 썸네일 */}
              {(product.banner_image || product.thumbnail) && (
                <div className="w-full rounded-lg overflow-hidden" style={{ height: '360px' }}>
                  <img
                    src={product.banner_image || product.thumbnail}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 탭 메뉴 - 항상 표시, 스크롤 시 상단 고정 */}
              <div className="border-b border-gray-200 sticky top-16 bg-white z-20 py-2 shadow-sm">
                <div className="flex gap-8">
                  <button
                    onClick={() => scrollToSection('description-section', 'description')}
                    className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${
                      activeTab === 'description'
                        ? 'text-[#FF8547] border-[#FF8547]'
                        : 'text-gray-500 hover:text-[#FF8547] border-transparent hover:border-[#FF8547]'
                    }`}
                  >
                    강의소개
                  </button>
                  <button
                    onClick={() => scrollToSection('curriculum-section', 'curriculum')}
                    className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${
                      activeTab === 'curriculum'
                        ? 'text-[#FF8547] border-[#FF8547]'
                        : 'text-gray-500 hover:text-[#FF8547] border-transparent hover:border-[#FF8547]'
                    }`}
                  >
                    커리큘럼
                  </button>
                  <button
                    onClick={() => scrollToSection('schedule-section', 'schedule')}
                    className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${
                      activeTab === 'schedule'
                        ? 'text-[#FF8547] border-[#FF8547]'
                        : 'text-gray-500 hover:text-[#FF8547] border-transparent hover:border-[#FF8547]'
                    }`}
                  >
                    강의일정
                  </button>
                </div>
              </div>

              {/* 강의소개 섹션 */}
              <div id="description-section" className="prose prose-lg max-w-none scroll-mt-20">
                <h2 className="text-2xl font-bold mb-4">강의소개</h2>
                {product.detailed_description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
                ) : (
                  <p className="text-gray-600">{product.description || '상세 설명이 없습니다.'}</p>
                )}
              </div>

              {/* 커리큘럼 섹션 */}
              <div id="curriculum-section" className="prose prose-lg max-w-none scroll-mt-20">
                <h2 className="text-2xl font-bold mb-4">커리큘럼</h2>
                {product.curriculum ? (
                  <div dangerouslySetInnerHTML={{ __html: product.curriculum }} />
                ) : (
                  <p className="text-gray-600">커리큘럼 정보가 없습니다.</p>
                )}
              </div>

              {/* 강의일정 섹션 */}
              <div id="schedule-section" className="prose prose-lg max-w-none scroll-mt-20">
                <h2 className="text-2xl font-bold mb-4">강의일정</h2>
                {product.schedule_info ? (
                  <div dangerouslySetInnerHTML={{ __html: product.schedule_info }} />
                ) : (
                  <p className="text-gray-600">강의일정 정보가 없습니다.</p>
                )}
              </div>
            </div>

            {/* 오른쪽: 구매 정보 카드 (모바일 모달과 동일) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-6 shadow-lg space-y-4">
                <h2 className="text-lg font-bold text-gray-900">강의 상품</h2>

                {/* 상품명 */}
                <h3 className="text-base font-bold text-gray-900">{product.title}</h3>

                {/* 가격 정보 */}
                <div className="space-y-1">
                  {hasDiscount && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-sm">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[#FF8547] font-bold text-2xl">
                          {calculateDiscountRate(product.price, product.discount_price!)}%
                        </span>
                        <span className="text-xl font-bold text-[#FF8547]">
                          {formatPrice(product.discount_price!)}
                        </span>
                      </div>
                    </>
                  )}
                  {!hasDiscount && (
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>

                {/* 강의 상품 선택 */}
                {product.product_options && product.product_options.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="productOption-desktop" className="text-sm font-medium text-gray-700">
                      강의 상품
                    </Label>
                    <div className="relative">
                      <select
                        id="productOption-desktop"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8547] focus:border-transparent text-sm"
                      >
                        <option value="">선택해주세요</option>
                        {product.product_options.map((opt, idx) => (
                          <option key={idx} value={opt.name}>
                            {opt.name}
                            {opt.description && ` (${opt.description})`}
                            {opt.price !== undefined && ` - ${formatPrice(opt.price)}`}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* 추가 옵션 선택 */}
                {product.additional_options && product.additional_options.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      옵션 (선택)
                    </Label>
                    <div className="space-y-2">
                      {product.additional_options.map((opt, idx) => (
                        <div key={idx} className="flex items-start space-x-2 p-2 border border-gray-200 rounded-lg hover:border-[#FF8547] transition-colors">
                          <input
                            type="checkbox"
                            id={`addon-desktop-${idx}`}
                            className="mt-0.5 w-4 h-4 text-[#FF8547] border-gray-300 rounded focus:ring-[#FF8547]"
                          />
                          <label htmlFor={`addon-desktop-${idx}`} className="flex-1 cursor-pointer text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{opt.name}</span>
                              <span className="font-bold text-gray-900">+{formatPrice(opt.price)}</span>
                            </div>
                            {opt.description && (
                              <span className="text-xs text-gray-500">{opt.description}</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 총 결제 금액 */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-gray-900">총 결제 금액</span>
                    <span className="text-xl font-bold text-[#FF8547]">
                      {formatPrice(displayPrice)}
                    </span>
                  </div>
                </div>

                {/* 구매 버튼 - 높이 40% 줄임 */}
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#FF8547] hover:bg-[#FF7035] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-base"
                >
                  강의 구매하기
                </button>
              </div>
            </div>
          </div>

          {/* 모바일: 탭 메뉴 - 항상 표시, 스크롤 시 상단 고정 */}
          <div className="lg:hidden border-b border-gray-200 mb-6 sticky top-14 bg-white z-20 py-2 shadow-sm">
            <div className="flex gap-4 overflow-x-auto">
              <button
                onClick={() => scrollToSection('mobile-description', 'description')}
                className={`pb-4 px-2 font-medium text-base transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'description'
                    ? 'text-[#FF8547] border-[#FF8547]'
                    : 'text-gray-500 hover:text-[#FF8547] border-transparent hover:border-[#FF8547]'
                }`}
              >
                강의소개
              </button>
              <button
                onClick={() => scrollToSection('mobile-curriculum', 'curriculum')}
                className={`pb-4 px-2 font-medium text-base transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'curriculum'
                    ? 'text-[#FF8547] border-[#FF8547]'
                    : 'text-gray-500 hover:text-[#FF8547] border-transparent hover:border-[#FF8547]'
                }`}
              >
                커리큘럼
              </button>
              <button
                onClick={() => scrollToSection('mobile-schedule', 'schedule')}
                className={`pb-4 px-2 font-medium text-base transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'schedule'
                    ? 'text-[#FF8547] border-[#FF8547]'
                    : 'text-gray-500 hover:text-[#FF8547] border-transparent hover:border-[#FF8547]'
                }`}
              >
                강의일정
              </button>
            </div>
          </div>

          {/* 모바일: 컨텐츠 섹션 */}
          <div className="lg:hidden space-y-8">
            {/* 강의소개 섹션 */}
            <div id="mobile-description" className="prose prose-lg max-w-none scroll-mt-20">
              <h2 className="text-xl font-bold mb-4">강의소개</h2>
              {product.detailed_description ? (
                <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
              ) : (
                <p className="text-gray-600">{product.description || '상세 설명이 없습니다.'}</p>
              )}
            </div>

            {/* 커리큘럼 섹션 */}
            <div id="mobile-curriculum" className="prose prose-lg max-w-none scroll-mt-20">
              <h2 className="text-xl font-bold mb-4">커리큘럼</h2>
              {product.curriculum ? (
                <div dangerouslySetInnerHTML={{ __html: product.curriculum }} />
              ) : (
                <p className="text-gray-600">커리큘럼 정보가 없습니다.</p>
              )}
            </div>

            {/* 강의일정 섹션 */}
            <div id="mobile-schedule" className="prose prose-lg max-w-none scroll-mt-20">
              <h2 className="text-xl font-bold mb-4">강의일정</h2>
              {product.schedule_info ? (
                <div dangerouslySetInnerHTML={{ __html: product.schedule_info }} />
              ) : (
                <p className="text-gray-600">강의일정 정보가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 모바일: 하단 고정 구매 버튼 - 높이 40% 줄임 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden z-50">
        <button
          onClick={handleBuyNow}
          className="w-full bg-[#FF8547] hover:bg-[#FF7035] text-white font-bold py-2.5 px-6 rounded-lg transition-colors text-base"
        >
          강의 구매하기
        </button>
      </div>

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}

      {/* Kakao Channel Chat Button */}
      {storeInfo?.kakao_channel_id && (
        <KakaoChannelButton channelId={storeInfo.kakao_channel_id} />
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        productTitle={product.title}
        basePrice={displayPrice}
        productOptions={product.product_options}
        additionalOptions={product.additional_options}
        onPurchase={handlePurchase}
      />
    </div>
  );
}
