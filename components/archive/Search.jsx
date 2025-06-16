"use client";
import styles from './Gallery.module.css';
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
      className={styles.search}

    />
  );
}
