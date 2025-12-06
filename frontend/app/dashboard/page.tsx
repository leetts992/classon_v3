"use client";

import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock Data
const recentOrders = [
  {
    id: "ORD-001",
    customer: "김철수",
    product: "Python 완전정복",
    amount: 49000,
    status: "paid",
    date: "2025-01-15",
  },
  {
    id: "ORD-002",
    customer: "이영희",
    product: "FastAPI 실전",
    amount: 39000,
    status: "paid",
    date: "2025-01-14",
  },
  {
    id: "ORD-003",
    customer: "박민수",
    product: "Next.js 마스터",
    amount: 59000,
    status: "pending",
    date: "2025-01-14",
  },
  {
    id: "ORD-004",
    customer: "정수진",
    product: "React 기초",
    amount: 35000,
    status: "paid",
    date: "2025-01-13",
  },
  {
    id: "ORD-005",
    customer: "최동욱",
    product: "TypeScript 가이드",
    amount: 35000,
    status: "paid",
    date: "2025-01-13",
  },
];

const bestProducts = [
  { name: "Python 완전정복", sales: 23, revenue: 1127000 },
  { name: "Next.js 마스터", sales: 18, revenue: 1062000 },
  { name: "FastAPI 실전", sales: 15, revenue: 585000 },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <div className="border-b bg-background">
          <div className="flex h-16 items-center px-8">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-2xl font-bold">대시보드</h2>
                <p className="text-sm text-muted-foreground">
                  John's Dev Class
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Welcome */}
          <div>
            <h3 className="text-xl font-semibold">환영합니다, John님! 👋</h3>
            <p className="text-muted-foreground">
              오늘도 좋은 하루 되세요. 여기 최근 활동 요약입니다.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="이번 달 매출"
              value="₩1,240,000"
              icon={DollarSign}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatsCard
              title="총 판매"
              value="342건"
              icon={ShoppingCart}
              trend={{ value: 8.2, isPositive: true }}
            />
            <StatsCard
              title="등록 상품"
              value="12개"
              icon={Package}
            />
            <StatsCard
              title="방문자"
              value="1,234명"
              icon={Users}
              trend={{ value: -2.4, isPositive: false }}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>최근 주문</CardTitle>
                <CardDescription>최근 5개의 주문 내역입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>주문번호</TableHead>
                      <TableHead>고객</TableHead>
                      <TableHead>금액</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>₩{order.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={order.status === "paid" ? "default" : "secondary"}
                          >
                            {order.status === "paid" ? "완료" : "대기"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Best Products */}
            <Card>
              <CardHeader>
                <CardTitle>베스트 상품</CardTitle>
                <CardDescription>이번 달 가장 많이 팔린 상품</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bestProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales}건 판매
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ₩{product.revenue.toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>매출 추이</CardTitle>
              <CardDescription>최근 30일간 매출 그래프</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  차트 라이브러리 연동 예정 (Recharts)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
