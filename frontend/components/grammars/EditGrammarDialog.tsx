"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grammarApi, type ProductionRule, type Grammar } from "@/lib/api/grammar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FiPlus, FiX } from "react-icons/fi";
import { useToast } from "@/components/ui/toast";

interface EditGrammarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grammar: Grammar | null;
}

export function EditGrammarDialog({ open, onOpenChange, grammar }: EditGrammarDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [grammarType, setGrammarType] = useState<"type_2" | "type_3">("type_2");
  const [formData, setFormData] = useState({
    name: "",
    start_symbol: "S",
    non_terminals: ["S"],
    terminals: ["a", "b"],
    productions: [{ left: "S", right: ["a"] }] as ProductionRule[],
  });

  // Load grammar data when dialog opens
  useEffect(() => {
    if (grammar && open) {
      setFormData({
        name: grammar.name,
        start_symbol: grammar.start_symbol,
        non_terminals: [...grammar.non_terminals],
        terminals: [...grammar.terminals],
        productions: grammar.productions.map(p => ({ ...p })),
      });
      setGrammarType(grammar.grammar_type);
    }
  }, [grammar, open]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => grammarApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammars"] });
      queryClient.invalidateQueries({ queryKey: ["grammar", grammar?.id] });
      toast({
        title: "Gramática actualizada",
        description: "Los cambios se guardaron correctamente",
        variant: "success",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Error al actualizar la gramática";
      toast({
        title: "Error al actualizar",
        description: errorMessage,
        variant: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grammar) return;
    
    updateMutation.mutate({
      id: grammar.id,
      data: {
        ...formData,
        grammar_type: grammarType,
      },
    });
  };

  const addProduction = () => {
    setFormData({
      ...formData,
      productions: [...formData.productions, { left: "S", right: [""] }],
    });
  };

  const removeProduction = (index: number) => {
    setFormData({
      ...formData,
      productions: formData.productions.filter((_, i) => i !== index),
    });
  };

  const updateProduction = (index: number, field: "left" | "right", value: string | string[]) => {
    const newProductions = [...formData.productions];
    if (field === "right" && typeof value === "string") {
      newProductions[index] = {
        ...newProductions[index],
        right: value.split(/[\s,]+/).filter(Boolean),
      };
    } else {
      newProductions[index] = { ...newProductions[index], [field]: value };
    }
    setFormData({ ...formData, productions: newProductions });
  };

  if (!grammar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FFFDFB]/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto border-2 border-[#191918]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Gramática</DialogTitle>
          <DialogDescription>
            Modifica los componentes de tu gramática formal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grammar Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Gramática *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Expresiones Aritméticas"
              className="bg-[#F5F1ED] border-[#191918]"
              required
            />
          </div>

          {/* Grammar Type */}
          <div className="space-y-2">
            <Label>Tipo de Gramática *</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setGrammarType("type_2")}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                  grammarType === "type_2"
                    ? "border-[#191918] bg-[#F5F1ED] shadow-sm"
                    : "border-[#E0DCD5] hover:border-[#C5C0B8]"
                }`}
              >
                <div className="font-medium">Tipo 2</div>
                <div className="text-xs text-[#5A524C]">Libre de Contexto</div>
              </button>
              <button
                type="button"
                onClick={() => setGrammarType("type_3")}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                  grammarType === "type_3"
                    ? "border-[#191918] bg-[#F5F1ED] shadow-sm"
                    : "border-[#E0DCD5] hover:border-[#C5C0B8]"
                }`}
              >
                <div className="font-medium">Tipo 3</div>
                <div className="text-xs text-[#5A524C]">Regular</div>
              </button>
            </div>
          </div>

          {/* Start Symbol */}
          <div className="space-y-2">
            <Label htmlFor="start_symbol">Símbolo Inicial *</Label>
            <Input
              id="start_symbol"
              value={formData.start_symbol}
              onChange={(e) => setFormData({ ...formData, start_symbol: e.target.value })}
              placeholder="S"
              className="bg-[#F5F1ED] border-[#191918]"
              required
            />
          </div>

          {/* Non-terminals */}
          <div className="space-y-2">
            <Label htmlFor="non_terminals">Símbolos No Terminales (N) *</Label>
            <Input
              id="non_terminals"
              value={formData.non_terminals.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  non_terminals: e.target.value.split(/[\s,]+/).filter(Boolean),
                })
              }
              placeholder="S, A, B"
              className="bg-[#F5F1ED] border-[#191918]"
              required
            />
            <p className="text-xs text-[#5A524C]">Separados por comas o espacios</p>
          </div>

          {/* Terminals */}
          <div className="space-y-2">
            <Label htmlFor="terminals">Símbolos Terminales (Σ) *</Label>
            <Input
              id="terminals"
              value={formData.terminals.join(", ")}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  terminals: e.target.value.split(/[\s,]+/).filter(Boolean),
                })
              }
              placeholder="a, b, 0, 1"
              className="bg-[#F5F1ED] border-[#191918]"
              required
            />
            <p className="text-xs text-[#5A524C]">Separados por comas o espacios</p>
          </div>

          {/* Productions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Producciones (P) *</Label>
              <Button
                type="button"
                onClick={addProduction}
                size="sm"
                className="bg-[#191918] hover:bg-[#2D2925] text-white"
              >
                <FiPlus className="h-4 w-4 mr-1" />
                Añadir
              </Button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {formData.productions.map((prod, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-center p-3 bg-white/50 rounded-lg border border-[#E0DCD5]"
                >
                  <Input
                    value={prod.left}
                    onChange={(e) => updateProduction(index, "left", e.target.value)}
                    placeholder="S"
                    className="w-20 bg-[#F5F1ED] border-[#191918]"
                  />
                  <span className="text-[#5A524C]">→</span>
                  <Input
                    value={prod.right.join(" ")}
                    onChange={(e) => updateProduction(index, "right", e.target.value)}
                    placeholder="a S b"
                    className="flex-1 bg-[#F5F1ED] border-[#191918]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProduction(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <FiX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#5A524C]">
              Usa ε (epsilon) para producciones vacías. Separa símbolos con espacios.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#191918]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#191918] hover:bg-[#2D2925] text-white"
            >
              {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
