"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type BreadcrumbContextType = {
  titles: Record<string, string>;
  setBreadcrumbTitle: (id: string, title: string) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  titles: {},
  setBreadcrumbTitle: () => {},
});

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [titles, setTitles] = useState<Record<string, string>>({});

  const setBreadcrumbTitle = (id: string, title: string) => {
    setTitles((prev) => {
      if (prev[id] === title) return prev;
      return { ...prev, [id]: title };
    });
  };

  return (
    <BreadcrumbContext.Provider value={{ titles, setBreadcrumbTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  return useContext(BreadcrumbContext);
}

export function BreadcrumbSetter({ id, title }: { id: string; title: string }) {
  const { setBreadcrumbTitle } = useBreadcrumb();

  useEffect(() => {
    if (id && title) {
      setBreadcrumbTitle(id, title);
    }
  }, [id, title, setBreadcrumbTitle]);

  return null;
}
