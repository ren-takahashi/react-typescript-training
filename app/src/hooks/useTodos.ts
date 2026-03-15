"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, CreateTodoInput, TodoFilter } from "@/types";

export function useTodos() {
  // todos: Todo の配列を管理する状態（初期値は空の配列）
  const [todos, setTodos] = useState<Todo[]>([]);
  // isLoading: データの読み込み中かどうかを管理する状態（初期値は true = 読み込み中）
  const [isLoading, setIsLoading] = useState(true);
  // filter: 現在選択中のフィルターを管理する状態（初期値は "all" = すべて表示）
  const [filter, setFilter] = useState<TodoFilter>("all");

  // Todo 一覧を API から取得する関数
  // useCallback でメモ化することで、fetchTodos 関数自体が毎回再生成されるのを防ぐ
  // 依存配列が空 [] なので、コンポーネントの初回マウント時に一度だけ生成される
  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch("/api/todos");
    const data: Todo[] = await res.json();
    setTodos(data);
    setIsLoading(false);
  }, []);

  // マウント時に一度だけ fetchTodos を呼び出す
  // 依存配列に fetchTodos を指定しているが、useCallback でメモ化済みなので実質1回だけ実行される
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Todo を追加する関数
  // API に POST リクエストを送り、成功したら新しい Todo をリストの先頭に追加する
  const addTodo = useCallback(async (input: CreateTodoInput) => {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("追加に失敗しました");
    const newTodo: Todo = await res.json();
    // prev は現在の todos 配列。新しい Todo を先頭に追加して新しい配列を返す
    setTodos((prev) => [newTodo, ...prev]);
  }, []);

  // Todo の完了状態を切り替える関数
  // 対象の Todo を id で探し、completed を反転させて PATCH リクエストを送る
  const toggleTodo = useCallback(async (id: string) => {
    const target = todos.find((t) => t.id === id);
    if (!target) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      // !target.completed で現在の状態を反転させた値を送る
      body: JSON.stringify({ completed: !target.completed }),
    });
    if (!res.ok) throw new Error("更新に失敗しました");
    const updated: Todo = await res.json();
    // id が一致する Todo だけ API のレスポンスで置き換え、他はそのまま
    setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, [todos]); // todos に依存: todos.find で最新の配列を参照するため

  // Todo を削除する関数
  // API に DELETE リクエストを送り、成功したら該当 Todo をリストから除去する
  const deleteTodo = useCallback(async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("削除に失敗しました");
    // id が一致しない Todo だけ残す（= 一致する Todo を除去する）
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // フィルター処理: 選択中のフィルターに合わせて todos を絞り込む
  // filter や todos が変わるたびに再計算される（レンダリングのたびに実行）
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;   // 未完了のみ
    if (filter === "completed") return todo.completed; // 完了済みのみ
    return true; // "all" はすべて表示
  });

  // カウント処理: フィルターボタンに表示する件数を計算する
  const counts = {
    all: todos.length,
    active: todos.filter((t) => !t.completed).length,
    completed: todos.filter((t) => t.completed).length,
  };

  // フック利用側（ページコンポーネントなど）に必要な値と関数を返す
  return {
    todos: filteredTodos, // フィルター適用済みの Todo 一覧
    counts,
    isLoading,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
