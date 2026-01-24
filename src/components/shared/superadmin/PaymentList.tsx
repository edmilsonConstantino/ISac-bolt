// src/components/shared/PaymentList.tsx - VERSÃO MODERNA E PROFISSIONAL
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  DollarSign,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  className: string;
  status: string;
}

interface PaymentListProps {
  students: Student[];
  onOpenPaymentModal: (studentId: number) => void;
  formatCurrency: (amount: number) => string;
  getStudentPaymentInfo: (studentId: number, name: string, className: string) => {
    studentId: number;
    studentName: string;
    className: string;
    monthlyFee: number;
    totalPaid: number;
    currentBalance: number;
    overduePayments: any[];
    lastPaymentDate: string | null;
  };
}

export function PaymentList({
  students,
  onOpenPaymentModal,
  formatCurrency,
  getStudentPaymentInfo
}: PaymentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Calcular estatísticas
  const getPaymentStats = () => {
    let withDebt = 0;
    let withCredit = 0;
    let overdue = 0;
    let upToDate = 0;

    students.forEach(student => {
      const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
      
      if (paymentInfo.overduePayments.length > 0) {
        overdue++;
      } else if (paymentInfo.currentBalance < 0) {
        withDebt++;
      } else if (paymentInfo.currentBalance > 0) {
        withCredit++;
      } else {
        upToDate++;
      }
    });

    return { withDebt, withCredit, overdue, upToDate, total: students.length };
  };

  const stats = getPaymentStats();

  // Filtrar estudantes
  const getFilteredStudents = () => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter === 'overdue') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.overduePayments.length > 0;
      });
    } else if (statusFilter === 'debt') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.currentBalance < 0 && paymentInfo.overduePayments.length === 0;
      });
    } else if (statusFilter === 'credit') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.currentBalance > 0;
      });
    } else if (statusFilter === 'uptodate') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.currentBalance === 0 && paymentInfo.overduePayments.length === 0;
      });
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const getPaymentStatusBadge = (paymentInfo: any) => {
    if (paymentInfo.overduePayments.length > 0) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Em Atraso</Badge>;
    } else if (paymentInfo.currentBalance < 0) {
      return <Badge variant="destructive" className="gap-1"><DollarSign className="h-3 w-3" /> Com Dívida</Badge>;
    } else if (paymentInfo.currentBalance > 0) {
      return <Badge variant="default" className="gap-1 bg-blue-600"><TrendingUp className="h-3 w-3" /> Com Crédito</Badge>;
    } else {
      return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Em Dia</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-elegant bg-gradient-to-r from-blue-50 via-white to-green-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Controle de Pagamentos
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestão financeira de todos os estudantes matriculados
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'overdue' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setStatusFilter('overdue')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-red-600" />
              <p className="text-xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Em Atraso</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'debt' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => setStatusFilter('debt')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-1 text-orange-600" />
              <p className="text-xl font-bold text-orange-600">{stats.withDebt}</p>
              <p className="text-xs text-muted-foreground">Com Dívida</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'credit' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setStatusFilter('credit')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <p className="text-xl font-bold text-blue-600">{stats.withCredit}</p>
              <p className="text-xs text-muted-foreground">Com Crédito</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${statusFilter === 'uptodate' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setStatusFilter('uptodate')}
        >
          <CardContent className="pt-4 pb-4">
            <div className="text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <p className="text-xl font-bold text-green-600">{stats.upToDate}</p>
              <p className="text-xs text-muted-foreground">Em Dia</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="shadow-elegant">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar estudante por nome, turma ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List - GRID TABLE LAYOUT */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum estudante encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0">
              {/* Header da Tabela */}
              <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white">
                <div className="grid grid-cols-12 gap-4 p-4 font-semibold text-sm">
                  <div className="col-span-3">Estudante</div>
                  <div className="col-span-2 text-center">Status</div>
                  <div className="col-span-2 text-center">Mensalidade</div>
                  <div className="col-span-2 text-center">Total Pago</div>
                  <div className="col-span-2 text-center">Saldo</div>
                  <div className="col-span-1 text-center">Ações</div>
                </div>
              </div>

              {/* Linhas da Tabela */}
              <div className="divide-y divide-slate-200">
                {filteredStudents.map((student, index) => {
                  const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
                  
                  return (
                    <div 
                      key={student.id} 
                      className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      {/* Coluna Estudante */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="h-11 w-11 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 truncate">{student.name}</p>
                          <p className="text-xs text-slate-500 truncate">{student.className}</p>
                        </div>
                      </div>

                      {/* Divisor */}
                      <div className="col-span-2 flex justify-center border-l border-slate-200 pl-4">
                        {getPaymentStatusBadge(paymentInfo)}
                      </div>

                      {/* Divisor */}
                      <div className="col-span-2 text-center border-l border-slate-200 pl-4">
                        <p className="font-bold text-base text-[#F5821F]">
                          {formatCurrency(paymentInfo.monthlyFee)}
                        </p>
                      </div>

                      {/* Divisor */}
                      <div className="col-span-2 text-center border-l border-slate-200 pl-4">
                        <p className="font-bold text-base text-green-600">
                          {formatCurrency(paymentInfo.totalPaid)}
                        </p>
                      </div>

                      {/* Divisor */}
                      <div className="col-span-2 text-center border-l border-slate-200 pl-4">
                        <p className={`font-bold text-base ${
                          paymentInfo.currentBalance > 0 
                            ? 'text-blue-600' 
                            : paymentInfo.currentBalance < 0 
                            ? 'text-red-600' 
                            : 'text-slate-600'
                        }`}>
                          {paymentInfo.currentBalance > 0 ? '+' : paymentInfo.currentBalance < 0 ? '-' : ''}
                          {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                        </p>
                      </div>

                      {/* Divisor */}
                      <div className="col-span-1 flex justify-center border-l border-slate-200 pl-2">
                        <Button
                          onClick={() => onOpenPaymentModal(student.id)}
                          size="sm"
                          className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md h-9 px-4"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Info */}
      {filteredStudents.length > 0 && (
        <Card className="shadow-elegant bg-gradient-to-r from-slate-50 to-slate-100">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground">
              Mostrando <span className="font-semibold text-primary">{filteredStudents.length}</span> de{" "}
              <span className="font-semibold text-primary">{students.length}</span> estudantes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}