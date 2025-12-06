"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Mock Data
const periodData = {
  "7days": {
    revenue: 342000,
    orders: 12,
    visitors: 456,
    conversionRate: 2.6,
    trends: {
      revenue: 12.5,
      orders: 8.3,
      visitors: -3.2,
      conversionRate: 0.4,
    },
  },
  "30days": {
    revenue: 1240000,
    orders: 45,
    visitors: 1854,
    conversionRate: 2.4,
    trends: {
      revenue: 15.2,
      orders: 12.1,
      visitors: 5.3,
      conversionRate: 0.3,
    },
  },
  "90days": {
    revenue: 3680000,
    orders: 132,
    visitors: 5234,
    conversionRate: 2.5,
    trends: {
      revenue: 18.7,
      orders: 14.5,
      visitors: 8.9,
      conversionRate: 0.2,
    },
  },
};

const topProducts = [
  {
    name: "Python 완전정복",
    sales: 23,
    revenue: 1127000,
    growth: 12.5,
  },
  {
    name: "Next.js 마스터",
    sales: 18,
    revenue: 1062000,
    growth: 8.3,
  },
  {
    name: "FastAPI 실전",
    sales: 15,
    revenue: 585000,
    growth: -2.1,
  },
  {
    name: "React 기초",
    sales: 12,
    revenue: 420000,
    growth: 5.7,
  },
  {
    name: "TypeScript 가이드",
    sales: 10,
    revenue: 350000,
    growth: 3.2,
  },
];

const trafficSources = [
  { name: "직접 방문", percentage: 45, visits: 835 },
  { name: "검색 엔진", percentage: 30, visits: 556 },
  { name: "소셜 미디어", percentage: 15, visits: 278 },
  { name: "기타", percentage: 10, visits: 185 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"7days" | "30days" | "90days">("30days");
  const data = periodData[period];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
  }: {
    title: string;
    value: string;
    icon: any;
    trend: number;
  }) => {
    const isPositive = trend >= 0;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {trend}%
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              vs 이전 기간
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">매출 분석</h1>
          <p className="text-muted-foreground">
            스토어의 성과를 분석하고 인사이트를 얻으세요
          </p>
        </div>
        <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">최근 7일</SelectItem>
            <SelectItem value="30days">최근 30일</SelectItem>
            <SelectItem value="90days">최근 90일</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="총 매출"
          value={`₩${data.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={data.trends.revenue}
        />
        <StatCard
          title="주문 수"
          value={`${data.orders}건`}
          icon={ShoppingCart}
          trend={data.trends.orders}
        />
        <StatCard
          title="방문자"
          value={`${data.visitors.toLocaleString()}명`}
          icon={Users}
          trend={data.trends.visitors}
        />
        <StatCard
          title="전환율"
          value={`${data.conversionRate}%`}
          icon={Eye}
          trend={data.trends.conversionRate}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>매출 추이</CardTitle>
            <CardDescription>
              {period === "7days" && "최근 7일간"}
              {period === "30days" && "최근 30일간"}
              {period === "90days" && "최근 90일간"} 일별 매출
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  차트 라이브러리 연동 예정
                </p>
                <p className="text-sm text-muted-foreground">
                  (Recharts 또는 Chart.js)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products and Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>베스트 상품</CardTitle>
            <CardDescription>판매량 기준 상위 5개 상품</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.sales}건 판매
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₩{product.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      {product.growth >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`text-xs ${
                          product.growth >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.growth >= 0 ? "+" : ""}
                        {product.growth}%
                      </span>
                    </div>
                  </div>
                </div>
                {index < topProducts.length - 1 && (
                  <div className="border-b pt-2" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>유입 경로</CardTitle>
            <CardDescription>방문자가 어디서 왔는지 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {trafficSources.map((source) => (
              <div key={source.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{source.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {source.visits.toLocaleString()}회
                    </span>
                    <span className="font-semibold w-12 text-right">
                      {source.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={source.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">평균 주문 금액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₩{Math.round(data.revenue / data.orders).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              주문당 평균 매출
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">방문당 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₩{Math.round(data.revenue / data.visitors).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              방문자 1명당 발생 매출
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">재방문율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">34.2%</div>
            <p className="text-sm text-muted-foreground mt-1">
              다시 방문한 고객 비율
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
