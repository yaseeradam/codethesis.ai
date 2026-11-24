import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thesis.academyhub.com.ng"),
  title: {
    default: "CodeThesis AI — Undergraduate Research, Thesis & SIWES Platform",
    template: "%s | CodeThesis AI",
  },
  description:
    "Nigeria's premier academic research automation platform. Generate NUC/CCMAS-compliant 5-chapter thesis dissertations, technical SIWES & ITF logbooks, full-stack software prototypes, UML diagrams, and viva defense slides in minutes.",
  keywords: [
    "academic thesis generator",
    "Nigerian university project dissertation",
    "NUC CCMAS compliant thesis",
    "SIWES logbook generator",
    "ITF technical report",
    "computer science final year project code",
    "software engineering project builder",
    "UML diagram generator",
    "viva simulator defense",
    "APA 7th edition formatting",
    "FUBK project",
    "ABU Zaria dissertation",
    "UNILAG computer science",
    "UI Ibadan",
    "OAU Ife",
    "academic research portal Nigeria",
    "CodeThesis AI",
  ],
  authors: [{ name: "CodeThesis AI AcademyHub", url: "https://thesis.academyhub.com.ng" }],
  creator: "CodeThesis AI",
  publisher: "AcademyHub Nigeria",
  applicationName: "CodeThesis AI",
  category: "Education & Academic Software",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CodeThesis AI — Complete Academic Research, Dissertation & SIWES Platform",
    description:
      "Turn-key academic projects, 5-chapter NUC-compliant dissertations, production software source code, UML diagrams, and technical SIWES logbooks.",
    url: "https://thesis.academyhub.com.ng",
    siteName: "CodeThesis AI",
    images: [
      {
        url: "/assets/header.png",
        width: 1200,
        height: 630,
        alt: "CodeThesis AI Academic Platform",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeThesis AI — Academic Thesis & Software Engineering Platform",
    description:
      "Nigeria's leading academic SaaS. Automated 5-chapter dissertations, SIWES logbooks, and working software prototypes.",
    images: ["/assets/header.png"],
    creator: "@CodeThesisAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://thesis.academyhub.com.ng/#website",
      "url": "https://thesis.academyhub.com.ng",
      "name": "CodeThesis AI",
      "description": "Nigeria's Leading Academic Engineering & Research Platform for Tertiary Students",
      "inLanguage": "en-NG",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://thesis.academyhub.com.ng/tool/thesis?topic={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://thesis.academyhub.com.ng/#software",
      "name": "CodeThesis AI",
      "operatingSystem": "All (Web-based)",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "1500",
        "priceCurrency": "NGN",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1420",
        "bestRating": "5",
      },
      "description":
        "Automated academic engineering platform that generates 5-chapter NUC/CCMAS-compliant thesis dissertations, technical SIWES logbooks, UML diagrams, and working software prototypes.",
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://thesis.academyhub.com.ng/#organization",
      "name": "CodeThesis AI by AcademyHub",
      "url": "https://thesis.academyhub.com.ng",
      "logo": "https://thesis.academyhub.com.ng/icon-512.png",
      "sameAs": ["https://twitter.com/CodeThesisAI"],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${lora.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  localStorage.removeItem('codethesis_theme');
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
