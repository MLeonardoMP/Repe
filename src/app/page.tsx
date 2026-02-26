'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Dumbbell, Clock, TrendingUp, ChevronRight, Zap, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Geometric Grid Background - Inspired by Next.js
const GeometricGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(201, 168, 124, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201, 168, 124, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
      
      {/* Larger accent grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(201, 168, 124, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(201, 168, 124, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '180px 180px',
      }} />
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 168, 124, 0.12), transparent)',
        }}
      />
    </div>
  );
};

// Stable particle positions (pre-computed to avoid hydration mismatch)
const PARTICLES = [
  { id: 0,  x: 12,  y: 8,  size: 2, duration: 18, delay: 0 },
  { id: 1,  x: 34,  y: 22, size: 3, duration: 22, delay: 1 },
  { id: 2,  x: 58,  y: 15, size: 1, duration: 17, delay: 2 },
  { id: 3,  x: 78,  y: 35, size: 2, duration: 20, delay: 0.5 },
  { id: 4,  x: 91,  y: 12, size: 3, duration: 24, delay: 3 },
  { id: 5,  x: 23,  y: 55, size: 1, duration: 19, delay: 1.5 },
  { id: 6,  x: 45,  y: 68, size: 2, duration: 21, delay: 4 },
  { id: 7,  x: 67,  y: 45, size: 3, duration: 16, delay: 2.5 },
  { id: 8,  x: 88,  y: 72, size: 1, duration: 23, delay: 0.8 },
  { id: 9,  x: 5,   y: 85, size: 2, duration: 25, delay: 3.5 },
  { id: 10, x: 30,  y: 90, size: 3, duration: 18, delay: 1.2 },
  { id: 11, x: 52,  y: 78, size: 1, duration: 20, delay: 4.5 },
  { id: 12, x: 74,  y: 92, size: 2, duration: 22, delay: 0.3 },
  { id: 13, x: 95,  y: 60, size: 3, duration: 17, delay: 2.8 },
  { id: 14, x: 18,  y: 42, size: 1, duration: 19, delay: 1.8 },
  { id: 15, x: 40,  y: 30, size: 2, duration: 24, delay: 3.2 },
  { id: 16, x: 62,  y: 58, size: 3, duration: 16, delay: 0.6 },
  { id: 17, x: 83,  y: 20, size: 1, duration: 21, delay: 4.2 },
  { id: 18, x: 8,   y: 65, size: 2, duration: 23, delay: 1.6 },
  { id: 19, x: 50,  y: 5,  size: 3, duration: 18, delay: 3.8 },
];

// Floating particles effect
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-accent/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Interactive spotlight that follows mouse
const InteractiveSpotlight = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    
    const handleMouseLeave = () => setIsVisible(false);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-30"
      animate={{
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
          background: 'radial-gradient(circle, rgba(201, 168, 124, 0.04) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
};

// Animated line decoration
const AnimatedLines = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Horizontal lines */}
      {[20, 40, 60, 80].map((top, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px"
          style={{ top: `${top}%` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.05 }}
          transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-accent to-transparent" />
        </motion.div>
      ))}
      
      {/* Vertical lines */}
      {[25, 50, 75].map((left, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px"
          style={{ left: `${left}%` }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 0.05 }}
          transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: 'easeOut' }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-accent to-transparent" />
        </motion.div>
      ))}
    </div>
  );
};

// 3D Tilt Card Component
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }, [x, y]);
  
  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative', className)}
    >
      {children}
    </motion.div>
  );
};

// Shimmering text effect
const ShimmerText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <span className={cn('relative inline-block', className)}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        style={{ 
          WebkitBackgroundClip: 'text',
          maskImage: 'linear-gradient(90deg, transparent, white, transparent)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />
    </span>
  );
};

// Animated counter
const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span className="number-display">{displayValue}{suffix}</span>;
};

// Feature card with hover effects
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <TiltCard>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-500 hover:border-accent/30 hover:bg-card/80">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(201, 168, 124, 0.1) 45%, rgba(201, 168, 124, 0.2) 50%, rgba(201, 168, 124, 0.1) 55%, transparent 60%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
          
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/50 border border-border/50 group-hover:border-accent/30 transition-colors duration-300">
              <Icon className="h-7 w-7 text-foreground group-hover:text-accent transition-colors duration-300" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
};

