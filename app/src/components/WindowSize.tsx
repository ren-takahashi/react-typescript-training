"use client";
import { useState, useEffect } from "react";

export default function WindowSize() {
  const [windowWidth, setWindowWidth] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    // 初期値を設定
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);

    // 【JavaScript】リサイズイベントを監視
    function handleResize() {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    }

    // イベントリスナーを登録
    window.addEventListener("resize", handleResize);

    // 【React】クリーンアップ: イベントリスナーを解除
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <h3>ウィンドウサイズ</h3>
      <p>幅: {windowWidth}px / 高さ: {windowHeight}px</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        ブラウザのウィンドウをリサイズしてみてください
      </p>
    </div>
  );
}