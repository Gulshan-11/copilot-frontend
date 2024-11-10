import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor, { Monaco } from '@monaco-editor/react';
import { editor, IKeyboardEvent } from 'monaco-editor';
import { debounce } from 'lodash';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';

interface EditorConfig {
  id: string;
  code: string;
  language: string;
  isGenerating: boolean;
}

interface AutocompleteResponse {
  label: string;
  kind: string;
  detail: string;
  insertText: string;
}


interface CodeReviewResult {
  issues: {
    type: 'error' | 'warning' | 'suggestion';
    line: number;
    message: string;
    suggestion: string;
  }[];
  corrected_code: string;
  summary: string;
}

interface CompilationResult {
  output: string;
  error?: string;
  executionTime?: number;
}

const Editor: React.FC = () => {
  const [editors, setEditors] = useState<EditorConfig[]>(() => {
    const savedEditors = localStorage.getItem('editors');
    return savedEditors ? JSON.parse(savedEditors) : [
      { id: 'editor-1', code: '# Type your code here\n', language: 'python', isGenerating: false }
    ];
  });
  const [activeEditorId, setActiveEditorId] = useState<string>(() => {
    return localStorage.getItem('activeEditorId') || 'editor-1';
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState<CodeReviewResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);


  const editorRefs = useRef<{ [key: string]: editor.IStandaloneCodeEditor | null }>({});
  const debouncedFetchRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then(response => response.json())
      .then(() => setIsBackendAvailable(true))
      .catch(() => setIsBackendAvailable(false));

    console.log(isBackendAvailable);
  }, []);

  useEffect(() => {
    localStorage.setItem('editors', JSON.stringify(editors));
  }, [editors]);

  useEffect(() => {
    localStorage.setItem('activeEditorId', activeEditorId);
  }, [activeEditorId]);

  // Initialize debounced fetch function
  useEffect(() => {
    debouncedFetchRef.current = debounce(async (
      source: string,
      line: number,
      column: number,
      editorId: string,
      model: editor.ITextModel,
      monaco: Monaco
    ) => {
      try {
        // Get the full visible range of code
        const fullRange = model.getFullModelRange();
        console.log("fullRange", fullRange, "monaco", monaco);
        const visibleRanges = editorRefs.current[editorId]?.getVisibleRanges() || [];

        // Calculate context window (20 lines before and after current line)
        const startLine = Math.max(1, line - 20);
        const endLine = Math.min(model.getLineCount(), line + 20);

        // Get the surrounding context
        const contextCode = model.getValueInRange({
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: endLine,
          endColumn: model.getLineMaxColumn(endLine)
        });

        const response = await fetch('http://localhost:5000/api/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: contextCode,
            fullSource: source,
            line: line - startLine + 1, // Adjust line number relative to context
            column,
            language: selectedLanguage,
            visibleRanges: visibleRanges.map(range => ({
              startLine: range.startLineNumber,
              endLine: range.endLineNumber,
            })),
          }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        return [];
      }
    }, 1500); // 500ms debounce delay

    return () => {
      debouncedFetchRef.current?.cancel();
    };
  }, [selectedLanguage]);

  const handleCompileCode = async (editorId: string) => {
    const editor = editors.find(e => e.id === editorId);
    if (!editor || isCompiling) return;

    setIsCompiling(true);
    setCompilationResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editor.code,
          language: editor.language
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result: CompilationResult = await response.json();
      setCompilationResult(result);
    } catch (error) {
      console.error('Error compiling code:', error);
      setCompilationResult({
        output: '',
        error: 'Failed to compile code. Please check your connection and try again.'
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCodeReview = async (editorId: string) => {
    const editor = editors.find(e => e.id === editorId);
    if (!editor || isReviewing) return;

    setIsReviewing(true);
    try {
      const response = await fetch('http://localhost:5000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editor.code,
          language: editor.language
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const review: CodeReviewResult = await response.json();
      setReviewResults(review);
      console.log(review)

      // Add review markers to the editor
      const editorInstance = editorRefs.current[editorId];
      if (editorInstance && review.issues.length > 0) {
        const model = editorInstance.getModel();
        if (model && monacoRef.current) {
          const markers = review.issues.map(issue => ({
            severity: issue.type === 'error' ? 8 : issue.type === 'warning' ? 4 : 1,
            startLineNumber: issue.line,
            startColumn: 1,
            endLineNumber: issue.line,
            endColumn: model.getLineMaxColumn(issue.line),
            message: `${issue.message}\nSuggestion: ${issue.suggestion}`,
          }));

          monacoRef.current.editor.setModelMarkers(model, 'code-review', markers);
        }
      }
    } catch (error) {
      console.error('Error reviewing code:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleEditorDidMount = (editorInstance: editor.IStandaloneCodeEditor, editorId: string, monaco: Monaco) => {
    editorRefs.current[editorId] = editorInstance;
    monacoRef.current = monaco;

    monaco.languages.registerCompletionItemProvider(selectedLanguage, {
      triggerCharacters: ['.', ' ', '\n', "'", '"', '[', '(', '{'],
      provideCompletionItems: async (model, position) => {
        const source = model.getValue();
        const suggestions = await debouncedFetchRef.current(
          source,
          position.lineNumber,
          position.column,
          editorId,
          model,
          monaco
        );

        return {
          suggestions: suggestions.map((s: AutocompleteResponse) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind[s.kind as keyof typeof monaco.languages.CompletionItemKind] || monaco.languages.CompletionItemKind.Text,
            insertText: s.insertText,
            detail: s.detail,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          })),
        };
      }
    });

    // Add keyboard event handler for comment generation
    editorInstance.onKeyUp((e: IKeyboardEvent) => {
      if (e.keyCode === 3) { // Enter key
        const position = editorInstance.getPosition();
        if (position) {
          const model = editorInstance.getModel();
          if (model) {
            const lineNumber = position.lineNumber - 1;
            const line = model.getLineContent(lineNumber);
            handleCommentDetection(editorId, lineNumber, line);
          }
        }
      }
    });
  };

  const handleNewEditor = () => {
    const newEditorId = `editor-${editors.length + 1}`;
    setEditors([
      ...editors,
      { id: newEditorId, code: '# Type your code here\n', language: selectedLanguage, isGenerating: false }
    ]);
    setActiveEditorId(newEditorId);
  };

  const handleEditorChange = (value: string | undefined, editorId: string) => {
    setEditors(editors.map(editor =>
      editor.id === editorId ? { ...editor, code: value || '' } : editor
    ));
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    setEditors(editors.map(editor =>
      editor.id === activeEditorId ? { ...editor, language } : editor
    ));
  };


  const handleCommentDetection = async (editorId: string, lineNumber: number, commentLine: string) => {
    const editor = editors.find(e => e.id === editorId);
    if (!editor || editor.isGenerating || !commentLine.trim().startsWith('#')) return;

    setEditors(editors.map(e => (e.id === editorId ? { ...e, isGenerating: true } : e)));

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentLine.trim().substring(1), context: getCodeContext(editorId, lineNumber) }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const editorInstance = editorRefs.current[editorId];

      if (editorInstance && data.generated_code) {
        const position = { lineNumber: lineNumber + 2, column: 1 };
        editorInstance.executeEdits('comment-generation', [{
          range: { startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: position.lineNumber, endColumn: position.column },
          text: data.generated_code + '\n',
        }]);
      }
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setEditors(editors.map(e => (e.id === editorId ? { ...e, isGenerating: false } : e)));
    }
  };

  const getCodeContext = (editorId: string, lineNumber: number): string => {
    const editorInstance = editorRefs.current[editorId];
    if (!editorInstance) return '';

    const model = editorInstance.getModel();
    if (!model) return '';

    const startLine = Math.max(1, lineNumber - 5);
    const endLine = Math.min(model.getLineCount(), lineNumber + 5);
    let context = '';

    for (let i = startLine; i <= endLine; i++) {
      context += model.getLineContent(i) + '\n';
    }
    return context;
  };


  const activeEditor = editors.find(editor => editor.id === activeEditorId);

  return (
    <div className="flex w-full h-screen bg-gray-900 text-white">
      {isSidebarOpen && (
        <div className="w-64 bg-gray-800 p-4 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Editors</h1>
          <button onClick={handleNewEditor} className="bg-blue-600 text-white p-2 rounded mb-4">
            New Editor
          </button>
          <div className="flex flex-col space-y-2 mb-4">
            {editors.map(editor => (
              <button
                key={editor.id}
                onClick={() => setActiveEditorId(editor.id)}
                className={`p-2 rounded ${editor.id === activeEditorId ? 'bg-blue-500' : 'bg-gray-700'}`}
              >
                {editor.id}
              </button>
            ))}
          </div>
          <div className="mt-auto">
            <label className="block mb-2">Select Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col relative">
        <div className="h-12 bg-gray-800 flex items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:text-blue-500"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
          <div className="flex items-center ml-auto mr-4 space-x-4">
            <button
              onClick={() => handleCompileCode(activeEditorId)}
              disabled={isCompiling}
              className={`px-4 py-2 rounded ${isCompiling
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {isCompiling ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Compiling...
                </span>
              ) : (
                'Run Code'
              )}
            </button>
            <button
              onClick={() => handleCodeReview(activeEditorId)}
              disabled={isReviewing}
              className={`px-4 py-2 rounded ${isReviewing
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
            >
              {isReviewing ? 'Reviewing...' : 'Review Code'}
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeEditor && (
            <MonacoEditor
              height="90%"
              language={activeEditor.language}
              theme="vs-dark"
              value={activeEditor.code}
              onChange={(value) => handleEditorChange(value, activeEditor.id)}
              onMount={(editorInstance, monaco) => handleEditorDidMount(editorInstance, activeEditor.id, monaco)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                autoClosingBrackets: 'always',
                autoIndent: 'full',
                wordWrap: 'on',
                wrappingStrategy: 'advanced',
              }}
            />
          )}
        </div>

        {/* Output Panel */}
        {compilationResult && (
          <div className="h-1/3 border-t border-gray-700 bg-gray-800 p-4 overflow-y-auto z-999">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Output</h3>
              {compilationResult.executionTime && (
                <span className="text-sm text-gray-400">
                  Execution time: {compilationResult.executionTime}ms
                </span>
              )}
              <button
                onClick={() => setCompilationResult(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {compilationResult.error ? (
              <Alert className="border-red-600 bg-red-950/20">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  <pre className="whitespace-pre-wrap text-red-400">
                    {compilationResult.error}
                  </pre>
                </AlertDescription>
              </Alert>
            ) : (
              <pre className="whitespace-pre-wrap text-green-400 bg-gray-900 p-4 rounded">
                {compilationResult.output}
              </pre>
            )}
          </div>
        )}

        {reviewResults && (
          <div className="absolute right-0 top-12 w-96 max-h-[calc(100vh-3rem)] overflow-y-auto bg-gray-800 border-l border-gray-700 p-4">
            <Alert className="mb-4 border-blue-600">
              <AlertTitle>Code Review Summary</AlertTitle>
              <AlertDescription>{reviewResults.summary}</AlertDescription>
            </Alert>

            {reviewResults.issues.map((issue, index) => (
              <Alert
                key={index}
                className={`mb-2 ${issue.type === 'error'
                    ? 'border-red-600 bg-red-950/20'
                    : issue.type === 'warning'
                      ? 'border-yellow-600 bg-yellow-950/20'
                      : 'border-blue-600 bg-blue-950/20'
                  }`}
              >
                <AlertTitle className="flex items-center justify-between">
                  <span>Line {issue.line}: {issue.type}</span>
                </AlertTitle>
                <AlertDescription>
                  <p className="mt-2">{issue.message}</p>
                  <p className="mt-2 text-sm opacity-80">Suggestion: {issue.suggestion}</p>
                </AlertDescription>
              </Alert>
            ))}

            {reviewResults.corrected_code && (
              <Alert className="mt-4 border-green-600">
                <AlertTitle>Corrected Code</AlertTitle>
                <AlertDescription>
                  <button
                    onClick={() => {
                      const editorInstance = editorRefs.current[activeEditorId];
                      if (editorInstance && reviewResults.corrected_code) {
                        editorInstance.setValue(reviewResults.corrected_code);
                        setReviewResults(null); // Close the review panel after applying
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Apply Corrections
                  </button>
                </AlertDescription>
              </Alert>
            )}

            <button
              onClick={() => setReviewResults(null)}
              className="mt-4 w-full px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Close Review
            </button>
          </div>
        )}
      </div>
    </div>
  );

};



export default Editor;