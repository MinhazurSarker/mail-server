import type { DocsVersion, NavDocsSection } from "./types";

export const docsVersions: DocsVersion[] = [
  "v1.0.1",
  "v2.0.8-alpha",
  "V3.0.9-beta1",
];

export const docsNavSections: NavDocsSection[] = [
  {
    id: "GetStarted",
    label: "Get Started",
    items: [
      { id: "Introduction", label: "Introduction" },
      { id: "QuickStart", label: "Quick Start" },
      { id: "FrameworkGuides", label: "Framework guides" },
      { id: "Usage", label: "Usage" },
      { id: "Javascript", label: "Javascript" },
      { id: "Accessibility", label: "Accessibility" },
      { id: "UpgradeGuide", label: "Upgrade Guide" },
      { id: "License", label: "License" },
    ],
  },
  {
    id: "Components",
    label: "Components",
    items: [
      { id: "Accordion", label: "Accordion" },
      { id: "Alert", label: "Alert" },
      { id: "Avatar", label: "Avatar" },
      { id: "Badge", label: "Badge" },
      { id: "Button", label: "Button" },
      { id: "Card", label: "Card" },
      { id: "Carousel", label: "Carousel" },
      { id: "ChatBubble", label: "Chat Bubble" },
      { id: "Collapse", label: "Collapse" },
      { id: "Indicator", label: "Indicator" },
      { id: "ListGroup", label: "List Group" },
      { id: "Loading", label: "Loading" },
      { id: "Progress", label: "Progress" },
      { id: "RadialProgress", label: "Radial progress" },
      { id: "Skeleton", label: "Skeleton" },
      { id: "Stack", label: "Stack" },
    ],
  },
];
