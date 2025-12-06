"use client";

import { useEffect, useState } from "react";
import { customersAPI, Customer } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Phone, Calendar, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.list();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      alert("회원 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await customersAPI.stats();
      setTotalCustomers(stats.total_customers);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm("정말로 이 회원을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await customersAPI.delete(customerId);
      alert("회원이 삭제되었습니다.");
      fetchCustomers();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("회원 삭제에 실패했습니다.");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.phone && customer.phone.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">회원 관리</h1>
          <p className="text-muted-foreground">
            내 스토어에 가입한 회원들을 관리하세요
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 회원</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              등록된 전체 회원 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 회원</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              현재 활성화된 회원
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이메일 인증</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.is_email_verified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              이메일 인증 완료 회원
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>회원 목록</CardTitle>
          <CardDescription>
            회원을 검색하고 관리할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일, 전화번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "아직 가입한 회원이 없습니다."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>최근 로그인</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.full_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {customer.email}
                          {customer.is_email_verified && (
                            <Badge variant="secondary" className="text-xs">
                              인증됨
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(customer.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.last_login ? (
                          formatDate(customer.last_login)
                        ) : (
                          <span className="text-muted-foreground">없음</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.is_active ? "default" : "secondary"}
                        >
                          {customer.is_active ? "활성" : "비활성"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results count */}
          {!loading && filteredCustomers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              총 {filteredCustomers.length}명의 회원
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
