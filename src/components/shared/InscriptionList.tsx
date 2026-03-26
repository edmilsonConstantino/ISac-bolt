// InscriptionList.tsx - ESTILO MODERNO COM TOGGLE GRID/LISTA
import { useState, useEffect } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, Search, RefreshCw, BookOpen, Edit2,
  CheckCircle2, XCircle, Calendar, Mail, Key, Settings,
  Grid3x3, List, Users, Trash2, AlertTriangle, Download,
  User, Phone, CreditCard, Save, X, Loader2, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InscriptionStudentModal } from "./InscriptionStudentModal";
import { EditInscriptionModal } from "./EditInscriptionModal";
import { InscriptionSettingsModal } from "./InscriptionSettingsModal";
import { RegistrationStudentModal } from "./reusable/RegistrationStudentModal";
import registrationService from "@/services/registrationService";
import type { CreateRegistrationData } from "@/services/registrationService";
import type { Registration } from "./RegistrationList";
import { SearchBar, ViewToggle } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { GradientButton } from "@/components/ui/gradient-button";
import { ListFooter } from "@/components/ui/info-row";

interface InscribedStudent {
  id: number;
  name: string;
  email: string;
  bi_number: string;
  username: string;
  gender: 'M' | 'F';
  phone?: string;
  birth_date?: string;
  address?: string;
  emergency_contact_1?: string;
  emergency_contact_2?: string;
  notes?: string;
  is_bolsista?: number;
  status: 'ativo' | 'inativo';
  created_at: string;
  has_registration: 0 | 1;
}

interface InscriptionListProps {
  onProceedToRegistration?: (studentId: number) => void;
  onStudentsChange?: (students: InscribedStudent[]) => void;
  currentUserRole?: string;
  // undefined = pai ainda a carregar | array = dados prontos
  initialStudents?: InscribedStudent[] | undefined;
}

