"use client";

/**
 * Landing Page Component - Luxury Gold Redesign
 *
 * Design philosophy: Museum-quality luxury watch presentation
 * Aesthetic: Champagne gold elegance, not blue/purple tech
 * Every element refined to perfection
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { WatchAnalyzer } from "./watch-analyzer";

export function LandingPage() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);

  if (showAnalyzer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setShowAnalyzer(false)}
            className="mb-4"
          >
            ← Back to Home
          </Button>
          <WatchAnalyzer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-[oklch(0.95_0.015_80)] to-background overflow-hidden">
      {/* Hero Section - Full viewport with champagne gold aesthetic */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Luxury background elements - gold particles, not blue/purple */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[oklch(0.68_0.12_85)]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-[oklch(0.75_0.08_45)]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[oklch(0.72_0.10_70)]/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Premium badge */}
            <div className="inline-block mb-8">
              <motion.span
                className="px-5 py-2.5 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary uppercase tracking-widest"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                AI-Powered Watch Authentication
              </motion.span>
            </div>

            {/* Hero headline - Playfair Display serif for luxury */}
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-semibold mb-8 leading-[1.1] text-balance">
              <span className="block mb-2 text-foreground">
                Authenticate with
              </span>
              <span className="block text-gradient">
                Confidence
              </span>
            </h1>

            {/* Subheadline - generous line-height for readability */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              AI-powered luxury watch authentication in seconds. Museum-quality analysis trusted by collectors and dealers worldwide.
            </p>

            {/* Premium CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={() => setShowAnalyzer(true)}
                  className="btn-luxury text-primary-foreground px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-[0_8px_40px_oklch(0.68_0.12_85/0.4)] transition-all duration-300 relative overflow-hidden group"
                >
                  <svg className="w-6 h-6 mr-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="relative z-10">Start Free Analysis</span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-2 border-border hover:border-primary/30 px-10 py-7 text-lg font-semibold transition-all duration-300"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See How It Works
                </Button>
              </motion.div>
            </div>

            {/* Trust indicators - subtle, not overwhelming */}
            <div className="flex flex-wrap gap-8 justify-center items-center text-muted-foreground text-sm">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10,000+ Watches Analyzed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                <span>Trusted by Collectors</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>98% Accuracy</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-6 h-6 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Features Section - Cinematic presentation with actual product imagery */}
      <section className="py-32 px-4 relative bg-card/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-5xl md:text-6xl font-semibold mb-6 text-foreground">
              Professional-Grade Analysis
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto">
              Every detail examined with the precision of a master watchmaker
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <Card className="card-elevated card-interactive h-full border-primary/5 bg-gradient-to-br from-card to-card/80 group">
                  <CardContent className="p-10 space-y-6">
                    {/* Icon container with gold gradient */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-500 group-hover:scale-110">
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-semibold mb-4 text-foreground font-display">
                      {feature.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Horizontal timeline with gold accents */}
      <section id="how-it-works" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="font-display text-5xl md:text-6xl font-semibold mb-6">
              How It Works
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6" />
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Authentication perfected in three elegant steps
            </p>
          </motion.div>

          {/* Horizontal timeline */}
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-14 left-0 right-0 h-px">
              <div className="divider-luxury" />
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Gold circle with step number */}
                    <div className="w-28 h-28 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-4xl font-bold mb-8 shadow-xl shadow-primary/30 relative z-10 border-4 border-background">
                      <span className="text-primary-foreground">{index + 1}</span>
                    </div>

                    <h3 className="text-2xl font-semibold mb-4 text-foreground font-display">
                      {step.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-base max-w-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Trust indicators with gold accents */}
      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-5xl md:text-6xl font-bold text-gradient mb-3 font-display">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
              Trusted by Experts
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card-elevated h-full border-primary/5 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-8 space-y-6">
                    {/* Quote */}
                    <div className="text-lg leading-relaxed text-foreground/90 italic">
                      "{testimonial.quote}"
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-primary font-semibold text-lg">
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
              <CardContent className="relative p-16 text-center">
                <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6 text-foreground">
                  Ready to Authenticate Your Watch?
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of collectors who trust Watchfinder for professional-grade authentication
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={() => setShowAnalyzer(true)}
                    className="btn-luxury px-12 py-7 text-lg font-semibold shadow-2xl hover:shadow-[0_12px_48px_oklch(0.68_0.12_85/0.4)]"
                  >
                    Start Your Free Analysis Now
                    <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-muted-foreground text-sm">
              © 2026 Watchfinder. All rights reserved.
            </div>
            <div className="flex gap-8 text-muted-foreground text-sm">
              <a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors duration-200">Terms of Service</a>
              <a href="/admin" className="hover:text-primary transition-colors duration-200">Admin</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: (
      <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "AI Authentication",
    description: "Advanced computer vision analyzes dial markers, case finishing, and movement details with the precision of a master watchmaker."
  },
  {
    icon: (
      <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: "Reference Matching",
    description: "Compare against our curated database of verified luxury timepieces from every major manufacture and independent brand."
  },
  {
    icon: (
      <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Detailed Reports",
    description: "Comprehensive analysis including authentication indicators, condition assessment, materials verification, and market insights."
  }
];

const steps = [
  {
    title: "Capture Photos",
    description: "Photograph your watch from multiple angles: dial, caseback, crown, and bracelet. Our intelligent camera guides you through the process."
  },
  {
    title: "AI Analysis",
    description: "Advanced algorithms examine dial printing, case finishing, movement details, and compare against thousands of verified references."
  },
  {
    title: "Receive Report",
    description: "Get a comprehensive authentication report with confidence scores, reference matches, condition assessment, and exportable certificate."
  }
];

const stats = [
  { value: "99.8%", label: "Accuracy Rate" },
  { value: "<5s", label: "Analysis Time" },
  { value: "10K+", label: "References" },
  { value: "50K+", label: "Analyses" }
];

const testimonials = [
  {
    quote: "Incredible accuracy and speed. Saved me from a fake Submariner purchase. The authentication markers it identified were spot-on.",
    name: "James H.",
    role: "Private Collector",
    initials: "JH"
  },
  {
    quote: "As a dealer, this tool has become indispensable. The reference matching is phenomenal, especially for vintage pieces.",
    name: "Maria K.",
    role: "Watch Dealer",
    initials: "MK"
  },
  {
    quote: "The level of detail in the condition assessment rivals professional watchmakers. Absolutely worth every penny.",
    name: "Robert T.",
    role: "Horologist",
    initials: "RT"
  }
];
