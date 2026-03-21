/**
 * RECEIPT SERVICE - Gestão de Recibos
 *
 * 📁 LOCATION: src/services/receiptService.ts
 *
 * Este serviço fornece métodos para:
 * - Criar recibos de inscrição, matrícula e mensalidades
 * - Listar recibos por estudante
 * - Anular recibos
 * - Imprimir recibos
 */

import apiClient from './api';

// Tipos de recibo
export type ReceiptType = 'inscription' | 'registration' | 'monthly_fee' | 'other';

// Métodos de pagamento
export type PaymentMethod = 'cash' | 'transfer' | 'mobile' | 'check';

// Interface do recibo
export interface Receipt {
  id: number;
  receipt_number: string;
  type: ReceiptType;
  student_id: number;
  registration_id?: number | null;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference?: string | null;
  description?: string | null;
  created_at: string;
  created_by?: number | null;
  voided_at?: string | null;
  voided_by?: number | null;
  void_reason?: string | null;
  // Campos do JOIN
  student_name?: string;
  student_email?: string;
}

// Interface para criar recibo
export interface CreateReceiptData {
  student_id: number;
  registration_id?: number | null;
  type: ReceiptType;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  description?: string;
  created_by?: number;
}

// Interface para anular recibo
export interface VoidReceiptData {
  id: number;
  voided_by?: number;
  void_reason?: string;
}

// Resposta da API ao criar recibo
interface CreateReceiptResponse {
  success: boolean;
  message: string;
  id: number;
  receipt_number: string;
}

// Resposta da API ao listar recibos
interface ListReceiptsResponse {
  success?: boolean;
  message?: string;
}

class ReceiptService {
  /**
   * 📋 Listar todos os recibos
   */
  async getAll(): Promise<Receipt[]> {
    try {
      const response = await apiClient.get<Receipt[]>('/api/receipts.php');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Erro ao buscar recibos:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar recibos');
    }
  }

  /**
   * 🔍 Buscar recibo por ID
   */
  async getById(id: number): Promise<Receipt | null> {
    try {
      const response = await apiClient.get<Receipt[]>(`/api/receipts.php?id=${id}`);
      const receipts = Array.isArray(response.data) ? response.data : [];
      return receipts.length > 0 ? receipts[0] : null;
    } catch (error: any) {
      console.error('Erro ao buscar recibo:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar recibo');
    }
  }

