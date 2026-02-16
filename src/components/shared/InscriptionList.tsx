// InscriptionList.tsx - ESTILO MODERNO COM TOGGLE GRID/LISTA
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, Search, RefreshCw, BookOpen, Edit2,
  CheckCircle2, XCircle, Calendar, Mail, Key, Settings,
  Grid3x3, List, Users, Trash2, AlertTriangle, Download,
  User, Phone, CreditCard, Save, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InscriptionStudentModal } from "./InscriptionStudentModal";
import { InscriptionSettingsModal } from "./InscriptionSettingsModal";
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
  enrollment_number: string;
  gender: 'M' | 'F';
  phone?: string;
  birth_date?: string;
  address?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
}

interface InscriptionListProps {
  onProceedToRegistration?: (studentId: number) => void;
}

export function InscriptionList({ onProceedToRegistration }: InscriptionListProps) {
  const [students, setStudents] = useState<InscribedStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<InscribedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estados para modais
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; student: InscribedStudent | null }>({ isOpen: false, student: null });
  const [editModal, setEditModal] = useState<{ isOpen: boolean; student: InscribedStudent | null }>({ isOpen: false, student: null });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bi_number: '',
    phone: '',
    gender: 'M' as 'M' | 'F',
    birth_date: '',
    address: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const API_URL = 'http://localhost/API-LOGIN/api';

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchInscribedStudents = async () => {
    setIsLoading(true);
    try {
      // Verificar se o token existe
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('❌ Token não encontrado no localStorage');
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      console.log('🔑 Token encontrado, fazendo requisição...');

      let response = await fetch(`${API_URL}/students.php?status=inscrito&with_credentials=true`, {
        headers: getAuthHeaders()
      });

      // Verificar status da resposta
      if (response.status === 401) {
        console.error('❌ Token inválido ou expirado (401)');
        toast.error('Sessão expirada. Faça login novamente.');
        localStorage.removeItem('access_token');
        return;
      }

      let result = await response.json();

      if (!result.success || !result.data) {
        response = await fetch(`${API_URL}/students.php?with_credentials=true`, { headers: getAuthHeaders() });

        if (response.status === 401) {
          console.error('❌ Token inválido ou expirado (401)');
          toast.error('Sessão expirada. Faça login novamente.');
          localStorage.removeItem('access_token');
          return;
        }

        result = await response.json();
      }

      if (result.success && Array.isArray(result.data)) {
        const inscribed = result.data.filter((s: any) =>
          s && s.username && s.username.trim().length > 0
        );

        console.log('✅ Estudantes Inscritos:', inscribed);
        setStudents(inscribed);
        setFilteredStudents(inscribed);
      } else {
        console.error('❌ Resposta da API inválida:', result);
        toast.error('Erro ao carregar estudantes inscritos');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estudantes inscritos:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInscribedStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.username.toLowerCase().includes(term) ||
        s.bi_number.toLowerCase().includes(term) ||
        s.enrollment_number.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, statusFilter, students]);

  const handleInscriptionSuccess = () => {
    fetchInscribedStudents();
  };

  const handleProceedToRegistration = (studentId: number) => {
    if (onProceedToRegistration) {
      onProceedToRegistration(studentId);
    }
    setIsModalOpen(false);
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
    setEditForm({
      name: student.name || '',
      email: student.email || '',
      bi_number: student.bi_number || '',
      phone: student.phone || '',
      gender: student.gender || 'M',
      birth_date: student.birth_date || '',
      address: student.address || ''
    });
    setEditModal({ isOpen: true, student });
  };

  // Salvar edição da inscrição
  const handleSaveEdit = async () => {
    if (!editModal.student) return;

    if (!editForm.name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }
    if (!editForm.bi_number.trim()) {
      toast.error('O número de BI é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/students.php?id=${editModal.student.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          bi_number: editForm.bi_number,
          phone: editForm.phone,
          gender: editForm.gender,
          birth_date: editForm.birth_date,
          address: editForm.address
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Dados da inscrição actualizados com sucesso!');
        setEditModal({ isOpen: false, student: null });
        fetchInscribedStudents();
      } else {
        toast.error(result.message || 'Erro ao actualizar dados');
      }
    } catch (error) {
      console.error('Erro ao actualizar:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  // Baixar recibo de inscrição
  const handleDownloadReceipt = (student: InscribedStudent) => {
    // Criar conteúdo do recibo
    const receiptContent = `
╔════════════════════════════════════════════════════════════════╗
║                    RECIBO DE INSCRIÇÃO                         ║
║                   OXFORD - Sistema Académico                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  DADOS DO ESTUDANTE                                            ║
║  ─────────────────────────────────────────────────────────     ║
║  Nome Completo: ${student.name.padEnd(45)}║
║  Nº de BI:      ${student.bi_number.padEnd(45)}║
║  Email:         ${student.email.padEnd(45)}║
║  Telefone:      ${(student.phone || 'N/A').padEnd(45)}║
║  Género:        ${(student.gender === 'M' ? 'Masculino' : 'Feminino').padEnd(45)}║
║                                                                ║
║  DADOS DA INSCRIÇÃO                                            ║
║  ─────────────────────────────────────────────────────────     ║
║  Nº Matrícula:  ${student.enrollment_number.padEnd(45)}║
║  Username:      ${student.username.padEnd(45)}║
║  Data Inscrição: ${formatDate(student.created_at).padEnd(44)}║
║  Status:        ${(student.status === 'ativo' ? 'Activo' : 'Inactivo').padEnd(45)}║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Este documento comprova a inscrição do estudante acima        ║
║  identificado no sistema académico OXFORD.                     ║
║                                                                ║
║  Data de Emissão: ${new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' }).padEnd(43)}║
╚════════════════════════════════════════════════════════════════╝
    `.trim();

    // Criar blob e baixar
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo_inscricao_${student.enrollment_number}_${student.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Recibo de inscrição baixado com sucesso!');
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
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(true)}
              className="border-2 border-slate-300 hover:border-slate-400"
              title="Configurações de Inscrição"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
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
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
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
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
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
            <p className="text-2xl font-bold text-slate-700">{stats.inactive}</p>
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
          onClick={fetchInscribedStudents}
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
      {isLoading ? (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <RefreshCw className="h-12 w-12 text-[#F5821F] animate-spin mb-4" />
              <p className="text-slate-500">Carregando estudantes inscritos...</p>
            </div>
          </CardContent>
        </Card>
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
                      Nº Matrícula
                    </span>
                    <span className="font-mono font-bold text-[11px] text-slate-700">{student.enrollment_number}</span>
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
                    <span className="font-mono text-sm">{student.enrollment_number}</span>
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
      {editModal.isOpen && editModal.student && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Edit2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Editar Inscrição</h3>
                    <p className="text-blue-100 text-sm">Informações do estudante</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditModal({ isOpen: false, student: null })}
                  className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Formulário */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {/* Nome Completo */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    <User className="h-3 w-3 inline mr-1" />
                    Nome Completo *
                  </label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome completo do estudante"
                    className="h-11 border-2 border-slate-200 focus:border-[#F5821F]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    <Mail className="h-3 w-3 inline mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="h-11 border-2 border-slate-200 focus:border-[#F5821F]"
                  />
                </div>

                {/* BI e Telefone em linha */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      <CreditCard className="h-3 w-3 inline mr-1" />
                      Número de BI *
                    </label>
                    <Input
                      value={editForm.bi_number}
                      onChange={(e) => setEditForm({ ...editForm, bi_number: e.target.value })}
                      placeholder="000000000AA000"
                      className="h-11 border-2 border-slate-200 focus:border-[#F5821F]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      <Phone className="h-3 w-3 inline mr-1" />
                      Telefone
                    </label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+258 84 000 0000"
                      className="h-11 border-2 border-slate-200 focus:border-[#F5821F]"
                    />
                  </div>
                </div>

                {/* Género e Data de Nascimento em linha */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      Género
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'M' | 'F' })}
                      className="w-full h-11 px-3 border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:outline-none text-sm"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Data de Nascimento
                    </label>
                    <Input
                      type="date"
                      value={editForm.birth_date}
                      onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                      className="h-11 border-2 border-slate-200 focus:border-[#F5821F]"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                    Endereço
                  </label>
                  <Input
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Endereço completo"
                    className="h-11 border-2 border-slate-200 focus:border-[#F5821F]"
                  />
                </div>

                {/* Info de dados não editáveis */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-700">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Dados como username, nº de matrícula e credenciais de acesso não podem ser editados aqui.
                  </p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setEditModal({ isOpen: false, student: null })}
                  className="flex-1 h-12 border-2 border-slate-300 hover:border-slate-400 font-bold"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex-1 h-12 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-bold"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Guardar Alterações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
