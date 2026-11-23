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
      { id: "QuickStart", label: "Quick Start" },
      { id: "InstallationGuide", label: "Installation Guide" },
      { id: "Tutorials", label: "Tutorials" },
      { id: "Configuration", label: "Configuration" },
      { id: "BestPractices", label: "Best Practices" },
      { id: "FAQ", label: "FAQ" },
    ],
  },
  {
    id: "DeveloperFeatures",
    label: "Developer Features",
    items: [
      { id: "Plugins", label: "Plugins" },
      { id: "CustomHooks", label: "Custom Hooks" },
      { id: "StateManagement", label: "State Management" },
      { id: "PerformanceTips", label: "Performance Tips" },
    ],
  },
  {
    id: "SDKDocumentation",
    label: "SDK Documentation",
    items: [
      { id: "SDKGettingStarted", label: "Getting Started" },
      { id: "SDKAuthentication", label: "Authentication" },
      { id: "ErrorHandling", label: "Error Handling" },
      { id: "RateLimits", label: "Rate Limits" },
    ],
  },
  {
    id: "APIReference",
    label: "API Reference",
    items: [
      { id: "RESTAPI", label: "REST API" },
      { id: "GraphQL", label: "GraphQL" },
      { id: "Webhooks", label: "Webhooks" },
      { id: "SDKMethods", label: "SDK Methods" },
    ],
  },
  {
    id: "IntegrationGuides",
    label: "Integration Guides",
    items: [
      { id: "OAuthSetup", label: "OAuth Setup" },
      { id: "ThirdPartyServices", label: "Third-party Services" },
      { id: "DatabaseIntegration", label: "Database Integration" },
    ],
  },
  {
    id: "TutorialsSection",
    label: "Tutorials",
    items: [
      { id: "BuildingDashboard", label: "Building a Dashboard" },
      { id: "CRUDOperations", label: "CRUD Operations" },
      { id: "AuthFlow", label: "Authentication Flow" },
    ],
  },
  {
    id: "ReleaseNotes",
    label: "Release Notes",
    items: [
      { id: "v200", label: "v2.0.0" },
      { id: "v150", label: "v1.5.0" },
      { id: "v100", label: "v1.0.0" },
    ],
  },
];
