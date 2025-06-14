"use client";
import { useState } from "react";

export default function SearchBar({ onChange }) {
  const [searchText, setSearchText] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    onChange?.(value); // Llama a la función que recibe el texto
  };

  return (
    <input
      type="text"
      placeholder="Buscar..."
      value={searchText}
      onChange={handleChange}
      className="w-full max-w-md px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  );
}
