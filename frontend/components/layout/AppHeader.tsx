import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="bg-[#F0EEE6] sticky top-0 z-50 shadow-none border-0">
      <div className="px-4 sm:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300">
            <span className="text-3xl font-black text-[#191918] tracking-tight">ForGram</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/grammars" className="relative group">
              <span className="text-[#191918] font-semibold">Gramáticas</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#191918] group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
