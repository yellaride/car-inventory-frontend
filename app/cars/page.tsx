'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { searchApi, type Car } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Car as CarIcon, Image as ImageIcon, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const conditionColors: Record<string, string> = {
  EXCELLENT: 'bg-green-500',
  GOOD: 'bg-blue-500',
  FAIR: 'bg-yellow-500',
  POOR: 'bg-orange-500',
  SALVAGE: 'bg-red-500',
  JUNK: 'bg-gray-500',
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <CarIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Car Inventory</h1>
            </Link>
            <Link href="/cars/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Car
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by VIN, make, model, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        {data && (
          <div className="mb-6 text-sm text-gray-600">
            Showing {data.data.length} of {data.pagination.total} cars
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-48 bg-gray-200"></CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Backend Connection Error
                </h3>
                <p className="text-red-700 mb-4">
                  Unable to connect to the backend server. Please make sure:
                </p>
                <ul className="text-left text-sm text-red-600 space-y-1 mb-4">
                  <li>• Backend is running on port 3001</li>
                  <li>• Database connection is working</li>
                  <li>• Check terminal for error logs</li>
                </ul>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {data && data.data.length === 0 && (
          <div className="text-center py-12">
            <CarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No cars found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or add a new car</p>
            <Link href="/cars/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Car
              </Button>
            </Link>
          </div>
        )}

        {/* Cars Grid */}
        {data && data.data.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.data.map((car: Car) => (
                <Link key={car.id} href={`/cars/${car.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="p-0">
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                        {car.coverImage ? (
                          <img
                            src={car.coverImage}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : car.media && car.media.length > 0 ? (
                          <img
                            src={car.media[0].url}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CarIcon className="h-20 w-20 text-gray-400" />
                        )}
                        <Badge
                          className={`absolute top-2 right-2 ${conditionColors[car.condition]} text-white`}
                        >
                          {car.condition}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2">
                        {car.year} {car.make} {car.model}
                      </CardTitle>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          VIN: {car.vin}
                        </p>
                        {car.location && <p>📍 {car.location}</p>}
                        {car.mileage && <p>🚗 {car.mileage.toLocaleString()} miles</p>}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        {car._count?.media || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {car._count?.remarks || 0}
                      </span>
                      <span className="text-xs">
                        {formatDate(car.createdAt)}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-4">
                  Page {page} of {data.pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  disabled={page === data.pagination.totalPages}
                  onClick={() => setPage(page + 1)}
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
