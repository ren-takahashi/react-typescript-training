"use client";
// 【React】カスタム Hook: 真偽値を切り替える
import { useState, useCallback } from "react";

// 【TypeScript】戻り値の型を明示
type UseToggleReturn = {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
};

export function useToggle(initialValue: boolean = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);

  // 【React】useCallback で関数をメモ化
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}