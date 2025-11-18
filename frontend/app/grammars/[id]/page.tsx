"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { grammarApi } from "@/lib/api/grammar";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FiCheck, FiX, FiZap, FiCode, FiChevronLeft, FiEdit } from "react-icons/fi";
import { Brain } from "lucide-react";
import Link from "next/link";
import { DerivationTree } from "@/components/grammars/DerivationTree";
import { PageTransition } from "@/components/ui/page-transition";
import { AIExplanationDialog } from "@/components/grammars/AIExplanationDialog";
import { EditGrammarDialog } from "@/components/grammars/EditGrammarDialog";
import { useToast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GrammarDetailPage({ params }: PageProps) {
  const [inputString, setInputString] = useState("");
  const [parseResult, setParseResult] = useState<any>(null);
  const [generatedStrings, setGeneratedStrings] = useState<string[]>([]);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Unwrap params
  const [id, setId] = useState<string | null>(null);
  
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  // Fetch grammar details
  const { data: grammar, isLoading } = useQuery({
    queryKey: ["grammar", id],
    queryFn: () => grammarApi.get(Number(id)),
    enabled: !!id,
  });

  // Parse mutation
  const parseMutation = useMutation({
    mutationFn: ({ grammarId, input }: { grammarId: number; input: string }) =>
      grammarApi.parse(grammarId, input),
    onSuccess: (data) => {
      setParseResult(data);
      if (data.accepted) {
        toast({
          title: "Cadena aceptada ✓",
          description: "La cadena pertenece al lenguaje de la gramática",
          variant: "success",
        });
      } else {
        toast({
          title: "Cadena rechazada",
          description: "La cadena no pertenece al lenguaje de la gramática",
          variant: "warning",
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Error al analizar la cadena";
      toast({
        title: "Error en el análisis",
        description: errorMessage,
        variant: "error",
      });
    },
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: (grammarId: number) => grammarApi.generate(grammarId, 10),
    onSuccess: (data) => {
      setGeneratedStrings(data.strings);
      toast({
        title: "Cadenas generadas",
        description: `Se generaron ${data.strings.length} cadenas válidas`,
        variant: "success",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || error.message || "Error al generar cadenas";
      toast({
        title: "Error en la generación",
        description: errorMessage,
        variant: "error",
      });
    },
  });

  const handleParse = () => {
    if (grammar) {
      parseMutation.mutate({ grammarId: grammar.id, input: inputString });
    }
  };

  const handleGenerate = () => {
    if (grammar) {
      generateMutation.mutate(grammar.id);
    }
  };

  if (isLoading || !id) {
    return (
      <div className="min-h-screen bg-[#F0EEE6]">
        <AppHeader />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4816B] mx-auto"></div>
            <p className="mt-4 text-[#5A524C]">Cargando gramática...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grammar) {
    return (
      <div className="min-h-screen bg-[#F0EEE6]">
        <AppHeader />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <p className="text-[#C75744]">Gramática no encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const getGrammarTypeBadge = (type: string) => {
    return type === "type_2" ? (
      <Badge className="bg-[#E8C4B8] text-[#6D4535] border-[#D4816B]">Tipo 2 - CFG</Badge>
    ) : (
      <Badge className="bg-[#D8C6B0] text-[#5A4A3A] border-[#B89A7A]">Tipo 3 - Regular</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0EEE6]">
      <AppHeader />
      <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Link href="/grammars" className="inline-flex items-center gap-2 text-[#2D2925] hover:text-[#191918] transition-colors group mb-4">
            <FiChevronLeft className="h-4 w-4" />
            <span className="relative">
              Volver a Gramáticas
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#191918] group-hover:w-full transition-all duration-300"></span>
            </span>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2D2925] mb-2">{grammar.name}</h1>
              <p className="text-[#5A524C]">
                Analiza cadenas y genera lenguajes con esta gramática
              </p>
            </div>
            {getGrammarTypeBadge(grammar.grammar_type)}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Grammar info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Grammar Details */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#191918]">
              <CardHeader>
                <CardTitle className="text-lg">Detalles de la Gramática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-[#5A524C]">Símbolo Inicial</Label>
                  <div className="mt-1 px-3 py-2 bg-[#F5F1ED] border border-[#191918] rounded-xl font-mono">
                    {grammar.start_symbol}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#5A524C]">
                    No Terminales (N)
                  </Label>
                  <div className="mt-1 px-3 py-2 bg-[#F5F1ED] border border-[#191918] rounded-xl">
                    {grammar.non_terminals.join(", ")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#5A524C]">
                    Terminales (T)
                  </Label>
                  <div className="mt-1 px-3 py-2 bg-[#F5F1ED] border border-[#191918] rounded-xl">
                    {grammar.terminals.join(", ")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-[#5A524C]">
                    Producciones (P)
                  </Label>
                  <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
                    {grammar.productions.map((prod, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-[#F5F1ED] border border-[#191918] rounded-xl font-mono text-sm"
                      >
                        {prod.left} → {prod.right.join(" ")}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Explanation */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#191918]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#191918]" />
                  Explicación con IA
                </CardTitle>
                <CardDescription>
                  Chat con Gemini AI sobre esta gramática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setAiDialogOpen(true)}
                  className="w-full bg-[#191918] hover:bg-[#2D2925] text-white shadow-sm transition-colors"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Abrir Chat con IA
                </Button>
              </CardContent>
            </Card>

            {/* Generate Strings */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#191918]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiCode className="h-5 w-5" />
                  Generar Cadenas
                </CardTitle>
                <CardDescription>
                  Genera las 10 cadenas más cortas del lenguaje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full bg-[#9A6B5C] hover:bg-[#7D5649] text-white shadow-sm"
                >
                  <FiZap className="mr-2 h-4 w-4" />
                  {generateMutation.isPending ? "Generando..." : "Generar Cadenas"}
                </Button>

                {generatedStrings.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#5A524C]">
                      Cadenas Generadas:
                    </Label>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {generatedStrings.map((str, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-gradient-to-r from-[#F0EBE6] to-[#F5F1ED] rounded-xl font-mono text-sm animate-in fade-in slide-in-from-left-2 hover:bg-gradient-to-r hover:from-[#E8DEDA] hover:to-[#EDE7E1] transition-all duration-200"
                          style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'backwards' }}
                        >
                          {str}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Grammar */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#191918]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiEdit className="h-5 w-5" />
                  Editar Gramática
                </CardTitle>
                <CardDescription>
                  Modifica los componentes de esta gramática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setEditDialogOpen(true)}
                  className="w-full bg-[#5A524C] hover:bg-[#3D3935] text-white shadow-sm transition-colors"
                >
                  <FiEdit className="mr-2 h-4 w-4" />
                  Editar Gramática
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Parse and results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parse Input */}
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#191918]">
              <CardHeader>
                <CardTitle className="text-lg">Analizar Cadena</CardTitle>
                <CardDescription>
                  Ingresa una cadena para verificar si pertenece al lenguaje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={inputString}
                      onChange={(e) => setInputString(e.target.value)}
                      placeholder="Ingresa la cadena con espacios entre tokens (ej: a b b a, id + id)"
                      onKeyDown={(e) => e.key === "Enter" && handleParse()}
                      className="font-mono bg-[#F5F1ED] border-[#191918]"
                    />
                  </div>
                  <Button
                    onClick={handleParse}
                    disabled={parseMutation.isPending || !inputString}
                    className="bg-[#191918] hover:bg-[#2D2925] text-white shadow-sm"
                  >
                    {parseMutation.isPending ? "Analizando..." : "Analizar"}
                  </Button>
                </div>

                {parseResult && (
                  <div
                    className={`p-4 rounded-xl border-2 animate-in fade-in slide-in-from-top-4 duration-500 ${
                      parseResult.accepted
                        ? "bg-[#E8F5E8] border-[#A8D5A8]"
                        : "bg-[#FFF5F0] border-[#E8A89A]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {parseResult.accepted ? (
                        <FiCheck className="h-6 w-6 text-[#3A7A3A]" />
                      ) : (
                        <FiX className="h-6 w-6 text-[#C75744]" />
                      )}
                      <div>
                        <p
                          className={`font-semibold ${
                            parseResult.accepted ? "text-[#3A7A3A]" : "text-[#C75744]"
                          }`}
                        >
                          {parseResult.accepted ? "✓ Cadena Aceptada" : "✗ Cadena Rechazada"}
                        </p>
                        <p className="text-sm text-[#5A524C]">
                          Pasos de derivación: {parseResult.steps}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Derivation Tree */}
            {parseResult && parseResult.accepted && parseResult.derivation_tree && (
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-[#191918]">
                <CardHeader>
                  <CardTitle className="text-lg">Árbol de Derivación</CardTitle>
                  <CardDescription>
                    Representación visual del análisis sintáctico
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DerivationTree tree={parseResult.derivation_tree} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </PageTransition>

      {/* AI Explanation Dialog */}
      {grammar && (
        <AIExplanationDialog
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          grammar={grammar}
        />
      )}

      {/* Edit Grammar Dialog */}
      {grammar && (
        <EditGrammarDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          grammar={grammar}
        />
      )}
    </div>
  );
}
