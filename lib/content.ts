/**
 * Home page content.
 *
 * Typed locally rather than fetched from Sanity for now: designing the CMS
 * schema against real usage beats guessing at it up front. These shapes become
 * the Sanity document types in phase 2.
 */

export interface Pillar {
  id: "seo" | "aeo" | "geo";
  abbr: string;
  name: string;
  question: string;
  answer: string;
  detail: string;
}

/** The three-search-futures thesis: the brief's stated USP, made concrete. */
export const pillars: Pillar[] = [
  {
    id: "seo",
    abbr: "SEO",
    name: "Search Engine Optimization",
    question: "Someone types a query.",
    answer:
      "Classic organic search. Content structured around real keyword demand, built to earn links and rank on the results page buyers still start from.",
    detail:
      "Topical clusters, on-page optimization, internal linking, and technical hygiene: the compounding foundation everything else sits on.",
  },
  {
    id: "aeo",
    abbr: "AEO",
    name: "Answer Engine Optimization",
    question: "Someone asks for an answer.",
    answer:
      "Featured snippets, voice results, and AI Overviews pull a single answer rather than a list. Content has to be structured so a machine can lift it cleanly.",
    detail:
      "Answer-first paragraphs, question-shaped headings, FAQ and HowTo schema, and unambiguous phrasing that extraction models can parse without guessing.",
  },
  {
    id: "geo",
    abbr: "GEO",
    name: "Generative Engine Optimization",
    question: "Someone asks ChatGPT.",
    answer:
      "Generative engines synthesise answers from sources they trust, then cite them. Getting cited is a different discipline from ranking, and most agencies aren't doing it yet.",
    detail:
      "Citable claims, original data, clear entity definitions, and crawler access for the models that increasingly sit between your buyer and your website.",
  },
];

export interface Service {
  title: string;
  description: string;
}

/** All six service types the client asked to showcase (brief §5). */
export const services: Service[] = [
  {
    title: "SEO Content Writing",
    description:
      "Research-led articles and landing pages built around genuine search demand, written to rank and to read well.",
  },
  {
    title: "AEO Content",
    description:
      "Answer-first structures, question-shaped headings, and schema-ready formatting so answer engines can quote you directly.",
  },
  {
    title: "GEO Content",
    description:
      "Content engineered for citation by generative engines: clear claims, defined entities, and sourceable substance.",
  },
  {
    title: "General Copywriting",
    description:
      "Website, campaign, and conversion copy that sounds like a business worth hiring, not a template.",
  },
  {
    title: "Blog Writing",
    description:
      "Consistent, on-strategy publishing that compounds. Editorial calendars mapped to clusters, not to guesswork.",
  },
  {
    title: "Technical Content",
    description:
      "Documentation, whitepapers, and deep explainers for products that need an author who actually understands them.",
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export const process: ProcessStep[] = [
  {
    number: "01",
    title: "Audit",
    description:
      "We map where you currently surface, and where you don't, across search, answer engines, and AI assistants.",
  },
  {
    number: "02",
    title: "Architecture",
    description:
      "Topic clusters, entity definitions, and a content model designed so every piece has a job and a home.",
  },
  {
    number: "03",
    title: "Production",
    description:
      "Writing that carries genuine expertise, structured from the first draft for both readers and machines.",
  },
  {
    number: "04",
    title: "Measurement",
    description:
      "Rankings, citations, and pipeline, reported monthly against the outcomes you actually care about.",
  },
];

export interface Tier {
  name: string;
  price: string;
  cadence: string;
  summary: string;
  includes: string[];
  featured?: boolean;
}

/**
 * Pricing from the strategy brief §4. Flagged there as "a defensible starting
 * point ... validate against the client's cost base before publishing."
 */
export const tiers: Tier[] = [
  {
    name: "Foundation",
    price: "$1,500",
    cadence: "/month",
    summary: "Establish the base layer and start compounding.",
    includes: [
      "4 SEO-optimized articles per month",
      "On-page optimization",
      "Monthly reporting",
    ],
  },
  {
    name: "Ascendant",
    price: "$3,200",
    cadence: "/month",
    summary: "Add answer-engine structure to the mix.",
    includes: [
      "Everything in Foundation",
      "8 pieces per month",
      "AEO content: FAQ and answer blocks",
      "Schema-ready structure",
    ],
    featured: true,
  },
  {
    name: "Paramount",
    price: "$5,500",
    cadence: "/month",
    summary: "The full three-front program.",
    includes: [
      "Everything in Ascendant",
      "12+ pieces per month",
      "GEO-structured content for AI citation",
      "Technical content",
      "Quarterly strategy review",
    ],
  },
  {
    name: "Custom",
    price: "Let's scope it",
    cadence: "",
    summary: "Multi-market, multi-language, or high-volume programs.",
    includes: [
      "Scoped individually",
      "Multi-market and multi-language",
      "Dedicated strategist",
    ],
  },
];

export interface Faq {
  question: string;
  answer: string;
}

/**
 * Answer-first by design: each answer opens with a direct, self-contained
 * response in roughly 40 to 60 words. That is the shape answer engines lift, so
 * this section doubles as a live demonstration of the AEO service, and it
 * feeds FAQPage schema from the same source.
 */
export const faqs: Faq[] = [
  {
    question: "What is Answer Engine Optimization (AEO)?",
    answer:
      "Answer Engine Optimization is the practice of structuring content so search features and AI assistants can extract a single, direct answer from it. It relies on answer-first paragraphs, question-shaped headings, and schema markup, optimizing to be quoted rather than only to rank.",
  },
  {
    question: "How is GEO different from traditional SEO?",
    answer:
      "SEO optimizes for a ranked list of links. GEO, or Generative Engine Optimization, optimizes to be cited inside an AI-generated answer. It prioritises verifiable claims, clearly defined entities, original data, and crawler access for AI models, because generative engines synthesise and attribute rather than list.",
  },
  {
    question: "Do I still need SEO if AI search is growing?",
    answer:
      "Yes. Organic search still drives the majority of discovery, and AI answer engines draw heavily on the same pages that rank well. Strong SEO foundations make content more likely to be cited by AI, not less. The two reinforce each other rather than competing.",
  },
  {
    question: "How long before content starts performing?",
    answer:
      "Most programs see meaningful movement in three to six months, though timelines vary with domain authority, competition, and publishing volume. AEO and GEO gains can appear faster than classic rankings, because answer extraction depends more on structure and clarity than on accumulated link equity.",
  },
  {
    question: "Which markets do you work in?",
    answer:
      "We work with small and mid-sized businesses across the United States and United Kingdom, writing in both US and UK English. Content is optimized for the regional search behaviour and terminology of whichever market a campaign targets.",
  },
];
