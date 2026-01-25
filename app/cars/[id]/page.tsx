'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { carsApi, remarksApi } from '@/lib/api';
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
  AlertCircle, Upload, Car as CarIcon, X
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

const conditionColors: Record<string, string> = {
  EXCELLENT: 'bg-gradient-to-r from-green-500 to-emerald-600',
  GOOD: 'bg-gradient-to-r from-blue-500 to-cyan-600',
  FAIR: 'bg-gradient-to-r from-yellow-500 to-amber-600',
  POOR: 'bg-gradient-to-r from-orange-500 to-red-600',
  SALVAGE: 'bg-gradient-to-r from-red-600 to-rose-700',
  JUNK: 'bg-gradient-to-r from-gray-600 to-slate-700',
};

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [remarkText, setRemarkText] = useState('');
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', resolvedParams.id],
    queryFn: () => carsApi.getById(resolvedParams.id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => carsApi.delete(resolvedParams.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast({ title: 'Car deleted successfully' });
      router.push('/cars');
    },
    onError: () => {
      toast({ title: 'Failed to delete car', variant: 'destructive' });
    },
  });

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
      <div className="min-h-screen gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="relative h-20 w-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen gradient-secondary flex items-center justify-center p-4">
        <div className="text-center glass-effect rounded-2xl p-8 sm:p-12 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
          <p className="text-gray-600 mb-6">This vehicle doesn't exist or has been removed</p>
          <Link href="/cars">
            <Button className="gradient-primary">Back to Inventory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = car.media?.filter(m => m.type === 'IMAGE') || [];
  const videos = car.media?.filter(m => m.type === 'VIDEO') || [];

  return (
    <div className="min-h-screen gradient-secondary">
      {/* Modern Header */}
      <header className="glass-effect border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/cars">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  {car.year} {car.make} {car.model}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-mono truncate">VIN: {car.vin}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href={`/cars/${car.id}/edit`} className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media Gallery */}
            <Card className="overflow-hidden border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <ImageIcon className="h-5 w-5 text-purple-600" />
                    Media Gallery ({car.media?.length || 0})
                  </CardTitle>
                  <Link href={`/cars/${car.id}/upload`} className="w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto gradient-primary">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Media
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {images.length === 0 && videos.length === 0 ? (
                  <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">No media uploaded yet</p>
                    <Link href={`/cars/${car.id}/upload`}>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {images.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900">Images</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                          {images.map((media) => (
                            <div
                              key={media.id}
                              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 hover:border-purple-400 transition-all"
                              onClick={() => setSelectedImage(media.url)}
                            >
                              <img
                                src={media.url}
                                alt={media.fileName}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-sm font-medium">View Full</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {videos.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-gray-900">Videos</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {videos.map((media) => (
                            <video
                              key={media.id}
                              controls
                              className="w-full rounded-xl shadow-lg border-2"
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
            <Card className="overflow-hidden border-2 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Remarks ({car.remarks?.length || 0})
                  </CardTitle>
                  <Button size="sm" onClick={() => setIsAddingRemark(!isAddingRemark)} variant="outline" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Remark
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isAddingRemark && (
                  <div className="mb-6 p-4 sm:p-6 border-2 border-purple-100 rounded-xl bg-purple-50/50">
                    <Label htmlFor="remark" className="text-base font-semibold">New Remark</Label>
                    <Input
                      id="remark"
                      value={remarkText}
                      onChange={(e) => setRemarkText(e.target.value)}
                      placeholder="Enter your note or comment..."
                      className="mt-2 border-2"
                    />
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => addRemarkMutation.mutate(remarkText)}
                        disabled={!remarkText.trim() || addRemarkMutation.isPending}
                        className="gradient-primary"
                      >
                        {addRemarkMutation.isPending ? 'Saving...' : 'Save'}
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

                {car.remarks && car.remarks.length > 0 ? (
                  <div className="space-y-3">
                    {car.remarks.map((remark) => (
                      <div key={remark.id} className="p-4 border-2 rounded-xl bg-white hover:border-purple-200 transition-colors group">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base text-gray-800 mb-2">{remark.text}</p>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(remark.createdAt)} • by {remark.createdBy}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">No remarks yet</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vehicle Info Card */}
            <Card className="overflow-hidden border-2 shadow-lg sticky top-24">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-lg sm:text-xl">Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex justify-center">
                  <Badge className={`${conditionColors[car.condition]} text-white shadow-lg border-0 px-4 py-2 text-base`}>
                    {car.condition}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Calendar, label: 'Year', value: car.year },
                    { icon: MapPin, label: 'Location', value: car.location },
                    { icon: Gauge, label: 'Mileage', value: car.mileage ? `${car.mileage.toLocaleString()} miles` : null },
                    { icon: DollarSign, label: 'Purchase Price', value: car.purchasePrice ? `$${car.purchasePrice.toLocaleString()}` : null },
                    { icon: Calendar, label: 'Purchase Date', value: car.purchaseDate ? formatDate(car.purchaseDate) : null },
                  ].map((item, i) => 
                    item.value && (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors">
                        <item.icon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                          <p className="font-semibold text-gray-900 truncate">{item.value}</p>
                        </div>
                      </div>
                    )
                  )}

                  {car.color && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-5 h-5 rounded-full border-2 shadow-sm" style={{ backgroundColor: car.color.toLowerCase() }} />
                      <div>
                        <p className="text-xs text-gray-500">Color</p>
                        <p className="font-semibold text-gray-900">{car.color}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-1">
                  <p className="text-xs text-gray-500">Added: {formatDateTime(car.createdAt)}</p>
                  <p className="text-xs text-gray-500">Updated: {formatDateTime(car.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* VIN Data Card */}
            {car.vinData && (
              <Card className="overflow-hidden border-2 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardTitle className="text-base sm:text-lg">VIN Decoded Data</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3 text-sm">
                  {[
                    { label: 'Manufacturer', value: car.vinData.manufacturer },
                    { label: 'Vehicle Type', value: car.vinData.vehicleType },
                    { label: 'Body Class', value: car.vinData.bodyClass },
                    { label: 'Engine', value: car.vinData.engineModel },
                    { label: 'Fuel Type', value: car.vinData.fuelType },
                    { label: 'Country', value: car.vinData.plantCountry },
                  ].map((item, i) =>
                    item.value && (
                      <div key={i} className="p-2 rounded-lg bg-gray-50">
                        <span className="text-gray-500 text-xs">{item.label}:</span>
                        <p className="font-semibold text-gray-900">{item.value}</p>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vehicle?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">
              Are you sure you want to permanently delete this vehicle? This action cannot be undone.
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900 font-medium">
                {car.year} {car.make} {car.model}
              </p>
              <p className="text-xs text-red-700 font-mono mt-1">{car.vin}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                deleteMutation.mutate();
                setShowDeleteDialog(false);
              }}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-0">
            <DialogTitle className="sr-only">Car Image</DialogTitle>
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white z-10"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img src={selectedImage} alt="Full size" className="w-full h-auto rounded-lg" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
