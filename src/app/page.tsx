'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Dumbbell, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Spotlight component for elegant hero effect
const Spotlight = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className={cn(
        'pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500',
        className
      )}
      style={{
        background:
          'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(201, 168, 124, 0.06), transparent 40%)',
      }}
    />
  );
};

// Animated border component
const AnimatedBorder = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('relative group', className)}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 via-transparent to-accent/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="relative">{children}</div>
    </div>
  );
};

// Feature card component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
            <Icon className="h-6 w-6 text-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Mouse tracking for spotlight effect
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.spotlight-card');
      cards.forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 pt-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-sm text-muted-foreground">Minimalista y poderoso</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                <span className="block">Tu fuerza,</span>
                <span className="block text-muted-foreground">sin complicaciones</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Registra tus entrenamientos con elegancia. Una experiencia de seguimiento 
              diseñada para quienes valoran la simplicidad y la eficacia.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                href="/workout/new"
                className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-background font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-foreground/20"
              >
                <span>Comenzar entrenamiento</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/history"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border px-8 font-medium transition-all duration-300 hover:bg-secondary hover:border-muted-foreground/30"
              >
                <span>Ver historial</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Elegant divider */}
        <div className="max-w-xl mx-auto px-6">
          <div className="elegant-divider" />
        </div>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Diseñado para el rendimiento
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Cada detalle pensado para que te enfoques en lo que importa: tu progreso.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Dumbbell}
                title="Registro inteligente"
                description="Agrega ejercicios y series con un flujo natural. Tu ultimo peso y repeticiones siempre a la mano."
                delay={1.1}
              />
              <FeatureCard
                icon={Clock}
                title="Temporizador integrado"
                description="Control preciso de tus descansos. Mantén el ritmo sin perder la concentración."
                delay={1.2}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Progreso visible"
                description="Visualiza tu evolución con métricas claras. Cada sesión cuenta para tu historia."
                delay={1.3}
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <AnimatedBorder>
              <div className="spotlight-card relative overflow-hidden rounded-2xl border border-border bg-card p-10 md:p-14">
                <Spotlight className="opacity-100" />
                <div className="relative">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Listo para empezar?
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    No necesitas crear una cuenta. Comienza a registrar tu primer entrenamiento ahora.
                  </p>
                  <Link
                    href="/workout/new"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-background font-medium transition-all duration-300 hover:scale-105"
                  >
                    <span>Iniciar ahora</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </AnimatedBorder>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
