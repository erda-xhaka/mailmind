import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const Privacy = () => {
  const lastUpdated = new Date().toLocaleDateString("sq-AL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Mail className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-heading text-sm font-bold">MailMind AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm mt-1">Përditësuar më: {lastUpdated}</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Hyrje</h2>
          <p className="text-muted-foreground leading-relaxed">
            MailMind është një aplikacion për integrim me Gmail që ndihmon përdoruesit në menaxhimin e email-eve me ndihmën e inteligjencës artificiale. Kjo politikë privatësie shpjegon se si mblidhen, përdoren dhe mbrohen të dhënat tuaja.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Informacionet që Mbledhim</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li><strong className="text-foreground">Të dhëna regjistrimi:</strong> Emri dhe adresa e email-it gjatë krijimit të llogarisë.</li>
            <li><strong className="text-foreground">Qasja në Gmail:</strong> Me autorizimin tuaj të qartë, aplikacioni qaset në email-et tuaja vetëm për funksionalitetet e tij.</li>
            <li><strong className="text-foreground">Të dhëna përdorimi:</strong> Cookies dhe të dhëna teknike si adresa IP për përmirësimin e shërbimit.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Si i Përdorim Informacionet</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li>Për të shfaqur dhe menaxhuar email-et tuaja</li>
            <li>Për të gjeneruar përmbledhje dhe përgjigje me AI</li>
            <li>Për përmirësimin e vazhdueshëm të aplikacionit</li>
            <li>Ne nuk i ndajmë apo shesim të dhënat tuaja tek palë të treta për qëllime marketingu</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Shërbimet e Palëve të Treta</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li><strong className="text-foreground">Supabase</strong> — autentifikim dhe databazë</li>
            <li><strong className="text-foreground">Google (Gmail API)</strong> — qasje në email me autorizim</li>
            <li><strong className="text-foreground">Vercel</strong> — hosting i aplikacionit</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Ruajtja e të Dhënave</h2>
          <p className="text-muted-foreground leading-relaxed">
            Të dhënat ruhen në mënyrë të sigurt në serverët e Supabase. Ne marrim masa teknike dhe organizative për të mbrojtur informacionin nga qasja e paautorizuar.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Të Drejtat Tuaja</h2>
          <p className="text-muted-foreground leading-relaxed">
            Përdoruesit mund të kërkojnë fshirjen e të dhënave dhe të revokojnë qasjen në Gmail në çdo kohë përmes llogarisë së tyre Google.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Kontakti</h2>
          <p className="text-muted-foreground leading-relaxed">
            Për çdo pyetje:{" "}
            <a href="mailto:erdaxhaka1@gmail.com" className="text-primary hover:underline">
              erdaxhaka1@gmail.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Privacy;
