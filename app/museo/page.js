import GalleryRoom from "../components/GalleryRoom.jsx";

export default function MuseoPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
      }}
    >
      <GalleryRoom />
    </div>
  );
}
