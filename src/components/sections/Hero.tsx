'use client';

import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { scrollToElement } from '@/lib/utils';
import Image from 'next/image';

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const floatingIconVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export function Hero() {
  const handleCTAClick = () => {
    scrollToElement('products');
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-dark-950 to-dark-900 pt-20"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating icons (ahora imágenes de productos) */}
        <motion.div
          variants={floatingIconVariants}
          animate="animate"
          className="absolute top-20 left-10"
        >
          <Image src="/images/queso.jpg" alt="Queso flotante" width={48} height={48} className="rounded-full opacity-30" />
        </motion.div>
        <motion.div
          variants={floatingIconVariants}
          animate="animate"
          className="absolute top-40 right-20"
          style={{ animationDelay: '2s' }}
        >
          <Image src="/images/quesillo.jpg" alt="Quesillo flotante" width={56} height={56} className="rounded-full opacity-40" />
        </motion.div>
        <motion.div
          variants={floatingIconVariants}
          animate="animate"
          className="absolute bottom-40 left-20"
          style={{ animationDelay: '4s' }}
        >
          <Image src="/images/queso.jpg" alt="Queso flotante" width={64} height={64} className="rounded-full opacity-25" />
        </motion.div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Tradición y Calidad desde 2006
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
              <span className="text-white">El Sabor Auténtico</span>
              <br />
              <span className="text-gradient">de Oaxaca en tu Mesa</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Descubre el{' '}
              <span className="text-primary-400 font-semibold">Queso</span> y{' '}
              <span className="text-primary-400 font-semibold">Quesillo</span> del{' '}
              <span className="text-primary-400 font-semibold">Valle Eteco</span>,{' '}
              elaborados con métodos tradicionales y la mejor calidad
            </p>
          </motion.div>

          {/* Key benefits */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap justify-center gap-8 text-sm sm:text-base">
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Productores Directos
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Métodos Tradicionales
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Calidad Garantizada
              </div>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={handleCTAClick}
              className="btn-primary text-lg px-12 py-5 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explora Nuestros Productos
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform inline" />
            </motion.button>
            
            <motion.button
              onClick={() => scrollToElement('about')}
              className="btn-secondary text-lg px-12 py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Conoce Nuestra Historia
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div variants={itemVariants} className="pt-8">
            <p className="text-gray-400 text-sm mb-4">
              El sabor auténtico que conquista paladares
            </p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="text-primary-400 font-semibold">Desde 2006</div>
              <div className="w-1 h-1 bg-primary-500 rounded-full" />
              <div className="text-primary-400 font-semibold">100% Artesanal</div>
              <div className="w-1 h-1 bg-primary-500 rounded-full" />
              <div className="text-primary-400 font-semibold">Valle Eteco</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator personalizado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-gray-400 text-xs">Descubre más</span>
          <motion.div
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-10 h-10 flex justify-center items-center"
          >
            <Image src="/images/queso.jpg" alt="Scroll queso" width={40} height={40} className="rounded-full shadow-lg border-2 border-primary-500 bg-white" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
} 