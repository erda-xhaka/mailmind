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
            MailMind është një aplikacion për integrim me Gmail që ndihmon përdoruesit të menaxhojnë emailet me ndihmën e inteligjencës artificiale. Kjo politikë privatësie shpjegon se si ne mbledhim, përdorim dhe mbrojmë të dhënat tuaja.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Informacionet që Mbledhim</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li><strong className="text-foreground">Të dhëna regjistrimi:</strong> Emri dhe adresa e email-it tuaj gjatë krijimit të llogarisë.</li>
            <li><strong className="text-foreground">Qasja në Gmail:</strong> Vetëm me lejen tuaj të qartë, ne qasemi në emailet tuaja për t'i shfaqur dhe menaxhuar brenda aplikacionit.</li>
            <li><strong className="text-foreground">Të dhëna përdorimi:</strong> Cookies, adresa IP, dhe informacione teknike për përmirësimin e shërbimit.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Si i Përdorim Informacionet</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li>Për të shfaqur dhe menaxhuar emailet tuaja brenda MailMind.</li>
            <li>Për të gjeneruar përmbledhje dhe përgjigje me AI.</li>
            <li>Për përmirësimin e vazhdueshëm të shërbimit dhe eksperiencës së përdoruesit.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Shërbimet e Palëve të Treta</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ne përdorim shërbimet e mëposhtme të palëve të treta:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li><strong className="text-foreground">Supabase</strong> — për autentifikimin dhe ruajtjen e të dhënave.</li>
            <li><strong className="text-foreground">Google (Gmail API)</strong> — për qasjen në emailet tuaja me autorizim.</li>
            <li><strong className="text-foreground">Vercel</strong> — për hosting të infrastrukturës.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Ruajtja e të Dhënave</h2>
          <p className="text-muted-foreground leading-relaxed">
            Të dhënat tuaja ruhen në mënyrë të sigurt në serverët e Supabase, të vendosur në Shtetet e Bashkuara të Amerikës (SHBA). Ne marrim masa të arsyeshme për të mbrojtur informacionet tuaja nga qasja e paautorizuar.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Të Drejtat Tuaja</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ju keni të drejtë të kërkoni fshirjen e llogarisë tuaj dhe të gjitha të dhënave të lidhura me të. Gjithashtu mund të revokoni qasjen në Gmail në çdo kohë përmes cilësimeve të llogarisë suaj Google.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Kontakti</h2>
          <p className="text-muted-foreground leading-relaxed">
            Për çdo pyetje rreth privatësisë, na kontaktoni në:{" "}
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
