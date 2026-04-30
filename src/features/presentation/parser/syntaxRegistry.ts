import rawRegistry from './syntax-registry.json';

type StyleCommandRegistryEntry = {
  name: string;
  command: string;
  regex: string;
  description: string;
  values?: string[];
};

type RegistryEntry = {
  kind: 'slide' | 'block' | 'inline';
  tag: string;
  syntax: string;
  options?: string[];
  description: string;
  demo?: string;
};

type SyntaxRegistry = {
  version: number;
  slideDirectives: {
    title: string;
    sectionPrefix: string;
    category: string;
    subtitle: string;
    badge: string;
    items: string;
    yesScroll: string;
    noScroll: string;
  };
  blockDirectives: {
    end: string;
    step: string;
    style: string;
    fragment: string;
    columns: string;
    column: string;
    code: string;
    table: string;
    imagePrefix: string;
    videoPrefix: string;
    divider: string;
    presenter: string;
    badgeRow: string;
    diagram: string;
  };
  noteVariants: string[];
  styleCommands: StyleCommandRegistryEntry[];
  listDirective: {
    command: string;
    regex: string;
    styles: string[];
  };
  entries: RegistryEntry[];
};

const syntaxRegistry = rawRegistry as SyntaxRegistry;

export const SYNTAX_REGISTRY = syntaxRegistry;
export const NOTE_VARIANTS = syntaxRegistry.noteVariants;
export const NOTE_VARIANTS_SET = new Set(syntaxRegistry.noteVariants);
export const NOTE_VARIANTS_REGEX_PART = syntaxRegistry.noteVariants.join('|');
export const STYLE_COMMANDS = syntaxRegistry.styleCommands.map((entry) => ({
  ...entry,
  compiledRegex: new RegExp(entry.regex, 'i'),
}));

export const STYLE_COMMAND_PREFIXES = syntaxRegistry.styleCommands.map((entry) => {
  const first = entry.command.split('|')[0];
  return first.startsWith('\\') ? first.slice(1) : first;
});

export const LIST_DIRECTIVE_REGEX = new RegExp(syntaxRegistry.listDirective.regex);
