'use client';

import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const benefits = [
  {
    icon: SparklesIcon,
    title: 'Tradición Artesanal',
    description: 'Elaboramos nuestros productos siguiendo las técnicas tradicionales del Valle Eteco, preservando la autenticidad y el sabor único de Oaxaca.',
  },
  {
    icon: HeartIcon,
    title: 'Calidad Superior',
    description: 'Utilizamos solo los mejores ingredientes y procesos rigurosos para garantizar la excelencia en cada producto que llega a tu mesa.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Productores Directos',
    description: 'Al ser productores directos, garantizamos la frescura y calidad de nuestros productos desde el origen hasta tu mesa.',
  },
  {
    icon: ClockIcon,
    title: 'Frescura Garantizada',
    description: 'Nuestros productos son elaborados diariamente, asegurando la máxima frescura y sabor en cada compra.',
  },
  {
    icon: MapPinIcon,
    title: 'Origen Oaxaqueño',
    description: 'Cada producto lleva consigo la esencia del Valle Eteco, reflejando la riqueza cultural y gastronómica de Oaxaca.',
  },
  {
    icon: UserGroupIcon,
    title: 'Compromiso Familiar',
    description: 'Somos una empresa familiar que combina la sabiduría tradicional con un enfoque profesional y de calidad garantizada.',
  },
];

const scrollToElement = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export function Benefits() {
  return (
    <section id="benefits" className="py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-display font-bold mb-4">
            <span className="text-gradient">¿Por qué elegir nuestros productos?</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre las razones por las que nuestros productos son la mejor elección para tu mesa
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-dark-800/50 p-8 rounded-2xl border border-primary-500/10 hover:border-primary-500/30 transition-colors"
            >
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-6">
                <benefit.icon className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          className="mt-16 text-center"
        >
          <button
            onClick={() => scrollToElement('contact')}
            className="btn-primary text-lg px-12 py-5"
          >
            Solicita tu Pedido
          </button>
        </motion.div>
      </div>
    </section>
  );
} 