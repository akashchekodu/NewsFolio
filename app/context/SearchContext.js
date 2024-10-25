"use client";
// context/SearchContext.js
import { createContext, useContext, useEffect, useState } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
