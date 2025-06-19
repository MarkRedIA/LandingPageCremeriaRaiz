'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

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

const scrollToElement = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export function Products() {
  return (
    <section id="products" className="py-24 bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-display font-bold mb-4">
            <span className="text-gradient">Nuestros Productos Estrella</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-gray-300 max-w-3xl mx-auto">
            Elaborados con métodos tradicionales en el Valle Eteco, Oaxaca
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Queso */}
          <motion.div
            variants={itemVariants}
            className="relative aspect-square rounded-2xl overflow-hidden"
          >
            <Image
              src="/images/queso.jpg"
              alt="Queso del Valle Eteco"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-3xl font-display font-bold text-primary-500">Queso del Valle Eteco</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Nuestro queso artesanal es elaborado con leche fresca de vaca, siguiendo las técnicas
              tradicionales del Valle Eteco. Su sabor único y textura cremosa lo hacen perfecto para
              cualquier ocasión.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Elaborado con leche fresca de vaca
              </li>
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Proceso artesanal tradicional
              </li>
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Maduración natural
              </li>
            </ul>
          </motion.div>

          {/* Quesillo */}
          <motion.div variants={itemVariants} className="space-y-6 order-3 md:order-4">
            <h3 className="text-3xl font-display font-bold text-primary-500">Quesillo Oaxaqueño</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              El quesillo es nuestro producto más emblemático, elaborado con técnicas ancestrales
              que han pasado de generación en generación. Su textura suave y sabor delicado lo
              hacen irresistible.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Técnicas ancestrales
              </li>
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Textura suave y elástica
              </li>
              <li className="flex items-center text-gray-300">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                Sabor delicado y versátil
              </li>
            </ul>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative aspect-square rounded-2xl overflow-hidden order-2 md:order-3"
          >
            <Image
              src="/images/quesillo.jpg"
              alt="Quesillo Oaxaqueño"
              fill
              className="object-cover"
            />
          </motion.div>
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