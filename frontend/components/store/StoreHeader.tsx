"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut, ShoppingCart, BookOpen } from "lucide-react";

interface StoreHeaderProps {
  storeName: string;
}

export default function StoreHeader({ storeName }: StoreHeaderProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const subdomain = params.subdomain as string;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("customer_token");
    const storedSubdomain = localStorage.getItem("customer_subdomain");

    if (token && storedSubdomain === subdomain) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const updateCartCount = () => {
    const savedCart = localStorage.getItem(`cart_${subdomain}`);
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartCount(cart.length);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Check login status on mount and when pathname changes
    checkLoginStatus();
    updateCartCount();

    // Listen for storage events to update cart count
    const handleStorageChange = () => {
      updateCartCount();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [subdomain, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_subdomain");
    localStorage.removeItem(`cart_${subdomain}`);
    setIsLoggedIn(false);
    setCartCount(0);
    router.push("/");
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Store Name */}
          <Link href="/" className="text-2xl font-bold">
            {storeName}
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900"
            >
              홈
            </Link>
            <Link
              href="/courses"
              className="text-gray-700 hover:text-gray-900"
            >
              강의
            </Link>
          </nav>

          {/* Auth & Cart Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="gap-2 relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/my-courses">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    내 강의
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
