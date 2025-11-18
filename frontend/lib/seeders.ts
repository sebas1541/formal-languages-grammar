// Gramáticas de ejemplo predefinidas para importar

export interface GrammarSeed {
  name: string;
  description: string;
  grammar_type: "type_2" | "type_3";
  non_terminals: string[];
  terminals: string[];
  start_symbol: string;
  productions: Array<{
    left: string;
    right: string[];
  }>;
  examples: {
    accepted: string[];
    rejected: string[];
  };
}

export const grammarSeeds: GrammarSeed[] = [
  {
    name: "Paréntesis Balanceados",
    description: "Gramática que reconoce cadenas con paréntesis balanceados usando 'a' como '(' y 'b' como ')'",
    grammar_type: "type_2",
    non_terminals: ["S"],
    terminals: ["a", "b"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["a", "S", "b"] },
      { left: "S", right: ["ε"] },
    ],
    examples: {
      accepted: ["ε", "a b", "a a b b", "a a a b b b"],
      rejected: ["a", "b", "a b b", "b a"],
    },
  },
  {
    name: "Expresiones Aritméticas",
    description: "Gramática para expresiones aritméticas simples con +, *, paréntesis e identificadores",
    grammar_type: "type_2",
    non_terminals: ["E", "T", "F"],
    terminals: ["id", "+", "*", "(", ")"],
    start_symbol: "E",
    productions: [
      { left: "E", right: ["E", "+", "T"] },
      { left: "E", right: ["T"] },
      { left: "T", right: ["T", "*", "F"] },
      { left: "T", right: ["F"] },
      { left: "F", right: ["(", "E", ")"] },
      { left: "F", right: ["id"] },
    ],
    examples: {
      accepted: ["id", "id + id", "id * id", "( id )", "id + id * id"],
      rejected: ["+ id", "id +", "( id", "id )"],
    },
  },
  {
    name: "Números Binarios que terminan en 1",
    description: "Gramática regular que acepta números binarios que terminan en 1",
    grammar_type: "type_3",
    non_terminals: ["S", "A"],
    terminals: ["0", "1"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["0", "S"] },
      { left: "S", right: ["1", "S"] },
      { left: "S", right: ["1"] },
    ],
    examples: {
      accepted: ["1", "0 1", "1 1", "0 0 1", "1 0 1"],
      rejected: ["0", "1 0", "0 0", "1 1 0"],
    },
  },
  {
    name: "Cadenas con cantidad par de a",
    description: "Gramática regular que acepta cadenas sobre {a,b} con cantidad par de 'a'",
    grammar_type: "type_3",
    non_terminals: ["S", "A"],
    terminals: ["a", "b"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["a", "A"] },
      { left: "S", right: ["b", "S"] },
      { left: "S", right: ["ε"] },
      { left: "A", right: ["a", "S"] },
      { left: "A", right: ["b", "A"] },
    ],
    examples: {
      accepted: ["ε", "a a", "b b", "a b a", "b a a b"],
      rejected: ["a", "a a a", "b a", "a b b"],
    },
  },
  {
    name: "Palíndromos sobre {a,b}",
    description: "Gramática que reconoce palíndromos sobre el alfabeto {a,b}",
    grammar_type: "type_2",
    non_terminals: ["S"],
    terminals: ["a", "b"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["a", "S", "a"] },
      { left: "S", right: ["b", "S", "b"] },
      { left: "S", right: ["a"] },
      { left: "S", right: ["b"] },
      { left: "S", right: ["ε"] },
    ],
    examples: {
      accepted: ["ε", "a", "b", "a a", "b b", "a b a", "b a b"],
      rejected: ["a b", "a a b", "a b b", "a b c"],
    },
  },
  {
    name: "Lenguaje a^n b^n",
    description: "Gramática clásica que genera el lenguaje L = {a^n b^n | n ≥ 0}",
    grammar_type: "type_2",
    non_terminals: ["S"],
    terminals: ["a", "b"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["a", "S", "b"] },
      { left: "S", right: ["ε"] },
    ],
    examples: {
      accepted: ["ε", "a b", "a a b b", "a a a b b b"],
      rejected: ["a", "b", "a a b", "a b b"],
    },
  },
  {
    name: "Identificadores C/Java",
    description: "Gramática para identificadores válidos en C/Java (comienzan con letra o _, seguidos de letras, dígitos o _)",
    grammar_type: "type_3",
    non_terminals: ["S", "A"],
    terminals: ["letra", "digito", "_"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["letra", "A"] },
      { left: "S", right: ["letra"] },
      { left: "S", right: ["_", "A"] },
      { left: "S", right: ["_"] },
      { left: "A", right: ["letra", "A"] },
      { left: "A", right: ["letra"] },
      { left: "A", right: ["digito", "A"] },
      { left: "A", right: ["digito"] },
      { left: "A", right: ["_", "A"] },
      { left: "A", right: ["_"] },
    ],
    examples: {
      accepted: ["letra", "_", "letra digito", "_ letra", "letra _ digito"],
      rejected: ["digito", "digito letra"],
    },
  },
  {
    name: "Comentarios de una línea",
    description: "Gramática para comentarios de una línea estilo // de C/Java",
    grammar_type: "type_3",
    non_terminals: ["S", "A"],
    terminals: ["/", "char"],
    start_symbol: "S",
    productions: [
      { left: "S", right: ["/", "/", "A"] },
      { left: "A", right: ["char", "A"] },
      { left: "A", right: ["ε"] },
    ],
    examples: {
      accepted: ["/ /", "/ / char", "/ / char char"],
      rejected: ["/", "char", "/ char"],
    },
  },
];
