import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Car, Search, FileText, Upload, ArrowRight, CheckCircle2, Zap, Shield, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Modern Header with Glass Effect */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow">
                <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Car Inventory
              </span>
            </Link>
            <div className="flex gap-2 sm:gap-3">
              <Link href="/cars">
                <Button variant="ghost" className="hidden sm:inline-flex">View Inventory</Button>
              </Link>
              <Link href="/cars/new">
                <Button className="gradient-primary">
                  <span className="hidden sm:inline">Add Car</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Modern Gradient */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 gradient-secondary relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-purple-200 mb-6 sm:mb-8">
              <Zap className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Production Ready System</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 text-balance">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Manage Your Car Inventory
              </span>
              <br />
              <span className="text-gray-900">Like Never Before</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Complete solution for damaged & salvage vehicles with VIN decoding, media management, and real-time tracking
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cars">
                <Button size="lg" className="w-full sm:w-auto gradient-primary text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 shadow-lg hover:shadow-xl transition-all">
                  <Car className="mr-2 h-5 w-5" />
                  Browse Inventory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cars/new">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 border-2 hover:bg-purple-50">
                  <Upload className="mr-2 h-5 w-5" />
                  Add New Car
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Modern Cards */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your vehicle inventory efficiently
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Car, title: 'VIN Decoder', desc: 'Auto-fetch car details from VIN number', color: 'from-purple-500 to-purple-600' },
              { icon: Search, title: 'Smart Search', desc: 'Filter by VIN, make, model, condition', color: 'from-blue-500 to-blue-600' },
              { icon: Upload, title: 'Media Upload', desc: 'Multiple images and videos support', color: 'from-green-500 to-green-600' },
              { icon: FileText, title: 'Remarks', desc: 'Track status with comments & notes', color: 'from-orange-500 to-orange-600' },
            ].map((feature, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-200">
                <div className="p-6 sm:p-8">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Design */}
      <section className="py-16 sm:py-24 gradient-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-effect rounded-3xl p-8 sm:p-12 lg:p-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 text-gray-900">
              Built for Scale & Performance
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              {[
                { icon: CheckCircle2, title: 'Complete CRUD', desc: 'Full create, read, update, delete operations' },
                { icon: Shield, title: 'Secure Storage', desc: 'Safe media storage with backups' },
                { icon: BarChart3, title: 'Real-time Analytics', desc: 'Instant search and filtering' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-4">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">{stat.title}</div>
                  <p className="text-gray-600">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Get Started?</h3>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12">
              Start managing your inventory with powerful tools and intuitive interface
            </p>
            <Link href="/cars">
              <Button size="lg" className="gradient-primary text-lg h-14 px-8 shadow-lg hover:shadow-xl transition-all">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Clean & Modern */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Car Inventory</span>
            </div>
            <p className="text-gray-600 text-sm text-center sm:text-left">
              &copy; 2026 Built with Next.js 15 & NestJS 11
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
