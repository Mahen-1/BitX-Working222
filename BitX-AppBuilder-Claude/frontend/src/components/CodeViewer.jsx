import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

/**
 * Parses an error string to extract the line number and error message.
 * Expected formats:
 *   "SyntaxError: Unexpected token at line 23"
 *   "Error on line 45: Variable is not defined"
 */
function parseError(errorText) {
  if (!errorText) return null;

  const lineMatch = errorText.match(/line\s+(\d+)/i);
  const messageMatch = errorText.match(/:(.*)$/);

  return {
    line: lineMatch ? parseInt(lineMatch[1], 10) : null,
    message: messageMatch ? messageMatch[1].trim() : errorText.trim(),
  };
}

export default function CodeViewer({ code, language = "javascript", error, isPartial }) {
  const errorInfo = parseError(error);

  // Apply error line highlighting
  const customLineStyle = (lineNumber) => {
    if (errorInfo?.line === lineNumber) {
      return {
        backgroundColor: "rgba(255, 0, 0, 0.15)",
        display: "block",
        width: "100%",
      };
    }
    return {};
  };

  return (
    <Tabs defaultValue="code" className="w-full">
      <TabsList>
        <TabsTrigger value="code">Code</TabsTrigger>
        {error && <TabsTrigger value="error">Error</TabsTrigger>}
      </TabsList>

      <TabsContent value="code">
        <ScrollArea className="h-[500px] border rounded">
          <SyntaxHighlighter
            language={language}
            style={dracula}
            wrapLongLines={true}
            showLineNumbers
            lineProps={(lineNumber) => ({
              style: customLineStyle(lineNumber),
            })}
          >
            {isPartial ? code || "// Waiting for full output from Claude..." : code}
          </SyntaxHighlighter>
        </ScrollArea>
      </TabsContent>

      {error && (
        <TabsContent value="error">
          <div className="p-4 bg-red-50 text-red-800 border border-red-200 rounded">
            <strong>Error:</strong> {errorInfo?.message || error}
            {errorInfo?.line && (
              <p className="mt-2">
                <strong>Line:</strong> {errorInfo.line}
              </p>
            )}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
