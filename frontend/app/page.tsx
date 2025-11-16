import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiBook, FiCode, FiFileText, FiZap } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <FiCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analizador Sintáctico</h1>
                <p className="text-xs text-gray-600">Lenguajes Formales</p>
              </div>
            </div>
            <Link href="/grammars">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Parser y Generador de Lenguajes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analizador sintáctico para Gramáticas Tipo 2 (Libres de Contexto) y Tipo 3 (Regulares)
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <FiFileText className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Definir Gramática</CardTitle>
              <CardDescription>
                Define gramáticas formales especificando N, T, P y S
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <FiZap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Analizar Cadenas</CardTitle>
              <CardDescription>
                Determina si una cadena pertenece al lenguaje
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <FiBook className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Árbol de Derivación</CardTitle>
              <CardDescription>
                Visualiza el árbol sintáctico de cadenas aceptadas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                <FiCode className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">Generar Cadenas</CardTitle>
              <CardDescription>
                Genera las cadenas más cortas del lenguaje
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/30 rounded-2xl p-8 text-center backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            ¿Listo para comenzar?
          </h3>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Crea tu primera gramática y comienza a analizar cadenas de forma visual e interactiva
          </p>
          <Link href="/grammars">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
              Ir a Gramáticas
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 mt-16">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Universidad Pedagógica y Tecnológica de Colombia - UPTC</p>
            <p className="mt-1">Facultad de Ingeniería • Lenguajes Formales</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
