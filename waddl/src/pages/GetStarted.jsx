import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import '../App.css';

function MathVisualization({ operation, values, result, type, animationKey }) {
  if (!operation || !values || !result) return null;

  return (
    <div className="math-visualization" key={animationKey}>
      <div className="math-row">
        {values.map((value, index) => (
          <React.Fragment key={index}>
            <div className="math-box input-box">
              {value}
            </div>
            {index < values.length - 1 && (
              <div className="math-operator">{operation}</div>
            )}
          </React.Fragment>
        ))}
        <div className="math-arrow">→</div>
        <div className="math-result">
          <div className="type-label">int: {type}</div>
          <div className="math-box result-box">
            {result}
          </div>
        </div>
      </div>
    </div>
  );
}

function ForLoopVisualization({ list, currentIndex, varName, animationKey }) {
  return (
    <div className="loop-visualization" key={animationKey}>
      <div className="list-label">
        [list]: numbers
      </div>
      <div className="list-container">
        {list.map((item, index) => (
          <React.Fragment key={index}>
            <div className={`list-item ${index === currentIndex ? 'current' : ''}`}>
              {item}
            </div>
            {index < list.length - 1 && <div className="list-separator">—</div>}
          </React.Fragment>
        ))}
      </div>
      <div className="loop-pointer-container">
        {list.map((_, index) => (
          <div 
            key={index} 
            className={`loop-pointer ${index === currentIndex ? 'active' : ''}`}
          >
            <span>↑</span>
            <span className="variable-name">num</span>
          </div>
        ))}
      </div>
      <div className="math-result">
        <div className="type-label">output:</div>
        <div className="math-box result-box output-box">
          {currentIndex >= 0 ? list.slice(0, currentIndex + 1).join('\n') : ''}
        </div>
      </div>
    </div>
  );
}

