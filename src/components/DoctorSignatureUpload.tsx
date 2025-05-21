
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { doctorsAPI } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    try {
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        setSignature(result);
        
        try {
          // First try to save to Supabase
          if (supabase) {
            // Check if we have a storage bucket for signatures
            try {
              // Upload to Supabase Storage
              const { data: storageData, error: storageError } = await supabase.storage
                .from('signatures')
                .upload(`doctor-${doctorId}-${Date.now()}.png`, file);
                
              if (storageData) {
                // Get public URL
                const { data: urlData } = await supabase.storage
                  .from('signatures')
                  .getPublicUrl(storageData.path);
                  
                if (urlData?.publicUrl) {
                  // Update in Supabase database
                  await supabase
                    .from('doctors')
                    .update({ signature: urlData.publicUrl })
                    .eq('id', doctorId);
                    
                  if (onSignatureUpdated) {
                    onSignatureUpdated(urlData.publicUrl);
                  }
                  
                  setIsUploading(false);
                  toast.success('Signature uploaded successfully');
                  return;
                }
              }
            } catch (err) {
              console.error('Supabase storage error:', err);
              // Continue with base64 approach if storage fails
            }
          }
          
          // If Supabase approach failed, use base64 and MongoDB
          await doctorsAPI.updateDoctorSignature(doctorId, result);
          
          if (onSignatureUpdated) {
            onSignatureUpdated(result);
          }
          
          toast.success('Signature uploaded successfully');
        } catch (error) {
          console.error('Error saving signature:', error);
          toast.error('Failed to save signature. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process the image. Please try again.');
      setIsUploading(false);
    }
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
