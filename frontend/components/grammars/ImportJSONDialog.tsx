"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { grammarApi } from "@/lib/api/grammar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiUpload, FiCheck, FiAlertCircle, FiX } from "react-icons/fi";

interface ImportJSONDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportJSONDialog({ open, onOpenChange }: ImportJSONDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (grammarData: any) => {
      // Remove id if present in the JSON (backend will generate new one)
      const { id, ...dataToImport } = grammarData;
      return grammarApi.create(dataToImport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammars"] });
      setImportSuccess(true);
      setSelectedFile(null);
      setJsonError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Auto-close after success
      setTimeout(() => {
        setImportSuccess(false);
        onOpenChange(false);
      }, 2000);
    },
    onError: (error: any) => {
      setJsonError(error.response?.data?.detail || error.message || "Error al importar la gramática");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setJsonError(null);
    setImportSuccess(false);

    // Read and validate JSON
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);

        // Validate required fields
        const requiredFields = ["name", "grammar_type", "non_terminals", "terminals", "start_symbol", "productions"];
        const missingFields = requiredFields.filter(field => !(field in json));
        
        if (missingFields.length > 0) {
          setJsonError(`Faltan campos requeridos: ${missingFields.join(", ")}`);
          return;
        }

        // Validate grammar_type
        if (!["type_2", "type_3"].includes(json.grammar_type)) {
          setJsonError('grammar_type debe ser "type_2" o "type_3"');
          return;
        }

        // Validate arrays
        if (!Array.isArray(json.non_terminals) || !Array.isArray(json.terminals) || !Array.isArray(json.productions)) {
          setJsonError("non_terminals, terminals y productions deben ser arrays");
          return;
        }

        // Validate productions structure
        for (const prod of json.productions) {
          if (!prod.left || !Array.isArray(prod.right)) {
            setJsonError("Cada producción debe tener 'left' (string) y 'right' (array)");
            return;
          }
        }

      } catch (error) {
        setJsonError("JSON inválido. Verifica el formato del archivo.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        importMutation.mutate(json);
      } catch (error) {
        setJsonError("Error al procesar el archivo JSON");
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      const fakeEvent = {
        target: { files: [file] }
      } as any;
      handleFileSelect(fakeEvent);
    } else {
      setJsonError("Por favor, selecciona un archivo JSON válido");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setJsonError(null);
    setImportSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[#FFFDFB] border-2 border-[#191918]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FiUpload className="h-6 w-6 text-[#191918]" />
            Importar Gramática desde JSON
          </DialogTitle>
          <DialogDescription>
            Selecciona un archivo JSON con la estructura de gramática
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${selectedFile ? "border-[#191918] bg-[#F5F1ED]" : "border-[#C5C0B8] hover:border-[#191918] hover:bg-[#F5F1ED]"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
              id="json-file-input"
            />
            
            {!selectedFile ? (
              <label htmlFor="json-file-input" className="cursor-pointer block">
                <FiUpload className="h-12 w-12 mx-auto mb-3 text-[#5A524C]" />
                <p className="text-[#2D2925] font-medium mb-1">
                  Arrastra un archivo JSON aquí
                </p>
                <p className="text-sm text-[#5A524C]">
                  o haz clic para seleccionar
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FiCheck className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <p className="text-[#2D2925] font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-[#5A524C]">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="ml-2"
                >
                  <FiX className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {jsonError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
              <FiAlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Error de validación</p>
                <p className="text-sm text-red-700 mt-1">{jsonError}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {importSuccess && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center gap-3">
              <FiCheck className="h-5 w-5 text-green-600" />
              <p className="text-green-900 font-medium">
                ¡Gramática importada exitosamente!
              </p>
            </div>
          )}

          {/* JSON Structure Example */}
          <details className="bg-[#F5F1ED] border border-[#C5C0B8] rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-[#2D2925] mb-2">
              Estructura JSON esperada
            </summary>
            <pre className="text-xs bg-white border border-[#E0DCD5] rounded p-3 overflow-x-auto">
{`{
  "name": "Mi Gramática",
  "grammar_type": "type_2",
  "non_terminals": ["S", "A"],
  "terminals": ["a", "b"],
  "start_symbol": "S",
  "productions": [
    {"left": "S", "right": ["a", "S", "b"]},
    {"left": "S", "right": ["ε"]}
  ]
}`}
            </pre>
          </details>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E0DCD5]">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#191918] hover:bg-[#F5F1ED]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || !!jsonError || importMutation.isPending || importSuccess}
              className="bg-[#191918] hover:bg-[#2D2925] text-white"
            >
              {importMutation.isPending ? (
                <>
                  <span className="animate-spin mr-2">⚙</span>
                  Importando...
                </>
              ) : (
                <>
                  <FiUpload className="mr-2 h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
