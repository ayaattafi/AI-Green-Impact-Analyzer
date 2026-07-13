import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, BarChart3, Leaf, Zap, Brain, Shield, Globe,
  TrendingDown, Car, Droplets, Recycle, UtensilsCrossed, Smartphone,
  ChevronDown, Check,
} from 'lucide-react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/shared/Animations';
import {
  SolarEnergyIllustration, TreesIllustration, WaterIllustration,
} from '@/components/illustrations/Illustrations';
import { ScoreGauge } from '@/components/shared/ScoreGauge';

const features = [
  { icon: Brain, title: 'AI-Powered Insights', desc: 'Machine learning models analyze your data and predict future impact with 96% accuracy.', color: 'text-primary' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Interactive dashboards visualize your environmental footprint across every category.', color: 'text-accent' },
  { icon: Leaf, title: '6 Impact Calculators', desc: 'Carbon, water, energy, food, waste, and electronics — each with tailored recommendations.', color: 'text-emerald-500' },
  { icon: TrendingDown, title: 'Trend Forecasting', desc: 'See where your footprint is heading and get actionable steps to reverse negative trends.', color: 'text-lime-500' },
  { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours. Bank-grade encryption and full control over what you share.', color: 'text-sky-500' },
  { icon: Globe, title: 'Global Standards', desc: 'Calculations based on EPA, IPCC, and WHO methodologies for trustworthy results.', color: 'text-teal-500' },
];

const calculatorCards = [
  { icon: Car, title: 'Carbon', desc: 'Transport emissions', href: '/app/calculators/carbon' },
  { icon: Droplets, title: 'Water', desc: 'Consumption tracking', href: '/app/calculators/water' },
  { icon: Zap, title: 'Energy', desc: 'Usage & renewables', href: '/app/calculators/energy' },
  { icon: UtensilsCrossed, title: 'Food', desc: 'Dietary footprint', href: '/app/calculators/food' },
  { icon: Recycle, title: 'Waste', desc: 'Recycling impact', href: '/app/calculators/waste' },
  { icon: Smartphone, title: 'Electronics', desc: 'Device energy', href: '/app/calculators/electronics' },
];

const faqs = [
  { q: 'How does GREENLY calculate my environmental impact?', a: 'We use established methodologies from the EPA, IPCC, and WHO, combined with machine learning models trained on global emissions data. Each calculator factors in your specific inputs to produce personalized, accurate results.' },
  { q: 'Is my data private and secure?', a: 'Absolutely. All data is encrypted in transit and at rest. You own your data entirely and can export or delete it at any time. We never sell your information to third parties.' },
  { q: 'Can GREENLY work for my business?', a: 'Yes. Our Business Intelligence dashboard provides team-level analytics, trend comparisons, and exportable reports designed for ESG reporting and sustainability initiatives.' },
  { q: 'How accurate are the AI predictions?', a: 'Our models achieve 96% accuracy on average, validated against historical datasets. Confidence intervals are displayed with every forecast so you always know the reliability range.' },
  { q: 'Do I need to install anything?', a: 'No. GREENLY is fully web-based and works on any modern browser. Your analyses are saved to your account and accessible from any device.' },
  { q: 'What\'s included in the free plan?', a: 'The free plan includes all six calculators, basic analytics, history tracking, and CSV exports. Premium unlocks AI forecasting, advanced BI dashboards, and PDF reports.' },
];

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 -left-40 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Sustainability Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
              >
                Understand your<br />
                <span className="text-gradient">environmental</span><br />
                impact, instantly.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 max-w-lg text-lg text-muted-foreground"
              >
                Measure, analyze, and reduce your carbon footprint with AI-driven insights
                across six categories. From daily habits to business strategy.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate('/register')}>
                  Start free analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" onClick={() => navigate('/app/dashboard')}>
                  View dashboard demo
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 flex items-center gap-6 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Free forever plan</span>
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <Card className="glass-card relative z-10 p-6 shadow-glow">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Green Score</p>
                    <p className="text-2xl font-bold">Excellent progress</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Leaf className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-center py-4">
                  <ScoreGauge score={78} size={180} />
                </div>
                <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
                  {[
                    { label: 'CO₂ saved', value: '340kg' },
                    { label: 'Water', value: '1.2kL' },
                    { label: 'Energy', value: '85kWh' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Floating cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -left-8 top-20 z-20 hidden sm:block"
              >
                <Card className="glass-card flex items-center gap-3 p-3 shadow-lg">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">-23% emissions</p>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -right-4 bottom-12 z-20 hidden sm:block"
              >
                <Card className="glass-card flex items-center gap-3 p-3 shadow-lg">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">AI Insight</p>
                    <p className="text-xs text-muted-foreground">Switch to EV: -60%</p>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 flex justify-center"
          >
            <ChevronDown className="h-6 w-6 animate-bounce text-muted-foreground" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">
              Everything you need to go green
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools that make sustainability measurable, understandable, and actionable.
            </p>
          </FadeIn>

          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <Card className="glass-card h-full p-6 transition-all hover:shadow-glow hover:-translate-y-1">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${f.color}`}>
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Calculators showcase */}
      <section className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="mb-16 max-w-2xl">
            <h2 className="text-4xl font-extrabold tracking-tight">Six calculators. One platform.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each calculator delivers precise metrics, a Green Score, and AI-tailored recommendations.
            </p>
          </FadeIn>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calculatorCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="glass-card group flex cursor-pointer items-center gap-4 p-5 transition-all hover:shadow-glow hover:-translate-y-1"
                  onClick={() => navigate('/register')}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                    <c.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{c.title} Calculator</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="relative overflow-hidden py-24">
        <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Brain className="h-3.5 w-3.5" />
                Artificial Intelligence
              </div>
              <h2 className="mt-6 text-4xl font-extrabold tracking-tight">
                Predict your future<br />footprint with AI
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our models — trained on millions of data points using XGBoost and
                gradient-boosted trees — forecast your environmental impact months ahead.
                Get confidence intervals, trend analysis, and personalized recommendations.
              </p>
              <ul className="mt-6 space-y-3">
                {['Carbon, water & energy forecasting', '96% model confidence on average', 'Personalized, actionable recommendations', 'Trend detection with seasonal adjustments'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-8" size="lg" onClick={() => navigate('/register')}>
                Try AI analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card className="glass-card p-6 shadow-glow">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Carbon Forecast — Next 12 months</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    96% confidence
                  </span>
                </div>
                <div className="flex h-48 items-end gap-2">
                  {[40, 55, 48, 62, 58, 72, 68, 80, 75, 88, 82, 95].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-primary to-accent"
                    />
                  ))}
                </div>
                <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                  <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
                </div>
                <div className="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
                  <p className="font-medium text-primary">AI Recommendation</p>
                  <p className="mt-1 text-muted-foreground">
                    Switching to an EV could reduce your transport emissions by 60% over the next year.
                  </p>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Sustainability section with illustrations */}
      <section id="sustainability" className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">Built for a sustainable world</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every analysis contributes to a bigger picture — a healthier planet for future generations.
            </p>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { Illust: TreesIllustration, title: 'Reforestation impact', desc: 'Each analysis calculates trees needed to offset your emissions.' },
              { Illust: WaterIllustration, title: 'Water conservation', desc: 'Track consumption and identify savings across daily activities.' },
              { Illust: SolarEnergyIllustration, title: 'Renewable energy', desc: 'Model the impact of solar panels and heat pumps on your footprint.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card flex flex-col items-center p-8 text-center">
                  <item.Illust className="h-24 w-24" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-muted/20 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FadeIn className="mb-12 text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">Frequently asked questions</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need to know about GREENLY.</p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-xl px-4">
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Start your sustainability journey today
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Measure, understand, and reduce your environmental footprint with AI-powered insights.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base" onClick={() => navigate('/register')}>
                Create free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
