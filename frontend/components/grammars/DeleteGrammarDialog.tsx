"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle } from "react-icons/fi";
import type { Grammar } from "@/lib/api/grammar";

interface DeleteGrammarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grammar: Grammar | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteGrammarDialog({
  open,
  onOpenChange,
  grammar,
  onConfirm,
  isDeleting,
}: DeleteGrammarDialogProps) {
  if (!grammar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#FFFDFB] border-2 border-[#191918] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FiAlertTriangle className="h-6 w-6 text-red-600" />
            Eliminar Gramática
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            ¿Estás seguro de que deseas eliminar la gramática{" "}
            <span className="font-semibold text-[#191918]">"{grammar.name}"</span>?
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-[#FFF5F0] border border-red-200 rounded-xl p-3 text-sm text-[#5A524C]">
          Esta acción no se puede deshacer. Se perderán todas las producciones y configuraciones.
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="border-[#191918]"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
