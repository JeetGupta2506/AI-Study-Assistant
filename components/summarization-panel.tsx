"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Sparkles, List, Key } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SummarizationPanelProps {
  text: string
  fileName: string
}

export function SummarizationPanel({ text, fileName }: SummarizationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState<{
    quickNotes: string[]
    keyTakeaways: string[]
  } | null>(null)

  const generateSummary = async () => {
    setIsGenerating(true)

    // Simulate AI summarization
    setTimeout(() => {
      setSummary({
        quickNotes: [
          "Biology is the scientific study of life and living organisms",
          "Cell theory states all living things are made of cells",
          "Evolution explains how species change over time through natural selection",
          "Homeostasis is the maintenance of internal balance in organisms",
          "Metabolism encompasses chemical processes that sustain life",
          "Prokaryotic cells include bacteria, while eukaryotic cells include plants and animals",
          "Key organelles include nucleus, mitochondria, ribosomes, and endoplasmic reticulum",
        ],
        keyTakeaways: [
          "Cell Theory: All living organisms are composed of one or more cells, cells are the basic unit of life, and all cells arise from pre-existing cells",
          "Evolution by Natural Selection: Organisms with favorable traits are more likely to survive and reproduce, passing these traits to offspring",
          "Homeostasis: Living systems maintain stable internal conditions despite external changes through feedback mechanisms",
          "Cellular Respiration: Process by which cells break down glucose to produce ATP energy for cellular functions",
          "Photosynthesis: Plants convert sunlight, CO₂, and water into glucose and oxygen, forming the base of most food chains",
          "DNA Structure: Double helix containing genetic information that determines organism characteristics and is passed to offspring",
        ],
      })
      setIsGenerating(false)
    }, 3000)
  }

  const downloadSummary = () => {
    if (!summary) return

    const content =
      `Study Summary - ${fileName}\n\n` +
      `QUICK NOTES:\n${summary.quickNotes.map((note, i) => `${i + 1}. ${note}`).join("\n")}\n\n` +
      `KEY TAKEAWAYS:\n${summary.keyTakeaways.map((takeaway, i) => `${i + 1}. ${takeaway}`).join("\n\n")}`

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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Summarization
          </CardTitle>
          <CardDescription>Generate concise study notes and key takeaways from your uploaded material.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{fileName}</span>
            <Badge variant="secondary">Ready for analysis</Badge>
          </div>

          {!summary && (
            <Button onClick={generateSummary} disabled={isGenerating} className="w-full">
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
                    {summary.quickNotes.map((note, index) => (
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
                    {summary.keyTakeaways.map((takeaway, index) => (
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
