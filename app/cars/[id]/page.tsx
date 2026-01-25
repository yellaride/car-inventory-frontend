'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { carsApi, remarksApi, mediaApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Edit, Trash2, Plus, Image as ImageIcon, 
  Video, FileText, Calendar, DollarSign, MapPin, Gauge,
  AlertCircle, Upload
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

const conditionColors: Record<string, string> = {
  EXCELLENT: 'bg-green-500',
  GOOD: 'bg-blue-500',
  FAIR: 'bg-yellow-500',
  POOR: 'bg-orange-500',
  SALVAGE: 'bg-red-500',
  JUNK: 'bg-gray-500',
};

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [remarkText, setRemarkText] = useState('');
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch car details
  const { data: car, isLoading } = useQuery({
    queryKey: ['car', resolvedParams.id],
    queryFn: () => carsApi.getById(resolvedParams.id),
  });

  // Delete car mutation
  const deleteMutation = useMutation({
    mutationFn: () => carsApi.delete(resolvedParams.id),
    onSuccess: () => {
      // Invalidate cars cache to refresh listing
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: 'Car deleted successfully' });
      router.push('/cars');
    },
    onError: () => {
      toast({ title: 'Failed to delete car', variant: 'destructive' });
    },
  });

  // Add remark mutation
  const addRemarkMutation = useMutation({
    mutationFn: (text: string) => remarksApi.create({ carId: resolvedParams.id, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car', resolvedParams.id] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setRemarkText('');
      setIsAddingRemark(false);
      toast({ title: 'Remark added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add remark', variant: 'destructive' });
    },
  });

  // Delete remark mutation
  const deleteRemarkMutation = useMutation({
    mutationFn: (remarkId: string) => remarksApi.delete(remarkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car', resolvedParams.id] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: 'Remark deleted successfully' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
          <Link href="/cars">
            <Button>Back to Inventory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = car.media?.filter(m => m.type === 'IMAGE') || [];
  const videos = car.media?.filter(m => m.type === 'VIDEO') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/cars">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">
                  {car.year} {car.make} {car.model}
                </h1>
                <p className="text-sm text-gray-600 font-mono">VIN: {car.vin}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/cars/${car.id}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Car?</DialogTitle>
                  </DialogHeader>
                  <p className="text-gray-600">
                    Are you sure you want to delete this car? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" onClick={() => deleteMutation.mutate()}>
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Gallery */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Media ({car.media?.length || 0})
                  </CardTitle>
                  <Link href={`/cars/${car.id}/upload`}>
                    <Button size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {images.length === 0 && videos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No media uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Images */}
                    {images.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {images.map((media) => (
                            <div
                              key={media.id}
                              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedImage(media.url)}
                            >
                              <img
                                src={media.url}
                                alt={media.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {videos.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Videos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {videos.map((media) => (
                            <video
                              key={media.id}
                              controls
                              className="w-full rounded-lg"
                              src={media.url}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Remarks Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Remarks ({car.remarks?.length || 0})
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsAddingRemark(!isAddingRemark)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Remark
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Add Remark Form */}
                {isAddingRemark && (
                  <div className="mb-4 p-4 border rounded-lg">
                    <Label htmlFor="remark">New Remark</Label>
                    <Input
                      id="remark"
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder="Enter remark..."
                      className="mt-2"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => addRemarkMutation.mutate(remarkText)}
                        disabled={!remarkText.trim() || addRemarkMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsAddingRemark(false);
                          setRemarkText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Remarks List */}
                {car.remarks && car.remarks.length > 0 ? (
                  <div className="space-y-3">
                    {car.remarks.map((remark) => (
                      <div key={remark.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{remark.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(remark.createdAt)} • by {remark.createdBy}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteRemarkMutation.mutate(remark.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isAddingRemark && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No remarks yet</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Car Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className={`${conditionColors[car.condition]} text-white`}>
                    {car.condition}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Year:</span>
                    <span className="font-semibold">{car.year}</span>
                  </div>

                  {car.color && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: car.color.toLowerCase() }} />
                      <span className="text-gray-600">Color:</span>
                      <span className="font-semibold">{car.color}</span>
                    </div>
                  )}

                  {car.mileage && (
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-semibold">{car.mileage.toLocaleString()} miles</span>
                    </div>
                  )}

                  {car.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Location:</span>
                      <span className="font-semibold">{car.location}</span>
                    </div>
                  )}

                  {car.purchasePrice && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Purchase Price:</span>
                      <span className="font-semibold">${car.purchasePrice.toLocaleString()}</span>
                    </div>
                  )}

                  {car.purchaseDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-semibold">{formatDate(car.purchaseDate)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t text-xs text-gray-500">
                  <p>Added: {formatDateTime(car.createdAt)}</p>
                  <p>Updated: {formatDateTime(car.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* VIN Data Card */}
            {car.vinData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">VIN Decoded Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {car.vinData.manufacturer && (
                    <div>
                      <span className="text-gray-600">Manufacturer:</span>
                      <p className="font-semibold">{car.vinData.manufacturer}</p>
                    </div>
                  )}
                  {car.vinData.vehicleType && (
                    <div>
                      <span className="text-gray-600">Vehicle Type:</span>
                      <p className="font-semibold">{car.vinData.vehicleType}</p>
                    </div>
                  )}
                  {car.vinData.bodyClass && (
                    <div>
                      <span className="text-gray-600">Body Class:</span>
                      <p className="font-semibold">{car.vinData.bodyClass}</p>
                    </div>
                  )}
                  {car.vinData.engineModel && (
                    <div>
                      <span className="text-gray-600">Engine:</span>
                      <p className="font-semibold">{car.vinData.engineModel}</p>
                    </div>
                  )}
                  {car.vinData.fuelType && (
                    <div>
                      <span className="text-gray-600">Fuel Type:</span>
                      <p className="font-semibold">{car.vinData.fuelType}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogTitle className="sr-only">Car Image</DialogTitle>
            <img src={selectedImage} alt="Full size" className="w-full h-auto" />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
