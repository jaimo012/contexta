"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useAuthStore } from "@/store/useAuthStore";
import AppShell from "@/components/layout/AppShell";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";

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
  const [isAdding, setIsAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState("");
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
      description: "",
    });

    if (error) {
      setDbReady(false);
      alert("단어 추가 실패: Supabase SQL Editor에서 schema.sql을 먼저 실행해 주세요.");
      console.warn("[DICT] 추가 실패:", error.message);
    } else {
      setNewWord("");
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWord("");
  };

  const handleUpdate = async () => {
    if (!editingId || !editWord.trim()) return;

    const { error } = await supabase
      .from("custom_words")
      .update({
        word: editWord.trim(),
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
      <AppShell title="내 사전" showBackButton backHref="/settings">
        <div className="flex min-h-full items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-notion-border border-t-dark animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="내 사전" showBackButton backHref="/settings">
      <div className="mx-auto max-w-[720px] px-6 md:px-12 py-10">
        {!dbReady && (
          <section className="mb-6 animate-fade-in">
            <div className="flex items-start gap-3 rounded-lg border border-[#FFAA00]/30 bg-[#FFAA00]/5 p-4">
              <AlertTriangle className="h-4 w-4 text-[#FFAA00] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-dark">
                  Supabase 데이터베이스 설정이 필요합니다
                </p>
                <p className="text-xs text-notion-text-secondary mt-1 leading-relaxed">
                  Supabase Dashboard &gt; SQL Editor에서{" "}
                  <code className="px-1 py-0.5 bg-notion-bg-hover rounded text-dark font-mono text-[11px]">
                    database/schema.sql
                  </code>{" "}
                  파일을 실행해 주세요.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Add form */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider mb-3">
            새 단어 추가
          </h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="단어 (예: Kubernetes, SLA)"
              className="w-full rounded-md border border-notion-border px-3 py-2 text-sm text-dark placeholder-notion-text-muted outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={isAdding || !newWord.trim()}
              className="self-end inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-mint rounded-md hover:bg-mint-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {isAdding ? "추가 중..." : "추가"}
            </button>
          </div>
        </section>

        {/* Word list */}
        <section>
          <h2 className="text-xs font-semibold text-notion-text-secondary uppercase tracking-wider mb-3">
            등록된 단어 ({words.length}개)
          </h2>

          {words.length === 0 ? (
            <div className="rounded-lg border border-notion-border p-12 text-center">
              <p className="text-sm text-notion-text-muted">
                등록된 단어가 없습니다. 첫 번째 단어를 추가해 보세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {words.map((item) => (
                <div
                  key={item.id}
                  className="group -mx-2 px-2 py-2.5 rounded-md hover:bg-notion-bg-hover transition-colors"
                >
                  {editingId === item.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editWord}
                        onChange={(e) => setEditWord(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                        className="w-full rounded-md border border-mint px-3 py-2 text-sm text-dark outline-none focus:ring-1 focus:ring-mint"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1.5 text-xs font-medium text-notion-text-secondary rounded-md hover:bg-notion-bg-hover transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={!editWord.trim()}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-mint rounded-md hover:bg-mint-dark disabled:opacity-50 transition-colors"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4 min-w-0">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <h3 className="text-sm font-medium text-dark truncate" title={item.word}>
                          {item.word}
                        </h3>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-md p-1.5 text-notion-text-muted hover:bg-notion-border hover:text-notion-text transition-colors"
                          title="수정"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded-md p-1.5 text-notion-text-muted hover:bg-pink-light hover:text-pink transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
