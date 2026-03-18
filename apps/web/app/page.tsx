import {
  Header,
  Hero,
  LogoCloud,
  Features,
  HowItWorks,
  Stats,
  Testimonials,
  Pricing,
  FAQ,
  CTA,
  Footer,
  FloatingDock,
} from "../components/landing";

// Static generation for better build performance
export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <Header user={null} />
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Logo Cloud */}
        <LogoCloud />

        {/* Features Section */}
        <Features />

        {/* How It Works */}
        <HowItWorks />

        {/* Stats */}
        <Stats />

        {/* Testimonials */}
        <Testimonials />

        {/* Pricing */}
        <Pricing />

        {/* FAQ */}
        <FAQ />

        {/* CTA */}
        <CTA />
      </main>
      <Footer />
      
      {/* Floating Dock Navigation */}
      <FloatingDock />
    </>
  );
}
