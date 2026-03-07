import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Mail, Brain, Sparkles, Zap, Shield,
  ArrowRight, Bot, FileText, Calendar
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Përmbledhje Email-esh me AI",
    description: "Merrni përmbledhje të menjëhershme dhe inteligjente të thread-eve të gjata të emailit, që të mos humbisni asnjë detaj të rëndësishëm.",
  },
  {
    icon: Bot,
    title: "Gjenerim i Zgjuar i Përgjigjeve",
    description: "Përgjigje të hartuara nga AI që përputhen me tonin dhe stilin tuaj. Rishikoni, modifikoni dhe dërgoni në sekonda.",
  },
  {
    icon: Zap,
    title: "Kategorizim Automatik",
    description: "Emailet renditen automatikisht në Punë, Personale, Të Rëndësishme dhe kategori të personalizuara.",
  },
  {
    icon: FileText,
    title: "Nxjerrja e Dokumenteve",
    description: "Zbuloni dhe organizoni automatikisht bashkëngjitjet, faturat dhe dokumentet e rëndësishme.",
  },
  {
    icon: Calendar,
    title: "Integrimi me Kalendarin",
    description: "Ftesat për takime zbulohen dhe sinkronizohen me kalendarin tuaj me kujtues të zgjuara.",
  },
  {
    icon: Shield,
    title: "Privatësia në Radhë të Parë",
    description: "Enkriptim nga skaji në skaj. Emailet tuaja mbeten private. AI përpunon lokalisht kur është e mundur.",
  },
];

const stats = [
  { value: "3x", label: "Përpunim më i shpejtë i emaileve" },
  { value: "85%", label: "Më pak kohë në inbox" },
  { value: "10K+", label: "Përdorues aktivë" },
  { value: "99.9%", label: "Garanci funksionimi" },
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
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-foreground">MailMind</span>
            <span className="gradient-text font-heading text-lg font-bold">AI</span>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20">
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
              <span>Mundësuar nga AI i Avancuar</span>
            </div>
            <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
              Inbox-i juaj,{" "}
              <span className="gradient-text">i superngarkuar</span>
              <br />
              me AI
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              MailMind AI lexon, përmbledh, kategorizon dhe harton përgjigje për emailet tuaja — që ju të fokusoheni në atë që ka vërtet rëndësi.
            </p>
            <div className="mt-8 flex items-center justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Hyr <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
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
              Gjithçka që ju nevojitet për të{" "}
              <span className="gradient-text">zotëruar inbox-in tuaj</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Mjete të fuqishme AI të dizajnuara për të eliminuar mbingarkesën e emaileve dhe për të rritur produktivitetin tuaj.
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

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="container flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary transition-colors">Politika e Privatësisë</Link>
          <span className="text-muted-foreground/50">|</span>
          <Link to="/terms" className="hover:text-primary transition-colors">Kushtet e Shërbimit</Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
