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

    const fmtCurrency = (v: number) => v.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
    const printDate = new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });

    return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>Recibo ${receipt.receipt_number}</title>
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
    .pay-table{width:100%;border-collapse:collapse;margin-bottom:8px;}
    .pay-table th{background:#004B87;color:white;font-size:11px;padding:8px 10px;text-align:left;font-weight:600;}
    .pay-table th:last-child{text-align:right;}
    .pay-table td{padding:8px 10px;border:1px solid #d1d5db;font-size:12px;color:#374151;}
    .items-table{width:100%;border-collapse:collapse;margin-bottom:4px;}
    .items-table th{background:#004B87;color:white;font-size:11px;padding:8px 10px;font-weight:600;letter-spacing:.04em;text-align:left;}
    .items-table th:first-child{text-align:center;width:50px;}
    .items-table th:last-child{text-align:right;}
    .items-table td{padding:7px 10px;border:1px solid #d1d5db;font-size:12px;}
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
      <div class="label">Recibo Nº</div>
      <div class="number">${receipt.receipt_number}</div>
      <div class="date">Emitido em: ${fmtDate(receipt.created_at)}</div>
    </div>
  </div>

  <div class="student-block">
    <div class="sfield"><label>Recebemos de</label><span>${studentName}</span></div>
    ${additionalInfo?.courseName ? `<div class="sfield"><label>Curso</label><span>${additionalInfo.courseName}</span></div>` : ''}
    ${additionalInfo?.className ? `<div class="sfield"><label>Turma</label><span>${additionalInfo.className}</span></div>` : ''}
    ${additionalInfo?.period ? `<div class="sfield"><label>Período</label><span>${additionalInfo.period}</span></div>` : ''}
  </div>

  <table class="pay-table" style="margin-bottom:8px;">
    <thead><tr>
      <th>Valor</th>
      <th>Forma de Pagamento</th>
      <th>Referência</th>
      <th style="text-align:right;">Data</th>
    </tr></thead>
    <tbody><tr>
      <td style="font-weight:700;color:#004B87;font-size:14px;">${fmtCurrency(receipt.amount)} MT</td>
      <td>${paymentMethodLabels[receipt.payment_method]}</td>
      <td>${receipt.payment_reference || '—'}</td>
      <td style="text-align:right;">${fmtDate(receipt.created_at)}</td>
    </tr></tbody>
  </table>

  <table class="items-table" style="margin-top:14px;">
    <thead><tr>
      <th>Ord.</th>
      <th>Referente a</th>
      <th style="text-align:right;">Valor (MT)</th>
    </tr></thead>
    <tbody>
      <tr>
        <td style="text-align:center;color:#374151;">1</td>
        <td style="color:#374151;">${typeLabels[receipt.type]}${receipt.description ? ' — ' + receipt.description : ''}</td>
        <td style="text-align:right;font-weight:600;color:#374151;">${fmtCurrency(receipt.amount)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2">Total</td>
        <td>${fmtCurrency(receipt.amount)}</td>
      </tr>
    </tbody>
  </table>

  <div class="bottom">
    <div class="printed">Impresso no dia ${printDate}<br/>Sistema Académico ISAC</div>
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
