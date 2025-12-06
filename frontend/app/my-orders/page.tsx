"use client";

import { useEffect, useState } from "react";
import { ordersAPI, Order, OrderStatus } from "@/lib/api";
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
import { Button } from "@/components/ui/button";
import { Download, Package } from "lucide-react";

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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ordersAPI.myOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "주문 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paidOrders = orders.filter((o) => o.status === "PAID");
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.paid_price, 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">내 주문 내역</h1>
        <p className="text-muted-foreground mt-2">
          구매한 상품과 주문 내역을 확인하세요
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 주문
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              구매 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidOrders.length}건</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 결제 금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{totalSpent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>주문 목록</CardTitle>
          <CardDescription>총 {orders.length}개의 주문</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문번호</TableHead>
                  <TableHead>상품 ID</TableHead>
                  <TableHead>결제 금액</TableHead>
                  <TableHead>결제 방법</TableHead>
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
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          주문 내역이 없습니다
                        </p>
                        <p className="text-sm text-muted-foreground">
                          마음에 드는 강의를 구매해보세요
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.product_id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        ₩{order.paid_price.toLocaleString()}
                        {order.original_price !== order.paid_price && (
                          <div className="text-xs text-muted-foreground line-through">
                            ₩{order.original_price.toLocaleString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.payment_method || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(order.status)}>
                          {statusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {order.status === "PAID" && (
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            다운로드
                          </Button>
                        )}
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
