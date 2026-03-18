import Link from "next/link";

import { DottedGlowBackground } from "@/components/dotted-glow-background";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <DottedGlowBackground
        className="absolute inset-0 pointer-events-none"
        gap={14}
        radius={2}
        opacity={0.5}
        color="rgba(100, 116, 139, 0.4)"
        glowColor="rgba(59, 130, 246, 0.6)"
        darkColor="rgba(100, 116, 139, 0.3)"
        darkGlowColor="rgba(96, 165, 250, 0.5)"
        speedMin={0.4}
        speedMax={1.0}
      />
      {/* Header */}
      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-4 group">
              <Image src={"/logo.svg"} alt="TurboStack Logo" width={36} height={36} />
          <span className="font-bold gradient-text text-2xl">TurboStack</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center relative z-10">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} TurboStack. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
