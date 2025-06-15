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
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}
