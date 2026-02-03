'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { carsApi, mediaApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Loader2, Upload, X, CheckCircle2, Camera } from 'lucide-react';
import { CameraCapture } from '@/components/CameraCapture';

const conditions = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'SALVAGE', 'JUNK'];

export default function NewCarPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDecodingVin, setIsDecodingVin] = useState(false);
  
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    condition: 'POOR',
    mileage: '',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    coverImage: '',
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [cameraOpen, setCameraOpen] = useState(false);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCover = (file: File) => {
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setCameraOpen(false);
  };

  const decodeVin = async () => {
    if (!formData.vin || formData.vin.length !== 17) {
      toast({ 
        title: 'Invalid VIN', 
        description: 'VIN must be exactly 17 characters',
        variant: 'destructive' 
      });
      return;
    }

    setIsDecodingVin(true);
    try {
      const data = await carsApi.decodeVin(formData.vin);
      setFormData(prev => ({
        ...prev,
        make: data.make || prev.make,
        model: data.model || prev.model,
        year: data.year || prev.year,
      }));
      toast({ 
        title: 'VIN Decoded Successfully!', 
        description: `Found: ${data.year} ${data.make} ${data.model}` 
      });
    } catch (error) {
      toast({ 
        title: 'VIN Decode Failed', 
        description: 'Could not decode VIN. Please enter details manually.',
        variant: 'destructive' 
      });
    } finally {
      setIsDecodingVin(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      let coverImageUrl = '';

      const car = await carsApi.create({
        ...formData,
        condition: formData.condition as any,
        year: Number(formData.year),
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        purchaseDate: formData.purchaseDate || undefined,
      });

      if (coverImageFile) {
        try {
          const media = await mediaApi.upload(coverImageFile, car.id, 'IMAGE', 'cover');
          const updatedCar = await carsApi.update(car.id, { 
            coverImage: media.url,
            lastModifiedBy: 'system' 
          });
          return updatedCar;
        } catch (error) {
          console.error('Cover image upload failed:', error);
          return car;
        }
      }

      return car;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: 'Car added successfully!', description: 'Redirecting to car details...' });
      router.push(`/cars/${data.id}`);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to add car', 
        description: error.response?.data?.message || 'An error occurred',
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="min-h-screen gradient-secondary">
      {/* Header */}
      <header className="glass-effect border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/cars">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Add New Vehicle</h1>
              <p className="text-xs sm:text-sm text-gray-600">Enter VIN to auto-fill details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="text-xl sm:text-2xl">Vehicle Information</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Start by entering the VIN number to automatically fetch details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* VIN Decoder */}
              <div>
                <Label htmlFor="vin" className="text-base font-semibold">VIN Number *</Label>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 relative">
                    <Input
                      id="vin"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                      placeholder="1HGBH41JXMN109186"
                      maxLength={17}
                      required
                      className="font-mono text-sm sm:text-base h-11 sm:h-12 border-2"
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${formData.vin.length === 17 ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.vin.length}/17
                    </span>
                  </div>
                  <Button
                    type="button"
                    onClick={decodeVin}
                    disabled={isDecodingVin || formData.vin.length !== 17}
                    className="gradient-primary h-11 sm:h-12 px-4 sm:px-6"
                  >
                    {isDecodingVin ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Decode</span>
                      </>
                    )}
                  </Button>
                </div>
                {formData.vin.length === 17 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Valid VIN length
                  </p>
                )}
              </div>

              {/* Cover Image Upload */}
              <div>
                <Label className="text-base font-semibold">Cover Image (Optional)</Label>
                <p className="text-xs text-gray-500 mb-2">This image will appear on the listing page</p>
                <div className="mt-2">
                  {coverImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-purple-200">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-48 sm:h-64 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 shadow-lg"
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 gap-2 border-2 border-purple-200"
                          onClick={() => setCameraOpen(true)}
                        >
                          <Camera className="h-4 w-4" />
                          Take photo
                        </Button>
                      </div>
                      <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-4 pb-5">
                          <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-sm text-gray-600 font-medium">
                            Or click to upload from device
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WEBP (Max 10MB)
                          </p>
                        </div>
                        <input
                          id="coverImage"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <CameraCapture
                  open={cameraOpen}
                  onOpenChange={setCameraOpen}
                  onCapture={handleCameraCover}
                  mode="photo"
                />
              </div>

              {/* Form Fields - 2 Column Grid */}
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="make" className="font-semibold">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="Honda"
                    required
                    className="mt-2 h-11 border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="model" className="font-semibold">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Accord"
                    required
                    className="mt-2 h-11 border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="year" className="font-semibold">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    required
                    className="mt-2 h-11 border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="color" className="font-semibold">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Black"
                    className="mt-2 h-11 border-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condition" className="font-semibold">Condition *</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 mt-2"
                  required
                >
                  {conditions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="mileage" className="font-semibold">Mileage (miles)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    placeholder="75000"
                    min={0}
                    className="mt-2 h-11 border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="font-semibold">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="New York"
                    className="mt-2 h-11 border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="purchaseDate" className="font-semibold">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="mt-2 h-11 border-2"
                  />
                </div>

                <div>
                  <Label htmlFor="purchasePrice" className="font-semibold">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="5000"
                    min={0}
                    className="mt-2 h-11 border-2"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 gradient-primary h-12 text-base shadow-lg hover:shadow-xl transition-all"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Car...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Add Car
                    </>
                  )}
                </Button>
                <Link href="/cars" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-12 text-base border-2">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
