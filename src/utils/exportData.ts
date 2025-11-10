import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  phone_number: string;
  status: string;
  created_at: string;
  mpesa_receipt_number: string | null;
  description: string | null;
}

export const exportToCSV = (transactions: Transaction[], filename: string = 'transactions.csv') => {
  const headers = [
    'Date',
    'Type',
    'Phone Number',
    'Amount',
    'Status',
    'Receipt Number',
    'Description',
  ];

  const rows = transactions.map((t) => [
    new Date(t.created_at).toLocaleString(),
    t.transaction_type,
    t.phone_number,
    t.amount,
    t.status,
    t.mpesa_receipt_number || '',
    t.description || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (transactions: Transaction[], filename: string = 'transactions.pdf') => {
  // For PDF generation, we'll create a printable HTML view
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Transactions Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #00A86B; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #00A86B; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>M-Leja Transaction Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Phone Number</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Receipt Number</th>
            </tr>
          </thead>
          <tbody>
            ${transactions
              .map(
                (t) => `
              <tr>
                <td>${new Date(t.created_at).toLocaleString()}</td>
                <td>${t.transaction_type}</td>
                <td>${t.phone_number}</td>
                <td>KES ${t.amount}</td>
                <td>${t.status}</td>
                <td>${t.mpesa_receipt_number || '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Trigger print dialog
  printWindow.onload = () => {
    printWindow.print();
  };
};

export const exportLedgerData = async (userId: string, startDate?: Date, endDate?: Date) => {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
};
