import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface InvoicePdfData {
  invoiceNumber: string;
  issuedAt: Date;
  status: string;
  orderId: string;
  companyName: string;
  email: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: string | number;
    subtotal: string | number;
  }>;
  totalAmount: string | number;
}

@Injectable()
export class PdfService {
  generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 45, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Primary Branding & Header
        doc
          .fillColor('#1E293B')
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('ARROWSTACK WHOLESALE', 45, 45);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#64748B')
          .text('B2B Logistics & Wholesale Supply Chain Network', 45, 75)
          .text('finance@arrowstack.local | www.arrowstack.local', 45, 88);

        // Invoice Metadata Box
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text('INVOICE', 380, 45, { align: 'right' });

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#334155')
          .text(`Invoice #: ${data.invoiceNumber}`, 380, 72, { align: 'right' })
          .font('Helvetica')
          .fillColor('#64748B')
          .text(`Issue Date: ${new Date(data.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 380, 86, { align: 'right' })
          .text(`Status: ${data.status}`, 380, 100, { align: 'right' });

        // Divider
        doc
          .strokeColor('#CBD5E1')
          .lineWidth(1)
          .moveTo(45, 125)
          .lineTo(550, 125)
          .stroke();

        // Bill To Section
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#475569')
          .text('BILL TO:', 45, 140);

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text(data.companyName || 'Valued Commercial Client', 45, 155);

        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#64748B')
          .text(`Buyer Email: ${data.email}`, 45, 170)
          .text(`Order Reference: ${data.orderId}`, 45, 184);

        // Table Header
        const tableTop = 220;
        doc
          .rect(45, tableTop, 505, 24)
          .fill('#F1F5F9');

        doc
          .fillColor('#1E293B')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('DESCRIPTION / SKU', 55, tableTop + 7)
          .text('QTY', 330, tableTop + 7, { width: 40, align: 'center' })
          .text('UNIT PRICE', 380, tableTop + 7, { width: 70, align: 'right' })
          .text('TOTAL', 460, tableTop + 7, { width: 80, align: 'right' });

        // Table Rows
        let y = tableTop + 30;
        doc.font('Helvetica').fontSize(9);

        data.items.forEach((item, index) => {
          const isEven = index % 2 === 0;
          if (isEven) {
            doc.rect(45, y - 4, 505, 22).fill('#F8FAFC');
          }

          doc
            .fillColor('#0F172A')
            .text(`${item.productName} (${item.sku})`, 55, y, { width: 260, lineBreak: false });

          doc
            .fillColor('#334155')
            .text(String(item.quantity), 330, y, { width: 40, align: 'center' })
            .text(`$${Number(item.unitPrice).toFixed(2)}`, 380, y, { width: 70, align: 'right' })
            .text(`$${Number(item.subtotal).toFixed(2)}`, 460, y, { width: 80, align: 'right' });

          y += 24;
        });

        // Summary Line
        doc
          .strokeColor('#E2E8F0')
          .lineWidth(1)
          .moveTo(45, y + 10)
          .lineTo(550, y + 10)
          .stroke();

        y += 20;

        // Total
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#0F172A')
          .text('Total Amount Due:', 340, y, { width: 110, align: 'right' })
          .fontSize(14)
          .fillColor('#2563EB')
          .text(`$${Number(data.totalAmount).toFixed(2)}`, 460, y - 2, { width: 80, align: 'right' });

        // Payment Terms & Notes
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#475569')
          .text('TERMS & PAYMENT INSTRUCTIONS', 45, y + 55);

        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#64748B')
          .text('Payment terms: Net 30 days from date of invoice.', 45, y + 70)
          .text('Direct wire transfer payments should reference the Invoice # above.', 45, y + 82)
          .text('For billing inquiries, contact billing@arrowstack.local.', 45, y + 94);

        // Footer
        doc
          .fontSize(8)
          .fillColor('#94A3B8')
          .text('Generated automatically by Arrowstack B2B Order Platform. Valid official tax document.', 45, 750, { align: 'center', width: 505 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
