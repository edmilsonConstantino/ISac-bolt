// src/components/shared/RegistrationList.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Grid3x3,
  LayoutList,
  Eye,
  Edit,
  Trash2,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Pause,
  Trophy,
  User,
  Printer,
  UserCircle,
} from "lucide-react";
import { RegistrationProfileModal } from "../RegistrationProfileModal";
import { Permission } from "../../types";

// Componentes reutilizaveis
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { SearchBar, ViewToggle } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { ListFooter } from "@/components/ui/info-row";
import { GradientButton } from "@/components/ui/gradient-button";

// Interface para Matrícula
export interface Registration {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  courseId: string;
  courseName: string;
  classId?: number;
  className?: string;
  period: string; // "2025/1", "2025/2"
  enrollmentDate: string;
  status: 'active' | 'pending' | 'suspended' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'overdue';
  enrollmentFee: number;
  monthlyFee: number;
  modules?: string[];
  observations?: string;
  registrationType?: 'new' | 'renewal' | 'transfer';
  isBolsista?: boolean;
  // Campos de pagamento (ConfirmationTab)
  paidAmount?: number;
  paymentMethod?: 'cash' | 'transfer' | 'mobile' | 'check';
  paymentReference?: string;
  includeFirstMonth?: boolean;
}

interface RegistrationListProps {
  registrations: Registration[];
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin';
  onViewRegistration?: (registration: Registration) => void;
  onEditRegistration?: (registration: Registration) => void;
  onDeleteRegistration?: (registrationId: number) => void;
  onAddRegistration?: () => void;
  onRenewRegistration?: (registration: Registration) => void;
  onViewStudentProfile?: (studentId: number) => void;
  onPrintReceipt?: (registration: Registration) => void;
}

