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
import { FiCheck, FiX, FiZap, FiCode, FiChevronLeft } from "react-icons/fi";
import Link from "next/link";
import { DerivationTree } from "@/components/grammars/DerivationTree";
import { PageTransition } from "@/components/ui/page-transition";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GrammarDetailPage({ params }: PageProps) {
  const [inputString, setInputString] = useState("");
  const [parseResult, setParseResult] = useState<any>(null);
  const [generatedStrings, setGeneratedStrings] = useState<string[]>([]);
  
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
    },
  });

  // Generate mutation
  const generateMutation = useMutation({
    mutationFn: (grammarId: number) => grammarApi.generate(grammarId, 10),
    onSuccess: (data) => {
      setGeneratedStrings(data.strings);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <AppHeader />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando gramática...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grammar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <AppHeader />
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Gramática no encontrada</p>
          </div>
        </div>
      </div>
    );
  }

  const getGrammarTypeBadge = (type: string) => {
    return type === "type_2" ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">Tipo 2 - CFG</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800 border-green-200">Tipo 3 - Regular</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <AppHeader />
      <PageTransition>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Back button and header */}
        <div className="mb-6">
          <Link href="/grammars">
            <Button variant="ghost" size="sm" className="mb-4">
              <FiChevronLeft className="mr-2 h-4 w-4" />
              Volver a Gramáticas
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{grammar.name}</h1>
              <p className="text-gray-600">
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
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
              <CardHeader>
                <CardTitle className="text-lg">Detalles de la Gramática</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Símbolo Inicial</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded-xl font-mono">
                    {grammar.start_symbol}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    No Terminales (N)
                  </Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded-xl">
                    {grammar.non_terminals.join(", ")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Terminales (T)
                  </Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 rounded-xl">
                    {grammar.terminals.join(", ")}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Producciones (P)
                  </Label>
                  <div className="mt-1 space-y-1 max-h-64 overflow-y-auto">
                    {grammar.productions.map((prod, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-gray-50 rounded-xl font-mono text-sm"
                      >
                        {prod.left} → {prod.right.join(" ")}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Strings */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
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
                  className="w-full bg-purple-500 hover:bg-purple-600"
                >
                  <FiZap className="mr-2 h-4 w-4" />
                  {generateMutation.isPending ? "Generando..." : "Generar Cadenas"}
                </Button>

                {generatedStrings.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Cadenas Generadas:
                    </Label>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {generatedStrings.map((str, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl font-mono text-sm animate-in fade-in slide-in-from-left-2 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
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
          </div>

          {/* Right column - Parse and results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parse Input */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
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
                      className="font-mono"
                    />
                  </div>
                  <Button
                    onClick={handleParse}
                    disabled={parseMutation.isPending || !inputString}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {parseMutation.isPending ? "Analizando..." : "Analizar"}
                  </Button>
                </div>

                {parseResult && (
                  <div
                    className={`p-4 rounded-xl border-2 animate-in fade-in slide-in-from-top-4 duration-500 ${
                      parseResult.accepted
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {parseResult.accepted ? (
                        <FiCheck className="h-6 w-6 text-green-600" />
                      ) : (
                        <FiX className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <p
                          className={`font-semibold ${
                            parseResult.accepted ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {parseResult.accepted ? "✓ Cadena Aceptada" : "✗ Cadena Rechazada"}
                        </p>
                        <p className="text-sm text-gray-600">
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
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
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
    </div>
  );
}
