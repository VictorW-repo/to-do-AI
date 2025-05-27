import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_TODO } from '@/graphql/mutations';
import { GET_TODOS } from '@/graphql/queries';
import { Button } from '@/components/ui/button';
import { PlusCircle, Sparkles, Loader2, Calendar, BarChart } from 'lucide-react';
import Spinner from './Spinner';
import { cn } from '@/lib/utils';
import { saveSpinnerState, loadSpinnerState, clearSpinnerState } from '@/lib/persistence';

interface TodoInputProps {
  onGenerateTodo: () => void;
  isGenerating: boolean;
  generatedTodoText: string;
}

// Priority levels with labels and colors
const PRIORITY_LEVELS = [
  { value: 1, label: 'Low', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  { value: 2, label: 'Medium', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' },
  { value: 3, label: 'High', color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
];

const TodoInput: React.FC<TodoInputProps> = ({
  onGenerateTodo,
  isGenerating,
  generatedTodoText,
}) => {
  const [todoText, setTodoText] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<number>(1);
  const [dueDate, setDueDate] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Use Apollo's useMutation hook for creating todos
  const [createTodo, { loading }] = useMutation(CREATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
    onCompleted: () => {
      setTodoText('');
      setDescription('');
      setPriority(1);
      setDueDate('');
      setIsExpanded(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  });

  // When a todo is generated, update the input field
  useEffect(() => {
    if (generatedTodoText && !isGenerating) {
      setTodoText(generatedTodoText);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [generatedTodoText, isGenerating]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (todoText.trim()) {
      createTodo({
        variables: {
          input: {
            title: todoText.trim(),
            description: description.trim() || null,
            priority,
            dueDate: dueDate || null,
            isAiGenerated: todoText === generatedTodoText,
          },
        },
      });
    }
  };

  // Handle AI generation button click
  const handleGenerateClick = () => {
    saveSpinnerState(true);
    onGenerateTodo();
  };

  // Format today's date for the date input min value
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative pb-6 mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl opacity-20 rounded-lg -z-10"></div>
      <form onSubmit={handleSubmit} className="relative bg-card border border-border/50 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <textarea
              ref={inputRef}
              placeholder="Add a new todo..."
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              className={cn(
                "w-full px-4 py-3 rounded-md resize-none min-h-[80px]",
                "bg-background border border-input",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                "text-base placeholder:text-muted-foreground transition-all duration-200",
                isGenerating ? "bg-muted" : ""
              )}
              disabled={loading || isGenerating}
            />
            {isGenerating && (
              <div className="absolute right-3 top-3">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          
          {/* Expandable advanced options */}
          <div className={cn(
            "grid gap-4 transition-all duration-300",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}>
            <div className="overflow-hidden">
              <div className="space-y-3 pt-2">
                {/* Description input */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Add more details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-md resize-none h-24 bg-background border border-input text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Priority selection */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <div className="flex space-x-2">
                      {PRIORITY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setPriority(level.value)}
                          className={cn(
                            "flex-1 py-1 px-2 rounded-md text-sm font-medium transition-colors",
                            priority === level.value ? level.color : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Due date selection */}
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={today}
                        className="w-full px-3 py-2 rounded-md bg-background border border-input text-sm appearance-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between gap-2">
            {/* Toggle for advanced options */}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs flex items-center gap-1"
            >
              <BarChart className="h-3 w-3" />
              {isExpanded ? "Hide options" : "Show options"}
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={!todoText.trim() || loading || isGenerating}
                className="transition-all duration-200 min-w-[80px]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="flex items-center gap-1 transition-all duration-200 bg-card hover:bg-primary/10"
                title="Generate a todo with AI"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span>AI</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        {isGenerating && (
          <div className="mt-2 text-xs text-muted-foreground animate-pulse">
            Generating AI suggestion...
          </div>
        )}
      </form>
    </div>
  );
};

export default TodoInput;