export function InscriptionList({ onProceedToRegistration, onStudentsChange, currentUserRole, initialStudents }: InscriptionListProps) {
  const [students, setStudents] = useState<InscribedStudent[]>(initialStudents ?? []);
  const [filteredStudents, setFilteredStudents] = useState<InscribedStudent[]>(initialStudents ?? []);
  const [isLoading, setIsLoading] = useState(false);
  // loading = true se não há dados do pai (vai buscar sozinho) OU se pai ainda não terminou (undefined)
  const [initialLoading, setInitialLoading] = useState(initialStudents === undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estados para modais
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; student: InscribedStudent | null }>({ isOpen: false, student: null });
  const [editInscriptionModal, setEditInscriptionModal] = useState<{ isOpen: boolean; student: InscribedStudent | null }>({ isOpen: false, student: null });
  const [regModal, setRegModal] = useState<{ isOpen: boolean; studentId: number | null }>({ isOpen: false, studentId: null });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchInscribedStudents = async (silent = false) => {
    if (!silent) setInitialLoading(true);
    setIsLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.');
        setStudents([]); setFilteredStudents([]);
        return;
      }

      // Pedido único — o backend filtra directamente na BD (has_username=1)
      const response = await fetch(
        `${API_URL}/students.php?has_username=1`,
        { headers: getAuthHeaders(), signal: controller.signal }
      );

      if (response.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('access_token');
        setStudents([]); setFilteredStudents([]);
        return;
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setStudents(result.data);
        setFilteredStudents(result.data);
        onStudentsChange?.(result.data);
      } else {
        setStudents([]); setFilteredStudents([]);
        onStudentsChange?.([]);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Erro ao buscar inscrições:', error);
      }
      setStudents([]); setFilteredStudents([]);
    } finally {
      clearTimeout(timeout);
      setIsLoading(false);
      setInitialLoading(false);
    }
  };

  // Sem dados do pai → buscar autonomamente
  useEffect(() => {
    if (initialStudents === undefined) fetchInscribedStudents(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronizar quando o pai entregar (ou actualizar) os dados
  useEffect(() => {
    if (initialStudents !== undefined) {
      setStudents(initialStudents as InscribedStudent[]);
      setFilteredStudents(initialStudents as InscribedStudent[]);
      setInitialLoading(false);
    }
  }, [initialStudents]);

  // Auto-refresh silencioso: não mostra spinner, apenas actualiza os dados
  useAutoRefresh(() => fetchInscribedStudents(true), { interval: 60_000 });

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.username.toLowerCase().includes(term) ||
        s.bi_number.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, statusFilter, students]);

  const handleInscriptionSuccess = () => {
    setSearchTerm("");
    fetchInscribedStudents();
  };

  const handleProceedToRegistration = (studentId: number) => {
    if (onProceedToRegistration) {
      onProceedToRegistration(studentId);
    }
    setIsModalOpen(false);
  };

  const handleSaveRegistration = async (registrationData: Partial<Registration>) => {
    // Sem try-catch aqui: erros propagam para RegistrationStudentModal.handleSave()
    // que já tem o error handling correcto (mostra error.message da API)
    await registrationService.create(registrationData as unknown as CreateRegistrationData);

    // Capturar o ID antes de qualquer limpeza
    const enrolledId = regModal.studentId;

    // Actualização local imediata — botão desaparece sem esperar pela API
    if (enrolledId !== null) {
      setStudents(prev =>
        prev.map(s => s.id === enrolledId ? { ...s, has_registration: 1 as const } : s)
      );
      setFilteredStudents(prev =>
        prev.map(s => s.id === enrolledId ? { ...s, has_registration: 1 as const } : s)
      );
    }

    setSearchTerm("");
    // Sincronizar com a API em segundo plano
    fetchInscribedStudents();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para rejeitar/cancelar inscrição
  const handleRejectInscription = async (student: InscribedStudent) => {
    try {
      const response = await fetch(`${API_URL}/students.php?id=${student.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (result.success) {
        toast.success(`Inscrição de ${student.name} foi rejeitada com sucesso!`);
        setRejectModal({ isOpen: false, student: null });
        fetchInscribedStudents();
      } else {
        toast.error(result.message || 'Erro ao rejeitar inscrição');
      }
    } catch (error) {
      console.error('Erro ao rejeitar inscrição:', error);
      toast.error('Erro ao rejeitar inscrição');
    }
  };

  // Abrir modal de edição
  const handleOpenEditModal = (student: InscribedStudent) => {
    setEditInscriptionModal({ isOpen: true, student });
  };

  // Imprimir recibo de inscrição
  const handleDownloadReceipt = (student: InscribedStudent) => {
    const printDate = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
    const inscDate = formatDate(student.created_at);
    const receiptNum = `INS-${String(student.id).padStart(6, '0')}`;
    const gender = student.gender === 'M' ? 'Masculino' : 'Feminino';

    const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>Recibo de Inscrição — ${student.name}</title>
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
    .section-title{font-size:11px;font-weight:700;color:#004B87;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;}
    .fields{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-bottom:20px;}
    .field label{font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:2px;}
    .field span{font-size:13px;font-weight:600;color:#111827;}
    .field.full{grid-column:1/-1;}
    .status-badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;}
    .status-ativo{background:#dcfce7;color:#16a34a;}
    .status-inativo{background:#f1f5f9;color:#64748b;}
    .note{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px;font-size:12px;color:#1e40af;margin-bottom:20px;line-height:1.6;}
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

  <!-- Header -->
  <div class="top">
    <div class="brand">
      <div class="logo">I</div>
      <div class="brand-info">
        <h1>ISAC</h1>
        <p>Consultoria Linguística e Coaching<br/>Maputo, Moçambique</p>
      </div>
    </div>
    <div class="rec-box">
      <div class="label">Recibo de Inscrição Nº</div>
      <div class="number">${receiptNum}</div>
      <div class="date">Emitido em: ${inscDate}</div>
    </div>
  </div>

  <!-- Dados pessoais -->
  <div class="section-title">Dados do Estudante</div>
  <div class="fields">
    <div class="field full"><label>Nome Completo</label><span>${student.name}</span></div>
    <div class="field"><label>Nº de BI</label><span>${student.bi_number || '—'}</span></div>
    <div class="field"><label>Género</label><span>${gender}</span></div>
    <div class="field"><label>Email</label><span>${student.email}</span></div>
    <div class="field"><label>Telefone</label><span>${student.phone || '—'}</span></div>
  </div>

  <!-- Dados da inscrição -->
  <div class="section-title">Dados da Inscrição</div>
  <div class="fields">
    <div class="field"><label>Username / Nº de Estudante</label><span>${student.username}</span></div>
    <div class="field"><label>Data de Inscrição</label><span>${inscDate}</span></div>
    <div class="field"><label>Estado</label>
      <span class="status-badge ${student.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
        ${student.status === 'ativo' ? '✓ Activo' : '✕ Inactivo'}
      </span>
    </div>
  </div>

  <!-- Nota -->
  <div class="note">
    Este documento comprova que o(a) estudante <strong>${student.name}</strong> se encontra
    devidamente inscrito(a) no sistema académico ISAC com o número de identificação
    <strong>${student.username}</strong>, sendo válido para os devidos efeitos académicos e administrativos.
  </div>

  <!-- Footer -->
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

    const win = window.open('', '_blank', 'width=820,height=860');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    toast.success('Recibo de inscrição aberto para impressão!');
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'ativo').length,
    inactive: students.filter(s => s.status === 'inativo').length
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#004B87] mb-2 flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-xl flex items-center justify-center shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              Gestão de Inscrições
            </h2>
            <p className="text-slate-600 flex items-center gap-2 ml-1">
              <Users className="h-4 w-4" />
              Estudantes inscritos no sistema com credenciais de acesso
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUserRole !== 'academic_admin' && (
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
                className="border-2 border-slate-300 hover:border-slate-400"
                title="Configurações de Inscrição"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            )}
            <GradientButton onClick={() => setIsModalOpen(true)}>
              <UserPlus className="h-5 w-5" />
              Nova Inscrição
            </GradientButton>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
              statusFilter === 'all' ? 'border-[#004B87] shadow-lg' : 'border-slate-100'
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="h-4 w-4 text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">Total Inscritos</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{initialLoading ? '—' : stats.total}</p>
          </div>

          <div
            className={`bg-green-50 rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
              statusFilter === 'ativo' ? 'border-green-500 shadow-lg' : 'border-green-200'
            }`}
            onClick={() => setStatusFilter('ativo')}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Activos</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{initialLoading ? '—' : stats.active}</p>
          </div>

          <div
            className={`bg-slate-50 rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-lg ${
              statusFilter === 'inativo' ? 'border-slate-500 shadow-lg' : 'border-slate-200'
            }`}
            onClick={() => setStatusFilter('inativo')}
          >
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-slate-600" />
              <span className="text-xs text-slate-700 font-medium">Inactivos</span>
            </div>
            <p className="text-2xl font-bold text-slate-700">{initialLoading ? '—' : stats.inactive}</p>
          </div>
        </div>
      </div>

      {/* Search Bar + View Toggle */}
      <div className="flex gap-3">
        <SearchBar
          placeholder="Pesquisar por nome, email, username, BI ou nº matrícula..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <Button
          variant="outline"
          onClick={() => fetchInscribedStudents(false)}
          className="h-12 px-4 rounded-xl border-2"
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>

        <ViewToggle
          view={viewMode}
          onChange={setViewMode}
          gridIcon={<Grid3x3 className="h-4 w-4" />}
          listIcon={<List className="h-4 w-4" />}
        />
      </div>

      {/* Students Display */}
      {initialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
              <div className="h-1.5 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <div className="h-2.5 bg-slate-200 rounded w-full" />
                  <div className="h-2.5 bg-slate-200 rounded w-4/5" />
                  <div className="h-2.5 bg-slate-200 rounded w-3/5" />
                </div>
                <div className="h-9 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhum estudante encontrado"
          description={
            searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Nenhum estudante inscrito ainda'
          }
          action={
            !searchTerm && statusFilter === 'all' ? (
              <GradientButton onClick={() => setIsModalOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Fazer Primeira Inscrição
              </GradientButton>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        // ============ VISUALIZAÇÃO EM GRID (CARDS) ============
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white rounded-2xl"
            >
              {/* Barra superior com gradiente */}
              <div className="h-1.5 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]" />

              <CardContent className="p-5">
                {/* Header do card: avatar + nome + botão delete */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md",
                      student.gender === 'M'
                        ? "bg-gradient-to-br from-[#004B87] to-[#0066B3]"
                        : "bg-gradient-to-br from-[#F5821F] to-[#FF9933]"
                    )}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Indicador de status */}
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                      student.status === 'ativo' ? "bg-emerald-500" : "bg-slate-300"
                    }`} />
                  </div>

                  {/* Nome + email + badge */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight mb-0.5">
                      {student.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mb-1.5">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      {student.email}
                    </p>
                    <Badge
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-semibold gap-1 border-0",
                        student.status === 'ativo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {student.status === 'ativo' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {student.status === 'ativo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  {/* Botão delete */}
                  <button
                    onClick={() => setRejectModal({ isOpen: true, student })}
                    className="flex-shrink-0 h-7 w-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200"
                    title="Rejeitar Inscrição"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Dados do estudante */}
                <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 mb-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <Key className="h-3 w-3 text-[#F5821F]" />
                      Username
                    </span>
                    <code className="bg-white border border-slate-200 text-[#004B87] text-[10px] font-mono px-2 py-0.5 rounded-lg">
                      {student.username}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <BookOpen className="h-3 w-3 text-[#F5821F]" />
                      Username
                    </span>
                    <span className="font-mono font-bold text-[11px] text-slate-700">{student.username}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <CreditCard className="h-3 w-3 text-[#F5821F]" />
                      BI
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">{student.bi_number}</span>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar className="h-3 w-3 text-[#F5821F]" />
                      Inscrição
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700">{formatDate(student.created_at)}</span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(student)}
                      className="flex-1 h-9 text-xs border-2 border-[#004B87]/20 text-[#004B87] hover:bg-[#004B87] hover:text-white hover:border-[#004B87] transition-all font-semibold rounded-xl"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                      Editar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(student)}
                      className="flex-1 h-9 text-xs border-2 border-[#F5821F]/30 text-[#F5821F] hover:bg-[#F5821F] hover:text-white hover:border-[#F5821F] transition-all font-semibold rounded-xl"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Recibo
                    </Button>
                  </div>

                  {!student.has_registration && (
                    <Button
                      size="sm"
                      onClick={() => setRegModal({ isOpen: true, studentId: student.id })}
                      className="w-full h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all"
                    >
                      <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                      Matricular
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // ============ VISUALIZAÇÃO EM LISTA (TABELA) ============
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
              <div className="grid grid-cols-12 gap-4 p-4">
                <div className="col-span-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Estudante</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">BI / Username</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Nº Matrícula</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Data Inscrição</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Status</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ações</span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={cn(
                      "h-11 w-11 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0",
                      student.gender === 'M' ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-pink-500 to-pink-600"
                    )}>
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">{student.name}</p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <p className="text-xs text-slate-600 mb-1">{student.bi_number}</p>
                    <code className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono text-[#004B87]">
                      {student.username}
                    </code>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="font-mono text-sm">{student.username}</span>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="text-sm text-slate-600 flex items-center justify-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(student.created_at)}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <Badge
                      variant={student.status === 'ativo' ? 'default' : 'secondary'}
                      className={cn(
                        "gap-1 text-[10px]",
                        student.status === 'ativo' ? 'bg-green-600' : 'bg-slate-400'
                      )}
                    >
                      {student.status === 'ativo' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="col-span-2 flex justify-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditModal(student)}
                      className="h-8 w-8 p-0 border-2 border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white"
                      title="Editar Inscrição"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(student)}
                      className="h-8 w-8 p-0 border-2 border-green-300 text-green-600 hover:bg-green-600 hover:text-white"
                      title="Baixar Recibo"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>

                    {!student.has_registration && (
                      <Button
                        size="sm"
                        onClick={() => setRegModal({ isOpen: true, studentId: student.id })}
                        className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                        title="Matricular Estudante"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectModal({ isOpen: true, student })}
                      className="h-8 w-8 p-0 border-2 border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                      title="Rejeitar Inscrição"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      {filteredStudents.length > 0 && (
        <ListFooter
          showing={filteredStudents.length}
          total={students.length}
          hasFilters={!!searchTerm || statusFilter !== 'all'}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
        />
      )}

      {/* Modals */}
      <InscriptionStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleInscriptionSuccess}
        onProceedToRegistration={handleProceedToRegistration}
      />

      <InscriptionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <RegistrationStudentModal
        isOpen={regModal.isOpen}
        onClose={() => setRegModal({ isOpen: false, studentId: null })}
        isEditing={false}
        onSave={handleSaveRegistration}
        preSelectedStudentId={regModal.studentId}
      />

      {/* Modal de Confirmação de Rejeição */}
      {rejectModal.isOpen && rejectModal.student && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200">
            {/* Header com ícone de alerta */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Rejeitar Inscrição</h3>
                  <p className="text-red-100 text-sm">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <p className="text-slate-600 text-center mb-4">
                Tem certeza que deseja rejeitar a inscrição de:
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="font-bold text-lg text-[#004B87] text-center">{rejectModal.student.name}</p>
                <p className="text-sm text-slate-500 text-center">{rejectModal.student.email}</p>
              </div>
              <p className="text-sm text-red-600 text-center mb-6">
                O estudante e todas as suas credenciais serão removidos do sistema.
              </p>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setRejectModal({ isOpen: false, student: null })}
                  className="flex-1 h-12 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleRejectInscription(rejectModal.student!)}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sim, Rejeitar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Inscrição */}
      <EditInscriptionModal
        isOpen={editInscriptionModal.isOpen}
        onClose={() => setEditInscriptionModal({ isOpen: false, student: null })}
        student={editInscriptionModal.student}
        onSuccess={fetchInscribedStudents}
      />
    </div>
  );
}
