import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ArtifactMetadata } from '@/lib/artifactLoader';

export const metadata: ArtifactMetadata = {
  title: "TI-83 Style Calculator",
  description: "A TI-83 style scientific calculator with continuous scrolling display like the real TI-83",
  type: "react" as const,
  tags: ["calculator", "math", "utility", "ti-83", "graphing"],
  createdAt: "2025-07-13",
  updatedAt: "2025-07-13"
};

interface DisplayLine {
  type: 'expression' | 'result';
  content: string;
  id: number;
}

const TI83Calculator: React.FC = () => {
  const [expression, setExpression] = useState('');
  const [displayLines, setDisplayLines] = useState<DisplayLine[]>([]);
  const [isRadians, setIsRadians] = useState(true);
  const [lineCounter, setLineCounter] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const safeEvaluate = useCallback((expr: string): string => {
    try {
      let processedExpr = expr
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![0-9])/g, Math.E.toString())
        .replace(/\^/g, '**')
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/√\(/g, 'sqrt(')
        .replace(/√(\d+\.?\d*)/g, 'sqrt($1)')
        .replace(/log\(/g, 'log10(')
        .replace(/ln\(/g, 'log(');

      processedExpr = processedExpr.replace(/sin\(/g, isRadians ? 'sin(' : 'sin(deg2rad(');
      processedExpr = processedExpr.replace(/cos\(/g, isRadians ? 'cos(' : 'cos(deg2rad(');
      processedExpr = processedExpr.replace(/tan\(/g, isRadians ? 'tan(' : 'tan(deg2rad(');

      if (!isRadians) {
        processedExpr = processedExpr.replace(/deg2rad\(/g, '(');
        processedExpr = processedExpr.replace(/sin\(([^)]+)\)/g, 'sin(($1)*Math.PI/180)');
        processedExpr = processedExpr.replace(/cos\(([^)]+)\)/g, 'cos(($1)*Math.PI/180)');
        processedExpr = processedExpr.replace(/tan\(([^)]+)\)/g, 'tan(($1)*Math.PI/180)');
      }

      processedExpr = processedExpr.replace(/asin\(/g, 'asin(');
      processedExpr = processedExpr.replace(/acos\(/g, 'acos(');
      processedExpr = processedExpr.replace(/atan\(/g, 'atan(');

      const mathFunctions = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        sqrt: Math.sqrt,
        log: Math.log,
        log10: Math.log10,
        exp: Math.exp,
        abs: Math.abs,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        pow: Math.pow,
        PI: Math.PI,
        E: Math.E
      };

      const func = new Function(...Object.keys(mathFunctions), `return ${processedExpr}`);
      const result = func(...Object.values(mathFunctions));
      
      if (typeof result !== 'number' || isNaN(result)) {
        return 'Error';
      }
      
      return result.toString();
    } catch (error) {
      return 'Error';
    }
  }, [isRadians]);

  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const result = safeEvaluate(expression);
    
    setDisplayLines(prev => [
      ...prev,
      { type: 'expression', content: expression, id: lineCounter },
      { type: 'result', content: result, id: lineCounter + 1 }
    ]);
    
    setLineCounter(prev => prev + 2);
    setExpression('');
    
    setTimeout(() => {
      if (displayRef.current) {
        displayRef.current.scrollTop = displayRef.current.scrollHeight;
      }
    }, 0);
  }, [expression, safeEvaluate, lineCounter]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  }, [handleCalculate]);

  const insertFunction = useCallback((func: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newExpression = expression.slice(0, start) + func + expression.slice(end);
      setExpression(newExpression);
      
      setTimeout(() => {
        input.focus();
        const newPos = start + func.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    }
  }, [expression]);

  const clearDisplay = useCallback(() => {
    setDisplayLines([]);
    setExpression('');
    setLineCounter(0);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto bg-gray-900 text-green-400 rounded-lg overflow-hidden border-2 border-gray-700">
      {/* Calculator Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-mono">TI-83 Plus</h2>
          <div className="flex gap-2">
            <Button
              variant={isRadians ? "default" : "outline"}
              size="sm"
              className="text-xs h-6 px-2 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
              onClick={() => setIsRadians(!isRadians)}
            >
              {isRadians ? "RAD" : "DEG"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-6 px-2 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
              onClick={clearDisplay}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Main Display - scrolling area */}
      <div 
        ref={displayRef}
        className="bg-black h-80 overflow-y-auto p-4 font-mono text-sm border-b border-gray-700"
      >
        {/* Previous calculations */}
        {displayLines.map((line) => (
          <div key={line.id} className={`mb-1 ${line.type === 'expression' ? 'text-left' : 'text-right'}`}>
            <span className={line.type === 'expression' ? 'text-green-300' : 'text-green-400 font-bold'}>
              {line.content}
            </span>
          </div>
        ))}
        
        {/* Current input line */}
        <div className="text-left">
          <Input
            ref={inputRef}
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={displayLines.length === 0 ? "Enter expression and press Enter..." : ""}
            className="bg-transparent border-none text-green-300 font-mono text-sm focus:ring-0 p-0 placeholder-gray-600 w-full"
          />
        </div>
      </div>

      {/* Function Buttons */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-4 gap-1 text-xs">
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('sin(')}
          >
            sin
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('cos(')}
          >
            cos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('tan(')}
          >
            tan
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('log(')}
          >
            log
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('asin(')}
          >
            sin⁻¹
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('acos(')}
          >
            cos⁻¹
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('atan(')}
          >
            tan⁻¹
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('ln(')}
          >
            ln
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('√(')}
          >
            √
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('^2')}
          >
            x²
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('^(')}
          >
            x^y
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('(')}
          >
            (
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('π')}
          >
            π
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('e')}
          >
            e
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction('abs(')}
          >
            abs
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={() => insertFunction(')')}
          >
            )
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-green-400 border-gray-600"
            onClick={handleCalculate}
          >
            Calculate (Enter)
          </Button>
          <Button
            variant="destructive"
            className="bg-red-700 hover:bg-red-600"
            onClick={() => setExpression('')}
          >
            Clear Line
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TI83Calculator;
