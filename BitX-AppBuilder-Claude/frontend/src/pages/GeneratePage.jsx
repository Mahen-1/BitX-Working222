import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CodeViewer from "@/components/CodeViewer";
import { Loader2 } from "lucide-react";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPartial, setIsPartial] = useState(false);

  const handleGenerate = async () => {
    setGeneratedCode("");
    setError("");
    setLoading(true);
    setIsPartial(false);

    try {
      const response = await fetch("/api/generate-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.body) {
        throw new Error("No response body from server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split on newline-delimited JSON objects
        const parts = buffer.split("\n");
        buffer = parts.pop(); // Keep the last (possibly incomplete) chunk

        for (const part of parts) {
          if (!part.trim()) continue;
          try {
            const json = JSON.parse(part);

            if (json.partial === true) {
              // This is a partial Claude output
              setGeneratedCode((prev) => prev + (json.code || ""));
              setIsPartial(true);
            } else if (json.code) {
              // Final complete code
              setGeneratedCode(json.code);
              setIsPartial(false);
            }

            if (json.error) {
              setError(json.error);
            }
          } catch (e) {
            console.warn("Non-JSON chunk:", part);
          }
        }
      }
    } catch (err) {
      console.error("Error generating app:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Generate Your App</h1>
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your app idea..."
        />
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Generate"}
        </Button>
      </div>

      <CodeViewer
        code={generatedCode}
        error={error}
        isPartial={isPartial}
      />
    </div>
  );
}
