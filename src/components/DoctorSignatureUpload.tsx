
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface DoctorSignatureUploadProps {
  doctorId: string;
  existingSignature?: string;
  onSignatureUpdated?: (signatureUrl: string) => void;
}

const DoctorSignatureUpload: React.FC<DoctorSignatureUploadProps> = ({
  doctorId,
  existingSignature,
  onSignatureUpdated
}) => {
  const [signature, setSignature] = useState<string | null>(existingSignature || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Signature image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    
    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSignature(result);
      
      // In a real implementation, we would upload to server here
      // For now, we'll simulate a successful upload
      setTimeout(() => {
        setIsUploading(false);
        toast.success('Signature uploaded successfully');
        if (onSignatureUpdated) {
          onSignatureUpdated(result);
        }
      }, 1000);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Doctor's Signature</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signature ? (
            <div className="border rounded-md p-4 bg-gray-50">
              <p className="text-sm text-muted-foreground mb-2">Current Signature:</p>
              <img 
                src={signature} 
                alt="Doctor's signature" 
                className="max-h-32 mx-auto border border-dashed border-gray-300 p-2 rounded"
              />
            </div>
          ) : (
            <div className="border rounded-md p-4 bg-gray-50 text-center py-8">
              <p className="text-sm text-muted-foreground">No signature uploaded</p>
            </div>
          )}
          
          <div>
            <p className="text-sm mb-2">Upload a new signature:</p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="signature-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('signature-upload')?.click()}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : 'Select Signature Image'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Please upload a clear image of your signature (PNG or JPG, max 2MB)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorSignatureUpload;
