// src/components/StudentDashboard.tsx (Código Atualizado)
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Download, 
  Play, 
  MessageCircle, 
  Trophy, 
  Clock,
  Star,
  LogOut,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  HelpCircle,
  Settings,
  GraduationCap,
  Zap
} from "lucide-react";

// Import dos hooks compartilhados
import { useStudentData } from "@/hooks/useData";
import { usePaymentData } from "@/hooks/usePaymentData";
import { StudentFinanceModal } from "@/components/Students/StudentFinanceModal";
import { useAuthStore } from "@/store/authStore";

interface StudentDashboardProps {
  onLogout?: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  // Dados do auth store (usuário logado)
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Se não houver usuário, não mostramos dados pessoais
  const currentStudentId = user?.id ?? undefined;

  // Hooks de dados compartilhados
  const { getStudentById } = useStudentData();
  const { getStudentReadOnlyInfo, updatePayment, recordPayment } = usePaymentData();

  // Estados para modais
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Dados do estudante atual
  const studentData = currentStudentId ? getStudentById(currentStudentId) : null;
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Visitante';
  const paymentInfo = getStudentReadOnlyInfo( // ✅ Usar método específico para estudantes
    currentStudentId ?? 0,
    displayName,
    studentData?.level ?? '—'
  );

  const [grades] = useState([
    { subject: "Grammar", grade: 8.5, status: "approved", period: "1º Bimestre", feedback: "Excelente domínio das estruturas básicas" },
    { subject: "Listening", grade: 9.0, status: "approved", period: "1º Bimestre", feedback: "Compreensão auditiva muito boa" },
    { subject: "Speaking", grade: 7.8, status: "approved", period: "1º Bimestre", feedback: "Precisa praticar mais a fluência" },
    { subject: "Writing", grade: 8.2, status: "approved", period: "1º Bimestre", feedback: "Boa estruturação de textos" },
    { subject: "Reading", grade: 9.2, status: "approved", period: "1º Bimestre", feedback: "Excelente compreensão textual" }
  ]);

  const [schedule] = useState([
    { day: "Segunda", time: "14:00-15:30", topic: "Business English", type: "class" },
    { day: "Quarta", time: "14:00-15:30", topic: "Conversation Practice", type: "class" },
    { day: "Sexta", time: "16:00-17:00", topic: "Essay Writing - Deadline", type: "assignment" },
    { day: "Sábado", time: "10:00-11:30", topic: "Pronunciation Workshop", type: "workshop" }
  ]);

  const [materials] = useState([
    { name: "Unit 5 - Audio Files", type: "audio", size: "15.2 MB", downloads: 45 },
    { name: "Grammar Exercises", type: "pdf", size: "2.1 MB", downloads: 89 },
    { name: "Conversation Videos", type: "video", size: "125.4 MB", downloads: 67 },
    { name: "Pronunciation Guide", type: "audio", size: "8.7 MB", downloads: 33 }
  ]);

  // Formatação de moeda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  // Cores para grades e status
  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getPaymentStatusColor = () => {
    if (paymentInfo.overduePayments.length > 0) return "text-red-600";
    if (paymentInfo.currentBalance > 0) return "text-blue-600";
    return "text-green-600";
  };

  const getPaymentStatusText = () => {
    if (paymentInfo.overduePayments.length > 0) return "Em Atraso";
    if (paymentInfo.currentBalance > 0) return "Com Crédito";
    return "Em Dia";
  };

  // Ações rápidas - removidas as funcionalidades desnecessárias
  const quickActions = [
    { id: 'payment', label: 'Ver Situação Financeira', icon: DollarSign, color: 'text-green-600' },
    { id: 'support', label: 'Falar com Suporte', icon: HelpCircle, color: 'text-purple-600' },
    { id: 'profile', label: 'Atualizar Perfil', icon: Settings, color: 'text-gray-600' }
  ];

  const handleQuickAction = (actionId: string) => {
    setSelectedAction(actionId);
    
    switch (actionId) {
      case 'payment':
        setPaymentModal(true);
        break;
      case 'support':
        // Abrir WhatsApp ou sistema de suporte real
        window.open('https://wa.me/258840000000', '_blank');
        break;
      case 'profile':
        // Implementar funcionalidade de atualização de perfil
        console.log('Abrindo configurações do perfil');
        break;
    }
  };

  // Handlers para pagamento
  const handleRecordPayment = (amount: number, method: any, monthReference: string, description?: string) => {
    recordPayment(currentStudentId, amount, monthReference, method, description);
  };

