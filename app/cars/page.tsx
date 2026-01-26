'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { searchApi, type Car } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/LogoutButton';
import { Plus, Search, Car as CarIcon, Image as ImageIcon, FileText, ArrowLeft, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const conditionColors: Record<string, string> = {
  EXCELLENT: 'bg-gradient-to-r from-green-500 to-emerald-600',
  GOOD: 'bg-gradient-to-r from-blue-500 to-cyan-600',
  FAIR: 'bg-gradient-to-r from-yellow-500 to-amber-600',
  POOR: 'bg-gradient-to-r from-orange-500 to-red-600',
  SALVAGE: 'bg-gradient-to-r from-red-600 to-rose-700',
  JUNK: 'bg-gradient-to-r from-gray-600 to-slate-700',
};

export default function CarsListPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cars', searchQuery, page],
    queryFn: () => searchApi.search({ q: searchQuery, page, limit: 12 }),
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Modern Header - Glass Effect */}
      <header className="sticky top-0 z-40 glass-effect border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/" className="sm:hidden">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl gradient-primary">
                  <CarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Car Inventory
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Manage your vehicles</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/cars/new" className="flex-1 sm:flex-none">
                <Button className="w-full gradient-primary shadow-lg hover:shadow-xl transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add New Car</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
              <LogoutButton variant="outline" className="border-2 hover:bg-red-50 hover:border-red-300 text-red-600" />
            </div>
          </div>

          {/* Modern Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-purple-600 transition-colors" />
            <Input
              type="text"
              placeholder="Search by VIN, make, model, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 sm:h-14 text-base sm:text-lg border-2 focus:border-purple-500 rounded-xl shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Bar */}
        {data && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-white border shadow-sm">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-purple-600">{data.data.length}</span> of{' '}
              <span className="font-semibold text-purple-600">{data.pagination.total}</span> cars
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        )}

        {/* Loading State - Skeletons */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-48 sm:h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State - Improved */}
        {error && !isLoading && (
          <div className="text-center py-12 sm:py-20">
            <div className="max-w-md mx-auto glass-effect rounded-2xl p-8 border-2 border-red-100">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Connection Error</h3>
              <p className="text-red-700 mb-4">Unable to connect to backend. Please check:</p>
              <ul className="text-left text-sm text-red-600 space-y-1 mb-6">
                <li>• Backend is running</li>
                <li>• Database connection is active</li>
                <li>• Network connectivity</li>
              </ul>
              <Button onClick={() => window.location.reload()} className="gradient-primary">
                Retry Connection
              </Button>
            </div>
          </div>
        )}

        {/* Empty State - Attractive */}
        {data && data.data.length === 0 && !searchQuery && (
          <div className="text-center py-16 sm:py-24">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                <CarIcon className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">No Cars Yet</h3>
              <p className="text-gray-600 mb-6 text-lg">Start building your inventory by adding your first vehicle</p>
              <Link href="/cars/new">
                <Button size="lg" className="gradient-primary shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Your First Car
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {data && data.data.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Cars Grid - Modern Cards */}
        {data && data.data.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {data.data.map((car: Car) => (
                <Link key={car.id} href={`/cars/${car.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full overflow-hidden border-2 hover:border-purple-200">
                    {/* Image Container with Overlay */}
                    <div className="relative h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {car.coverImage || (car.media && car.media.length > 0) ? (
                        <>
                          <img
                            src={car.coverImage || car.media?.[0]?.url || ''}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <CarIcon className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300" />
                        </div>
                      )}
                      {/* Condition Badge */}
                      <Badge className={`absolute top-3 right-3 ${conditionColors[car.condition]} text-white shadow-lg border-0 px-3 py-1`}>
                        {car.condition}
                      </Badge>
                    </div>

                    {/* Card Content */}
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {car.year} {car.make} {car.model}
                      </h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="font-mono text-xs bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                          <span className="text-gray-500">VIN:</span> <span className="font-semibold text-purple-900">{car.vin}</span>
                        </div>
                        
                        {car.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-base">📍</span>
                            <span>{car.location}</span>
                          </p>
                        )}
                        
                        {car.mileage && (
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="text-base">🚗</span>
                            <span>{car.mileage.toLocaleString()} miles</span>
                          </p>
                        )}
                      </div>

                      {/* Footer Stats */}
                      <div className="flex justify-between items-center pt-3 border-t text-xs text-gray-500">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {car._count?.media || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            {car._count?.remarks || 0}
                          </span>
                        </div>
                        <span className="text-xs">{formatDate(car.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Modern Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8 sm:mt-12">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border">
                  <span className="text-sm text-gray-600">Page</span>
                  <span className="font-bold text-purple-600">{page}</span>
                  <span className="text-sm text-gray-600">of {data.pagination.totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
