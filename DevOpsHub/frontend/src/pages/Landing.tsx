import { Link } from 'react-router-dom';
import { Terminal, Shield, Activity, ArrowRight, Zap, Globe, Lock, Server, Code, CheckCircle2, Cloud } from 'lucide-react';
import content from '../data/landing-content.json';
import { motion, useScroll, useTransform } from 'framer-motion';

const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 256 256" fill="currentColor" className={className}>
    <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
  </svg>
);

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <div className="relative min-h-[100svh] bg-[#050505] text-[#EDEDED] font-sans overflow-x-hidden selection:bg-[#EAB308]/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/marvels-spider-man-3840x2160-11990.jpeg" alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-yellow-900/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-orange-900/5 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6"
      >
        <div className="w-full max-w-5xl px-4 py-2 flex items-center justify-between rounded-full bg-[#111111]/70 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
              <Logo className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-white text-lg tracking-wide">SELFHOST</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors tracking-wide hidden sm:block">
              Sign In
            </Link>
            <Link to="/signup" className="group relative bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center gap-2">
                Deploy Now
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[100svh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-24 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            <motion.div 
              style={{ y: heroY, opacity: heroOpacity }}
              className="flex-1 w-full flex flex-col items-start pt-10"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-6xl sm:text-7xl lg:text-[110px] font-serif font-bold tracking-tighter leading-[0.85] mb-8"
              >
                Automate<br />
                <span className="italic font-light text-neutral-500">Your</span><br />
                Development.
              </motion.h1>


              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg sm:text-xl text-neutral-400 max-w-lg mb-10 leading-relaxed font-light"
              >
                {content.hero.description}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <Link to="/signup" className="group relative flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  {content.hero.primaryCta}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="https://github.com" className="flex items-center justify-center gap-2 bg-transparent text-white px-8 py-4 rounded-full border border-white/10 font-medium text-sm hover:bg-white/5 transition-colors">
                  <Terminal size={16} />
                  {content.hero.secondaryCta}
                </a>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full relative perspective-[1000px]"
            >
              {/* Floating Dashboard Elements */}
              <div className="relative w-full aspect-square max-w-[600px] mx-auto group">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#111] to-[#1A1A1A] rounded-3xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden transform transition-transform duration-700 group-hover:-rotate-y-2 group-hover:rotate-x-2">
                  {/* Top Bar */}
                  <div className="h-12 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    <div className="ml-4 px-3 py-1 rounded bg-black/30 text-xs text-neutral-400 font-mono flex items-center gap-2">
                      <Lock size={10} /> Terminal
                    </div>
                  </div>
                  {/* Terminal Simulation */}
                  <div className="p-6 font-mono text-sm h-full flex flex-col">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="text-[#EAB308] mb-2"
                    >
                      $ devopshub deploy --auto
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 }}
                      className="text-neutral-400 mb-1"
                    >
                      [1/9] Validating repository... <span className="text-green-400">OK</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.2 }}
                      className="text-neutral-400 mb-1"
                    >
                      [5/9] Cloning source code... <span className="text-green-400">OK</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.6 }}
                      className="text-neutral-400 mb-4"
                    >
                      [7/9] Building Docker image... <span className="text-yellow-400 animate-pulse">In Progress</span>
                    </motion.div>
                    
                    {/* Animated Logs */}
                    <div className="bg-black/50 rounded-lg p-4 text-xs text-neutral-500 flex-1 overflow-hidden relative border border-white/5">
                       <motion.div
                         animate={{ y: [-20, -100] }}
                         transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                         className="flex flex-col gap-1.5"
                       >
                         <p>{">"} Step 1/15 : FROM node:18-alpine</p>
                         <p>{">"} Step 2/15 : WORKDIR /app</p>
                         <p>{">"} Step 3/15 : COPY package*.json ./</p>
                         <p>{">"} Step 4/15 : RUN npm install</p>
                         <p className="text-neutral-400">added 432 packages in 12s</p>
                         <p>{">"} Step 5/15 : COPY . .</p>
                         <p>{">"} Step 6/15 : RUN npm run build</p>
                         <p className="text-green-500">✓ Built in 4.2s</p>
                       </motion.div>
                       <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-4 lg:-right-12 top-20 p-4 rounded-2xl bg-[#111]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Live URL</div>
                    <div className="text-xs text-neutral-400">Ready in 42s</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-4 lg:-left-8 bottom-32 p-4 rounded-2xl bg-[#111]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EAB308]/20 flex items-center justify-center text-[#EAB308]">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">CPU 12%</div>
                    <div className="text-xs text-neutral-400">t3.micro running</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem & Solution (Unified Split Section) */}
      <section className="relative z-10 py-32 bg-black border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111] via-black to-black" />
        <div className="max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-stretch">
            
            {/* The Problem Side */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex-1 rounded-3xl bg-[#0A0A0A] border border-white/5 p-10 lg:p-14 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-900/10 blur-[80px] rounded-full group-hover:bg-red-900/20 transition-colors duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-red-200">THE PROBLEM</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif text-white mb-8 leading-tight">
                  {content.problem.description}
                </h2>
                <div className="space-y-4">
                  {content.problem.points.map((point, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + (idx * 0.1) }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="mt-1 flex-shrink-0 text-red-400 font-mono text-sm">✗</div>
                      <p className="text-neutral-400 text-sm leading-relaxed">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* The Solution Side */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex-1 rounded-3xl bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-white/10 p-10 lg:p-14 relative overflow-hidden shadow-2xl group flex flex-col justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-bl from-[#EAB308]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-green-200">THE SOLUTION</span>
                </div>
                
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EAB308] to-yellow-600 p-[1px] mb-8 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Server className="text-white w-6 h-6" />
                  </div>
                </div>

                <h2 className="text-4xl sm:text-5xl font-serif text-white mb-6">
                  {content.solution.title}
                </h2>
                <p className="text-lg text-neutral-300 leading-relaxed font-light">
                  {content.solution.description}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>





      {/* Workflow (Sticky Scroll / Timeline) */}
      <section className="relative z-10 py-40">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/3">
            <div className="sticky top-40">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-5xl sm:text-7xl font-serif text-white mb-6 leading-none">Deploy in Minutes.</h2>
                <p className="text-xl text-neutral-400 font-light">A seamless pipeline from your git repository to a live URL.</p>
              </motion.div>
            </div>
          </div>
          <div className="lg:w-2/3 relative">
            <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-white/5 hidden md:block" />
            <div className="space-y-32">
              {content.howItWorks.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.6 }}
                  className="relative md:pl-24"
                >
                  <div className="hidden md:flex absolute left-6 top-3 w-4 h-4 -translate-x-1/2 rounded-full bg-[#050505] border-2 border-[#EAB308] z-10 items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div className="text-[#EAB308] font-serif text-3xl mb-4 italic">0{step.step}</div>
                  <h3 className="text-3xl font-medium text-white mb-4">{step.title}</h3>
                  <p className="text-neutral-400 text-lg leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-40 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] sm:w-[600px] sm:h-[600px] bg-[#EAB308]/20 blur-[150px] rounded-full pointer-events-none mix-blend-screen animate-pulse duration-1000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-5xl sm:text-8xl font-serif font-bold text-white mb-8 tracking-tight">
              {content.cta.headline}
            </h2>
            <p className="text-xl sm:text-2xl text-neutral-400 mb-12 max-w-2xl mx-auto font-light">
              {content.cta.description}
            </p>
            <div className="flex justify-center">
              <Link to="/signup" className="group relative overflow-hidden rounded-full bg-white text-black px-12 py-5 font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <span className="relative z-10 flex items-center gap-2">
                  {content.cta.buttonText}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between text-neutral-500">
          <div className="flex items-center gap-2 mb-4 sm:mb-0 text-white">
            <Logo className="w-4 h-4" />
            <span className="font-serif font-bold tracking-widest text-xs uppercase">SELFHOST</span>
          </div>
          <span className="text-xs uppercase tracking-[0.1em] font-medium">&copy; {new Date().getFullYear()} Open Source Platform.</span>
        </div>
      </footer>
    </div>
  );
}