function GetStarted() {
  const navigate = useNavigate();
  const [code, setCode] = useState('# for loop example!\nnumbers = [1, 2, 3, 4, 5]\nfor num in numbers:\n    print(num)');
  const [output, setOutput] = useState('');
  const [outputHeight, setOutputHeight] = useState(120);
  const [visualization, setVisualization] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [currentLoopIndex, setCurrentLoopIndex] = useState(0);
  const loopIntervalRef = useRef(null);
  const resizingRef = useRef(false);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const evaluateExpression = (expr, variables) => {
    // Replace variable names with their values
    let evaluatedExpr = expr;
    
    // Sort variables by length (longest first) to avoid partial replacements
    const sortedVars = Object.entries(variables).sort((a, b) => b[0].length - a[0].length);
    
    for (const [name, value] of sortedVars) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      evaluatedExpr = evaluatedExpr.replace(regex, value);
    }

    try {
      // Safely evaluate basic math expressions
      return Function('"use strict";return (' + evaluatedExpr + ')')();
    } catch (error) {
      throw new Error('Invalid expression');
    }
  };

  const parseOperation = (expression) => {
    // Try to parse basic math operations
    const mathRegex = /^\s*(\d+|\w+)\s*([\+\-\*\/])\s*(\d+|\w+)\s*$/;
    const match = expression.match(mathRegex);
    
    if (match) {
      return {
        values: [match[1], match[3]],
        operation: match[2],
        expression: expression
      };
    }
    return null;
  };

  const parseForLoop = (code) => {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const listMatch = lines[i].match(/(\w+)\s*=\s*\[([\d,\s]+)\]/);
      if (listMatch) {
        const listName = listMatch[1];
        const listValues = listMatch[2].split(',').map(v => parseInt(v.trim()));
        
        // Look for a for loop using this list in the next line
        if (i + 1 < lines.length) {
          const forLoopMatch = lines[i + 1].match(/for\s+(\w+)\s+in\s+(\w+):/);
          if (forLoopMatch && forLoopMatch[2] === listName) {
            return {
              type: 'forLoop',
              list: listValues,
              varName: forLoopMatch[1],
              listName: listName
            };
          }
        }
      }
    }
    return null;
  };

  const simulatePythonOutput = (code) => {
    const variables = {};
    const output = [];
    let lastOperation = null;
    
    try {
      // Split code into lines and process each line
      const lines = code.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('#')) {
          continue;
        }

        // Handle variable assignment
        if (trimmedLine.includes('=') && !trimmedLine.startsWith('print')) {
          const [varName, expression] = trimmedLine.split('=').map(part => part.trim());
          try {
            // First try to parse as a math operation for visualization
            const operation = parseOperation(expression);
            if (operation) {
              // Evaluate each part of the operation to handle variables
              const evaluatedValues = operation.values.map(v => {
                try {
                  return variables[v] !== undefined ? variables[v] : Number(v);
                } catch {
                  return v;
                }
              });
              
              const result = evaluateExpression(expression, variables);
              variables[varName] = result;
              
              lastOperation = {
                values: evaluatedValues,
                operation: operation.operation,
                result: result,
                type: varName
              };
            } else {
              // If not a basic operation, just evaluate the expression
              const result = evaluateExpression(expression, variables);
              variables[varName] = result;
            }
          } catch (error) {
            output.push(`Error: Could not evaluate expression: ${expression}`);
          }
          continue;
        }

        // Handle print statements
        const printMatch = trimmedLine.match(/print\((.*)\)/);
        if (printMatch) {
          let printContent = printMatch[1];
          
          // Handle f-strings
          if (printContent.startsWith('f"') || printContent.startsWith("f'")) {
            printContent = printContent.slice(2, -1); // Remove f" and "
            // Replace {expressions} with their values
            printContent = printContent.replace(/\{([^}]+)\}/g, (match, expr) => {
              try {
                return evaluateExpression(expr, variables);
              } catch (error) {
                return `{${expr}}`;
              }
            });
            output.push(printContent);
          } else {
            // Handle regular print statements
            try {
              const result = evaluateExpression(printContent, variables);
              output.push(result);
            } catch (error) {
              output.push(printContent.replace(/["']/g, ''));
            }
          }
        }
      }

      // Update visualization if we found a math operation
      if (lastOperation) {
        setVisualization(lastOperation);
      }

      return output.join('\n') || 'No output';
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  const handleRun = () => {
    // Clear any existing animation interval
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }

    const forLoop = parseForLoop(code);
    if (forLoop) {
      setCurrentLoopIndex(-1); // Start at -1 so first increment sets to 0
      setVisualization({
        type: 'forLoop',
        ...forLoop
      });

      // Initialize output
      setOutput('');

      // Animate through the loop
      let index = -1; // Start at -1 so first increment sets to 0
      loopIntervalRef.current = setInterval(() => {
        index++;
        if (index < forLoop.list.length) {
          setCurrentLoopIndex(index);
          // Update output by appending the current number
          setOutput(prev => prev + (prev ? '\n' : '') + forLoop.list[index]);
        } else {
          clearInterval(loopIntervalRef.current);
        }
      }, 1000);
    } else {
      // Handle other code types (math operations, etc.)
      const result = simulatePythonOutput(code);
      setOutput(result);
    }
    setAnimationKey(prev => prev + 1);
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    resizingRef.current = true;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e) => {
    if (!resizingRef.current) return;
    
    const editorContainer = e.target.closest('.code-editor-container');
    if (!editorContainer) return;
    
    const containerRect = editorContainer.getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    
    // Set minimum and maximum heights
    const clampedHeight = Math.min(Math.max(80, newHeight), containerRect.height - 200);
    setOutputHeight(clampedHeight);
  };

  const handleResizeEnd = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  return (
    <div className="app">
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          back to home
        </button>
        <div className="logo-container">
          <h1 className="logo">waddl</h1>
        </div>
        <div className="duck-logo">
          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="duck-body" cx="50" cy="50" r="40" fill="#FFE66D"/>
            <path className="duck-wing" d="M30 50C30 50 25 60 35 65C45 70 50 60 50 60" stroke="#FFD23F" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="70" cy="40" r="20" fill="#FFE66D"/>
            <circle className="duck-eye" cx="75" cy="35" r="4" fill="#333"/>
            <path d="M85 45C85 45 95 45 95 50C95 55 85 55 85 55" fill="#FF9A3C"/>
          </svg>
        </div>
      </header>

      <main className="editor-layout">
        <div className="code-editor-container">
          <div className="editor-header">
            <span className="file-name">main.py</span>
            <div className="editor-controls">
              <button className="control-button" onClick={handleRun}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 10L5 5V15L15 10Z" fill="currentColor"/>
                </svg>
                Run
              </button>
            </div>
          </div>
          <CodeMirror
            value={code}
            height={`calc(100% - ${outputHeight}px)`}
            theme="dark"
            extensions={[python()]}
            onChange={handleCodeChange}
            className="code-mirror-wrapper"
          />
          <div className="output-window" style={{ height: outputHeight }}>
            <div className="resize-handle" onMouseDown={handleResizeStart} />
            <div className="output-header">
              <span>Output</span>
            </div>
            <pre className="output-content">{output}</pre>
          </div>
        </div>
        
        <div className="visualization-container">
          {visualization ? (
            visualization.type === 'forLoop' ? (
              <ForLoopVisualization 
                list={visualization.list}
                currentIndex={currentLoopIndex}
                varName={visualization.varName}
                animationKey={animationKey}
              />
            ) : (
              <MathVisualization {...visualization} animationKey={animationKey} />
            )
          ) : (
          <div className="visualization-placeholder">
              <h3>Your visualization will appear here!</h3>
              <p>Write and run your code to see a step-by-step walkthrough ✨</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default GetStarted; 