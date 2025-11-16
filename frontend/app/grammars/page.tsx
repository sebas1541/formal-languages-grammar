"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { grammarApi, type Grammar } from "@/lib/api/grammar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiPlus, FiEdit, FiTrash2, FiDownload, FiUpload, FiCode, FiDatabase } from "react-icons/fi";
import Link from "next/link";
import { CreateGrammarDialog } from "@/components/grammars/CreateGrammarDialog";
import { SeedGrammarsDialog } from "@/components/grammars/SeedGrammarsDialog";
import { AppHeader } from "@/components/layout/AppHeader";

export default function GrammarsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch grammars
  const { data: grammars, isLoading, error } = useQuery({
    queryKey: ["grammars"],
    queryFn: grammarApi.list,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: grammarApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammars"] });
    },
  });

  // Export grammar
  const handleExport = async (grammar: Grammar) => {
    const dataStr = JSON.stringify(grammar, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", `${grammar.name.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGrammarTypeLabel = (type: string) => {
    return type === "type_2" ? "Tipo 2 (CFG)" : "Tipo 3 (Regular)";
  };

  const getGrammarTypeBadge = (type: string) => {
    return type === "type_2" ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Tipo 2</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800 border-green-200">Tipo 3</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <AppHeader />

      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gramáticas</h1>
            <p className="text-gray-600">Gestiona tus gramáticas formales</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setSeedDialogOpen(true)}
              variant="outline"
              size="lg"
            >
              <FiDatabase className="mr-2 h-5 w-5" />
              Ejemplos
            </Button>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              <FiPlus className="mr-2 h-5 w-5" />
              Nueva Gramática
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando gramáticas...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800">Error al cargar gramáticas: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && grammars?.length === 0 && (
          <div className="text-center py-12">
            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCode className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay gramáticas</h3>
            <p className="text-gray-600 mb-6">Crea tu primera gramática o importa ejemplos para comenzar</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setSeedDialogOpen(true)}
                variant="outline"
                size="lg"
              >
                <FiDatabase className="mr-2 h-5 w-5" />
                Ver Ejemplos
              </Button>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600"
                size="lg"
              >
                <FiPlus className="mr-2 h-5 w-5" />
                Crear Gramática
              </Button>
            </div>
          </div>
        )}

        {/* Grammars Grid */}
        {grammars && grammars.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grammars.map((grammar) => (
              <Card
                key={grammar.id}
                className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{grammar.name}</CardTitle>
                    {getGrammarTypeBadge(grammar.grammar_type)}
                  </div>
                  <CardDescription>
                    {grammar.productions.length} producciones •{" "}
                    {grammar.non_terminals.length} no terminales
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Grammar Info */}
                  <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                    <div><span className="font-medium">Inicio:</span> {grammar.start_symbol}</div>
                    <div><span className="font-medium">Terminales:</span> {grammar.terminals.join(", ")}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/grammars/${grammar.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <FiEdit className="mr-2 h-4 w-4" />
                        Analizar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(grammar)}
                    >
                      <FiDownload className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`¿Eliminar la gramática "${grammar.name}"?`)) {
                          deleteMutation.mutate(grammar.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <FiTrash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateGrammarDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Seed Grammars Dialog */}
      <SeedGrammarsDialog
        open={seedDialogOpen}
        onOpenChange={setSeedDialogOpen}
      />
    </div>
  );
}
