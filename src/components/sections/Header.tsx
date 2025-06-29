'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuIcon, XIcon } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Productos', href: '#products' },
  { label: 'Beneficios', href: '#benefits' },
  { label: 'Contacto', href: '#contact' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-950/80 backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <a href="#hero" className="flex items-center">
              <Image src="/images/LogoCr.jpg" alt="Logo Cremería Raíz" width={62} height={62} className="rounded-lg mr-2" />
              <span className="sr-only">Cremería Raíz</span>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-8"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToElement(item.href.slice(1));
                }}
                className="text-gray-300 hover:text-primary-500 transition-colors"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => scrollToElement('contact')}
              className="btn-primary"
            >
              Ordenar Ahora
            </button>
          </motion.nav>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:hidden text-gray-300 hover:text-primary-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-dark-950/95 backdrop-blur-lg"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement(item.href.slice(1));
                    setIsMobileMenuOpen(false);
                  }}
                  className="block text-gray-300 hover:text-primary-500 transition-colors py-2"
                >
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => {
                  scrollToElement('contact');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full btn-primary"
              >
                Ordenar Ahora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 