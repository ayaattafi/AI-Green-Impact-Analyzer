import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">G</div>
              <span className="font-extrabold">GREENLY</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered sustainability analytics for a greener tomorrow.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Calculators', 'Analytics', 'Reports'] },
            { title: 'Company', links: ['About', 'Contact', 'Careers', 'Blog'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link to="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 GREENLY. All rights reserved.</p>
          <p>Built for a sustainable future.</p>
        </div>
      </div>
    </footer>
  );
}
