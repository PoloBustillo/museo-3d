import MuralCard from "./MuralCard";

export default function MuralesList({
  murales,
  onMuralClick,
  onLike,
  likedMurales,
  view = "grid",
  onARClick,
  lastItemRef,
}) {
  return (
    <div
      className={
        view === "list"
          ? "flex flex-col gap-4"
          : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      }
    >
      {murales.map((mural, idx) => {
        const isLast = idx === murales.length - 1;
        return (
          <MuralCard
            key={mural.id}
            mural={mural}
            onClick={() => onMuralClick(mural)}
            onLike={() => onLike(mural)}
            isLiked={likedMurales?.includes(mural.id)}
            view={view}
            onARClick={onARClick}
            ref={isLast && lastItemRef ? lastItemRef : undefined}
          />
        );
      })}
    </div>
  );
}
