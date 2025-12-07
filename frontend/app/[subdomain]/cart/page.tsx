"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import { publicStoreAPI, StoreInfo } from "@/lib/api";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CartItem {
  id: string;
  title: string;
  price: number;
  discount_price?: number;
  thumbnail?: string;
  type: string;
}

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subdomain) {
      fetchStoreInfo();
      loadCartItems();
    }
  }, [subdomain]);

  const fetchStoreInfo = async () => {
    try {
      const data = await publicStoreAPI.getStoreInfo(subdomain);
      setStoreInfo(data);
    } catch (error) {
      console.error("Failed to fetch store info:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCartItems = () => {
    const savedCart = localStorage.getItem(`cart_${subdomain}`);
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const removeFromCart = (productId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem(`cart_${subdomain}`, JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    if (confirm("장바구니를 비우시겠습니까?")) {
      setCartItems([]);
      localStorage.removeItem(`cart_${subdomain}`);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + price;
    }, 0);
  };

  const handleCheckout = () => {
    // TODO: 결제 페이지로 이동
    alert("결제 기능은 곧 추가될 예정입니다.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StoreHeader storeName={storeInfo?.store_name || "내 스토어"} />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">장바구니</h1>
            <p className="text-gray-600">
              {cartItems.length}개의 상품이 담겨있습니다
            </p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="bg-white rounded-lg shadow-sm p-16 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                장바구니가 비어있습니다
              </h2>
              <p className="text-gray-600 mb-6">
                관심있는 강의를 장바구니에 담아보세요
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                강의 둘러보기
              </Button>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">상품 목록</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700"
                  >
                    전체 삭제
                  </Button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm p-4 flex gap-4"
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.thumbnail ||
                          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop"
                        }
                        alt={item.title}
                        className="w-32 h-24 object-cover rounded"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.type === "video" ? "동영상 강의" : "전자책"}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.discount_price ? (
                          <>
                            <span className="text-lg font-bold text-blue-600">
                              {item.discount_price.toLocaleString()}원
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {item.price.toLocaleString()}원
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">
                            {item.price.toLocaleString()}원
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                  <h2 className="text-lg font-semibold mb-4">주문 요약</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>상품 금액</span>
                      <span>{getTotalPrice().toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>할인 금액</span>
                      <span className="text-red-600">
                        -
                        {cartItems
                          .reduce((total, item) => {
                            if (item.discount_price) {
                              return total + (item.price - item.discount_price);
                            }
                            return total;
                          }, 0)
                          .toLocaleString()}
                        원
                      </span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>총 결제 금액</span>
                        <span className="text-blue-600">
                          {getTotalPrice().toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                  >
                    구매하기
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    구매 후 즉시 수강이 가능합니다
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {storeInfo && <StoreFooter storeInfo={storeInfo} />}
    </div>
  );
}
