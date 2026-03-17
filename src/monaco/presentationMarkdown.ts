import type { languages } from 'monaco-editor';

/**
 * Monarch language definition that extends Markdown with
 * presentation-specific tags from syntax-registry.json.
 */
const presentationMarkdown: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.md',

  // Presentation @ directives
  slideDirectives: /title|section|yesScroll|noScroll/,
  blockDirectives: /style|fragment|columns|column|code|table|presenter/,
  noteVariants: /note|warning|important|tip/,
  inlineDirectives: /image|video|divider/,
  blockTerminals: /end|step/,

  // Style backslash commands
  styleCommands:
    /align|margin|marginTop|marginRight|marginBottom|marginLeft|fontSize|width|height|bg|color|padding|borderLeft|borderRadius|gap|border/,

  // Standard markdown escapes
  escapes: /\\[\\`*_{}[\]()#+\-.!]/,

  tokenizer: {
    root: [
      // ── Slide separator ───────────────────────────────
      [/^---\s*$/, 'keyword'],

      // ── @ directives ──────────────────────────────────
      // Block terminals: @end, @step
      [/^(\s*)(@)(end|step)\b/, ['white', 'tag', 'tag']],

      // Note variants: @note, @warning, @important, @tip  (+ optional label)
      [
        /^(\s*)(@)(note|warning|important|tip)\b(.*)/,
        ['white', 'tag', 'tag', 'attribute.value'],
      ],

      // Slide directives: @title, @section, @yesScroll, @noScroll
      [
        /^(\s*)(@)(title|section|yesScroll|noScroll)\b(.*)/,
        ['white', 'tag', 'tag', 'attribute.value'],
      ],

      // Block directives: @style, @fragment, @columns, @column, @code, @table, @presenter
      [
        /^(\s*)(@)(style|fragment|columns|column|code|table|presenter)\b(.*)/,
        ['white', 'tag', 'tag', 'attribute.value'],
      ],

      // Inline directives: @image, @video, @divider
      [
        /^(\s*)(@)(image|video|divider)\b(.*)/,
        ['white', 'tag', 'tag', 'attribute.value'],
      ],

      // ── Backslash style commands ──────────────────────
      [
        /^(\s*)(\\)(align|margin|marginTop|marginRight|marginBottom|marginLeft|fontSize|width|height|bg|color|padding|borderLeft|borderRadius|gap|border)\b(.*)/,
        ['white', 'tag', 'keyword', 'attribute.value'],
      ],

      // \list directive
      [
        /^(\s*)(\\)(list)\b(.*)/,
        ['white', 'tag', 'keyword', 'attribute.value'],
      ],

      // \date{...} inside @title
      [/^(\s*)(\\date)(\{)([^}]*)(\})/, ['white', 'keyword', 'delimiter.curly', 'number', 'delimiter.curly']],

      // ── Standard Markdown ─────────────────────────────
      // Headers (whole line is keyword)
      [/^(\s*)(#+\s.*)$/, ['white', 'keyword']],

      // Horizontal rules (whole line is keyword)
      [/^\s*(=+|\*{3,}|-{3,})\s*$/, 'keyword'],

      // List bullets
      [/^\s*([*\-+:]|\d+\.)\s/, 'keyword'],

      // Bold
      [/\*\*([^*]+)\*\*/, 'strong'],
      [/__([^_]+)__/, 'strong'],

      // Italic
      [/\*([^*]+)\*/, 'emphasis'],
      [/_([^_]+)_/, 'emphasis'],

      // Inline code
      [/`[^`]+`/, 'variable'],

      // Links
      [/!?\[/, { token: 'string.link', next: '@linkText' }],

      // HTML tags (allow inline HTML in markdown)
      [/<\w+/, { token: 'tag', next: '@htmlTag' }],
      [/<\/\w+\s*>/, 'tag'],

      // Block quotes
      [/^\s*>+/, 'comment'],

      // Fenced code blocks
      [/^\s*```\s*(\w+)?\s*$/, { token: 'string', next: '@codeblock' }],
    ],

    linkText: [
      [/[^\\)\]]+/, 'string.link'],
      [/\]\(/, { token: 'string.link', next: '@linkHref' }],
      [/\]/, { token: 'string.link', next: '@pop' }],
    ],

    linkHref: [
      [/[^)]+/, 'string.link'],
      [/\)/, { token: 'string.link', next: '@popall' }],
    ],

    htmlTag: [
      [/[^>]+/, 'tag'],
      [/>/, { token: 'tag', next: '@pop' }],
    ],

    codeblock: [
      [/^\s*```\s*$/, { token: 'string', next: '@pop' }],
      [/.*$/, 'variable.source'],
    ],
  },
};

export default presentationMarkdown;
