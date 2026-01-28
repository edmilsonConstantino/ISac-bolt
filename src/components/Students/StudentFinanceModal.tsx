// src/components/shared/StudentFinanceModal.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Receipt,
  History,
  Phone,
  MessageCircle,
  Download,
  Mail,
  MapPin,
  CreditCard,
  Smartphone,
  Building,
  Banknote
} from "lucide-react";

interface StudentPaymentInfo {
  studentId: number;
  studentName: string;
  className: string;
  monthlyFee: number;
  currentBalance: number;
  totalPaid: number;
  totalDue: number;
  lastPaymentDate?: string;
  paymentHistory: Payment[];
  overduePayments: Payment[];
  advancePayments: unknown[];
  // Informações específicas para estudantes
  canMakePayments: boolean;
  canEditPayments: boolean;
  contactInfo: {
    whatsapp: string;
    email: string;
    hours: string;
    address: string;
  };
  paymentMethods: {
    name: string;
    description: string;
    icon: string;
  }[];
}

interface StudentFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentPaymentInfo: StudentPaymentInfo;
}

export function StudentFinanceModal({ 
  isOpen, 
  onClose, 
  studentPaymentInfo
}: StudentFinanceModalProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'advance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Em Atraso';
      case 'partial': return 'Parcial';
      case 'advance': return 'Antecipado';
      default: return status;
    }
  };

  const getMethodText = (method?: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'transfer': return 'Transferência';
      case 'card': return 'Cartão';
      case 'mpesa': return 'M-Pesa';
      case 'other': return 'Outro';
      default: return 'N/A';
    }
  };

  const getMethodIcon = (iconType: string) => {
    switch (iconType) {
      case 'cash': return <Banknote className="h-4 w-4" />;
      case 'bank': return <Building className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  const balanceColor = studentPaymentInfo.currentBalance >= 0 ? 'text-green-600' : 'text-red-600';
  const balanceIcon = studentPaymentInfo.currentBalance >= 0 ? TrendingUp : TrendingDown;
  const BalanceIcon = balanceIcon;

  const handleContactFinance = () => {
    const message = `Olá! Sou ${studentPaymentInfo.studentName}, estudante da turma ${studentPaymentInfo.className}. Gostaria de falar sobre minha situação financeira.`;
    const whatsappUrl = `https://wa.me/${studentPaymentInfo.contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadReceipt = (payment: any) => {
    // Simular download do recibo
    alert(`Baixando recibo ${payment.receiptNumber}...`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>

        
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Minha Situação Financeira
              </DialogTitle>
              <DialogDescription>
                Visualize seu histórico de pagamentos e entre em contato conosco se precisar
              </DialogDescription>
            </div>
            
            {/* <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${balanceColor} flex items-center justify-center gap-1`}>
                  <BalanceIcon className="h-5 w-5" />
                  {formatCurrency(Math.abs(studentPaymentInfo.currentBalance))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {studentPaymentInfo.currentBalance >= 0 ? 'Seu Crédito' : 'Sua Dívida'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(studentPaymentInfo.monthlyFee)}
                </div>
                <div className="text-sm text-muted-foreground">Mensalidade</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(studentPaymentInfo.totalPaid)}
                </div>
                <div className="text-sm text-muted-foreground">Total Pago</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {studentPaymentInfo.overduePayments.length}
                </div>
                <div className="text-sm text-muted-foreground">Meses em Atraso</div>
              </CardContent>
            </Card>
          </div>

          {/* Alerta de Pagamentos em Atraso */}
          {studentPaymentInfo.overduePayments.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800">Atenção: Pagamentos Pendentes</h4>
                    <p className="text-sm text-red-600">
                      Você possui {studentPaymentInfo.overduePayments.length} pagamento(s) em atraso. 
                      Entre em contato conosco para regularizar.
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleContactFinance}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Falar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Crédito Disponível */}
          {studentPaymentInfo.currentBalance > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800">Parabéns! Você está em dia</h4>
                    <p className="text-sm text-green-600">
                      Você possui {formatCurrency(studentPaymentInfo.currentBalance)} em créditos de pagamentos antecipados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="history" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="payment-info">Como Pagar</TabsTrigger>
            </TabsList>

            {/* Histórico de Pagamentos */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Meu Histórico de Pagamentos
                  </CardTitle>
                  <CardDescription>
                    Todos os seus pagamentos registrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {studentPaymentInfo.paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <div className="font-semibold">
                              {payment.monthReference} - {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.description}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {payment.paidDate ? 
                                `✅ Pago em: ${new Date(payment.paidDate).toLocaleDateString('pt-BR')}` : 
                                `📅 Vencimento: ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}`
                              }
                              {payment.method && ` • ${getMethodText(payment.method)}`}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                          
                          {payment.receiptNumber && payment.status === 'paid' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadReceipt(payment)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Recibo
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    {studentPaymentInfo.paymentHistory.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum pagamento registrado ainda.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pagamentos Pendentes */}
            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Pagamentos Pendentes
                  </CardTitle>
                  <CardDescription>
                    Mensalidades com vencimento em aberto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentPaymentInfo.overduePayments.map((payment) => {
                      const daysOverdue = Math.floor((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={payment.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-red-800">
                                📅 {payment.monthReference} - {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-sm text-red-600">
                                Venceu em: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-red-500 font-medium">
                                ⏰ {daysOverdue} dias em atraso
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleContactFinance}
                              className="border-red-300 text-red-700 hover:bg-red-100"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Negociar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {studentPaymentInfo.overduePayments.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                        <h3 className="text-lg font-semibold text-green-600 mb-2">🎉 Parabéns!</h3>
                        <p className="text-muted-foreground">Você não possui nenhum pagamento em atraso.</p>
                        <p className="text-sm text-green-600 mt-2">Continue assim! 👏</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Informações de Contato */}
            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Precisa de Ajuda?
                    </CardTitle>
                    <CardDescription>
                      Fale conosco sobre sua situação financeira
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">WhatsApp Financeiro</span>
                      </div>
                      <p className="text-green-700 font-mono text-lg">
                        {studentPaymentInfo.contactInfo.whatsapp}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {studentPaymentInfo.contactInfo.hours}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Email</span>
                      </div>
                      <p className="text-blue-700">{studentPaymentInfo.contactInfo.email}</p>
                      <p className="text-xs text-blue-600 mt-1">Resposta em até 24h</p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-800">Presencial</span>
                      </div>
                      <p className="text-purple-700">{studentPaymentInfo.contactInfo.address}</p>
                      <p className="text-xs text-purple-600 mt-1">{studentPaymentInfo.contactInfo.hours}</p>
                    </div>
                    
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      onClick={handleContactFinance}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Conversar no WhatsApp
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-blue-600" />
                      Dúvidas Frequentes
                    </CardTitle>
                    <CardDescription>
                      Respostas rápidas para suas perguntas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Como posso pagar minha mensalidade?</h4>
                        <p className="text-xs text-muted-foreground">
                          Você pode pagar na recepção, por transferência bancária ou M-Pesa. Veja a aba "Como Pagar".
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Posso negociar minha dívida?</h4>
                        <p className="text-xs text-muted-foreground">
                          Sim! Entre em contato conosco pelo WhatsApp e encontraremos a melhor solução.
                        </p>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Como obter meu recibo?</h4>
                        <p className="text-xs text-muted-foreground">
                          Clique no botão "Recibo" no histórico de pagamentos para baixar.
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-1">Tenho desconto para pagamento antecipado?</h4>
                        <p className="text-xs text-muted-foreground">
                          Entre em contato para saber sobre nossas promoções de pagamento antecipado.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Formas de Pagamento */}
            <TabsContent value="payment-info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Como Pagar sua Mensalidade
                  </CardTitle>
                  <CardDescription>
                    Escolha a forma de pagamento mais conveniente para você
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentPaymentInfo.paymentMethods.map((method, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {getMethodIcon(method.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{method.name}</h4>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Dica Importante</h4>
                    <p className="text-sm text-blue-700">
                      Após realizar o pagamento, entre em contato conosco via WhatsApp enviando o comprovante 
                      para que possamos atualizar sua situação mais rapidamente.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>Dúvidas? Fale conosco: {studentPaymentInfo.contactInfo.whatsapp}</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>

      
    </Dialog>
  );
}