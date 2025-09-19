"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Sparkles, List, Key } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

interface SummarizationPanelProps {
  text: string
  fileName: string
}

export function SummarizationPanel({ text, fileName }: SummarizationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState<{
    quick_notes: string[]
    key_takeaways: string[]
  } | null>(null)

  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const summary = await api.generateSummary(text)
      setSummary(summary)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate summary'
      setError(message)
      console.error('Failed to generate summary:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadSummary = () => {
    if (!summary) return

    const content =
      `Study Summary - ${fileName}\n\n` +
      `QUICK NOTES:\n${summary.quick_notes.map((note: string, i: number) => `${i + 1}. ${note}`).join("\n")}\n\n` +
      `KEY TAKEAWAYS:\n${summary.key_takeaways.map((takeaway: string, i: number) => `${i + 1}. ${takeaway}`).join("\n\n")}`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName.replace(".pdf", "")}_summary.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle className="flex items-center gap-2 justify-center">
            <Sparkles className="h-5 w-5" />
            AI-Powered Summarization
          </CardTitle>
          <CardDescription className="text-center">Generate concise study notes and key takeaways from your uploaded material.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{fileName}</span>
            </div>
            <Badge variant="secondary">Ready for analysis</Badge>
          </div>

          {!summary && (
            <div className="flex justify-center">
            <Button onClick={generateSummary} disabled={isGenerating} className="w-48 bg-sky-500 text-white hover:bg-sky-600">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
              <Button 
                onClick={generateSummary} 
                variant="outline" 
                size="sm" 
                className="mt-2"
                disabled={isGenerating}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Summary</CardTitle>
              <Button onClick={downloadSummary} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quick-notes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick-notes" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Quick Notes
                </TabsTrigger>
                <TabsTrigger value="key-takeaways" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Key Takeaways
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick-notes" className="mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Quick Notes (1-2 line summaries)
                  </h3>
                  <ul className="space-y-2">
                    {summary.quick_notes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="key-takeaways" className="mt-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Key Takeaways (Detailed bullet points)
                  </h3>
                  <div className="space-y-4">
                    {summary.key_takeaways.map((takeaway: string, index: number) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-accent/10 text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <p className="text-sm leading-relaxed">{takeaway}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
