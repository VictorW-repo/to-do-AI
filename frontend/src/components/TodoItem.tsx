import React from 'react';
import { useMutation } from '@apollo/client';
import { TOGGLE_TODO_STATUS, DELETE_TODO } from '@/graphql/mutations';
import { GET_TODOS } from '@/graphql/queries';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles, Calendar, AlertCircle, BarChart3 } from 'lucide-react';
import { Todo } from '@/graphql/queries';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
}

// Priority levels with labels and colors
const PRIORITY_LEVELS = [
  { value: 1, label: 'Low', color: 'text-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20' },
  { value: 2, label: 'Medium', color: 'text-amber-500 border-amber-300 bg-amber-50 dark:bg-amber-900/20' },
  { value: 3, label: 'High', color: 'text-red-500 border-red-300 bg-red-50 dark:bg-red-900/20' },
];

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  // Toggle todo status mutation
  const [toggleStatus, { loading: toggleLoading }] = useMutation(TOGGLE_TODO_STATUS, {
    variables: { id: todo.id },
    refetchQueries: [{ query: GET_TODOS }],
  });

  // Delete todo mutation
  const [deleteTodo, { loading: deleteLoading }] = useMutation(DELETE_TODO, {
    variables: { id: todo.id },
    refetchQueries: [{ query: GET_TODOS }],
  });

  // Handle checkbox click
  const handleToggle = () => {
    if (!toggleLoading && !deleteLoading) {
      toggleStatus();
    }
  };

  // Handle delete button click
  const handleDelete = () => {
    if (!toggleLoading && !deleteLoading) {
      deleteTodo();
    }
  };

  // Format the date if it exists
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get the priority level object
  const priorityLevel = PRIORITY_LEVELS.find(level => level.value === todo.priority) || PRIORITY_LEVELS[0];
  
  // Check if todo is overdue
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED';

  return (
    <div 
      className={cn(
        "group flex items-start justify-between p-4 rounded-lg transition-all duration-200",
        "bg-card border hover:shadow-md",
        todo.status === 'COMPLETED' ? "opacity-75" : "",
        isOverdue ? "border-red-400/30 dark:border-red-800/30" : "border-border"
      )}
    >
      <div className="flex items-start space-x-3 flex-grow">
        <div className="pt-0.5">
          <Checkbox
            checked={todo.status === 'COMPLETED'}
            onCheckedChange={handleToggle}
            disabled={toggleLoading || deleteLoading}
            className={cn(
              "h-5 w-5 transition-colors",
              todo.status === 'COMPLETED' ? "text-green-500 dark:text-green-400" : ""
            )}
          />
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                "text-sm font-medium transition-all line-clamp-2",
                todo.status === 'COMPLETED' && "line-through text-muted-foreground"
              )}
            >
              {todo.title}
            </span>
            
            {/* Icons for special states */}
            <div className="flex gap-1 items-center">
              {todo.isAiGenerated && (
                <Sparkles className="flex-shrink-0 h-3 w-3 text-purple-500" />
              )}
              {isOverdue && (
                <AlertCircle className="flex-shrink-0 h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
          
          {todo.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {todo.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {/* Priority badge */}
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
              priorityLevel.color
            )}>
              <BarChart3 className="h-3 w-3" />
              {priorityLevel.label}
            </div>
            
            {/* Due date badge */}
            {todo.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                isOverdue 
                  ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/30" 
                  : "bg-primary/10 text-primary-foreground border-primary/20 dark:bg-primary/20"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(todo.dueDate)}
              </div>
            )}
            
            {/* Completed date badge */}
            {todo.completedAt && (
              <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/30">
                <Checkbox className="h-3 w-3" checked />
                {formatDate(todo.completedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={toggleLoading || deleteLoading}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
      </Button>
    </div>
  );
};

export default TodoItem;