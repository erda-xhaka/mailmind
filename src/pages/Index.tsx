import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Mail, Brain, Sparkles, Zap, Shield, BarChart3,
  ArrowRight, CheckCircle2, Bot, FileText, Calendar
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Email Summaries",
    description: "Get instant, intelligent summaries of long email threads so you never miss key details.",
  },
  {
    icon: Bot,
    title: "Smart Reply Generation",
    description: "AI-crafted replies that match your tone and style. Review, edit, and send in seconds.",
  },
  {
    icon: Zap,
    title: "Auto Categorization",
    description: "Emails automatically sorted into Work, Personal, Important, and custom categories.",
  },
  {
    icon: FileText,
    title: "Document Extraction",
    description: "Automatically detect and organize attachments, invoices, and important documents.",
  },
  {
    icon: Calendar,
    title: "Calendar Integration",
    description: "Meeting invites detected and synced to your calendar with smart reminders.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encryption. Your emails stay private. AI processes locally when possible.",
  },
];

const stats = [
  { value: "3x", label: "Faster email processing" },
  { value: "85%", label: "Less time in inbox" },
  { value: "10K+", label: "Active users" },
  { value: "99.9%", label: "Uptime guarantee" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">MailMind</span>
            <span className="gradient-text font-heading text-lg font-bold">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/inbox">Login</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/dashboard/inbox">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
        {/* Glow */}
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="container relative z-10">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Powered by Advanced AI</span>
            </div>
            <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Your inbox,{" "}
              <span className="gradient-text">supercharged</span>
              <br />
              with AI
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              MailMind AI reads, summarizes, categorizes, and drafts replies for your emails — so you can focus on what truly matters.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard/inbox">
                  Start Free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4"
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i + 2}
                className="glass-card p-6 text-center"
              >
                <div className="text-3xl font-heading font-bold gradient-text">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">master your inbox</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Powerful AI tools designed to eliminate email overwhelm and boost your productivity.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 group hover:border-primary/30 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">
                Ready to transform your email workflow?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                Join thousands of professionals who save hours every week with MailMind AI.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/dashboard/inbox">
                    Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Free forever plan</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Cancel anytime</span>
                <span className="text-muted-foreground/50">|</span>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <span className="text-muted-foreground/50">|</span>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <Mail className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-foreground">MailMind AI</span>
          </div>
          <span>© 2026 MailMind AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
