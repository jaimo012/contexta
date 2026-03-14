"use client";

import { useEffect, useCallback, useState } from "react";
import { CLIENT_MODE_SHORTCUT } from "@/constants/config";

export function useClientMode() {
  const [isClientMode, setIsClientMode] = useState(false);

  const toggle = useCallback(() => {
    setIsClientMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === CLIENT_MODE_SHORTCUT) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return { isClientMode, toggle };
}
