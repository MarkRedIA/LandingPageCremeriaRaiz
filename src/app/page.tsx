import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { Products } from '@/components/sections/Products';
import { Benefits } from '@/components/sections/Benefits';
import { Contact } from '@/components/sections/Contact';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { FloatingParticles } from '@/components/ui/FloatingParticles';
import DashboardSection from '@/components/sections/DashboardSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-950 custom-scrollbar relative">
      {/* Premium UI Components */}
      <ScrollIndicator />
      <CustomCursor />
      <FloatingParticles count={15} />
      
      {/* Header with navigation */}
      <Header />
      
      {/* Hero section */}
      <Hero />
      
      {/* Products section */}
      <Products />
      
      {/* Benefits section */}
      <Benefits />
      
      {/* Contact form section */}
      <Contact />
      {/* Dashboard section (protegida) */}
      <DashboardSection />
      
      {/* Footer */}
      <footer className="bg-dark-950 border-t border-primary-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-display font-bold text-gradient">
              Cremería<span className="text-white">Raíz</span>
            </h3>
            <p className="text-gray-400">
              El sabor auténtico del Valle Eteco · Tradición desde 2006
            </p>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <span>© 2024 Cremería Raíz. Todos los derechos reservados.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
