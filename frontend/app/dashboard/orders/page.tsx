"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye } from "lucide-react";
import { ordersAPI, Order, OrderStatus, OrderStats } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    case "REFUNDED":
      return "outline";
    default:
      return "secondary";
  }
};

const statusLabel = (status: OrderStatus) => {
  switch (status) {
    case "PAID":
      return "결제 완료";
    case "PENDING":
      return "결제 대기";
    case "CANCELLED":
      return "취소됨";
    case "REFUNDED":
      return "환불됨";
    default:
      return status;
  }
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const params = statusFilter === "all" ? {} : { status: statusFilter as OrderStatus };
      const data = await ordersAPI.list(params);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "주문 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ordersAPI.stats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      await fetchOrders();
      await fetchStats();
      alert("주문 상태가 업데이트되었습니다.");
    } catch (err: any) {
      alert(err.message || "주문 상태 업데이트에 실패했습니다.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주문 관리</h1>
          <p className="text-muted-foreground">
            고객의 주문 내역을 확인하고 관리합니다
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 주문
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}건</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                완료된 주문
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders_by_status.PAID}건</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                대기중인 주문
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.orders_by_status.PENDING}건</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                총 매출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₩{stats.total_revenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>주문 목록</CardTitle>
          <CardDescription>
            총 {filteredOrders.length}개의 주문
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="주문번호, 고객명, 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="PAID">결제 완료</SelectItem>
                <SelectItem value="PENDING">결제 대기</SelectItem>
                <SelectItem value="CANCELLED">취소됨</SelectItem>
                <SelectItem value="REFUNDED">환불됨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>고객</TableHead>
                  <TableHead>상품</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>주문일시</TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">로딩 중...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        주문 내역이 없습니다
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            상품 ID: {order.product_id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        사용자 ID: {order.user_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        ₩{order.paid_price.toLocaleString()}
                        {order.original_price !== order.paid_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₩{order.original_price.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <Badge variant={statusBadgeVariant(order.status)}>
                              {statusLabel(order.status)}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">결제 대기</SelectItem>
                            <SelectItem value="PAID">결제 완료</SelectItem>
                            <SelectItem value="CANCELLED">취소됨</SelectItem>
                            <SelectItem value="REFUNDED">환불됨</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
