import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/utils/auth';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { FileText, Download, Eye } from 'lucide-react';

async function getInvoices() {
  const user = await getUser();
  
  if (!user) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Invoices</h1>
        <p className="text-muted-foreground">
          View and download your auction invoices
        </p>
      </div>

      {invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'issued' ? 'secondary' :
                      invoice.status === 'void' ? 'destructive' :
                      'outline'
                    }
                  >
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(invoice.amount_due)}</p>
                    {invoice.status === 'paid' && invoice.paid_at && (
                      <p className="text-sm text-muted-foreground">
                        Paid on {formatDate(invoice.paid_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-muted mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No invoices yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Invoices will appear here once you win an auction
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}