import type { DocsVersion, NavDocsSection } from "./types";

export const docsVersions: DocsVersion[] = [
  "v1.0.1",
  "v2.0.8-alpha",
  "V3.0.9-beta1",
];

export const docsNavSections: NavDocsSection[] = [
  {
    group: "Get Started",
    items: [
      { id: "QuickStart", label: "Quick Start" },
      { id: "InstallationGuide", label: "Installation Guide" },
      { id: "Tutorials", label: "Tutorials" },
      { id: "APIReference", label: "API Reference" },
      { id: "BestPractices", label: "Best Practices" },
      { id: "FAQ", label: "FAQ" },
    ],
  },
  {
    group: "Components",
    items: [
      { id: "Accordion", label: "Accordion" },
      { id: "Alert", label: "Alert" },
      { id: "AlertDialog", label: "Alert Dialog" },
      { id: "AspectRatio", label: "Aspect Ratio" },
      { id: "Avatar", label: "Avatar" },
      { id: "Badge", label: "Badge" },
      { id: "Breadcrumbs", label: "Breadcrumbs" },
      { id: "Button", label: "Button" },
      { id: "ButtonGroup", label: "Button Group" },
      { id: "Card", label: "Card" },
      { id: "Checkbox", label: "Checkbox" },
      { id: "CircularProgress", label: "Circular Progress" },
      { id: "DatePicker", label: "Date Picker" },
      { id: "Dialog", label: "Dialog" },
    ],
  },
  {
    group: "API Reference",
    items: [
      { id: "FileConventions", label: "File Conventions" },
      { id: "VersionControl", label: "Version Control" },
      { id: "FileOrganization", label: "File Organization" },
      { id: "BackupProcedures", label: "Backup Procedures" },
    ],
  },
];
