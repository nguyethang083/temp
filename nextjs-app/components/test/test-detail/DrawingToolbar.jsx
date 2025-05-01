import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PenTool, Eraser, Square, Circle } from "lucide-react";

const drawingColors = ["#000000", "#FF0000", "#0000FF", "#008000", "#FFA500"];
const mathSymbols = [
  "π",
  "√",
  "∛",
  "∜",
  "∑",
  "∫",
  "∞",
  "≈",
  "≠",
  "≤",
  "≥",
  "±",
  "÷",
  "×",
  "²",
  "³",
];

export function DrawingToolbar({
  selectedTool,
  setSelectedTool,
  strokeWidth,
  setStrokeWidth,
  strokeColor,
  setStrokeColor,
  onInsertSymbol, // Callback to handle symbol insertion (might need text area logic)
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-white rounded-md border">
      <Tabs defaultValue="draw" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2 h-auto">
          <TabsTrigger value="draw">Drawing Tools</TabsTrigger>
          <TabsTrigger value="text">Text & Symbols</TabsTrigger>
        </TabsList>

        {/* Drawing Tools Tab */}
        <TabsContent value="draw" className="space-y-4 mt-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tool Selection */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === "pen" ? "default" : "outline"}
                    size="icon" // Use icon size for consistency
                    onClick={() => setSelectedTool("pen")}
                    aria-label="Pen Tool"
                  >
                    <PenTool className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pen (P)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === "eraser" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSelectedTool("eraser")}
                    aria-label="Eraser Tool"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eraser (E)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === "line" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSelectedTool("line")}
                    aria-label="Line Tool"
                  >
                    {/* Simple line representation */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="2"
                        y1="14"
                        x2="14"
                        y2="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Line (L)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      selectedTool === "rectangle" ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => setSelectedTool("rectangle")}
                    aria-label="Rectangle Tool"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rectangle (R)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedTool === "circle" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setSelectedTool("circle")}
                    aria-label="Circle Tool"
                  >
                    <Circle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Circle (C)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Separator */}
            <div className="h-6 border-l border-gray-300 mx-1 hidden md:block"></div>

            {/* Stroke Width */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Width:</span>
              <Slider
                value={[strokeWidth]}
                min={1}
                max={10}
                step={1}
                onValueChange={(value) => setStrokeWidth(value[0])}
                className="w-24"
                aria-label="Stroke Width"
              />
              <span className="text-sm w-6 text-right">{strokeWidth}</span>
            </div>

            {/* Separator */}
            <div className="h-6 border-l border-gray-300 mx-1 hidden md:block"></div>

            {/* Color Selection */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Color:</span>
              <div className="flex gap-1">
                {drawingColors.map((color) => (
                  <TooltipProvider key={color}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full cursor-pointer border border-gray-300 ${
                            strokeColor === color
                              ? "ring-2 ring-offset-1 ring-blue-500" // More prominent selection
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setStrokeColor(color)}
                          aria-label={`Select color ${color}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{color}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Text & Symbols Tab */}
        <TabsContent value="text" className="mt-0">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
            {mathSymbols.map((symbol) => (
              <Button
                key={symbol}
                variant="outline"
                size="sm"
                className="text-lg font-mono h-9" // Use mono for better symbol rendering
                onClick={() =>
                  onInsertSymbol
                    ? onInsertSymbol(symbol)
                    : console.warn("onInsertSymbol not provided")
                }
                aria-label={`Insert symbol ${symbol}`}
              >
                {symbol}
              </Button>
            ))}
            {/* Add Text input field here if needed */}
            {/* <Input placeholder="Type text..." className="col-span-full mt-2" /> */}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Symbol insertion requires integration with a text input method on
            the canvas (not implemented in this example).
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
