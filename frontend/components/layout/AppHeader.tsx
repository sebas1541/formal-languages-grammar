import Link from "next/link";
import { FiCode } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="border-b border-gray-200/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all duration-300">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FiCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Analizador Sintáctico</h1>
              <p className="text-xs text-gray-600">Lenguajes Formales</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/grammars">
              <Button variant="ghost" size="sm">
                Gramáticas
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