  const averageGrade = (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">M007 Oxford</h1>
                <p className="text-sm text-muted-foreground">Portal do Estudante</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium">{displayName}</p>
                <p className="text-sm text-muted-foreground">{studentData?.level ?? '—'}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    await logout();
                    if (onLogout) onLogout();
                  } catch (e) {
                    console.error('Logout falhou', e);
                  }
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo, {displayName}!</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-oxford-gold" />
              <span className="font-medium">Turma: {studentData?.level ?? '—'}</span>
            </div>
              <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso Geral</span>
                <span>{studentData?.progress ?? 0}%</span>
              </div>
              <Progress value={studentData?.progress ?? 0} className="h-2" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="grades" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Notas</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Horários</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Jogos</span>
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">IA Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-oxford-gold" />
                    Média Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{averageGrade}</div>
                  <p className="text-sm text-muted-foreground">Excelente desempenho!</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Situação Financeira
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getPaymentStatusColor()}`}>
                    {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                  </div>
                  <p className="text-sm text-muted-foreground">{getPaymentStatusText()}</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Próxima Aula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">Business English</div>
                  <p className="text-sm text-muted-foreground">Segunda, 14:00</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-warning" />
                    Pendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">
                    {paymentInfo.overduePayments.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {paymentInfo.overduePayments.length > 0 ? 'Pagamentos atrasados' : 'Tudo em dia!'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Ações Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo Acadêmico */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Resumo Acadêmico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Presença</span>
                      <span className="font-semibold text-green-600">{studentData?.attendance}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Média Atual</span>
                      <span className="font-semibold text-primary">{averageGrade}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-blue-600">{studentData?.progress ?? 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Ranking na Turma</span>
                      <span className="font-semibold text-oxford-gold">#3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas - Simplificadas */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>Acesso rápido às funcionalidades essenciais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action) => {
                      const IconComponent = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="w-full justify-start h-auto p-4"
                          onClick={() => handleQuickAction(action.id)}
                        >
                          <IconComponent className={`h-5 w-5 mr-3 ${action.color}`} />
                          <span>{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas Financeiros */}
            {paymentInfo.overduePayments.length > 0 && (
              <Card className="shadow-elegant border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">Atenção: Pagamentos em Atraso</h4>
                      <p className="text-sm text-red-600">
                        Você possui {paymentInfo.overduePayments.length} pagamento(s) em atraso. 
                        Total: {formatCurrency(paymentInfo.overduePayments.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => setPaymentModal(true)}>
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Créditos */}
            {paymentInfo.currentBalance > 0 && (
              <Card className="shadow-elegant border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-800">Parabéns! Você tem créditos</h4>
                      <p className="text-sm text-blue-600">
                        Saldo positivo de {formatCurrency(paymentInfo.currentBalance)} em pagamentos antecipados.
                      </p>
                    </div>
                    <Button variant="outline" className="border-blue-300" onClick={() => setPaymentModal(true)}>
                      Ver Histórico
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {paymentInfo.currentBalance >= 0 ? 
                      <TrendingUp className="h-5 w-5 text-green-600" /> : 
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    }
                    Saldo Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${paymentInfo.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {paymentInfo.currentBalance >= 0 ? 'Crédito disponível' : 'Valor em débito'}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Total Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(paymentInfo.totalPaid)}
                  </div>
                  <p className="text-sm text-muted-foreground">Pagamentos realizados</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    Mensalidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(paymentInfo.monthlyFee)}
                  </div>
                  <p className="text-sm text-muted-foreground">Valor mensal</p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Últimos Pagamentos
                </CardTitle>
                <CardDescription>Histórico recente de pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentInfo.paymentHistory.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {payment.monthReference} - {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.description}
                        </div>
                      </div>
                      <Badge className={
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                        payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        payment.status === 'advance' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {payment.status === 'paid' ? 'Pago' :
                         payment.status === 'overdue' ? 'Em Atraso' :
                         payment.status === 'advance' ? 'Antecipado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => setPaymentModal(true)}>
                    Ver Histórico Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Minhas Notas - 1º Bimestre</CardTitle>
                <CardDescription>Desempenho detalhado nas disciplinas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.map((grade, index) => (
                    <Card key={index} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-3 w-3 rounded-full ${
                              grade.grade >= 9 ? 'bg-green-500' :
                              grade.grade >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <span className="font-medium">{grade.subject}</span>
                              <div className="text-sm text-muted-foreground">
                                {grade.period}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-3">
                              <span className={`text-xl font-bold ${getGradeColor(grade.grade)}`}>
                                {grade.grade}
                              </span>
                              <Badge variant={grade.status === "approved" ? "default" : "destructive"}>
                                {grade.status === "approved" ? "Aprovado" : "Reprovado"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {grade.feedback && (
                          <div className="mt-3 p-2 bg-muted/50 rounded-md">
                            <p className="text-sm text-muted-foreground">
                              <strong>Feedback do Professor:</strong> {grade.feedback}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Horário Semanal</CardTitle>
                <CardDescription>Aulas e atividades programadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="text-center min-w-[80px]">
                        <div className="font-semibold">{item.day}</div>
                        <div className="text-sm text-muted-foreground">{item.time}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.topic}</div>
                        <Badge variant={item.type === "assignment" ? "destructive" : "default"}>
                          {item.type === "class" ? "Aula" : item.type === "assignment" ? "Trabalho" : "Workshop"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Materiais de Estudo</CardTitle>
                <CardDescription>Downloads disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {material.type === "audio" && <Play className="h-5 w-5 text-primary" />}
                          {material.type === "video" && <Play className="h-5 w-5 text-primary" />}
                          {material.type === "pdf" && <FileText className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <div className="font-medium">{material.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {material.size} • {material.downloads} downloads
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-elegant cursor-pointer hover:scale-105 transition-transform">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Listening Game
                  </CardTitle>
                  <CardDescription>Jogo de listening</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Jogar Agora</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-chat" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  IA Assistant - Oxford English Coach
                </CardTitle>
                <CardDescription>
                  Pratique inglês com nossa IA. Faça perguntas, pratique conversação ou peça exercícios!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MessageCircle className="h-12 w-12 text-primary mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">Chat IA em Desenvolvimento</h3>
                      <p className="text-muted-foreground">
                        Em breve você poderá conversar com nossa IA para praticar inglês!
                      </p>
                    </div>
                    <Button variant="oxford" disabled>
                      Iniciar Chat (Em breve)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Financeiro Específico para Estudantes */}
      <StudentFinanceModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        studentPaymentInfo={paymentInfo}
      />
    </div>
  );
}