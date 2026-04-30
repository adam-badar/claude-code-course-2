export type StaticMetric = { label: string; value: string };

export type Venture = {
  slug: string;
  name: string;
  positioning: string;
  url: string;
  github?: { owner: string; repo: string };
  staticMetrics: StaticMetric[];
};

export const ventures: Venture[] = [
  {
    slug: "maple-bit",
    name: "Maple Bit",
    positioning: "Payment processing for 100+ retail SMBs across Ontario, since 2021.",
    url: "https://maplebit.ca",
    staticMetrics: [
      { label: "Net profit", value: "$150k+" },
      { label: "Customers", value: "100+" },
      { label: "Years", value: "4+" },
    ],
  },
  {
    slug: "bavlio",
    name: "Bavlio",
    positioning: "Cursor for B2B outreach. Hyper-personalized cold email at scale.",
    url: "https://bavlio.com",
    github: { owner: "adam-badar", repo: "bavlio" },
    staticMetrics: [
      { label: "Emails sent", value: "100k+" },
      { label: "Founded", value: "2025" },
    ],
  },
  {
    slug: "sapienex",
    name: "SapienEx",
    positioning: "AI-native consultancy. AI-SRE work for crypto infra.",
    url: "https://sapienex.com",
    staticMetrics: [
      { label: "MTTR cut", value: "30 to 5 min" },
      { label: "Founded", value: "2026" },
    ],
  },
  {
    slug: "bavimail",
    name: "BaviMail",
    positioning: "Email infrastructure SDK powering Bavlio.",
    url: "https://bavimail.com",
    github: { owner: "adam-badar", repo: "bavimail" },
    staticMetrics: [
      { label: "Stack", value: "Postal + SDK" },
      { label: "Founded", value: "2025" },
    ],
  },
];
