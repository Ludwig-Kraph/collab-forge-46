import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, exportToPDF } from '@/utils/exportData';

interface ExportButtonProps {
  transactions: any[];
}

const ExportButton = ({ transactions }: ExportButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      if (format === 'csv') {
        exportToCSV(transactions, `m-leja-transactions-${Date.now()}.csv`);
        toast({
          title: 'Export successful',
          description: 'Transactions exported to CSV',
        });
      } else {
        await exportToPDF(transactions, `m-leja-transactions-${Date.now()}.pdf`);
        toast({
          title: 'Export successful',
          description: 'Transactions exported to PDF',
        });
      }
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
