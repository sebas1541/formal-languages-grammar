"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grammarApi } from "@/lib/api/grammar";
import { grammarSeeds, type GrammarSeed } from "@/lib/seeders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiCheck, FiDatabase } from "react-icons/fi";

interface SeedGrammarsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SeedGrammarsDialog({ open, onOpenChange }: SeedGrammarsDialogProps) {
  const [importedSeeds, setImportedSeeds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (seed: GrammarSeed) => {
      const { examples, ...grammarData } = seed;
      return grammarApi.create(grammarData);
    },
    onSuccess: (_, seed) => {
      queryClient.invalidateQueries({ queryKey: ["grammars"] });
      setImportedSeeds((prev) => new Set([...prev, seed.name]));
    },
  });

  const handleImport = (seed: GrammarSeed) => {
    importMutation.mutate(seed);
  };

  const handleImportAll = () => {
    grammarSeeds.forEach((seed) => {
      if (!importedSeeds.has(seed.name)) {
        handleImport(seed);
      }
    });
  };

  const isImported = (seedName: string) => importedSeeds.has(seedName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FiDatabase className="h-6 w-6 text-blue-500" />
            Gramáticas de Ejemplo
          </DialogTitle>
          <DialogDescription>
            Importa gramáticas predefinidas para empezar a experimentar rápidamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Import All Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleImportAll}
              disabled={importMutation.isPending || importedSeeds.size === grammarSeeds.length}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <FiDatabase className="mr-2 h-4 w-4" />
              Importar Todas ({grammarSeeds.length})
            </Button>
          </div>

          {/* Seeds Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {grammarSeeds.map((seed) => (
              <Card
                key={seed.name}
                className={`bg-white/80 backdrop-blur-sm border-gray-200/50 transition-all ${
                  isImported(seed.name) ? "border-green-400 bg-green-50/50" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {seed.name}
                        {isImported(seed.name) && (
                          <FiCheck className="h-4 w-4 text-green-600" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {seed.description}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        seed.grammar_type === "type_2"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      {seed.grammar_type === "type_2" ? "Tipo 2" : "Tipo 3"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Grammar Info */}
                  <div className="bg-gray-50 rounded-xl p-2 text-xs space-y-1">
                    <div>
                      <span className="font-medium">Terminales:</span>{" "}
                      <span className="font-mono">{seed.terminals.join(", ")}</span>
                    </div>
                    <div>
                      <span className="font-medium">Producciones:</span> {seed.productions.length}
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <div className="font-medium text-gray-700 mb-1">
                        ✓ Acepta (ejemplos):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {seed.examples.accepted.slice(0, 3).map((ex, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg font-mono text-xs"
                          >
                            {ex === "ε" ? "ε" : ex}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium text-gray-700 mb-1">
                        ✗ Rechaza (ejemplos):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {seed.examples.rejected.slice(0, 3).map((ex, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-red-50 text-red-700 rounded-lg font-mono text-xs"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Import Button */}
                  <Button
                    onClick={() => handleImport(seed)}
                    disabled={importMutation.isPending || isImported(seed.name)}
                    variant={isImported(seed.name) ? "outline" : "default"}
                    className="w-full"
                    size="sm"
                  >
                    {isImported(seed.name) ? (
                      <>
                        <FiCheck className="mr-2 h-4 w-4" />
                        Importada
                      </>
                    ) : (
                      "Importar"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
