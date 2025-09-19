"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"

interface FileUploadProps {
  onFileUpload: (file: File, extractedText: string) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const response = await api.uploadDocument(file)
      return response.text
    } catch (err) {
      throw new Error('Failed to extract text from document')
    }
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
