
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { doctorsAPI } from '@/services/api';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
          // First try to save to Supabase Storage
          if (supabase) {
            try {
              const fileName = `doctor-${doctorId}-${Date.now()}.png`;
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('signatures')
                .upload(fileName, file);
                
              if (uploadError) {
                console.error('Supabase storage upload error:', uploadError);
                throw uploadError;
              }
              
              if (uploadData) {
                // Get public URL
                const { data: publicUrlData } = supabase.storage
                  .from('signatures')
                  .getPublicUrl(fileName);
                  
                if (publicUrlData?.publicUrl) {
                  console.log('Uploaded to:', publicUrlData.publicUrl);
                  
                  // Check if doctor record exists first
                  const { data: doctorData, error: fetchError } = await supabase
                    .from('doctors')
                    .select('id')
                    .eq('id', doctorId)
                    .single();
                    
                  if (fetchError && fetchError.code === 'PGRST116') {
                    // Doctor not found, insert a new record
                    const { data: insertData, error: insertError } = await supabase
                      .from('doctors')
                      .insert([{ 
                        id: doctorId,
                        profile_image: publicUrlData.publicUrl,
                        experience: 0,
                        consultation_fee: 0,
                        specialty: 'General'
                      }]);
                      
                    if (insertError) {
                      console.error('Error creating doctor record:', insertError);
                      throw insertError;
                    }
                  } else {
                    // Doctor exists, update the record using profile_image field instead of signature
                    const { data: updateData, error: updateError } = await supabase
                      .from('doctors')
                      .update({ profile_image: publicUrlData.publicUrl })
                      .eq('id', doctorId);
                      
                    if (updateError) {
                      console.error('Error updating doctor record:', updateError);
                      throw updateError;
                    }
                  }
                  
                  // Also save to MongoDB
                  try {
                    await doctorsAPI.updateDoctorSignature(doctorId, publicUrlData.publicUrl);
                    console.log("Signature saved to MongoDB");
                  } catch (mongoErr) {
                    console.error("Failed to save signature to MongoDB:", mongoErr);
                    // Continue since we already saved to Supabase
                  }
                  
                  if (onSignatureUpdated) {
                    onSignatureUpdated(publicUrlData.publicUrl);
                  }
                  
                  toast.success('Signature uploaded successfully');
                  setIsUploading(false);
                  return;
                }
              }
            } catch (storageErr) {
              console.error('Storage upload error:', storageErr);
              // Continue with MongoDB approach
            }
          }
          
          // Fallback to MongoDB through API
          try {
            await doctorsAPI.updateDoctorSignature(doctorId, result);
            
            if (onSignatureUpdated) {
              onSignatureUpdated(result);
            }
            
            toast.success('Signature uploaded successfully via API');
          } catch (apiErr) {
            console.error('API upload error:', apiErr);
            
            // Last resort, save locally
            localStorage.setItem(`doctor_signature_${doctorId}`, result);
            
            if (onSignatureUpdated) {
              onSignatureUpdated(result);
            }
            
            toast.success('Signature stored locally');
          }
          
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
