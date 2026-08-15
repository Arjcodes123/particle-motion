import { Hero } from "@/components/hero/hero";
import { ParticleLayer } from "@/components/hero/particle-layer";
import { SectionMorph } from "@/components/motion/section-morph";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Thesis } from "@/components/sections/thesis";
import { Pillars } from "@/components/sections/pillars";
import { Services } from "@/components/sections/services";
import { Process } from "@/components/sections/process";
import { CaseStudies } from "@/components/sections/case-studies";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { Cta } from "@/components/sections/cta";
import { JsonLd } from "@/components/seo/json-ld";
import {
  faqSchema,
  organizationSchema,
  servicesSchema,
  websiteSchema,
} from "@/lib/schema";

/**
 * Stage choreography. Sections carry `data-stage`, and the particle spine
 * interpolates continuously between them as they pass the viewport centre:
 *
 *   0  hero      SEO / AEO / GEO wordmark
 *   2  thesis    the form shatters
 *   3  pillar 1  search bar
 *   4  pillar 2  answer card
 *   5  pillar 3  cited chat bubble
 *   6  services onward: ambient dust behind the conversion sections
 *   7  cta       re-assembles
 *
 * Stage 1 (the obelisk) is never a section's own value: it is the midpoint
 * between hero and thesis, so the form assembles as you scroll out of the
 * hero and breaks apart as the thesis lands.
 */
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

      <ParticleLayer />

      {/*
        Sibling of #main, not inside it: #main is `position: relative`, which
        would rebase this shape's absolute coordinates to main's own box
        instead of the document root that lib/shape-stage.ts measures
        against.
      */}
      <SectionMorph />

      <Header />

      {/* Sits above the fixed canvas; sections opt into their own background. */}
      <main id="main" className="relative z-10 flex-1">
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
