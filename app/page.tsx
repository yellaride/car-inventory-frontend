import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Search, FileText, Upload } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Car Inventory</h1>
          </div>
          <Link href="/cars">
            <Button>View Inventory</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Car Inventory Management System
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Comprehensive solution for managing damaged and salvage vehicle inventory with VIN decoding, media uploads, and detailed tracking
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/cars">
            <Button size="lg" className="text-lg">
              <Car className="mr-2 h-5 w-5" />
              Browse Inventory
            </Button>
          </Link>
          <Link href="/cars/new">
            <Button size="lg" variant="outline" className="text-lg">
              <Upload className="mr-2 h-5 w-5" />
              Add New Car
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Car className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>VIN Decoder</CardTitle>
              <CardDescription>
                Automatically fetch car details using VIN number
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Advanced Search</CardTitle>
              <CardDescription>
                Filter by VIN, make, model, condition, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Upload className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Media Upload</CardTitle>
              <CardDescription>
                Upload multiple images and videos for each car
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Remarks System</CardTitle>
              <CardDescription>
                Add notes and comments to track car status
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold text-center mb-12">
            Manage Your Inventory Efficiently
          </h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">Complete CRUD</div>
              <p className="text-blue-100">Create, Read, Update, Delete operations</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Media Storage</div>
              <p className="text-blue-100">Unlimited photos and videos per car</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Real-time Search</div>
              <p className="text-blue-100">Instant filtering and sorting</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2026 Car Inventory Management. Built with Next.js & NestJS</p>
        </div>
      </footer>
    </div>
  );
}