// Stats card
const StatCard = ({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">{label}</div>
    </motion.div>
  );
};

// CTA Section with animated border
const CTASection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-accent/20 via-accent/5 to-accent/20 blur-sm" />
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md p-12 md:p-16">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(201, 168, 124, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Sin registro necesario
            </span>
          </motion.div>
          
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            Comienza ahora,
            <br />
            <span className="text-muted-foreground">sin excusas</span>
          </h3>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
            Tu primer entrenamiento esta a un click de distancia. 
            Guarda tu progreso localmente y entrena sin distracciones.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/workout/new"
              className="group relative inline-flex h-14 items-center justify-center gap-3 rounded-full bg-foreground px-10 text-background font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-foreground/10 overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-accent"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 group-hover:text-accent-foreground transition-colors">Comenzar ahora</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-all group-hover:translate-x-1 group-hover:text-accent-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-accent border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background effects */}
      <GeometricGrid />
      <FloatingParticles />
      <AnimatedLines />
      <InteractiveSpotlight />
      
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-border/50 bg-card/30 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
                </span>
                <span className="text-sm font-medium text-muted-foreground">Minimalista. Poderoso. Tuyo.</span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-6"
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9]">
                <ShimmerText>Tu fuerza,</ShimmerText>
                <br />
                <span className="text-muted-foreground">sin limites</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
            >
              Registra cada repeticion con elegancia. Diseñado para atletas 
              que valoran la <span className="text-foreground font-medium">simplicidad</span> y la <span className="text-foreground font-medium">eficacia</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6"
            >
              <Link
                href="/workout/new"
                className="group relative inline-flex h-16 items-center justify-center gap-3 rounded-full bg-foreground px-10 text-background font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-foreground/20"
              >
                <span>Comenzar entrenamiento</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="/history"
                className="group inline-flex h-16 items-center justify-center gap-3 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm px-10 font-semibold text-lg transition-all duration-300 hover:bg-card/60 hover:border-border"
              >
                <span>Ver historial</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="pt-16"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex flex-col items-center gap-2 text-muted-foreground"
              >
                <span className="text-xs uppercase tracking-widest">Descubre mas</span>
                <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Divider with accent */}
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Features Section */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <span className="inline-block px-4 py-1.5 rounded-full border border-border/50 bg-card/30 text-sm font-medium text-muted-foreground mb-6">
                Caracteristicas
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Diseñado para
                <br />
                <span className="text-muted-foreground">el rendimiento</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Cada detalle pensado para que te enfoques en lo que importa: tu progreso.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Dumbbell}
                title="Registro inteligente"
                description="Agrega ejercicios y series con un flujo natural. Tu ultimo peso y repeticiones siempre a la mano."
                index={0}
              />
              <FeatureCard
                icon={Clock}
                title="Temporizador integrado"
                description="Control preciso de tus descansos. Mantén el ritmo sin perder la concentracion."
                index={1}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Progreso visible"
                description="Visualiza tu evolucion con métricas claras. Cada sesion cuenta para tu historia."
                index={2}
              />
              <FeatureCard
                icon={Target}
                title="Objetivos claros"
                description="Define tus metas y visualiza tu camino hacia ellas con indicadores precisos."
                index={3}
              />
              <FeatureCard
                icon={BarChart3}
                title="Estadisticas detalladas"
                description="Analiza tu rendimiento con datos que realmente importan para tu progreso."
                index={4}
              />
              <FeatureCard
                icon={Zap}
                title="Rapido y ligero"
                description="Sin tiempos de carga. Tu app de entrenamiento lista cuando tu lo estas."
                index={5}
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-8 p-10 rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm"
            >
              <StatCard value={100} label="Offline" suffix="%" />
              <StatCard value={0} label="Costo" suffix="$" />
              <StatCard value={60} label="Segundos para empezar" suffix="s" />
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto">
            <CTASection />
          </div>
        </section>

        {/* Footer space */}
        <div className="h-20" />
      </main>
    </div>
  );
}
