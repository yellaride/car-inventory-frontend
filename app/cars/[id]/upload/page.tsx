'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { carsApi, mediaApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, Image as ImageIcon, Video, Loader2, CheckCircle2, Camera } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { CameraCapture } from '@/components/CameraCapture';

interface UploadFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  mediaType: string;
  category: string;
}

export default function UploadMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Fetch car details
  const { data: car } = useQuery({
    queryKey: ['car', resolvedParams.id],
    queryFn: () => carsApi.getById(resolvedParams.id),
  });

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending',
        mediaType: file.type.startsWith('image') ? 'IMAGE' : 'VIDEO',
        category: 'general',
      }));
      setFiles(prev => [...prev, ...newFiles]);
    },
  });

  const handleCameraCapture = (file: File) => {
    const preview = URL.createObjectURL(file);
    const mediaType = file.type.startsWith('image') ? 'IMAGE' : 'VIDEO';
    setFiles(prev => [...prev, {
      file,
      preview,
      progress: 0,
      status: 'pending',
      mediaType,
      category: 'general',
    }]);
    setCameraOpen(false);
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Update file category
  const updateCategory = (index: number, category: string) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index].category = category;
      return newFiles;
    });
  };

  // Upload all files
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      
      // Update status to uploading
      setFiles(prev => {
        const updated = [...prev];
        updated[i].status = 'uploading';
        return updated;
      });

      try {
        const result = await mediaApi.upload(
          fileData.file,
          resolvedParams.id,
          fileData.mediaType,
          fileData.category
        );

        console.log('Upload successful:', result);

        // Update status to success
        setFiles(prev => {
          const updated = [...prev];
          updated[i].status = 'success';
          updated[i].progress = 100;
          return updated;
        });
      } catch (error: any) {
        console.error('Upload error:', error);
        console.error('Error response:', error.response?.data);
        
        // Update status to error
        setFiles(prev => {
          const updated = [...prev];
          updated[i].status = 'error';
          return updated;
        });
      }
    }

    setIsUploading(false);
    
    const successCount = files.filter(f => f.status === 'success').length;
    const errorCount = files.filter(f => f.status === 'error').length;
    
    console.log('Upload summary:', { total: files.length, success: successCount, errors: errorCount });
    
    if (successCount > 0) {
      toast({ 
        title: 'Upload Complete!', 
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}` 
      });
      // Invalidate both car detail and listing cache
      queryClient.invalidateQueries({ queryKey: ['car', resolvedParams.id] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.push(`/cars/${resolvedParams.id}`);
      }, 1500);
    } else {
      toast({ 
        title: 'Upload Failed', 
        description: 'No files were uploaded successfully. Check console for errors.',
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/cars/${resolvedParams.id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Upload Media</h1>
              {car && (
                <p className="text-sm text-gray-600">
                  {car.year} {car.make} {car.model}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos & Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera + Dropzone */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-2 h-14 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                onClick={() => setCameraOpen(true)}
              >
                <Camera className="h-5 w-5" />
                Open camera (photo / video)
              </Button>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg font-medium text-blue-600">
                  Drop files here...
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports: JPG, PNG, WEBP, GIF, MP4, WEBM (max 100MB)
                  </p>
                </>
              )}
            </div>

            <CameraCapture
              open={cameraOpen}
              onOpenChange={setCameraOpen}
              onCapture={handleCameraCapture}
              mode="both"
            />

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    Selected Files ({files.length})
                  </h3>
                  {!isUploading && (
                    <Button onClick={uploadFiles}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload All
                    </Button>
                  )}
                </div>

                <div className="grid gap-4">
                  {files.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border rounded-lg bg-white"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        {fileData.mediaType === 'IMAGE' ? (
                          <img
                            src={fileData.preview}
                            alt={fileData.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Status Indicator */}
                        {fileData.status === 'success' && (
                          <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {fileData.status === 'uploading' && (
                          <div className="absolute inset-0 bg-blue-500/80 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          </div>
                        )}
                        {fileData.status === 'error' && (
                          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                            <X className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatBytes(fileData.file.size)} • {fileData.mediaType}
                        </p>

                        {/* Category Select */}
                        <div className="mt-2">
                          <Label className="text-xs">Category</Label>
                          <select
                            value={fileData.category}
                            onChange={(e) => updateCategory(index, e.target.value)}
                            disabled={fileData.status !== 'pending'}
                            className="mt-1 text-sm border rounded px-2 py-1"
                          >
                            <option value="general">General</option>
                            <option value="exterior">Exterior</option>
                            <option value="interior">Interior</option>
                            <option value="engine">Engine</option>
                            <option value="damage">Damage</option>
                          </select>
                        </div>

                        {/* Status */}
                        {fileData.status === 'success' && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ Uploaded successfully
                          </p>
                        )}
                        {fileData.status === 'error' && (
                          <p className="text-sm text-red-600 mt-2">
                            ✗ Upload failed
                          </p>
                        )}
                        {fileData.status === 'uploading' && (
                          <p className="text-sm text-blue-600 mt-2">
                            Uploading...
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      {fileData.status === 'pending' && !isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Link href={`/cars/${resolvedParams.id}`} className="flex-1">
                <Button variant="outline" className="w-full" disabled={isUploading}>
                  {files.some(f => f.status === 'success') ? 'Done' : 'Cancel'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
