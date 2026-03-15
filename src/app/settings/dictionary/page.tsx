"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";

interface CustomWord {
  id: string;
  word: string;
  description: string;
  created_at: string;
}

export default function DictionaryPage() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [words, setWords] = useState<CustomWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [dbReady, setDbReady] = useState(true);

  const fetchWords = useCallback(async () => {
    const { data, error } = await supabase
      .from("custom_words")
      .select("id, word, description, created_at")
      .order("created_at", { ascending: false });
    if (error) { setDbReady(false); return; }
    if (data) setWords(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchWords();
  }, [user, fetchWords]);

  const handleAdd = async () => {
    if (!newWord.trim() || !user) return;
    setIsAdding(true);

    const { error } = await supabase.from("custom_words").insert({
      user_id: user.id,
      word: newWord.trim(),
      description: newDescription.trim(),
    });

    if (error) {
      setDbReady(false);
      alert("단어 추가 실패: Supabase SQL Editor에서 schema.sql을 먼저 실행해 주세요.");
      console.warn("[DICT] 추가 실패:", error.message);
    } else {
      setNewWord("");
      setNewDescription("");
      await fetchWords();
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 단어를 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("custom_words")
      .delete()
      .eq("id", id);

    if (error) {
      alert("삭제 실패: DB 연결을 확인해 주세요.");
      console.warn("[DICT] 삭제 실패:", error.message);
    } else {
      await fetchWords();
    }
  };

  const startEdit = (item: CustomWord) => {
    setEditingId(item.id);
    setEditWord(item.word);
    setEditDescription(item.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWord("");
    setEditDescription("");
  };

  const handleUpdate = async () => {
    if (!editingId || !editWord.trim()) return;

    const { error } = await supabase
      .from("custom_words")
      .update({
        word: editWord.trim(),
        description: editDescription.trim(),
      })
      .eq("id", editingId);

    if (error) {
      alert("수정 실패: DB 연결을 확인해 주세요.");
      console.warn("[DICT] 수정 실패:", error.message);
    } else {
      cancelEdit();
      await fetchWords();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6 md:px-10">
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← 대시보드
        </Link>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          내 영업 사전 관리
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {!dbReady && (
          <section className="mb-6">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-5">
              <h3 className="text-sm font-bold text-amber-800 mb-1">
                ⚠️ Supabase 데이터베이스 설정이 필요합니다
              </h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                단어 사전 기능을 사용하려면 Supabase Dashboard &gt; SQL Editor에서{" "}
                <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-900 font-mono">
                  database/schema.sql
                </code>{" "}
                파일을 실행해 주세요.
              </p>
            </div>
          </section>
        )}

        {/* 단어 추가 폼 */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            새 단어 추가하기
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="단어 (예: Kubernetes, SLA)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="설명 (예: 컨테이너 오케스트레이션 시스템)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              disabled={isAdding || !newWord.trim()}
              className="self-end px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAdding ? "추가 중..." : "단어 추가"}
            </button>
          </div>
        </section>

        {/* 단어 리스트 */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            등록된 단어 ({words.length}개)
          </h2>

          {words.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-400 text-sm">
                등록된 단어가 없습니다. 위 폼에서 첫 번째 단어를 추가해 보세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {words.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-4"
                >
                  {editingId === item.id ? (
                    /* 수정 모드 */
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editWord}
                        onChange={(e) => setEditWord(e.target.value)}
                        className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                        className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm text-gray-900 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={!editWord.trim()}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 읽기 모드 */
                    <div className="flex items-start justify-between gap-4 min-w-0">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h3 className="text-sm font-semibold text-gray-900 truncate" title={item.word}>
                          {item.word}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 break-words" title={item.description}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="px-2.5 py-1 text-xs font-medium text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 text-xs font-medium text-red-400 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
