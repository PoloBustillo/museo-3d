import { ColumnsPhotoAlbum } from "react-photo-album";
import "react-photo-album/columns.css";

const photos = [
  { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 800, height: 600 },
  { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 900, height: 900 },
    { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 800, height: 600 },
  { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 1600, height: 900 },
    { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 800, height: 600 },
  { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 1600, height: 900 },
    { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 800, height: 600 },
  { src: "https://i.ibb.co/qCkd9jS/img1.jpg", width: 1600, height: 900 },

];

export default function Gallery() {
  return <ColumnsPhotoAlbum photos={photos} />;
}