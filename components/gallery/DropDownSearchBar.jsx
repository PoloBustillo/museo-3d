import { useGallery, useRef } from "../../providers/GalleryProvider";

function CategoryBubble({imgSrc,name}){
    return(
        <div className="flex  items-center gap-1 rounded-2xl bg-gray-400/10 hover:bg-gray-300 overflow-hidden pr-3" >
            <img src={imgSrc} alt={name} className="object-fill w-28 h-full" />
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
    console.log(roomsToShow.length,hasLoadedRoomsRef.current );

  return (
    <div className="pl-6 absolute top-full left-0 bg-white pb-4 w-full rounded-br-3xl rounded-bl-3xl shadow-lg">
      <div className=" pr-6 overflow-y-scroll">
        <span className="text-sm font-semibold text-black text-b">Búsqueda por Salas</span>
       
        <div className="flex flex-wrap gap-2 pt-3">
            {
                roomsToShow.length > 0 && hasLoadedRoomsRef.current 
                && (
                    roomsToShow.map(room =>(
                        <CategoryBubble 
                            key={room.id}
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