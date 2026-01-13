import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold">
                Watchfinder <span className="text-sm text-muted-foreground">Admin</span>
              </Link>
              <nav className="flex gap-6">
                <Link
                  href="/admin/references"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  References
                </Link>
                <Link
                  href="/history"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  History
                </Link>
              </nav>
            </div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to App →
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <main>{children}</main>
    </div>
  );
}
