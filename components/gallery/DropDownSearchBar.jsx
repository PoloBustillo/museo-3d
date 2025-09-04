import { useGallery } from "../../providers/GalleryProvider";

function CategoryBubble({id,name,imgSrc}){
    const {
        stateFilter,
        dispatchFilter,

    } = useGallery();

    const handleSearchRoom = () => {
        if (id != stateFilter.filters.room) {
            dispatchFilter({ type: "SET_SALA", salaId: id });
        }
    };

    return(
        <div className="flex  grow items-center gap-1 rounded-2xl bg-gray-900/10 hover:bg-gray-300 overflow-hidden pr-2" 
            onClick={handleSearchRoom}
        >
            <img src={imgSrc} alt={name} className="object-cover w-28 h-24" />
            <span className="text-black  text-sm font-normal ">
                {name}
            </span>
        </div>
        
    );
}
export default function DropDownSearchBar() {
    const {
        hasLoadedRoomsRef ,
        roomsToShow,
    } = useGallery();
    
  return (
    <div className="pl-6 absolute top-full left-0 bg-white pb-4 w-full rounded-br-3xl rounded-bl-3xl shadow-lg">
      <div className=" pr-3 overflow-y-scroll">
        <span className="text-sm font-semibold text-black text-b">Búsqueda por Salas</span>
       
        <div className="flex flex-wrap gap-2 pt-3">
            {
                roomsToShow.length > 0 && hasLoadedRoomsRef.current 
                && (
                    
                    roomsToShow.map(room =>(
                        <CategoryBubble 
                            key={room.id}
                            id={room.id}
                            name={room.name}
                            imgSrc={room.img}
                        />
                    ))
                )
            }
        </div>
      </div>
    </div>
  );
}