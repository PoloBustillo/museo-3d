"use client";
import { useEffect, useState } from "react";
import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";

export default function Gallery({photos}) {
 
  return (
    <ColumnsPhotoAlbum
      photos={photos}
      layout="columns"
    />
  );
}
