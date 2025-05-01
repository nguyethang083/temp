import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { DrawingToolbar } from "./DrawingToolbar"; // Import the toolbar
import { Pencil, Eraser, Undo, Redo } from "lucide-react";

// Debounce function (simple version)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function DrawingArea({
  currentQuestion,
  canvasStates,
  setCanvasStates, // Function to update the parent's state
  markAsCompleted, // Function to mark question complete
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [savedStatus, setSavedStatus] = useState("saved"); // "saved", "saving", "unsaved"
  // Optional: Add state for undo/redo history if implementing
  // const [history, setHistory] = useState([]);
  // const [historyIndex, setHistoryIndex] = useState(-1);

  // --- Debounced Save Function ---
  const debouncedSave = useCallback(
    debounce((question, dataUrl) => {
      setCanvasStates((prevStates) => ({ ...prevStates, [question]: dataUrl }));
      setSavedStatus("saving");
      console.log(`Saving canvas state for Q${question}`);
      // Simulate async save
      setTimeout(() => {
        setSavedStatus("saved");
        console.log(`Saved canvas state for Q${question}`);
      }, 500);
    }, 1000),
    [setCanvasStates]
  ); // Recreate debounce only if setCanvasStates changes

  // --- Canvas Setup & Drawing Logic ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true }); // willReadFrequently might improve performance for frequent toDataURL calls
    if (!ctx) return;

    // Function to load state or clear canvas
    const loadCanvasState = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Always clear first
      if (canvasStates[currentQuestion]) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous"; // Important if loading from external source/storage
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            // Set drawing styles AFTER loading image
            setDrawingStyles(ctx);
            setSavedStatus("saved"); // Mark as saved initially when loaded
            console.log(`Loaded canvas state for Q${currentQuestion}`);
          };
          img.onerror = (e) => {
            console.error(`Error loading image for Q${currentQuestion}:`, e);
            // Fallback: ensure canvas is clear and styles are set
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setDrawingStyles(ctx);
            setSavedStatus("saved"); // Or 'unsaved' if clearing is considered a change
          };
          img.src = canvasStates[currentQuestion];
        } catch (error) {
          console.error(`Error creating image for Q${currentQuestion}:`, error);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setDrawingStyles(ctx);
        }
      } else {
        setDrawingStyles(ctx); // Set styles even if no saved state
        setSavedStatus("saved"); // No state means it's "saved" as empty
        console.log(`No saved state for Q${currentQuestion}, canvas cleared.`);
      }
    };

    const setDrawingStyles = (context) => {
      context.lineWidth = strokeWidth;
      context.strokeStyle = strokeColor;
      context.fillStyle = strokeColor; // Needed for shapes if you want fill
      context.lineCap = "round";
      context.lineJoin = "round";
      context.globalCompositeOperation = "source-over"; // Default mode
    };

    // Load initial state for the current question
    loadCanvasState();

    let lastX = 0;
    let lastY = 0;
    let startX = 0; // For shapes/lines
    let startY = 0; // For shapes/lines
    let drawingActionInProgress = false; // Track if a shape/line draw is happening

    // Get coordinates for both mouse and touch events
    const getCoordinates = (e, canvasElement) => {
      let clientX, clientY;
      const rect = canvasElement.getBoundingClientRect();

      if (e.touches && e.touches.length > 0) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        // Touchend event
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }

      // Calculate scale factors if canvas display size differs from its resolution
      const scaleX = canvasElement.width / rect.width;
      const scaleY = canvasElement.height / rect.height;

      return {
        offsetX: (clientX - rect.left) * scaleX,
        offsetY: (clientY - rect.top) * scaleY,
      };
    };

    // --- Event Handlers ---
    const startDrawing = (e) => {
      e.preventDefault(); // Prevent scrolling on touch devices
      setIsDrawing(true);
      drawingActionInProgress = true;
      const { offsetX, offsetY } = getCoordinates(e, canvas);
      lastX = offsetX;
      lastY = offsetY;
      startX = offsetX; // Store start point for shapes/lines
      startY = offsetY;

      // Set context properties based on tool
      if (selectedTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = strokeWidth * 3; // Eraser might need to be wider
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = strokeColor; // Ensure fillStyle is set too
      }

      // Start path for pen/eraser
      if (selectedTool === "pen" || selectedTool === "eraser") {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
      }
      // No beginPath needed immediately for shapes/lines, done in draw/stop
      setSavedStatus("unsaved"); // Action started, mark as unsaved
    };

    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { offsetX, offsetY } = getCoordinates(e, canvas);

      // --- Redraw background (previous state) for shape tools ---
      const redrawBackgroundForShape = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas first
        if (canvasStates[currentQuestion]) {
          try {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              // Restore drawing styles after drawing image
              setDrawingStyles(ctx);
              if (selectedTool === "eraser") {
                // Re-apply eraser settings if needed
                ctx.globalCompositeOperation = "destination-out";
                ctx.lineWidth = strokeWidth * 3;
              }
              // Now draw the shape
              drawCurrentShape(offsetX, offsetY);
            };
            img.onerror = () => {
              // Fallback if image load fails
              console.error("Redraw background failed");
              setDrawingStyles(ctx);
              if (selectedTool === "eraser") {
                ctx.globalCompositeOperation = "destination-out";
                ctx.lineWidth = strokeWidth * 3;
              }
              drawCurrentShape(offsetX, offsetY);
            };
            img.src = canvasStates[currentQuestion];
          } catch {
            console.error("Redraw background failed");
            setDrawingStyles(ctx);
            if (selectedTool === "eraser") {
              ctx.globalCompositeOperation = "destination-out";
              ctx.lineWidth = strokeWidth * 3;
            }
            drawCurrentShape(offsetX, offsetY);
          }
        } else {
          // No background, just draw the shape with current styles
          setDrawingStyles(ctx);
          if (selectedTool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineWidth = strokeWidth * 3;
          }
          drawCurrentShape(offsetX, offsetY);
        }
      };

      // --- Helper to draw the current shape being dragged ---
      const drawCurrentShape = (currentX, currentY) => {
        ctx.beginPath(); // Start path for the shape
        switch (selectedTool) {
          case "line":
            ctx.moveTo(startX, startY);
            ctx.lineTo(currentX, currentY);
            break;
          case "rectangle":
            ctx.rect(startX, startY, currentX - startX, currentY - startY);
            break;
          case "circle":
            const radius = Math.sqrt(
              Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
            );
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            break;
          default:
            return; // Should not happen if called correctly
        }
        ctx.stroke(); // Draw the shape outline
        // ctx.fill(); // Uncomment if you want filled shapes
      };

      // --- Tool-specific drawing ---
      if (selectedTool === "pen" || selectedTool === "eraser") {
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
        lastX = offsetX; // Update last position for pen/eraser
        lastY = offsetY;
      } else if (
        selectedTool === "line" ||
        selectedTool === "rectangle" ||
        selectedTool === "circle"
      ) {
        redrawBackgroundForShape(); // Redraw background and the shape being dragged
      }
    };

    const stopDrawing = (e) => {
      if (!isDrawing) return;
      // For touch end, we might need coordinates if the tool requires it
      // const { offsetX, offsetY } = getCoordinates(e, canvas);

      setIsDrawing(false);
      drawingActionInProgress = false;

      // Finalize drawing for shapes/lines onto the main context *without* clearing
      if (
        selectedTool === "line" ||
        selectedTool === "rectangle" ||
        selectedTool === "circle"
      ) {
        // We need the final coordinates from the 'stop' event if available
        const { offsetX, offsetY } = getCoordinates(e, canvas);
        // Ensure styles are correct before final draw
        setDrawingStyles(ctx);
        ctx.globalCompositeOperation = "source-over"; // Back to normal blending
        ctx.beginPath();
        switch (selectedTool) {
          case "line":
            ctx.moveTo(startX, startY);
            ctx.lineTo(offsetX, offsetY);
            break;
          case "rectangle":
            ctx.rect(startX, startY, offsetX - startX, offsetY - startY);
            break;
          case "circle":
            const radius = Math.sqrt(
              Math.pow(offsetX - startX, 2) + Math.pow(offsetY - startY, 2)
            );
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            break;
        }
        ctx.stroke();
        // ctx.fill(); // Uncomment for filled shapes
      } else if (selectedTool === "pen" || selectedTool === "eraser") {
        ctx.closePath(); // Close path for pen/eraser stroke
      }

      // --- Save canvas state ---
      const dataUrl = canvas.toDataURL();
      // Only mark complete and trigger save if something was actually drawn
      if (dataUrl !== canvasStates[currentQuestion] && dataUrl !== "data:,") {
        // Use the debounced save function
        debouncedSave(currentQuestion, dataUrl);
        // Auto-mark as completed when drawing is added/changed
        markAsCompleted(currentQuestion, true);
      } else {
        // If nothing changed (e.g., a click without drag), revert status
        if (savedStatus === "unsaved") {
          setSavedStatus("saved");
        }
      }
    };

    // Add event listeners
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing); // Stop if mouse leaves canvas

    // Touch support
    canvas.addEventListener("touchstart", startDrawing, { passive: false }); // Use passive: false to allow preventDefault
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    canvas.addEventListener("touchcancel", stopDrawing); // Handle interruptions

    // Add keyboard shortcuts listener
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return; // Ignore if typing

      switch (e.key.toLowerCase()) {
        case "p":
          setSelectedTool("pen");
          break;
        case "e":
          setSelectedTool("eraser");
          break;
        case "l":
          setSelectedTool("line");
          break;
        case "r":
          setSelectedTool("rectangle");
          break;
        case "c":
          setSelectedTool("circle");
          break;
        // Add undo/redo shortcuts if implemented
        // case 'z': if (e.metaKey || e.ctrlKey) handleUndo(); break;
        // case 'y': if (e.metaKey || e.ctrlKey) handleRedo(); break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
      document.removeEventListener("keydown", handleKeyDown);
      // Clear any pending debounced save when unmounting or question changes
      // This requires getting the cancel method from the debounce function if implemented
      // debouncedSave.cancel(); // Assuming debounce returns an object with cancel
    };
  }, [
    currentQuestion,
    selectedTool,
    strokeWidth,
    strokeColor,
    canvasStates,
    setCanvasStates,
    markAsCompleted,
    isDrawing, // Add isDrawing to dependencies if start/stop logic depends on it outside handlers
    debouncedSave, // Include debounced function in dependencies
    savedStatus, // Needed if stopDrawing logic depends on it
  ]);

  // --- Clear Canvas Function ---
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update saved state immediately after clearing
    const clearedDataUrl = canvas.toDataURL(); // Should be 'data:,'
    setCanvasStates({ ...canvasStates, [currentQuestion]: clearedDataUrl });
    markAsCompleted(currentQuestion, false); // Clearing removes completion by drawing
    setSavedStatus("unsaved"); // Mark as unsaved until explicitly saved
    // Optionally trigger immediate save after clear:
    // setSavedStatus("saving");
    // setTimeout(() => setSavedStatus("saved"), 500);
  };

  // --- Undo/Redo Placeholder Functions ---
  // const handleUndo = () => console.log("Undo action");
  // const handleRedo = () => console.log("Redo action");

  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-md mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-800">
            Drawing Pad / Scratchpad
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm self-end sm:self-center">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium
              ${savedStatus === "saved" ? "bg-green-100 text-green-700" : ""}
              ${
                savedStatus === "saving"
                  ? "bg-amber-100 text-amber-700 animate-pulse"
                  : ""
              }
              ${savedStatus === "unsaved" ? "bg-red-100 text-red-700" : ""}
            `}
          >
            {savedStatus === "saved" && "Saved"}
            {savedStatus === "saving" && "Saving..."}
            {savedStatus === "unsaved" && "Unsaved"}
          </span>
        </div>
      </div>

      {/* Drawing Toolbar Component */}
      <DrawingToolbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        // onInsertSymbol={handleInsertSymbol} // Pass handler if implementing symbol insertion
      />

      {/* Canvas Element */}
      <div className="border border-gray-300 rounded-md bg-white relative aspect-[2/1] overflow-hidden">
        {" "}
        {/* Aspect ratio */}
        <canvas
          ref={canvasRef}
          width={800} // Internal resolution
          height={400}
          className="w-full h-full touch-none block" // Ensure block display and responsive size
        ></canvas>
      </div>

      {/* Action Buttons (Undo/Redo/Clear) */}
      <div className="flex justify-between items-center mt-3">
        <div className="flex gap-2">
          {/* Implement Undo/Redo logic and enable buttons */}
          <Button variant="outline" size="sm" disabled>
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <Eraser className="h-4 w-4 mr-1" />
          Clear Canvas
        </Button>
      </div>
    </div>
  );
}
