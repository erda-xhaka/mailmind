import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const EmailParserPage = () => {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(false);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Email Parser</h1>
        <p className="text-muted-foreground text-sm mt-1">Paste an email to extract key information</p>
      </div>
      <div className="glass-card p-6 space-y-4">
        <Textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setParsed(false); }}
          placeholder="Paste your email content here..."
          className="min-h-[200px] bg-muted/50 border-border/50"
        />
        <Button onClick={() => setParsed(true)} disabled={!text.trim()}>
          <Sparkles className="h-4 w-4 mr-2" /> Parse Email
        </Button>
      </div>
      {parsed && (
        <div className="glass-card p-6 mt-4 space-y-3">
          <h3 className="font-heading font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Extracted Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2"><span className="text-muted-foreground w-24">Sender:</span><span>Detected sender name</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-24">Intent:</span><span className="text-primary">Request / Information / Action Required</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-24">Key Dates:</span><span>Dates mentioned in the email</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-24">Action Items:</span><span>Tasks extracted from the email</span></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">This is a demo preview. Connect AI service for real parsing.</p>
        </div>
      )}
    </div>
  );
};

export default EmailParserPage;
