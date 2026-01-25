'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { carsApi, mediaApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Loader2, Upload, X } from 'lucide-react';

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

  // Decode VIN
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
        title: 'VIN Decoded!', 
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

  // Handle cover image selection
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

  // Create car mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      let coverImageUrl = '';

      // If cover image selected, we'll upload it after car creation
      // but for now create car without it
      const car = await carsApi.create({
        ...formData,
        year: Number(formData.year),
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        purchaseDate: formData.purchaseDate || undefined,
      });

      // If cover image selected, upload it and update car
      if (coverImageFile) {
        try {
          const media = await mediaApi.upload(coverImageFile, car.id, 'IMAGE', 'cover');
          // Update car with cover image URL
          const updatedCar = await carsApi.update(car.id, { 
            coverImage: media.url,
            lastModifiedBy: 'system' 
          });
          return updatedCar;
        } catch (error) {
          console.error('Cover image upload failed:', error);
          // Return car even if image upload fails
          return car;
        }
      }

      return car;
    },
    onSuccess: (data) => {
      // Invalidate cars cache to refresh listing
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: 'Car added successfully!' });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/cars">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Add New Car</h1>
              <p className="text-sm text-gray-600">Enter VIN to auto-fill details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>
              Start by entering the VIN number to automatically fetch car details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* VIN with Decoder */}
              <div>
                <Label htmlFor="vin">VIN Number *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="vin"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    placeholder="1HGBH41JXMN109186"
                    maxLength={17}
                    required
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    onClick={decodeVin}
                    disabled={isDecodingVin || formData.vin.length !== 17}
                  >
                    {isDecodingVin ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Decode
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.vin.length}/17 characters
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    placeholder="Honda"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Accord"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Black"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="condition">Condition *</Label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  {conditions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Cover Image Upload */}
              <div>
                <Label htmlFor="coverImage">Cover Image (for listing)</Label>
                <div className="mt-2">
                  {coverImagePreview ? (
                    <div className="relative">
                      <img 
                        src={coverImagePreview} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setCoverImageFile(null);
                          setCoverImagePreview('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload cover image
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
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This image will appear on the listing page
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mileage">Mileage (miles)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    placeholder="75000"
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="New York"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="5000"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Car'
                  )}
                </Button>
                <Link href="/cars" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
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
