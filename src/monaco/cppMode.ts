import type { languages } from 'monaco-editor';

// Full Monarch grammar for C++/C with STL type highlighting.
// Based on Monaco's built-in cpp grammar, extended with common standard library types.
const cppLanguage: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.cpp',

  brackets: [
    { token: 'delimiter.curly', open: '{', close: '}' },
    { token: 'delimiter.parenthesis', open: '(', close: ')' },
    { token: 'delimiter.square', open: '[', close: ']' },
    { token: 'delimiter.angle', open: '<', close: '>' },
  ],

  keywords: [
    'abstract', 'amp', 'array', 'auto', 'bool', 'break', 'case', 'catch',
    'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'concept', 'const',
    'consteval', 'constexpr', 'constinit', 'const_cast', 'continue', 'co_await',
    'co_return', 'co_yield', 'cpu', 'decltype', 'default', 'delete', 'do',
    'double', 'dynamic_cast', 'each', 'else', 'enum', 'explicit', 'export',
    'extern', 'false', 'final', 'float', 'for', 'friend', 'goto', 'if',
    'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
    'nullptr', 'operator', 'override', 'private', 'protected', 'public',
    'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed',
    'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch',
    'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef',
    'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
    'volatile', 'wchar_t', 'while',
  ],

  // Standard library types — rendered with type.identifier token (teal in vs-dark)
  stlTypes: [
    // Smart pointers
    'shared_ptr', 'unique_ptr', 'weak_ptr', 'enable_shared_from_this',
    // Sequential containers
    'vector', 'list', 'deque', 'forward_list', 'array', 'span',
    // Associative containers
    'set', 'multiset', 'map', 'multimap',
    'unordered_set', 'unordered_multiset', 'unordered_map', 'unordered_multimap',
    // Container adapters
    'stack', 'queue', 'priority_queue',
    // Strings
    'string', 'wstring', 'u8string', 'u16string', 'u32string',
    'string_view', 'wstring_view',
    // Utilities
    'pair', 'tuple', 'optional', 'variant', 'any', 'expected', 'unexpected',
    'function', 'reference_wrapper', 'initializer_list',
    // Iterators / ranges
    'iterator', 'const_iterator', 'reverse_iterator', 'const_reverse_iterator',
    // Streams
    'istream', 'ostream', 'iostream',
    'ifstream', 'ofstream', 'fstream',
    'istringstream', 'ostringstream', 'stringstream',
    // Threading
    'thread', 'jthread', 'mutex', 'recursive_mutex', 'shared_mutex', 'timed_mutex',
    'lock_guard', 'unique_lock', 'shared_lock', 'scoped_lock',
    'condition_variable', 'condition_variable_any',
    'atomic', 'atomic_flag', 'atomic_ref',
    'future', 'promise', 'packaged_task',
    // Exceptions
    'exception', 'runtime_error', 'logic_error', 'length_error', 'out_of_range',
    'invalid_argument', 'overflow_error', 'underflow_error', 'range_error', 'bad_alloc',
    'bad_cast', 'bad_typeid', 'bad_exception', 'bad_optional_access',
    // Memory
    'allocator', 'allocator_traits', 'pointer_traits',
    // Fixed-width integers
    'int8_t', 'int16_t', 'int32_t', 'int64_t',
    'uint8_t', 'uint16_t', 'uint32_t', 'uint64_t',
    'int_least8_t', 'int_least16_t', 'int_least32_t', 'int_least64_t',
    'uint_least8_t', 'uint_least16_t', 'uint_least32_t', 'uint_least64_t',
    'intptr_t', 'uintptr_t', 'intmax_t', 'uintmax_t',
    'size_t', 'ptrdiff_t', 'nullptr_t', 'byte',
    // Numeric
    'complex', 'valarray', 'bitset',
    // Chrono
    'duration', 'time_point', 'system_clock', 'steady_clock', 'high_resolution_clock',
    // Filesystem
    'path',
    // Type traits / meta
    'type_identity', 'remove_reference', 'remove_const', 'remove_volatile',
    'remove_cv', 'remove_pointer', 'add_pointer', 'decay',
    'enable_if', 'conditional', 'integral_constant', 'true_type', 'false_type',
    'is_same', 'is_base_of', 'is_convertible', 'is_integral', 'is_floating_point',
    'is_pointer', 'is_reference', 'is_const', 'is_void', 'is_enum', 'is_class',
    // Ranges (C++20)
    'input_range', 'output_range', 'forward_range', 'bidirectional_range',
    'random_access_range', 'contiguous_range', 'sized_range', 'range',
  ],

  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '->', '.*', '->*',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  integersuffix: /([uU](ll|LL|l|L)|(ll|LL|l|L)[uU]?|[uU])?/,
  floatsuffix: /[fFlL]?/,
  encoding: /u|u8|U|L/,

  tokenizer: {
    root: [
      // Identifiers, keywords, and STL types
      [/[a-zA-Z_]\w*/, {
        cases: {
          '@keywords': { token: 'keyword.$0' },
          '@stlTypes': 'type.identifier',
          '@default': 'identifier',
        },
      }],

      // Whitespace
      { include: '@whitespace' },

      // Preprocessor
      [/^#\s*include/, { token: 'keyword.directive.include', next: '@include' }],
      [/^#\s*\w+/, 'keyword.directive'],

      // Delimiters and brackets
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'delimiter',
          '@default': '',
        },
      }],

      // Numbers
      [/\d*\d+[eE]([\-+]?\d+)?(@floatsuffix)/, 'number.float'],
      [/\d*\.\d+([eE][\-+]?\d+)?(@floatsuffix)/, 'number.float'],
      [/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, 'number.hex'],
      [/0[0-7']*[0-7](@integersuffix)/, 'number.octal'],
      [/0[bB][0-1']*[0-1](@integersuffix)/, 'number.binary'],
      [/\d[\d']*\d(@integersuffix)/, 'number'],
      [/\d(@integersuffix)/, 'number'],

      // Delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // Strings
      [/(@encoding)?"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      [/(@encoding)?R"(?:([^ ()\\\t]*)\()/, { token: 'string.raw.begin', next: '@raw_string.$2' }],

      // Characters
      [/(@encoding)?'/, { token: 'string.quote', bracket: '@open', next: '@char' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*\*(?!\/)/, 'comment.doc', '@doccomment'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      ['\\*/', 'comment', '@pop'],
      [/[/*]/, 'comment'],
    ],

    doccomment: [
      [/[^/*]+/, 'comment.doc'],
      [/\/\*/, 'comment.doc', '@push'],
      ['\\*/', 'comment.doc', '@pop'],
      [/[/*]/, 'comment.doc'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    raw_string: [
      [/[^)]+/, 'string'],
      [/\)(?:[^ ()\\\t]*)"/, { token: 'string.raw.end', next: '@pop' }],
      [/\)/, 'string'],
    ],

    char: [
      [/[^\\']/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    include: [
      [/(\s*)(<)([^<>]*)(>)/, ['', 'keyword.directive.include.begin', 'string.include.identifier', { token: 'keyword.directive.include.end', next: '@pop' }]],
      [/(\s*)(")([^"]*)(")/, ['', 'keyword.directive.include.begin', 'string.include.identifier', { token: 'keyword.directive.include.end', next: '@pop' }]],
    ],
  },
};

export default cppLanguage;
