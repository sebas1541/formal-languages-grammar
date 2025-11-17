"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grammarApi, type ProductionRule } from "@/lib/api/grammar";
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

interface CreateGrammarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGrammarDialog({ open, onOpenChange }: CreateGrammarDialogProps) {
  const queryClient = useQueryClient();
  const [grammarType, setGrammarType] = useState<"type_2" | "type_3">("type_2");
  const [formData, setFormData] = useState({
    name: "",
    start_symbol: "S",
    non_terminals: ["S"],
    terminals: ["a", "b"],
    productions: [{ left: "S", right: ["a"] }] as ProductionRule[],
  });

  const createMutation = useMutation({
    mutationFn: grammarApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammars"] });
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      start_symbol: "S",
      non_terminals: ["S"],
      terminals: ["a", "b"],
      productions: [{ left: "S", right: ["a"] }],
    });
    setGrammarType("type_2");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      grammar_type: grammarType,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#FFFDFB]/95 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Crear Nueva Gramática</DialogTitle>
          <DialogDescription>
            Define una gramática formal especificando sus componentes
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
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  grammarType === "type_2"
                    ? "border-[#191918] bg-[#E8C4B8]"
                    : "border-[#191918] bg-[#F5F1ED] hover:bg-[#E8C4B8]/50"
                }`}
              >
                <div className="font-semibold">Tipo 2</div>
                <div className="text-xs text-gray-600">Libre de Contexto</div>
              </button>
              <button
                type="button"
                onClick={() => setGrammarType("type_3")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  grammarType === "type_3"
                    ? "border-[#191918] bg-[#D8C6B0]"
                    : "border-[#191918] bg-[#F5F1ED] hover:bg-[#D8C6B0]/50"
                }`}
              >
                <div className="font-semibold">Tipo 3</div>
                <div className="text-xs text-gray-600">Regular</div>
              </button>
            </div>
          </div>

          {/* Non-terminals */}
          <div className="space-y-2">
            <Label htmlFor="nonTerminals">No Terminales (N) *</Label>
            <Input
              id="nonTerminals"
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
            <p className="text-xs text-gray-500">Separados por coma o espacio</p>
          </div>

          {/* Terminals */}
          <div className="space-y-2">
            <Label htmlFor="terminals">Terminales (T) *</Label>
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
            <p className="text-xs text-gray-500">Separados por coma o espacio</p>
          </div>

          {/* Start Symbol */}
          <div className="space-y-2">
            <Label htmlFor="startSymbol">Símbolo Inicial (S) *</Label>
            <Input
              id="startSymbol"
              value={formData.start_symbol}
              onChange={(e) => setFormData({ ...formData, start_symbol: e.target.value })}
              placeholder="S"
              className="bg-[#F5F1ED] border-[#191918]"
              required
            />
          </div>

          {/* Productions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Producciones (P) *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProduction}
              >
                <FiPlus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formData.productions.map((prod, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={prod.left}
                    onChange={(e) => updateProduction(index, "left", e.target.value)}
                    placeholder="S"
                    className="w-20 bg-[#F5F1ED] border-[#191918]"
                    required
                  />
                  <span className="text-gray-500">→</span>
                  <Input
                    value={prod.right.join(" ")}
                    onChange={(e) => updateProduction(index, "right", e.target.value)}
                    placeholder="a S b"
                    className="flex-1 bg-[#F5F1ED] border-[#191918]"
                    required
                  />
                  {formData.productions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduction(index)}
                    >
                      <FiX className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Use ε (epsilon) para producciones vacías
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#191918] hover:bg-[#2D2925] text-white shadow-sm"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creando..." : "Crear Gramática"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
    </Dialog>
  );
}
