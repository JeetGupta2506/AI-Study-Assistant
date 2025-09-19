"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onFileUpload: (file: File, extractedText: string) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Simulate PDF text extraction
    // In a real implementation, you would use a library like pdf-parse or send to a backend
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Sample extracted text from ${file.name}:

Chapter 1: Introduction to Biology
Biology is the scientific study of life and living organisms. It encompasses various fields including molecular biology, genetics, ecology, and evolution.

Key Concepts:
- Cell theory: All living things are made of cells
- Evolution: Species change over time through natural selection
- Homeostasis: Living organisms maintain internal balance
- Metabolism: Chemical processes that sustain life

Chapter 2: Cell Structure
Cells are the basic units of life. There are two main types:
1. Prokaryotic cells (bacteria)
2. Eukaryotic cells (plants, animals, fungi)

Important organelles include:
- Nucleus: Contains genetic material
- Mitochondria: Powerhouse of the cell
- Ribosomes: Protein synthesis
- Endoplasmic reticulum: Transport system

This is a simplified example of extracted text that would be used for summarization, chatbot responses, and quiz generation.`)
      }, 2000)
    })
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsProcessing(true)
      setError(null)

      try {
        const extractedText = await extractTextFromPDF(file)
        onFileUpload(file, extractedText)
      } catch (err) {
        setError("Failed to process the PDF file. Please try again.")
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Processing PDF...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive ? "Drop your PDF here" : "Upload your study material"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Drag and drop a PDF file here, or click to browse and select a file from your device.
                </p>
              </div>

              <Button variant="outline" className="mt-2 bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Choose PDF File
              </Button>

              <p className="text-xs text-muted-foreground">Supported format: PDF (max 10MB)</p>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
