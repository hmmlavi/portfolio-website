import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, Check, Copy, FileText, Link2, Mail, MessageSquare,
  RotateCcw, Send, TriangleAlert, User,
} from "lucide-react";
import { LINKS } from "@/data/content";
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/icons";
import { Reveal } from "@/components/anim";
import { useTheme } from "@/hooks/useTheme";
import { rose as roseAccent } from "@/data/palette";
import { copyText, toast } from "@/utils/feedback";
import { cn } from "@/utils/cn";

/** Inline SVG for Discord */
function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.036 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127c-.598.35-1.22.645-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418Z" />
    </svg>
  );
}

type Status = "idle" | "handoff" | "copied" | "failure";

export default function Contact() {
  const { theme } = useTheme();
  const light = theme === "light";
  const rose = roseAccent(light);

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const [emailCopyFeedback, setEmailCopyFeedback] = useState("");
  const [messageText, setMessageText] = useState("");
  const [discordCopied, setDiscordCopied] = useState(false);
  const discordTimer = useRef<number | undefined>(undefined);
  const emailTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => {
    window.clearTimeout(discordTimer.current);
    window.clearTimeout(emailTimer.current);
  }, []);

  // Only render external socials with real URLs. The username is shown
  // separately so it remains copyable without inventing an invite link.
  const SOCIALS = [
    { label: "GitHub", href: LINKS.github, Icon: GithubIcon },
    { label: "LinkedIn", href: LINKS.linkedin, Icon: LinkedinIcon },
    { label: "Instagram", href: LINKS.instagram, Icon: InstagramIcon },
    { label: "Discord", href: LINKS.discord, Icon: DiscordIcon },
    { label: "X", href: LINKS.x, Icon: XIcon },
  ].filter((s) => Boolean(s.href));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "What should I call you?";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Check your email format.";
    if (form.message.trim().length < 10) next.message = "Could you add a bit more detail?";
    if (!consent) next.consent = "Required for me to reply.";
    setErrors(next);
    if (Object.keys(next).length) { setStatus("idle"); return; }

    const subject = encodeURIComponent(`Message from ${form.name.trim()}`);
    const body = encodeURIComponent(`${form.message.trim()}\n\nFrom: ${form.name.trim()} (${form.email.trim()})`);
    setMessageText(`To: ${LINKS.email}\nSubject: Message from ${form.name.trim()}\n\n${form.message.trim()}\n\nFrom: ${form.name.trim()} (${form.email.trim()})`);

    // The existing behaviour is a mailto handoff. The polished confirmation
    // describes that real handoff honestly — it never claims a message was
    // delivered, because this client-side form has no backend to confirm it.
    try {
      window.location.href = `mailto:${LINKS.email}?subject=${subject}&body=${body}`;
      setStatus("handoff");
    } catch {
      setStatus("failure");
      toast("Could not open your email app", "error");
    }
  };

  const copyEmail = async () => {
    window.clearTimeout(emailTimer.current);
    setCopied(false);
    setEmailCopyFeedback("");
    const ok = await copyText(LINKS.email);
    setCopied(ok);
    setEmailCopyFeedback(ok
      ? "Email address copied."
      : `Copying was unavailable. Copy the address manually: ${LINKS.email}`);
    toast(ok ? `Copied ${LINKS.email}` : "Clipboard unavailable — copy the address manually", ok ? "success" : "error");
    if (ok) {
      emailTimer.current = window.setTimeout(() => {
        setCopied(false);
        setEmailCopyFeedback("");
      }, 2200);
    }
  };

  const copyDiscord = async () => {
    window.clearTimeout(discordTimer.current);
    setDiscordCopied(false);
    const ok = await copyText(LINKS.discordUsername);
    setDiscordCopied(ok);
    toast(ok ? "Discord username copied" : "Clipboard unavailable — select the username to copy it", ok ? "success" : "error");
    if (ok) discordTimer.current = window.setTimeout(() => setDiscordCopied(false), 2200);
  };

  const copyResumeLink = async () => {
    const ok = await copyText(LINKS.resume);
    toast(ok ? "Résumé link copied" : "Clipboard unavailable", ok ? "success" : "error");
  };

  const copyMessage = async () => {
    const ok = await copyText(messageText || LINKS.email);
    if (ok) {
      setStatus("copied");
      toast("Message copied to clipboard", "success");
    } else {
      // A real failure: don't claim success, show the recoverable error state.
      setStatus("failure");
      toast("Clipboard unavailable — try again or use your email app", "error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrors({});
    window.clearTimeout(emailTimer.current);
    setCopied(false);
    setEmailCopyFeedback("");
  };

  const errorCount = Object.keys(errors).length;
  const showSuccess = status === "handoff" || status === "copied";

  return (
    <section id="contact" className="pt-28 md:pt-32 pb-20 md:pb-24 px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <Reveal>
          <p className="eyebrow contact-eyebrow mb-4 flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--contact)" }} aria-hidden="true" />
            connect
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5">Get in touch</h1>
          <span className="block w-14 h-[3px] rounded-full mb-10 md:mb-14" style={{ background: "var(--contact)" }} aria-hidden="true" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Form Side */}
          <div className="lg:col-span-7">
            <Reveal delay={100}>
              <form onSubmit={submit} noValidate className={cn(
                "p-8 md:p-12 rounded-[32px] space-y-8 transition-all duration-500",
                "ui-surface"
              )} data-contact-form data-form-status={status}>
                {errorCount > 0 && status === "idle" && (
                  <p className="form-failure" role="alert" data-form-errors>
                    {errorCount} field{errorCount > 1 ? "s" : ""} need{errorCount > 1 ? "" : "s"} attention before we continue.
                  </p>
                )}

                <div className={showSuccess || status === "failure" ? "hidden" : "space-y-6"} data-form-fields>
                  <div className="relative">
                    <User className="absolute left-4 top-4 w-4 h-4 text-white/20" aria-hidden="true" />
                    <label htmlFor="contact-name" className="sr-only">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder="Name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "error-name" : undefined}
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className={cn(
                        "w-full pl-12 pr-6 py-4 rounded-2xl outline-none border transition-all duration-300",
                        "ui-input", errors.name && "form-field-error"
                      )}
                    />
                    {errors.name && <p id="error-name" className="form-hint mt-2 ml-4" style={{ color: rose }}>{errors.name}</p>}
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-4 h-4 text-white/20" aria-hidden="true" />
                    <label htmlFor="contact-email" className="sr-only">Email address</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder="Email address"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "error-email" : undefined}
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={cn(
                        "w-full pl-12 pr-6 py-4 rounded-2xl outline-none border transition-all duration-300",
                        "ui-input", errors.email && "form-field-error"
                      )}
                    />
                    {errors.email && <p id="error-email" className="form-hint mt-2 ml-4" style={{ color: rose }}>{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/20" aria-hidden="true" />
                    <label htmlFor="contact-message" className="sr-only">Your message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      placeholder="Your message"
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? "error-message" : undefined}
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className={cn(
                        "w-full pl-12 pr-6 py-4 rounded-2xl outline-none border transition-all duration-300 resize-none",
                        "ui-input", errors.message && "form-field-error"
                      )}
                    />
                    {errors.message && <p id="error-message" className="form-hint mt-2 ml-4" style={{ color: rose }}>{errors.message}</p>}
                  </div>
                </div>

                {status === "idle" && (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer" data-consent={consent ? "on" : "off"}>
                      <input type="checkbox" name="consent" checked={consent} onChange={e => setConsent(e.target.checked)} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "error-consent" : undefined} className="w-5 h-5 accent-[#a33a48]" />
                      <span className="text-xs text-white/60">I understand that this message will be sent via my email client.</span>
                    </label>
                    {errors.consent && <p id="error-consent" className="form-hint -mt-4" style={{ color: rose }} role="alert">{errors.consent}</p>}
                  </>
                )}

                {showSuccess && (
                  <div className="form-success" role="status" data-form-success={status}>
                    <span className="form-success-icon"><Check className="w-7 h-7" strokeWidth={2.4} aria-hidden="true" /></span>
                    <h3>{status === "copied" ? "Message copied" : "Draft ready"}</h3>
                    <p>
                      {status === "copied"
                        ? `Paste the copied message into an email to ${LINKS.email} and press send. It hasn't been delivered yet.`
                        : `Your browser was asked to open an email draft. If it opened, press send there to complete it — nothing has been delivered yet.`}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button type="button" className="pressable px-5 h-10 rounded-xl text-sm font-medium ui-btn-quiet" data-feedback="press" onClick={copyMessage} data-copy-message>
                        <Copy className="w-3.5 h-3.5" /> Copy the message
                      </button>
                      <button type="button" className="pressable px-5 h-10 rounded-xl text-sm font-medium ui-btn-quiet" data-feedback="press" onClick={reset}>
                        <RotateCcw className="w-3.5 h-3.5" /> Write another
                      </button>
                    </div>
                  </div>
                )}

                {status === "failure" && (
                  <div className="form-success" role="alert" data-form-failure>
                    <span className="form-success-icon" style={{ color: rose }}><TriangleAlert className="w-6 h-6" aria-hidden="true" /></span>
                    <h3>The handoff didn't complete</h3>
                    <p>Your email app or clipboard didn't respond. Nothing has been sent — try again, or paste the message into an email yourself.</p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button type="button" className="pressable px-5 h-10 rounded-xl text-sm font-medium ui-btn-quiet" data-feedback="press" onClick={copyMessage} data-copy-message>
                        <Copy className="w-3.5 h-3.5" /> Copy the message
                      </button>
                      <button type="button" className="pressable px-5 h-10 rounded-xl text-sm font-medium ui-btn-quiet" data-feedback="press" onClick={reset}>
                        <RotateCcw className="w-3.5 h-3.5" /> Try again
                      </button>
                    </div>
                  </div>
                )}

                {status === "idle" && (
                  <>
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button
                        type="submit"
                        data-submit-contact
                        className={cn(
                          "pressable flex-1 flex items-center justify-center gap-2 h-16 rounded-2xl text-base font-bold transition-all duration-300",
                          "ui-btn-contact hover:scale-[1.02]"
                        )}
                        data-feedback="ripple"
                      >
                        <Send className="w-4 h-4" /> Compose email
                      </button>
                      <button
                        type="button"
                        onClick={copyEmail}
                        data-copy-email
                        data-copy-state={copied ? "copied" : "idle"}
                        aria-label="Copy email address"
                        aria-describedby={emailCopyFeedback ? "copy-email-status" : undefined}
                        className={cn(
                          "pressable px-8 h-16 rounded-2xl flex items-center gap-2 transition-all duration-300",
                          "ui-btn-quiet"
                        )}
                        data-feedback="press"
                      >
                        {copied ? <Check className="w-4 h-4 text-accent" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                        <span aria-hidden="true">{copied ? "Copied!" : "Copy email"}</span>
                      </button>
                    </div>
                    <p
                      id="copy-email-status"
                      data-copy-email-status
                      aria-live="polite"
                      aria-atomic="true"
                      className={cn(
                        "text-xs leading-relaxed",
                        !copied && emailCopyFeedback ? "mt-3 text-white/60" : "sr-only",
                      )}
                    >{emailCopyFeedback}</p>
                  </>
                )}
              </form>
            </Reveal>
          </div>

          {/* Contact Cards Side */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <Reveal delay={200}>
               <div className={cn(
                 "p-10 rounded-[32px] h-full",
                 "ui-surface"
               )}>
                 <p className="font-mono text-[10px] tracking-widest uppercase text-contact mb-8">Social Ecosystem</p>
                 <div className="grid grid-cols-1 gap-3">
                   {SOCIALS.map((s) => (
                     <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={cn(
                       "pressable flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group",
                       "ui-row"
                     )} data-feedback="press" data-external={s.label}>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl ui-tech-tile flex items-center justify-center group-hover:scale-110 transition-transform">
                              <s.Icon className="w-5 h-5" />
                           </div>
                           <span className="font-medium text-white/80">{s.label}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                     </a>
                   ))}
                   {LINKS.discordUsername && <div className="ui-row flex items-center justify-between gap-3 p-5 rounded-2xl" data-discord-contact>
                     <div className="flex items-center gap-4 min-w-0">
                       <div className="w-10 h-10 rounded-xl ui-tech-tile flex items-center justify-center shrink-0" style={{ color: "var(--hue-violet)" }}><DiscordIcon className="w-5 h-5" /></div>
                       <div className="min-w-0"><p className="font-medium">Discord</p><p className="text-sm text-white/60 break-all">{LINKS.discordUsername}</p></div>
                     </div>
                     <button type="button" onClick={copyDiscord} className="ui-btn-quiet rounded-xl px-3 py-2 text-xs shrink-0" aria-label="Copy Discord username" data-copy-discord><span aria-live="polite">{discordCopied ? "Copied!" : "Copy"}</span></button>
                   </div>}
                   <a href={LINKS.resume} target="_blank" rel="noopener noreferrer" className={cn(
                     "pressable flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group mt-4",
                     "ui-btn-contact"
                   )} data-feedback="ripple" data-external="Résumé">
                      <div className="flex items-center gap-4">
                         <FileText className="w-5 h-5" />
                         <span className="font-bold">{LINKS.resumeLabel}</span>
                      </div>
                      <ArrowUpRight className="w-5 h-5" />
                   </a>
                   <button
                     type="button"
                     onClick={copyResumeLink}
                     data-copy-resume
                     className="pressable flex items-center justify-center gap-2 px-5 h-11 rounded-2xl text-xs font-medium ui-btn-quiet"
                     data-feedback="press"
                   >
                     <Link2 className="w-3.5 h-3.5" /> Copy résumé link
                   </button>
                 </div>
               </div>
             </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
