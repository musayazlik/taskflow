import { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Iconify } from "@/components/iconify";

import mailIcon from "@iconify-icons/lucide/mail";
import mapPinIcon from "@iconify-icons/lucide/map-pin";
import clockIcon from "@iconify-icons/lucide/clock";
import messageSquareIcon from "@iconify-icons/lucide/message-square";

export const metadata: Metadata = {
  title: "Contact Us - Taskflow",
  description:
    "Get in touch with the Taskflow team for support, partnerships, or custom solutions.",
};

const contactInfo = [
  {
    icon: mailIcon,
    title: "Email",
    description: "hello@example.com",
    link: "mailto:hello@example.com",
  },
  {
    icon: mapPinIcon,
    title: "Location",
    description: "Istanbul, Turkey",
    link: null,
  },
  {
    icon: clockIcon,
    title: "Response Time",
    description: "Within 24 hours",
    link: null,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Iconify icon={messageSquareIcon} className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Contact <span className="gradient-text">Us</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about Taskflow? Need a custom solution for your team?
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Let's talk</h2>
              <p className="text-muted-foreground mb-8">
                Whether you're interested in our Business plan, need technical
                support, or want to explore partnership opportunities, we're
                here to help.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Iconify
                      icon={item.icon}
                      className="w-6 h-6 text-primary"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    {item.link ? (
                      <a
                        href={item.link}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.description}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="pt-8 border-t border-border">
              <h3 className="font-semibold mb-4">Follow us</h3>
              <div className="flex gap-4">
                <a
                  href="https://github.com/musayazlik/taskflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
