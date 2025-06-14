
import { RowsPhotoAlbum } from "react-photo-album";
import "react-photo-album/rows.css";


export default function Gallery({photos}) {
 
  return (

      <RowsPhotoAlbum
        photos={photos}
        layout="rows"
      />

    
  );
}