export function RegistrationList({
  registrations,
  permissions,
  currentUserRole,
  onViewRegistration,
  onEditRegistration,
  onDeleteRegistration,
  onAddRegistration,
  onRenewRegistration,
  onPrintReceipt
}: RegistrationListProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended" | "cancelled" | "completed">("active");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [profileModal, setProfileModal] = useState<{ isOpen: boolean; registrationId: number | null }>({
    isOpen: false,
    registrationId: null
  });

  // Filtros
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.courseName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || reg.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || reg.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Estatísticas
  const stats = {
    total: registrations.length,
    active: registrations.filter(r => r.status === 'active').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    suspended: registrations.filter(r => r.status === 'suspended').length,
    cancelled: registrations.filter(r => r.status === 'cancelled').length,
    completed: registrations.filter(r => r.status === 'completed').length,
    overdue: registrations.filter(r => r.paymentStatus === 'overdue').length,
    paid: registrations.filter(r => r.paymentStatus === 'paid').length,
  };

  // Helper functions
  const getStatusInfo = (status: Registration['status']) => {
    const statusMap = {
      active:    { label: 'Matriculado', color: 'bg-green-500',  textColor: 'text-green-700',  bgColor: 'bg-green-50',  icon: CheckCircle },
      pending:   { label: 'Pendente',    color: 'bg-orange-400', textColor: 'text-orange-700', bgColor: 'bg-orange-50', icon: Clock },
      suspended: { label: 'Trancado',    color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', icon: Pause },
      cancelled: { label: 'Cancelado',   color: 'bg-red-500',    textColor: 'text-red-700',    bgColor: 'bg-red-50',    icon: XCircle },
      completed: { label: 'Concluído',   color: 'bg-blue-500',   textColor: 'text-blue-700',   bgColor: 'bg-blue-50',   icon: Trophy }
    };
    return statusMap[status] ?? statusMap.cancelled;
  };

  const getPaymentStatusInfo = (status: Registration['paymentStatus']) => {
    const statusMap = {
      paid: { label: 'Pago', color: 'text-green-600', bg: 'bg-green-100' },
      pending: { label: 'Pendente', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      overdue: { label: 'Atrasado', color: 'text-red-600', bg: 'bg-red-100' }
    };
    return statusMap[status];
  };

  const formatCurrency = (value: number) => {
    return 'MT ' + new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 0
    }).format(value);
  };

  // Função para imprimir recibo de matrícula
  const handlePrintReceipt = (registration: Registration) => {
    if (onPrintReceipt) {
      onPrintReceipt(registration);
      return;
    }

    // Fallback - imprimir recibo padrão
    const printDate = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
    const enrollDate = new Date(registration.enrollmentDate).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
    const receiptNum = `MAT-${String(registration.id || 0).padStart(6, '0')}`;
    const statusLabel = registration.status === 'active' ? 'Matriculado' : registration.status === 'pending' ? 'Pendente' : registration.status === 'suspended' ? 'Trancado' : registration.status === 'completed' ? 'Concluído' : 'Cancelado';
    const payLabel = registration.paymentStatus === 'paid' ? 'Pago' : registration.paymentStatus === 'pending' ? 'Pendente' : 'Em Atraso';
    const payColor = registration.paymentStatus === 'paid' ? '#16a34a' : registration.paymentStatus === 'pending' ? '#d97706' : '#dc2626';
    const payBg   = registration.paymentStatus === 'paid' ? '#dcfce7' : registration.paymentStatus === 'pending' ? '#fef9c3' : '#fee2e2';

    const lineItems = [
      registration.enrollmentFee > 0 ? `<tr><td style="padding:7px 10px;border:1px solid #d1d5db;text-align:center;color:#374151;">1</td><td style="padding:7px 10px;border:1px solid #d1d5db;color:#374151;">Taxa de Matrícula</td><td style="padding:7px 10px;border:1px solid #d1d5db;text-align:right;font-weight:600;color:#374151;">${registration.enrollmentFee.toLocaleString('pt-MZ',{minimumFractionDigits:2})}</td></tr>` : '',
      registration.monthlyFee > 0 ? `<tr><td style="padding:7px 10px;border:1px solid #d1d5db;text-align:center;color:#374151;">${registration.enrollmentFee > 0 ? 2 : 1}</td><td style="padding:7px 10px;border:1px solid #d1d5db;color:#374151;">Mensalidade</td><td style="padding:7px 10px;border:1px solid #d1d5db;text-align:right;font-weight:600;color:#374151;">${registration.monthlyFee.toLocaleString('pt-MZ',{minimumFractionDigits:2})}</td></tr>` : '',
    ].filter(Boolean).join('');

    const total = registration.enrollmentFee + registration.monthlyFee;

    const receiptContent = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>Recibo de Matrícula — ${registration.studentName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;display:flex;justify-content:center;padding:30px 0;}
    .page{background:white;width:700px;padding:36px 44px;box-shadow:0 2px 16px rgba(0,0,0,.12);}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #004B87;padding-bottom:18px;margin-bottom:18px;}
    .brand{display:flex;align-items:center;gap:14px;}
    .logo{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#004B87,#F5821F);display:flex;align-items:center;justify-content:center;color:white;font-size:26px;font-weight:900;flex-shrink:0;}
    .brand-info h1{font-size:22px;font-weight:900;color:#004B87;}
    .brand-info p{font-size:11px;color:#6b7280;margin-top:2px;line-height:1.5;}
    .rec-box{text-align:right;}
    .rec-box .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;}
    .rec-box .number{font-size:24px;font-weight:900;color:#F5821F;}
    .rec-box .date{font-size:11px;color:#6b7280;margin-top:2px;}
    .student-block{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;gap:32px;flex-wrap:wrap;}
    .sfield label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:2px;}
    .sfield span{font-size:13px;font-weight:600;color:#111827;}
    .section-title{font-size:11px;font-weight:700;color:#004B87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;}
    .items-table{width:100%;border-collapse:collapse;margin-bottom:4px;}
    .items-table th{background:#004B87;color:white;font-size:11px;padding:8px 10px;font-weight:600;letter-spacing:.04em;text-align:left;}
    .items-table th:first-child{text-align:center;width:50px;}
    .items-table th:last-child{text-align:right;}
    .total-row td{background:#004B87;color:white;padding:9px 10px;font-weight:700;font-size:13px;}
    .total-row td:last-child{text-align:right;}
    .bottom{margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;display:flex;justify-content:space-between;align-items:flex-end;}
    .printed{font-size:10px;color:#9ca3af;}
    .sig-area{text-align:center;}
    .sig-line{width:180px;border-top:1px solid #374151;margin:28px auto 4px;}
    .sig-label{font-size:10px;color:#6b7280;}
    .stamp{width:80px;height:80px;border:2px dashed #d1d5db;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;color:#d1d5db;text-align:center;}
    @media print{body{background:white;padding:0;}.page{box-shadow:none;width:100%;padding:20px;}}
  </style>
</head>
<body>
<div class="page">
  <div class="top">
    <div class="brand">
      <div class="logo">I</div>
      <div class="brand-info">
        <h1>ISAC</h1>
        <p>Consultoria Linguística e Coaching<br/>Maputo, Moçambique</p>
      </div>
    </div>
    <div class="rec-box">
      <div class="label">Recibo de Matrícula Nº</div>
      <div class="number">${receiptNum}</div>
      <div class="date">Emitido em: ${enrollDate}</div>
    </div>
  </div>

  <div class="student-block">
    <div class="sfield"><label>Estudante</label><span>${registration.studentName}</span></div>
    <div class="sfield"><label>Nº de Estudante</label><span>${registration.studentCode || '—'}</span></div>
    <div class="sfield"><label>Curso</label><span>${registration.courseName}</span></div>
    <div class="sfield"><label>Turma</label><span>${registration.className || 'Não atribuída'}</span></div>
    <div class="sfield"><label>Período</label><span>${registration.period}</span></div>
    <div class="sfield"><label>Data de Matrícula</label><span>${enrollDate}</span></div>
    <div class="sfield"><label>Estado</label><span>${statusLabel}</span></div>
    <div class="sfield"><label>Pagamento</label>
      <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:700;background:${payBg};color:${payColor};">${payLabel}</span>
    </div>
  </div>

  <div class="section-title" style="margin-bottom:10px;">Detalhes Financeiros</div>
  <table class="items-table">
    <thead>
      <tr>
        <th>Ord.</th>
        <th>Referente a</th>
        <th style="text-align:right;">Valor (MT)</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems || `<tr><td colspan="3" style="padding:10px;text-align:center;color:#9ca3af;border:1px solid #d1d5db;">Sem itens financeiros registados</td></tr>`}
      <tr class="total-row">
        <td colspan="2">Total</td>
        <td>${total.toLocaleString('pt-MZ',{minimumFractionDigits:2})}</td>
      </tr>
    </tbody>
  </table>

  <div class="bottom">
    <div class="printed">
      Impresso no dia ${printDate}<br/>
      Sistema Académico ISAC
    </div>
    <div style="display:flex;gap:32px;align-items:flex-end;">
      <div class="stamp"><span>Carimbo</span></div>
      <div class="sig-area">
        <div class="sig-line"></div>
        <div class="sig-label">Assinatura / Secretaria</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-2xl p-8 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <PageHeaderTitle>
              Gestão de Matrículas
            </PageHeaderTitle>
            <PageHeaderSubtitle icon={<FileText className="h-5 w-5" />}>
              {stats.total} matrícula{stats.total !== 1 ? 's' : ''} registrada{stats.total !== 1 ? 's' : ''}
            </PageHeaderSubtitle>
          </div>

          {permissions.canAdd && onAddRegistration && (
            <PageHeaderActions>
              <GradientButton onClick={onAddRegistration}>
                <Plus className="h-5 w-5 mr-2" />
                Nova Matrícula
              </GradientButton>
            </PageHeaderActions>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <StatCard icon={FileText} label="Total" value={stats.total} color="slate" />
          <StatCard icon={CheckCircle} label="Ativos" value={stats.active} color="green" />
          <StatCard icon={Pause} label="Trancados" value={stats.suspended} color="orange" />
          <StatCard icon={Trophy} label="Concluídos" value={stats.completed} color="blue" />
          <StatCard icon={DollarSign} label="Atrasados" value={stats.overdue} color="red" />
        </div>
      </div>

      {/* Barra de Pesquisa + Toggle */}
      <div className="flex gap-3">
        <SearchBar
          placeholder="Buscar por estudante, código ou curso..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="flex-1"
        />
        <ViewToggle
          view={viewMode}
          onChange={setViewMode}
          gridIcon={<Grid3x3 className="h-4 w-4" />}
          listIcon={<LayoutList className="h-4 w-4" />}
        />
      </div>

      {/* Filtros por Botões — Status */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all" as const,       label: "Todos",       count: stats.total,     activeClass: "bg-[#004B87] text-white border-[#004B87]" },
          { value: "active" as const,    label: "Matriculados", count: stats.active,   activeClass: "bg-emerald-500 text-white border-emerald-500" },
          { value: "pending" as const,   label: "Pendentes",   count: stats.pending,   activeClass: "bg-orange-400 text-white border-orange-400" },
          { value: "suspended" as const, label: "Trancados",   count: stats.suspended, activeClass: "bg-yellow-500 text-white border-yellow-500" },
          { value: "cancelled" as const, label: "Cancelados",  count: stats.cancelled, activeClass: "bg-red-500 text-white border-red-500" },
          { value: "completed" as const, label: "Concluídos",  count: stats.completed, activeClass: "bg-blue-500 text-white border-blue-500" },
        ].map(btn => (
          <button
            key={btn.value}
            onClick={() => setStatusFilter(btn.value)}
            className={`h-9 px-4 rounded-lg text-sm font-medium border-2 transition-all flex items-center gap-2 ${
              statusFilter === btn.value
                ? `${btn.activeClass} shadow-md`
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {btn.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              statusFilter === btn.value ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {btn.count}
            </span>
          </button>
        ))}
      </div>


      {/* Estado Vazio */}
      {filteredRegistrations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma matrícula encontrada"
          description={searchTerm ? "Tente ajustar os filtros de busca" : "Não há matrículas para este filtro"}
        />
      ) : (
        <>
          {/* VISUALIZAÇÃO EM GRELHA */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegistrations.map((registration) => {
                const statusInfo = getStatusInfo(registration.status);
                const paymentInfo = getPaymentStatusInfo(registration.paymentStatus);
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={registration.id}
                    className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white"
                  >
                    <div className={`h-2 ${statusInfo.color}`}></div>

                    <CardContent className="p-5">
                      {/* Header com Estudante */}
                     {/* Header com Estudante */}
                      <div className="flex items-start justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white font-bold text-lg">
                              {registration.studentName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-[#004B87] truncate" title={registration.studentName}>
                              {registration.studentName}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {registration.studentCode}
                            </p>
                            <Badge className={`text-[10px] mt-1.5 ${paymentInfo.bg} ${paymentInfo.color} border-0`}>
                              {paymentInfo.label}
                            </Badge>
                          </div>
                        </div>

                        {/* Botões de acção - canto superior direito */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {permissions.canDelete && onDeleteRegistration && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border-2 border-red-200 hover:border-red-300 transition-all duration-200"
                              onClick={() => onDeleteRegistration(registration.id)}
                              title="Cancelar matrícula"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Informações da Matrícula */}
                      <div className="space-y-2.5 mb-4">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-7 w-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-3.5 w-3.5 text-[#004B87]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-700 truncate" title={registration.courseName}>
                              {registration.courseName}
                            </p>
                          </div>
                        </div>

                        {registration.className && (
                          <div className="flex items-center gap-2 text-xs">
                            <div className="h-7 w-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="h-3.5 w-3.5 text-[#004B87]" />
                            </div>
                            <span className="text-slate-600 truncate" title={registration.className}>
                              {registration.className}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-7 w-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-[#004B87]" />
                          </div>
                          <div className="flex-1">
                            <span className="text-slate-600">Período: </span>
                            <span className="font-semibold text-slate-800">{registration.period}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-7 w-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-slate-600">Mensalidade: </span>
                            <span className="font-semibold text-green-700">
                              {formatCurrency(registration.monthlyFee)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg ${statusInfo.bgColor} mb-4`}>
                        <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                        <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Ações */}
                      <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                        {/* Linha 1: Ver Perfil e Baixar Recibo */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 text-xs border-2 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white transition-all"
                            onClick={() => setProfileModal({ isOpen: true, registrationId: registration.id })}
                            title="Ver Perfil da Matrícula"
                          >
                            <UserCircle className="h-3.5 w-3.5 mr-1.5" />
                            Perfil
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 text-xs border-2 border-slate-300 text-slate-600 hover:bg-slate-600 hover:text-white transition-all"
                            onClick={() => handlePrintReceipt(registration)}
                            title="Baixar Recibo de Matrícula"
                          >
                            <Printer className="h-3.5 w-3.5 mr-1.5" />
                            Recibo
                          </Button>
                        </div>

                        {/* Linha 2: Apenas Editar */}
                        {permissions.canEdit && onEditRegistration && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-9 text-xs border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white transition-all"
                            onClick={() => onEditRegistration(registration)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* VISUALIZAÇÃO EM LISTA */}
          {viewMode === "list" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
              {/* Header da Tabela */}
              <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white px-6 py-4">
                <div className="grid grid-cols-12 gap-4 items-center font-semibold text-sm">
                  <div className="col-span-3">Estudante</div>
                  <div className="col-span-2">Curso</div>
                  <div className="col-span-2">Período</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Pagamento</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>
              </div>

              {/* Linhas da Tabela */}
              <div className="divide-y divide-slate-100">
                {filteredRegistrations.map((registration) => {
                  const statusInfo = getStatusInfo(registration.status);
                  const paymentInfo = getPaymentStatusInfo(registration.paymentStatus);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={registration.id}
                      className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      {/* Estudante */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {registration.studentName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-800 truncate" title={registration.studentName}>
                            {registration.studentName}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">
                            {registration.studentCode}
                          </p>
                        </div>
                      </div>

                      {/* Curso */}
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-slate-700 truncate" title={registration.courseName}>
                          {registration.courseName}
                        </p>
                        {registration.className && (
                          <p className="text-xs text-slate-500 truncate">{registration.className}</p>
                        )}
                      </div>

                      {/* Período */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-700">
                            {registration.period}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor}`}>
                          <StatusIcon className={`h-3.5 w-3.5 ${statusInfo.textColor}`} />
                          <span className={`text-xs font-semibold ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Pagamento */}
                      <div className="col-span-2">
                        <Badge className={`${paymentInfo.bg} ${paymentInfo.color} border-0 text-xs`}>
                          {paymentInfo.label}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatCurrency(registration.monthlyFee)}/mês
                        </p>
                      </div>

                      {/* Ações */}
                      <div className="col-span-1 flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white rounded-lg"
                          onClick={() => setProfileModal({ isOpen: true, registrationId: registration.id })}
                          title="Ver Perfil da Matrícula"
                        >
                          <UserCircle className="h-4 w-4" />
                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-slate-300 text-slate-600 hover:bg-slate-600 hover:text-white rounded-lg"
                          onClick={() => handlePrintReceipt(registration)}
                          title="Baixar Recibo"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>

                        {permissions.canEdit && onEditRegistration && (
                          <Button
                            size="icon"
                            className="h-8 w-8 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white rounded-lg shadow-md"
                            onClick={() => onEditRegistration(registration)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {permissions.canDelete && onDeleteRegistration && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-lg"
                            onClick={() => onDeleteRegistration(registration.id)}
                            title="Cancelar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rodapé */}
      {filteredRegistrations.length > 0 && (
        <ListFooter
          showing={filteredRegistrations.length}
          total={registrations.length}
          hasFilters={!!searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setPaymentFilter("all");
          }}
        />
      )}

      <RegistrationProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, registrationId: null })}
        registrationId={profileModal.registrationId}
      />
    </div>
  );
}
