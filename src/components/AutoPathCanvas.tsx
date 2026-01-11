import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, Undo } from 'lucide-react';

interface AutoPathCanvasProps {
  onSave: (pathData: string) => void;
  onClose: () => void;
  initialPath?: string;
  alliance?: 'red' | 'blue';
  startPosition?: 'blue-classifier' | 'blue-launch' | 'red-classifier' | 'red-launch';
}

const AutoPathCanvas: React.FC<AutoPathCanvasProps> = ({ onSave, onClose, initialPath, startPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [fieldImage, setFieldImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Field dimensions (FTC field is 12ft x 12ft, represented as 360x360 canvas)
  const CANVAS_SIZE = 360;

  // Load field image
  useEffect(() => {
    const img = new Image();
    img.src = '/ftc.png';
    img.onload = () => {
      setFieldImage(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.log('Field image not found, using default field');
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    if (!imageLoaded) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    setCtx(context);
    
    // Draw field background
    drawField(context);

    // Load initial path if provided
    if (initialPath) {
      try {
        const loadedPaths = JSON.parse(initialPath);
        setPaths(loadedPaths);
        loadedPaths.forEach((path: any) => drawPath(context, path, '#3B82F6'));
      } catch (e) {
        console.error('Failed to load initial path');
      }
    }
  }, [initialPath, imageLoaded, fieldImage, startPosition]);

  // Starting position coordinates based on alliance and position
  const getStartingPosition = () => {
    // Positions based on FTC DECODE field layout
    // Classifier = near the classifier zone, Launch = near the launch zone
    const positions: Record<string, { x: number; y: number }> = {
      'blue-classifier': { x: CANVAS_SIZE * 0.15, y: CANVAS_SIZE * 0.85 },
      'blue-launch': { x: CANVAS_SIZE * 0.35, y: CANVAS_SIZE * 0.85 },
      'red-classifier': { x: CANVAS_SIZE * 0.65, y: CANVAS_SIZE * 0.15 },
      'red-launch': { x: CANVAS_SIZE * 0.85, y: CANVAS_SIZE * 0.15 },
    };
    return startPosition ? positions[startPosition] : null;
  };

  const drawField = (context: CanvasRenderingContext2D) => {
    // Clear canvas
    context.fillStyle = '#6B7280';
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw field image if loaded
    if (fieldImage) {
      context.drawImage(fieldImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    } else {
      // Fallback: Draw grid
      context.strokeStyle = '#4B5563';
      context.lineWidth = 1;
      for (let i = 0; i <= 12; i++) {
        const pos = (i * CANVAS_SIZE) / 12;
        context.beginPath();
        context.moveTo(pos, 0);
        context.lineTo(pos, CANVAS_SIZE);
        context.stroke();
        context.beginPath();
        context.moveTo(0, pos);
        context.lineTo(CANVAS_SIZE, pos);
        context.stroke();
      }
    }

    // Draw starting position marker if set
    const startPos = getStartingPosition();
    if (startPos) {
      // Draw a prominent starting circle
      const isBlue = startPosition?.startsWith('blue');
      context.strokeStyle = isBlue ? '#3B82F6' : '#EF4444';
      context.lineWidth = 3;
      context.fillStyle = isBlue ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      
      context.beginPath();
      context.arc(startPos.x, startPos.y, 15, 0, Math.PI * 2);
      context.fill();
      context.stroke();

      // Draw "START" label
      context.fillStyle = isBlue ? '#3B82F6' : '#EF4444';
      context.font = 'bold 10px Arial';
      context.textAlign = 'center';
      context.fillText('START', startPos.x, startPos.y + 25);
    }
  };

  const drawPath = (context: CanvasRenderingContext2D, path: Array<{ x: number; y: number }>, color: string) => {
    if (path.length < 2) return;

    context.strokeStyle = color;
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();
    context.moveTo(path[0].x, path[0].y);
    
    for (let i = 1; i < path.length; i++) {
      context.lineTo(path[i].x, path[i].y);
    }
    
    context.stroke();

    // Draw start point
    context.fillStyle = '#10B981';
    context.beginPath();
    context.arc(path[0].x, path[0].y, 6, 0, Math.PI * 2);
    context.fill();

    // Draw end point
    context.fillStyle = '#EF4444';
    context.beginPath();
    context.arc(path[path.length - 1].x, path[path.length - 1].y, 6, 0, Math.PI * 2);
    context.fill();
  };

  const getCanvasPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const pos = getCanvasPosition(e);
    if (!pos) return;

    setIsDrawing(true);
    setCurrentPath([pos]);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing || !ctx) return;

    const pos = getCanvasPosition(e);
    if (!pos) return;

    const newPath = [...currentPath, pos];
    setCurrentPath(newPath);

    // Redraw everything
    drawField(ctx);
    paths.forEach(path => drawPath(ctx, path, '#3B82F6'));
    drawPath(ctx, newPath, '#F59E0B');
  };

  const stopDrawing = () => {
    if (isDrawing && currentPath.length > 1) {
      setPaths([...paths, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath([]);

    // Redraw final state
    if (ctx) {
      drawField(ctx);
      [...paths, currentPath].forEach(path => {
        if (path.length > 1) drawPath(ctx, path, '#3B82F6');
      });
    }
  };

  const handleUndo = () => {
    if (paths.length === 0) return;
    const newPaths = paths.slice(0, -1);
    setPaths(newPaths);

    if (ctx) {
      drawField(ctx);
      newPaths.forEach(path => drawPath(ctx, path, '#3B82F6'));
    }
  };

  const handleClear = () => {
    setPaths([]);
    setCurrentPath([]);
    if (ctx) {
      drawField(ctx);
    }
  };

  const handleSave = () => {
    const pathData = JSON.stringify(paths);
    onSave(pathData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Draw Auto Path</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Canvas */}
        <div className="p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span> Start
              <span className="mx-2">•</span>
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> End
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              Draw the robot's autonomous path on the field. Green dot = start, Red dot = end.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleUndo}
            disabled={paths.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            <Undo className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={handleClear}
            disabled={paths.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
          >
            Save Path
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoPathCanvas;
