import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";

const Terms = () => {
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
          <p className="text-muted-foreground text-sm mt-1">Përditësuar më: 4 prill 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Pranimi i Kushteve</h2>
          <p className="text-muted-foreground leading-relaxed">
            Duke përdorur aplikacionin MailMind, përdoruesi pranon këto kushte shërbimi. Nëse nuk pajtoheni me to, ju lutem mos e përdorni aplikacionin.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Përshkrimi i Shërbimit</h2>
          <p className="text-muted-foreground leading-relaxed">
            MailMind është një aplikacion për integrim me Gmail që ofron menaxhimin e email-eve, përmbledhje automatike me inteligjencë artificiale, gjenerim përgjigjesh dhe mjete të tjera për rritjen e produktivitetit.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Rezultatet e gjeneruara nga AI janë automatike dhe mund të mos jenë gjithmonë plotësisht të sakta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Përgjegjësitë e Përdoruesit</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
            <li>Përdoruesit duhet të kenë autorizim për llogaritë e Gmail që lidhin me aplikacionin</li>
            <li>Ndalohet çdo formë keqpërdorimi i shërbimit, përfshirë spam apo aktivitete të paligjshme</li>
            <li>Përdoruesit janë përgjegjës për sigurinë e kredencialeve të tyre</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Kushtet e Llogarisë</h2>
          <p className="text-muted-foreground leading-relaxed">
            Përdoruesit duhet të japin informacione të sakta gjatë regjistrimit. Ne rezervojmë të drejtën të pezullojmë ose fshijmë llogaritë që shkelin këto kushte.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Pronësia Intelektuale</h2>
          <p className="text-muted-foreground leading-relaxed">
            Të gjitha të drejtat mbi aplikacionin MailMind, përfshirë kodin dhe dizajnin, i përkasin autorit të aplikacionit. Ndalohet kopjimi ose shpërndarja pa leje.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Kufizimi i Përgjegjësisë</h2>
          <p className="text-muted-foreground leading-relaxed">
            MailMind ofrohet "siç është", pa garanci. Ne nuk mbajmë përgjegjësi për ndonjë humbje të drejtpërdrejtë apo të tërthortë që mund të lindë nga përdorimi i aplikacionit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Ndryshimet në Kushte</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ne mund të ndryshojmë këto kushte në çdo kohë. Përdorimi i vazhdueshëm i aplikacionit nënkupton pranimin e ndryshimeve.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Kontakti</h2>
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

export default Terms;
