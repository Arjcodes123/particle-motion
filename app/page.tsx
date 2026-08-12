import dynamic from "next/dynamic";
import { Hero } from "@/components/hero/hero";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Thesis } from "@/components/sections/thesis";

/**
 * GSAP + ScrollTrigger is the heaviest thing on the page after three.js, and
 * this is the only section that needs it. Splitting it out keeps that weight
 * off first load.
 *
 * `ssr` stays on: the markup is still prerendered into the HTML, so crawlers
 * and AI extractors see the full SEO/AEO/GEO thesis. Only the hydration
 * JavaScript is deferred.
 */
const Pillars = dynamic(() =>
  import("@/components/sections/pillars").then((m) => m.Pillars),
);
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { CaseStudies } from "@/components/sections/case-studies";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";
import { JsonLd } from "@/components/seo/json-ld";
import { faqSchema, organizationSchema, servicesSchema, websiteSchema } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd
        schema={[
          organizationSchema(),
          websiteSchema(),
          servicesSchema(),
          faqSchema(),
        ]}
      />
      <Header />
      <main id="main" className="flex-1">
        <Hero />
        <Thesis />
        <Pillars />
        <Services />
        <Process />
        <CaseStudies />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
