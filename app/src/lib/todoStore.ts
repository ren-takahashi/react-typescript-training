import { Todo } from "@/types";
import initialTodos from "@/data/todos.json";

let todos: Todo[] = [...initialTodos];

export function getTodos(): Todo[] {
  return todos;
}

export function setTodos(newTodos: Todo[]): void {
  todos = newTodos;
}
