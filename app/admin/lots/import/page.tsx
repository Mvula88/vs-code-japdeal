'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ImportLotsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to import.',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    // Simulate import progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate import completion
    setTimeout(() => {
      setImporting(false);
      setImportResults({
        total: 50,
        success: 47,
        failed: 3,
        errors: [
          'Row 15: Invalid VIN number',
          'Row 23: Missing required field "make"',
          'Row 41: Invalid date format',
        ],
      });
      toast({
        title: 'Import completed',
        description: '47 of 50 lots imported successfully.',
      });
    }, 3500);
  };

  const handleDownloadTemplate = () => {
    toast({
      title: 'Template downloaded',
      description: 'The import template has been downloaded.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Import Lots</h1>
          <p className="text-muted-foreground">
            Bulk import auction lots from CSV or Excel files
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Import Guidelines</AlertTitle>
        <AlertDescription>
          Please ensure your file follows the correct format. Download the template for reference.
          Supported formats: CSV, XLSX. Maximum file size: 10MB.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              Select a CSV or Excel file to import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV or Excel files up to 10MB
                </p>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setImportResults(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            {importing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleImport}
              disabled={!file || importing}
            >
              <Upload className="mr-2 h-4 w-4" />
              {importing ? 'Importing...' : 'Start Import'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Template</CardTitle>
            <CardDescription>
              Download the template with correct format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">Required columns:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Lot Number</li>
                <li>• VIN</li>
                <li>• Make, Model, Year</li>
                <li>• Mileage</li>
                <li>• Starting Price</li>
                <li>• Auction Start Date</li>
                <li>• Auction End Date</li>
              </ul>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </CardContent>
        </Card>
      </div>

      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
            <CardDescription>
              Summary of the import operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="text-center p-4 border rounded-lg">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-2xl font-bold">{importResults.total}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-muted-foreground">Successfully Imported</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <XCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Errors:</p>
                <div className="space-y-2">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <Badge variant="destructive" className="mt-0.5">Error</Badge>
                      <span className="text-muted-foreground">{error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => router.push('/admin/lots')}>
                View Lots
              </Button>
              <Button onClick={() => {
                setFile(null);
                setImportResults(null);
                setProgress(0);
              }}>
                Import More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}