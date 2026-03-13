"use client";

import { useState, useEffect } from "react";

const KEY = "fayth-premium";

export const FREE_GAME = "gonogo" as const;

export function isPremium(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setPremium(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(KEY, "true");
    } else {
      localStorage.removeItem(KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

export function usePremium(): [boolean, (v: boolean) => void] {
  const [premium, _setPremium] = useState(false);

  useEffect(() => {
    _setPremium(isPremium());
  }, []);

  const toggle = (v: boolean) => {
    setPremium(v);
    _setPremium(v);
  };

  return [premium, toggle];
}