  /**
   * 👤 Buscar recibos por estudante
   */
  async getByStudentId(studentId: number): Promise<Receipt[]> {
    try {
      const response = await apiClient.get<Receipt[]>(`/api/receipts.php?student_id=${studentId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Erro ao buscar recibos do estudante:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar recibos');
    }
  }

  /**
   * 📝 Buscar recibos por tipo
   */
  async getByType(type: ReceiptType): Promise<Receipt[]> {
    try {
      const response = await apiClient.get<Receipt[]>(`/api/receipts.php?type=${type}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Erro ao buscar recibos por tipo:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar recibos');
    }
  }

  /**
   * ➕ Criar novo recibo
   */
  async create(data: CreateReceiptData): Promise<CreateReceiptResponse> {
    try {
      const response = await apiClient.post<CreateReceiptResponse>('/api/receipts.php', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar recibo:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar recibo');
    }
  }

  /**
   * ❌ Anular recibo
   */
  async void(data: VoidReceiptData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string }>('/api/receipts.php', data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao anular recibo:', error);
      throw new Error(error.response?.data?.message || 'Erro ao anular recibo');
    }
  }

  /**
   * 🖨️ Gerar HTML do recibo para impressão
   */
  generatePrintHTML(receipt: Receipt, studentName: string, additionalInfo?: {
    courseName?: string;
    className?: string;
    period?: string;
  }): string {
    const typeLabels: Record<ReceiptType, string> = {
      inscription: 'Taxa de Inscrição',
      registration: 'Taxa de Matrícula',
      monthly_fee: 'Mensalidade',
      other: 'Outro Pagamento',
    };

    const paymentMethodLabels: Record<PaymentMethod, string> = {
      cash: 'Numerário',
      transfer: 'Transferência Bancária',
      mobile: 'Pagamento Móvel (M-Pesa/E-Mola)',
      check: 'Cheque',
    };

    const formatCurrency = (value: number) => {
      return 'MT ' + new Intl.NumberFormat('pt-MZ', {
      }).format(value);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo ${receipt.receipt_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }

          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #004B87; padding-bottom: 20px; }
          .header h1 { color: #004B87; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0; }
          .header .receipt-number {
            background: #F5821F;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 15px;
            font-weight: bold;
          }

          .section { margin: 25px 0; }
          .section h2 {
            color: #004B87;
            font-size: 16px;
            margin-bottom: 15px;
            border-bottom: 2px solid #F5821F;
            padding-bottom: 5px;
          }

          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .info-row.full { grid-column: 1 / -1; }
          .info-row strong { color: #333; }
          .info-row span { color: #666; }

          .amount-box {
            background: linear-gradient(135deg, #004B87 0%, #003A6B 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            margin: 30px 0;
          }
          .amount-box .label { font-size: 14px; opacity: 0.9; margin-bottom: 5px; }
          .amount-box .value { font-size: 36px; font-weight: bold; }

          .footer {
            margin-top: 50px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px dashed #ccc;
          }
          .footer p { color: #666; font-size: 12px; margin: 5px 0; }
          .footer .signature {
            margin-top: 40px;
            border-top: 1px solid #333;
            width: 200px;
            display: inline-block;
            padding-top: 10px;
          }

          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ISAC - Instituto Superior de Artes e Cultura</h1>
          <p>Recibo de Pagamento</p>
          <div class="receipt-number">${receipt.receipt_number}</div>
        </div>

        <div class="section">
          <h2>Dados do Estudante</h2>
          <div class="info-grid">
            <div class="info-row">
              <strong>Nome:</strong>
              <span>${studentName}</span>
            </div>
            <div class="info-row">
              <strong>Email:</strong>
              <span>${receipt.student_email || '-'}</span>
            </div>
            ${additionalInfo?.courseName ? `
            <div class="info-row">
              <strong>Curso:</strong>
              <span>${additionalInfo.courseName}</span>
            </div>
            ` : ''}
            ${additionalInfo?.className ? `
            <div class="info-row">
              <strong>Turma:</strong>
              <span>${additionalInfo.className}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h2>Detalhes do Pagamento</h2>
          <div class="info-grid">
            <div class="info-row">
              <strong>Tipo:</strong>
              <span>${typeLabels[receipt.type]}</span>
            </div>
            <div class="info-row">
              <strong>Método:</strong>
              <span>${paymentMethodLabels[receipt.payment_method]}</span>
            </div>
            <div class="info-row">
              <strong>Data:</strong>
              <span>${formatDate(receipt.created_at)}</span>
            </div>
            ${receipt.payment_reference ? `
            <div class="info-row">
              <strong>Referência:</strong>
              <span>${receipt.payment_reference}</span>
            </div>
            ` : ''}
            ${receipt.description ? `
            <div class="info-row full">
              <strong>Descrição:</strong>
              <span>${receipt.description}</span>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="amount-box">
          <div class="label">Valor Pago</div>
          <div class="value">${formatCurrency(receipt.amount)}</div>
        </div>

        <div class="footer">
          <p>Este recibo comprova o pagamento acima referido.</p>
          <p>Gerado em ${new Date().toLocaleString('pt-MZ')}</p>
          <div class="signature">Assinatura e Carimbo</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 🖨️ Imprimir recibo (abre janela de impressão)
   */
  print(receipt: Receipt, studentName: string, additionalInfo?: {
    courseName?: string;
    className?: string;
    period?: string;
  }): void {
    const html = this.generatePrintHTML(receipt, studentName, additionalInfo);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }
}

// Exportar instância singleton
const receiptService = new ReceiptService();
export default receiptService;
