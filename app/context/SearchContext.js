"use client";
// context/SearchContext.js
import { createContext, useContext, useEffect, useState } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");

  return (
    <SearchContext.Provider
      value={{ searchTerm, setSearchTerm, setSearch, search }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
