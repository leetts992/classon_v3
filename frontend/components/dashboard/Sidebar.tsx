"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  BarChart3,
  LogOut,
  ExternalLink,
  Users,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { instructorAPI } from "@/lib/api";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "홈",
    href: "/dashboard",
  },
  {
    icon: Package,
    label: "상품 관리",
    href: "/dashboard/products",
  },
  {
    icon: ShoppingCart,
    label: "주문 관리",
    href: "/dashboard/orders",
  },
  {
    icon: Users,
    label: "회원 관리",
    href: "/dashboard/customers",
  },
  {
    icon: BarChart3,
    label: "매출 분석",
    href: "/dashboard/analytics",
  },
  {
    icon: MessageCircle,
    label: "카카오 로그인",
    href: "/dashboard/kakao",
  },
  {
    icon: Settings,
    label: "스토어 설정",
    href: "/dashboard/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [subdomain, setSubdomain] = useState("");

  useEffect(() => {
    const fetchInstructorInfo = async () => {
      try {
        const instructorInfo = await instructorAPI.getMe();
        if (instructorInfo.subdomain) {
          setSubdomain(instructorInfo.subdomain);
        }
      } catch (error) {
        console.error("Failed to fetch instructor info:", error);
      }
    };

    fetchInstructorInfo();
  }, []);

  // 환경에 따라 다른 URL 생성
  const getStoreUrl = () => {
    if (!subdomain) return '';
    if (typeof window === 'undefined') return '';

    const hostname = window.location.hostname;
    const port = window.location.port;

    // 로컬 개발 환경
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:${port || '3000'}/${subdomain}`;
    }

    // 배포 환경 (서브도메인 방식)
    return `https://${subdomain}.class-on.kr`;
  };

  const storeUrl = getStoreUrl();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_type");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user_email");
    sessionStorage.removeItem("user_type");

    // Redirect to home
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              C
            </div>
            <span className="text-xl font-bold">Class-On</span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t p-4 space-y-2">
          {storeUrl && (
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href={storeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                내 스토어 보기
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </aside>
  );
}
