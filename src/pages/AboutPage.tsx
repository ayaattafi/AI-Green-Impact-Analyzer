import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Brain, Target, Globe, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/shared/Animations';

const values = [
  { icon: Leaf, title: 'Sustainability First', desc: 'Every feature we build is designed to help reduce environmental impact.' },
  { icon: Brain, title: 'AI-Driven', desc: 'We leverage machine learning to provide actionable, personalized insights.' },
  { icon: Target, title: 'Transparency', desc: 'Our methodologies are based on EPA, IPCC, and WHO standards — open and verifiable.' },
  { icon: Globe, title: 'Global Impact', desc: 'From individuals to enterprises, we empower everyone to contribute.' },
];

const stats = [
  { value: '2024', label: 'Founded' },
  { value: '48K+', label: 'Active users' },
  { value: '180', label: 'Countries' },
  { value: '2.4M+', label: 'kg CO₂ offset' },
];

const team = [
  { name: 'Maya Greenfield', role: 'CEO & Co-founder', initials: 'MG' },
  { name: 'David Chen', role: 'CTO & Co-founder', initials: 'DC' },
  { name: 'Aisha Patel', role: 'Head of AI', initials: 'AP' },
  { name: 'Marcus Reed', role: 'Lead Designer', initials: 'MR' },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-20 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Leaf className="h-3.5 w-3.5" /> Our Story
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              On a mission to make<br />sustainability measurable
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              GREENLY was founded in 2024 with a simple belief: you can't improve what you can't measure.
              We combine AI, environmental science, and beautiful design to help everyone understand and
              reduce their environmental footprint.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-extrabold text-gradient">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">What we stand for</h2>
            <p className="mt-4 text-muted-foreground">The principles that guide everything we build.</p>
          </FadeIn>
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <Card className="glass-card h-full p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Team */}
      <section className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Meet the team</h2>
            <p className="mt-4 text-muted-foreground">Passionate about technology and the planet.</p>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card p-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-bold text-white">
                    {member.initials}
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <FadeIn>
            <h2 className="text-3xl font-extrabold tracking-tight">Join the movement</h2>
            <p className="mt-4 text-muted-foreground">Start measuring and reducing your environmental impact today.</p>
            <Button size="lg" className="mt-8" onClick={() => navigate('/register')}>
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
