import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ogImagePath, siteDescription, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

// One sans family for headings and body (tighter tracking on headings), plus a mono for code and metadata.
const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Amar Kumar",
  },
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    url: siteUrl,
    siteName: siteTitle,
    images: [
      {
        url: ogImagePath,
        width: 1200,
        height: 630,
        alt: "Amar Kumar, software engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [ogImagePath],
  },
};

/**
 * Scroll reveal: observe every .reveal element (including ones added by client navigation) and
 * mark it data-visible the first time it enters the viewport. html[data-reveal] turns on the
 * hidden starting state in globals.css, and is only set once the observers exist, so if this
 * script fails, or motion is reduced, content stays visible.
 */
const revealScript = `(function(){try{
if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var io=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.setAttribute("data-visible","");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px"});
var seen=new WeakSet();
function add(el){if(!seen.has(el)){seen.add(el);io.observe(el);}}
function scan(node){if(node.nodeType!==1)return;if(node.classList.contains("reveal"))add(node);node.querySelectorAll(".reveal").forEach(add);}
new MutationObserver(function(list){list.forEach(function(m){m.addedNodes.forEach(scan);});}).observe(document.documentElement,{childList:true,subtree:true});
document.documentElement.setAttribute("data-reveal","");
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full`}
    >
      <head>
        {/* Must run before first paint; see revealScript. */}
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main"
            className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50"
          >
            Skip to content
          </a>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              <ViewTransition>{children}</ViewTransition>
            </main>
            <SiteFooter />
          </div>
          {/* Free, privacy-friendly page analytics surfaced in the Vercel dashboard. */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
