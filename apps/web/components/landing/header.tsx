"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Iconify } from "@/components/iconify";
import menuIcon from "@iconify-icons/lucide/menu";
import xIcon from "@iconify-icons/lucide/x";
import { UserDropdown } from "@/components/user-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { LANDING_HEADER_NAV_LINKS } from "@/constant/landing-content";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image?: string | null;
}

interface HeaderProps {
  user?: User | null;
}

export function Header({ user: initialUser }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: (session.user as any).role || "USER",
        image: session.user.image,
      }
    : initialUser;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const sectionId = href.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
            <Image
              src={"/logo.svg"}
              alt="TaskFlow Logo"
              width={36}
              height={36}
            />
            <span className="text-xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {LANDING_HEADER_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <UserDropdown user={user} />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-5 py-2.5 rounded-full bg-linear-to-r from-primary to-purple-600 text-white hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <Iconify icon={xIcon} className="w-6 h-6" />
            ) : (
              <Iconify icon={menuIcon} className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-4">
              {LANDING_HEADER_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <hr className="border-border" />
              {user ? (
                <div className="flex items-center gap-3 py-2">
                  <UserDropdown user={user} />
                  <span className="text-sm text-muted-foreground">
                    {user.name || user.email}
                  </span>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-center font-medium px-4 py-2.5 rounded-full bg-linear-to-r from-primary to-purple-600 text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
