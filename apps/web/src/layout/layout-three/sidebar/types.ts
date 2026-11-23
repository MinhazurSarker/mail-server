export type DocsVersion = string;

export interface NavDocsItem {
  id: string;
  label: string;
  href?: string;
}

export interface NavDocsSection {
  group: string;
  items: NavDocsItem[];
}

export interface VersionDropdownProps {
  versions: DocsVersion[];
  activeVersion: DocsVersion;
  onSelectVersion: (version: DocsVersion) => void;
}
