import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TODOS } from '@/graphql/queries';
import { GENERATE_TODO_SUGGESTION, GenerateTodoSuggestionResponse } from '@/graphql/mutations';
import Layout from '@/components/Layout';
import TodoInput from '@/components/TodoInput';
import TodoItem from '@/components/TodoItem';
import Spinner from '@/components/Spinner';
import { saveSpinnerState, loadSpinnerState, clearSpinnerState } from '@/lib/persistence';
import { Todo, GetTodosResponse } from '@/graphql/queries';
import { 
  CheckCircle2, ListTodo, Search, Filter, 
  SortAsc, SortDesc, Clock, BarChart3, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sort options for todos
type SortOption = {
  label: string;
  key: keyof Todo | null;
  icon: React.ReactNode;
  direction: 'asc' | 'desc';
};

const Home: React.FC = () => {
  // State for AI-generated todo text
  const [generatedText, setGeneratedText] = useState<string>('');
  // State for tracking if AI generation is in progress
  const [isGenerating, setIsGenerating] = useState<boolean>(loadSpinnerState());
  // State for showing/hiding completed todos
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  // State for search filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  // State for sorting
  const [sortOption, setSortOption] = useState<SortOption>({
    label: 'Date Added (New first)',
    key: 'createdAt',
    icon: <Clock className="h-4 w-4" />,
    direction: 'desc'
  });

  // Sort options
  const sortOptions: SortOption[] = [
    { label: 'Date Added (New first)', key: 'createdAt', icon: <Clock className="h-4 w-4" />, direction: 'desc' },
    { label: 'Date Added (Old first)', key: 'createdAt', icon: <Clock className="h-4 w-4" />, direction: 'asc' },
    { label: 'Priority (High first)', key: 'priority', icon: <BarChart3 className="h-4 w-4" />, direction: 'desc' },
    { label: 'Priority (Low first)', key: 'priority', icon: <BarChart3 className="h-4 w-4" />, direction: 'asc' },
    { label: 'Due Date (Closest first)', key: 'dueDate', icon: <Calendar className="h-4 w-4" />, direction: 'asc' },
    { label: 'Due Date (Furthest first)', key: 'dueDate', icon: <Calendar className="h-4 w-4" />, direction: 'desc' },
  ];

  // Fetch todos
  const { loading, error, data } = useQuery<GetTodosResponse>(GET_TODOS, {
    variables: { includeCompleted: true },
    fetchPolicy: 'cache-and-network',
  });

  // Use mutation instead of subscription for todo generation
  const [generateTodoSuggestion, { loading: generationLoading }] = useMutation<GenerateTodoSuggestionResponse>(
    GENERATE_TODO_SUGGESTION,
    {
      onCompleted: (data) => {
        if (data?.generateTodoSuggestion?.suggestion) {
          setGeneratedText(data.generateTodoSuggestion.suggestion);
        }
        setIsGenerating(false);
        clearSpinnerState();
      },
      onError: (error) => {
        console.error("Error generating todo:", error);
        setIsGenerating(false);
        clearSpinnerState();
      }
    }
  );

  // Load spinner state from localStorage
  useEffect(() => {
    const spinnerState = loadSpinnerState();
    setIsGenerating(spinnerState);
    if (spinnerState) {
      // If spinner was active but the page refreshed, try generating again
      handleGenerateTodo();
    }
  }, []);

  // Start AI todo generation
  const handleGenerateTodo = () => {
    setGeneratedText('');
    setIsGenerating(true);
    saveSpinnerState(true);
    generateTodoSuggestion();
  };

  // Filter todos based on completion status and search query
  let filteredTodos = data?.todos
    ? data.todos
        .filter((todo) => showCompleted || todo.status !== 'COMPLETED')
        .filter((todo) => 
          searchQuery 
            ? todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
            : true
        )
    : [];

  // Sort todos based on selected option
  if (sortOption.key) {
    filteredTodos = [...filteredTodos].sort((a, b) => {
      const aValue = a[sortOption.key as keyof Todo];
      const bValue = b[sortOption.key as keyof Todo];
      
      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortOption.direction === 'asc' ? -1 : 1;
      if (bValue === null) return sortOption.direction === 'asc' ? 1 : -1;
      
      // Special case for dates
      if (sortOption.key === 'dueDate' || sortOption.key === 'createdAt' || sortOption.key === 'updatedAt' || sortOption.key === 'completedAt') {
        const aDate = aValue ? new Date(aValue as string).getTime() : 0;
        const bDate = bValue ? new Date(bValue as string).getTime() : 0;
        return sortOption.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Regular comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOption.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Number comparison
      return sortOption.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }

  // Count of completed and pending todos
  const completedCount = data?.todos?.filter(todo => todo.status === 'COMPLETED').length || 0;
  const pendingCount = (data?.todos?.length || 0) - completedCount;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">My Tasks</h2>
          <p className="text-muted-foreground">
            Manage your tasks and let AI help you remember what else to do.
          </p>
        </div>

        <TodoInput
          onGenerateTodo={handleGenerateTodo}
          isGenerating={isGenerating}
          generatedTodoText={generatedText}
        />

        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center rounded-full p-2 bg-primary/10 text-primary">
                <ListTodo className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-sm">
                <h3 className="font-semibold text-foreground">
                  {filteredTodos.length} {filteredTodos.length === 1 ? 'Task' : 'Tasks'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {pendingCount} pending, {completedCount} completed
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 w-full md:w-auto rounded-md text-sm border border-input bg-background px-3 py-1 
                              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              
              <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-primary text-primary focus:ring-primary"
                />
                <span>Show completed</span>
              </label>
            </div>
          </div>
          
          {/* Sorting options */}
          <div className="flex flex-wrap justify-between gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            {/* Sort filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortOptions.findIndex(opt => 
                  opt.key === sortOption.key && opt.direction === sortOption.direction
                )}
                onChange={(e) => setSortOption(sortOptions[parseInt(e.target.value)])}
                className="text-sm px-2 py-1 rounded-md border border-input bg-background"
              >
                {sortOptions.map((option, index) => (
                  <option key={index} value={index}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-lg border border-border">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading your tasks...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="font-medium">Error loading todos</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-lg border border-border text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tasks found matching your search</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                  }} 
                  className="mt-2 text-primary hover:underline text-sm"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tasks yet. Add one or generate with AI!</p>
                <button 
                  onClick={handleGenerateTodo}
                  disabled={isGenerating} 
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm disabled:opacity-50"
                >
                  {isGenerating ? <Spinner size="sm" /> : <Filter className="h-4 w-4" />}
                  Generate with AI
                </button>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="space-y-3">
              {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
            
            {filteredTodos.length > 5 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {filteredTodos.length} tasks total
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;