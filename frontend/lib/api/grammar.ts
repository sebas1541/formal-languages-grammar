import axios from 'axios';

// Types matching backend DTOs
export interface ProductionRule {
  left: string;
  right: string[];
}

export interface Grammar {
  id: number;
  name: string;
  grammar_type: 'type_2' | 'type_3';
  non_terminals: string[];
  terminals: string[];
  start_symbol: string;
  productions: ProductionRule[];
}

export interface ParseTreeNode {
  symbol: string;
  children: ParseTreeNode[];
}

export interface ParseResult {
  accepted: boolean;
  steps: number;
  derivation_tree: ParseTreeNode | null;
}

export interface GenerationResult {
  strings: string[];
}

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Grammar API
export const grammarApi = {
  // List all grammars
  list: async (): Promise<Grammar[]> => {
    const response = await apiClient.get('/grammars/');
    return response.data;
  },

  // Get single grammar
  get: async (id: number): Promise<Grammar> => {
    const response = await apiClient.get(`/grammars/${id}`);
    return response.data;
  },

  // Create grammar
  create: async (grammar: Omit<Grammar, 'id'>): Promise<Grammar> => {
    const response = await apiClient.post('/grammars/', grammar);
    return response.data;
  },

  // Update grammar
  update: async (id: number, grammar: Partial<Omit<Grammar, 'id'>>): Promise<Grammar> => {
    const response = await apiClient.put(`/grammars/${id}`, grammar);
    return response.data;
  },

  // Delete grammar
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/grammars/${id}`);
  },

  // Export grammar (same as get)
  export: async (id: number): Promise<Grammar> => {
    const response = await apiClient.get(`/grammars/${id}/export`);
    return response.data;
  },

  // Parse string
  parse: async (id: number, input: string, max_steps?: number): Promise<ParseResult> => {
    const response = await apiClient.post(`/grammars/${id}/parse`, {
      input_string: input,
      max_steps,
    });
    return response.data;
  },

  // Generate strings
  generate: async (id: number, limit: number = 10): Promise<GenerationResult> => {
    const response = await apiClient.get(`/grammars/${id}/generate`, {
      params: { limit },
    });
    return response.data;
  },
};
