import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border/30 py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted/60">
        <p>&copy; {new Date().getFullYear()} fayth.life</p>
        <nav className="flex gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
