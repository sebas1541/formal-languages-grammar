import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Binary, Sparkles, GitBranch, Zap } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0EEE6]">
      {/* Header */}
      <header className="bg-[#F0EEE6] sticky top-0 z-50 shadow-none">
        <div className="px-4 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300">
              <span className="text-3xl font-black text-[#191918] tracking-tight">ForGram</span>
            </Link>
            <Link href="/grammars" className="relative group">
              <span className="text-[#191918] font-semibold">Comenzar</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#191918] group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <PageTransition>
      <main className="px-4 sm:px-8 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20">
            <h2 className="text-5xl sm:text-6xl font-bold text-[#2D2925] mb-6 tracking-tight leading-tight">
              Analizador de<br />gramáticas formales
            </h2>
            <p className="text-xl text-[#5A524C] max-w-xl leading-relaxed mb-8">
              Trabaja con gramáticas Tipo 2 (libres de contexto) y Tipo 3 (regulares). 
              Analiza cadenas, visualiza árboles de derivación y explora lenguajes formales.
            </p>
            <Link href="/grammars">
              <Button size="lg" className="bg-[#191918] hover:bg-[#2D2925] text-white shadow-sm rounded-xl px-8 py-6 text-lg">
                Comenzar ahora
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <Card className="bg-[#E3DACC] border-2 border-[#191918] hover:shadow-md transition-all duration-300 p-8 rounded-2xl">
              <CardHeader className="p-0">
                <CardTitle className="text-xl mb-3 font-semibold text-[#2D2925]">Crear gramáticas</CardTitle>
                <CardDescription className="text-base text-[#5A524C] leading-relaxed">
                  Define terminales, no terminales y producciones para construir gramáticas formales.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#BCD1CA] border-2 border-[#191918] hover:shadow-md transition-all duration-300 p-8 rounded-2xl">
              <CardHeader className="p-0">
                <CardTitle className="text-xl mb-3 font-semibold text-[#2D2925]">Analizar cadenas</CardTitle>
                <CardDescription className="text-base text-[#5A524C] leading-relaxed">
                  Verifica si una cadena pertenece al lenguaje y visualiza el proceso.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#CBCADC] border-2 border-[#191918] hover:shadow-md transition-all duration-300 p-8 rounded-2xl">
              <CardHeader className="p-0">
                <CardTitle className="text-xl mb-3 font-semibold text-[#2D2925]">Árboles de derivación</CardTitle>
                <CardDescription className="text-base text-[#5A524C] leading-relaxed">
                  Visualiza el árbol sintáctico generado durante el análisis.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
      </PageTransition>

      {/* Footer */}
      <footer className="border-t border-[#E0D9D3]/30 mt-20 bg-[#F0EEE6]">
        <div className="px-4 sm:px-8 lg:px-12 py-12">
          <div className="max-w-6xl mx-auto text-sm text-[#5A524C]">
            <p className="font-medium text-[#2D2925] mb-2">Universidad Pedagógica y Tecnológica de Colombia</p>
            <p>Facultad de Ingeniería • Lenguajes Formales</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
