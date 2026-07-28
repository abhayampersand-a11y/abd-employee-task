"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";

export function Providers({ children }: { children: ReactNode }) {
  // Lazy initialiser: one store per browser session, created on first render
  // and never shared between server requests.
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
