import {
  Atom,
  Layers,
  FileCode,
  Palette,
  Sparkles,
  Sparkle,
  Server,
  Database,
  Network,
  Workflow,
  Compass,
  Component,
  PenTool,
  Award,
  Cloud,
  Code,
  Cpu,
  GitBranch,
  Globe,
  LayoutGrid,
  Terminal,
  Wand2,
  Boxes,
  Braces,

  // New
  Leaf,
  Wind,
  Building,
  RadioTower,
  Table,
  Search,
  GitMerge,
  Bot,
  Scan,
  BrainCircuit,
  MousePointer,
  Cylinder,
  TableProperties,
  Package,
  Rocket,
  DatabaseBackup,
  SendHorizontal,
  Monitor,

  type LucideIcon,
} from "lucide-react";

// Extend this map any time you add a skill/certification with a new `icon:`
// value in the YAML content files — the key is the kebab-case name used there.
export const iconMap: Record<string, LucideIcon> = {
  atom: Atom,
  layers: Layers,
  leaf: Leaf,
  component: Component,
  palette: Palette,
  wind: Wind,

  server: Server,
  network: Network,
  building: Building,
  workflow: Workflow,
  "radio-tower": RadioTower,

  "file-code": FileCode,
  braces: Braces,
  terminal: Terminal,
  table: Table,

  search: Search,
  "git-merge": GitMerge,
  sparkles: Sparkles,
  sparkle: Sparkle,
  bot: Bot,
  scan: Scan,

  cpu: Cpu,
  "brain-circuit": BrainCircuit,
  github: GitBranch,
  "mouse-pointer": MousePointer,

  database: Database,
  cylinder: Cylinder,
  "table-properties": TableProperties,
  boxes: Boxes,

  cloud: Cloud,
  package: Package,
  "git-branch": GitBranch,
  rocket: Rocket,

  "database-backup": DatabaseBackup,
  "send-horizontal": SendHorizontal,

  "pen-tool": PenTool,
  monitor: Monitor,

  compass: Compass,
  code: Code,
  globe: Globe,
  "layout-grid": LayoutGrid,
  award: Award,
  wand: Wand2,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkle;
}
