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
    setIsPurchaseModalOpen(true);
  };

  const handlePurchase = (selectedOption: string, selectedAdditional: string[]) => {
    console.log("Selected option:", selectedOption);
    console.log("Selected additional:", selectedAdditional);
    alert("결제 기능은 곧 추가될 예정입니다!");
    setIsPurchaseModalOpen(false);
  };

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
            <div className="space-y-2">
              {hasDiscount && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 line-through text-lg">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[#FF8547] font-bold text-xl">
                      {calculateDiscountRate(product.price, product.discount_price!)}% 할인
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#FF8547]">
                    월 {formatPrice(product.discount_price!)}
                  </div>
                </>
              )}
              {!hasDiscount && (
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </div>
              )}
              {hasDiscount && (
                <p className="text-sm text-gray-500">최대 12개월 무이자 할부 시</p>
              )}
            </div>
          </div>

          {/* 데스크톱: 2단 레이아웃 */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {/* 왼쪽: 메인 컨텐츠 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 배너 이미지 또는 썸네일 */}
              {(product.banner_image || product.thumbnail) && (
                <div className="w-full rounded-lg overflow-hidden">
                  <img
                    src={product.banner_image || product.thumbnail}
                    alt={product.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* 탭 메뉴 */}
              <div className="border-b border-gray-200">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab('description')}
                    className={`pb-4 px-2 font-medium text-lg transition-colors ${
                      activeTab === 'description'
                        ? 'text-[#FF8547] border-b-2 border-[#FF8547]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    강의소개
                  </button>
                  {product.curriculum && (
                    <button
                      onClick={() => setActiveTab('curriculum')}
                      className={`pb-4 px-2 font-medium text-lg transition-colors ${
                        activeTab === 'curriculum'
                          ? 'text-[#FF8547] border-b-2 border-[#FF8547]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      커리큘럼
                    </button>
                  )}
                  {product.schedule_info && (
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className={`pb-4 px-2 font-medium text-lg transition-colors ${
                        activeTab === 'schedule'
                          ? 'text-[#FF8547] border-b-2 border-[#FF8547]'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      강의일정
                    </button>
                  )}
                </div>
              </div>

              {/* 탭 컨텐츠 */}
              <div className="prose prose-lg max-w-none">
                {activeTab === 'description' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">강의 안내</h2>
                    {product.detailed_description ? (
                      <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
                    ) : (
                      <p className="text-gray-600">{product.description || '상세 설명이 없습니다.'}</p>
                    )}
                  </div>
                )}
                {activeTab === 'curriculum' && product.curriculum && (
                  <div dangerouslySetInnerHTML={{ __html: product.curriculum }} />
                )}
                {activeTab === 'schedule' && product.schedule_info && (
                  <div dangerouslySetInnerHTML={{ __html: product.schedule_info }} />
                )}
              </div>
            </div>

            {/* 오른쪽: 구매 정보 카드 (데스크톱만 표시) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-6 shadow-lg space-y-6">
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
                <div className="space-y-2">
                  {hasDiscount && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 line-through text-lg">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-[#FF8547] font-bold text-xl">
                          {calculateDiscountRate(product.price, product.discount_price!)}% 할인
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-[#FF8547]">
                        월 {formatPrice(product.discount_price!)}
                      </div>
                      <p className="text-sm text-gray-500">최대 12개월 무이자 할부 시</p>
                    </>
                  )}
                  {!hasDiscount && (
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </div>

                {/* 구매 버튼 */}
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#FF8547] hover:bg-[#FF7035] text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
                >
                  강의 구매하기
                </button>
              </div>
            </div>
          </div>

          {/* 모바일/데스크톱 공통: 탭 메뉴 */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-4 lg:gap-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 px-2 font-medium text-base lg:text-lg transition-colors whitespace-nowrap ${
                  activeTab === 'description'
                    ? 'text-[#FF8547] border-b-2 border-[#FF8547]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                강의소개
              </button>
              {product.curriculum && (
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`pb-4 px-2 font-medium text-base lg:text-lg transition-colors whitespace-nowrap ${
                    activeTab === 'curriculum'
                      ? 'text-[#FF8547] border-b-2 border-[#FF8547]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  커리큘럼
                </button>
              )}
              {product.schedule_info && (
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`pb-4 px-2 font-medium text-base lg:text-lg transition-colors whitespace-nowrap ${
                    activeTab === 'schedule'
                      ? 'text-[#FF8547] border-b-2 border-[#FF8547]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  강의일정
                </button>
              )}
            </div>
          </div>

          {/* 모바일/데스크톱 공통: 탭 컨텐츠 */}
          <div className="prose prose-lg max-w-none lg:hidden">
            {activeTab === 'description' && (
              <div>
                <h2 className="text-xl font-bold mb-4">강의 안내</h2>
                {product.detailed_description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
                ) : (
                  <p className="text-gray-600">{product.description || '상세 설명이 없습니다.'}</p>
                )}
              </div>
            )}
            {activeTab === 'curriculum' && product.curriculum && (
              <div dangerouslySetInnerHTML={{ __html: product.curriculum }} />
            )}
            {activeTab === 'schedule' && product.schedule_info && (
              <div dangerouslySetInnerHTML={{ __html: product.schedule_info }} />
            )}
          </div>
        </div>
      </main>

      {/* 모바일: 하단 고정 구매 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden z-50">
        <button
          onClick={handleBuyNow}
          className="w-full bg-[#FF8547] hover:bg-[#FF7035] text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
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
