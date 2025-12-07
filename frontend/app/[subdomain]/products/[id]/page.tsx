"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
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
    days: 3,
    hours: 0,
    minutes: 0,
    seconds: 48,
  });

  useEffect(() => {
    if (subdomain && productId) {
      fetchProductData();
    }
  }, [subdomain, productId]);

  // product가 로드되면 카운트다운 초기값 설정
  useEffect(() => {
    if (product) {
      setTimeLeft({
        days: product.modal_count_days || 3,
        hours: product.modal_count_hours || 0,
        minutes: product.modal_count_minutes || 0,
        seconds: product.modal_count_seconds || 48,
      });
    }
  }, [product]);

  // 카운트다운 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
        {/* 상세 이미지 중앙 정렬 (780px 기본, 반응형) */}
        {product.detailed_description && (
          <div className="w-full flex justify-center px-4">
            <div
              className="w-full max-w-[780px] prose prose-lg prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-p:text-gray-700 prose-a:text-blue-600 prose-img:w-full"
              dangerouslySetInnerHTML={{ __html: product.detailed_description }}
            />
          </div>
        )}

        {/* 상세 설명이 없는 경우 기본 이미지 표시 */}
        {!product.detailed_description && product.thumbnail && (
          <div className="w-full flex justify-center px-4">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full max-w-[780px]"
            />
          </div>
        )}
      </main>

      {/* 하단 고정 결제 유도 모달 (넓이 30% 축소, 하단 여백 추가) */}
      <div
        className="fixed bottom-4 left-0 right-0 p-3 shadow-2xl z-50"
        style={{
          backgroundColor: `${product.modal_bg_color || '#1a1a1a'}${Math.round(((product.modal_bg_opacity || 100) / 100) * 255).toString(16).padStart(2, '0')}`
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
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

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}
    </div>
  );
}
