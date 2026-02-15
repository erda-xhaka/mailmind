import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const Terms = () => {
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
          <h1 className="text-3xl font-bold font-heading">Terms of Service</h1>
          <p className="text-muted-foreground text-sm mt-1">Përditësuar më: {lastUpdated}</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Pranimi i Kushteve</h2>
          <p className="text-muted-foreground leading-relaxed">
            Duke përdorur MailMind, ju pranoni këto kushte shërbimi. Nëse nuk pajtoheni me ndonjë kusht, ju lutem mos e përdorni aplikacionin.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Përshkrimi i Shërbimit</h2>
          <p className="text-muted-foreground leading-relaxed">
            MailMind është një aplikacion për integrim me Gmail që ofron menaxhimin e emaileve, përmbledhje automatike me AI, gjenerimin e përgjigjeve, dhe mjete të tjera produktiviteti.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Përgjegjësitë e Përdoruesit</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li>Përdoruesit duhet të kenë autorizim për llogaritë e Gmail që lidhin me MailMind.</li>
            <li>Ndalohet keqpërdorimi i shërbimit, përfshirë dërgimin e spam-it ose përdorimin për qëllime të paligjshme.</li>
            <li>Përdoruesit janë përgjegjës për sigurinë e kredencialeve të llogarisë së tyre.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Kushtet e Llogarisë</h2>
          <p className="text-muted-foreground leading-relaxed">
            Për të përdorur MailMind, duhet të krijoni një llogari me informacione të sakta. Ne rezervojmë të drejtën të pezullojmë ose fshijmë llogaritë që shkelin këto kushte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Pronësia Intelektuale</h2>
          <p className="text-muted-foreground leading-relaxed">
            Të gjitha të drejtat e pronësisë intelektuale mbi MailMind, përfshirë kodin, dizajnin, dhe markën, i përkasin krijuesve të aplikacionit. Përdoruesit nuk kanë të drejtë të kopjojnë ose rishpërndajnë ndonjë pjesë të aplikacionit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Kufizimi i Përgjegjësisë</h2>
          <p className="text-muted-foreground leading-relaxed">
            MailMind ofrohet "siç është" pa garanci të ndonjë lloji. Ne nuk jemi përgjegjës për ndonjë humbje të dhënash, ndërprerje shërbimi, ose dëme të tjera që mund të lindin nga përdorimi i aplikacionit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Ndryshimet në Kushte</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ne rezervojmë të drejtën të ndryshojmë këto kushte në çdo kohë. Ndryshimet do të publikohen në këtë faqe dhe përdorimi i vazhdueshëm i aplikacionit përbën pranimin e kushteve të reja.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Kontakti</h2>
          <p className="text-muted-foreground leading-relaxed">
            Për çdo pyetje rreth kushteve të shërbimit, na kontaktoni në:{" "}
            <a href="mailto:erdaxhaka1@gmail.com" className="text-primary hover:underline">
              erdaxhaka1@gmail.com
            </a>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Terms;
