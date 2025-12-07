"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import KakaoChannelButton from "@/components/store/KakaoChannelButton";
import { publicStoreAPI, Product as APIProduct, StoreInfo } from "@/lib/api";
import { ShoppingCart, Clock, BookOpen, Flame } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;
  const productId = params.id as string;

  const [product, setProduct] = useState<APIProduct | null>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 카운트다운 타이머 상태 (항상 최상위에서 선언)
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

    // 즉시 계산
    calculateTimeLeft();

    // 1초마다 업데이트
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

  const handleAddToCart = () => {
    if (!product) return;

    // Get existing cart or create new one
    const savedCart = localStorage.getItem(`cart_${subdomain}`);
    const cart = savedCart ? JSON.parse(savedCart) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    if (existingIndex !== -1) {
      alert("이미 장바구니에 담긴 상품입니다!");
      return;
    }

    // Add product to cart
    const cartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      discount_price: product.discount_price,
      thumbnail: product.thumbnail,
      type: product.type,
    };

    cart.push(cartItem);
    localStorage.setItem(`cart_${subdomain}`, JSON.stringify(cart));

    // Trigger storage event to update header cart count
    window.dispatchEvent(new Event("storage"));

    alert("장바구니에 담겼습니다!");
  };

  const handleBuyNow = () => {
    alert("결제 기능은 곧 추가될 예정입니다!");
  };

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">로딩 중...</p>
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
    <div className="flex flex-col min-h-screen bg-white">
      <StoreHeader storeName={storeInfo?.store_name || "내 스토어"} />

      <main className="flex-1 pb-32">
        {/* 상세 이미지 중앙 정렬 (780px 기본, 반응형) - 여백 제거 */}
        {product.detailed_description && (
          <div className="w-full flex justify-center">
            <div
              className="w-full max-w-[780px] prose prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-gray-700 prose-a:text-blue-600 prose-img:w-full"
              dangerouslySetInnerHTML={{ __html: product.detailed_description }}
            />
          </div>
        )}

        {/* 상세 설명이 없는 경우 기본 이미지 표시 */}
        {!product.detailed_description && product.thumbnail && (
          <div className="w-full flex justify-center">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full max-w-[780px]"
            />
          </div>
        )}
      </main>

      {/* 하단 고정 결제 유도 모달 (860px 넓이, 라운드 처리) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[860px] z-50 px-4">
        <div
          className="p-4 shadow-2xl rounded-2xl"
          style={{
            backgroundColor: `${product.modal_bg_color || '#1a1a1a'}${Math.round(((product.modal_bg_opacity || 100) / 100) * 255).toString(16).padStart(2, '0')}`
          }}
        >
          <div className="flex items-center justify-between gap-4">
          {/* 왼쪽: 텍스트 + 카운트다운 (불 이모지 제거) */}
          <div className="flex items-center gap-3">
            <div>
              <p
                className="font-bold text-sm"
                style={{ color: product.modal_text_color || '#ffffff' }}
              >
                {product.modal_text || '🔥 선착순 마감입니다!'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="font-bold"
                  style={{ color: product.modal_text_color || '#ffffff' }}
                >
                  {timeLeft.days}일
                </span>
                <span style={{ color: product.modal_text_color || '#ffffff' }}>
                  {String(timeLeft.hours).padStart(2, '0')}시
                </span>
                <span style={{ color: product.modal_text_color || '#ffffff' }}>
                  {String(timeLeft.minutes).padStart(2, '0')}분
                </span>
                <span style={{ color: product.modal_text_color || '#ffffff' }}>
                  {String(timeLeft.seconds).padStart(2, '0')}초
                </span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 버튼 */}
          <button
            onClick={handleBuyNow}
            className="px-6 py-2 font-bold text-white rounded-lg transition-colors text-sm"
            style={{ backgroundColor: product.modal_button_color || '#ff0000' }}
            onMouseEnter={(e) => {
              const color = product.modal_button_color || '#ff0000';
              // 색상을 약간 어둡게
              e.currentTarget.style.backgroundColor = color + 'cc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = product.modal_button_color || '#ff0000';
            }}
          >
            {product.modal_button_text || '0원 무료 신청하기'}
          </button>
          </div>
        </div>
      </div>

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}

      {/* Kakao Channel Chat Button */}
      {storeInfo?.kakao_channel_id && (
        <KakaoChannelButton channelId={storeInfo.kakao_channel_id} />
      )}
    </div>
  );
}
