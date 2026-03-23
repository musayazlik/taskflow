import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/10 via-background to-background" />
      {/* Header */}
      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-4 group">
          <Image src={"/logo.svg"} alt="TaskFlow Logo" width={36} height={36} />
          <span className="font-bold gradient-text text-2xl">TaskFlow</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
