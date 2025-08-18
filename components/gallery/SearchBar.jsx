import DropDownSearchBar from "./DropDownSearchBar";
import { useState } from "react";

export default function SearchBar (){
    const [openDropSearch,setOpenDropSearch] = useState(false);
    
    return (
        <div className="relative w-11/12 mx-auto">
            <div 
              className={`pl-6 pr-4 flex items-center bg-white gap-2 h-16 w-full
                ${openDropSearch ? 'rounded-tr-4xl rounded-tl-4xl':'rounded-4xl '}`}    
            >
                {
                    !openDropSearch &&
                    <svg className="size-6 m-0">    
                        <use href="/assets/sprite.svg#icon-search" />
                    </svg>
                }
                <input 
                className="  grow-2 text-base  text-black focus:border-amber-200  focus:border-b-4 focus:outline-none" 
                type="text" 
                placeholder="Descubre mas obras..."
                onClick={()=>setOpenDropSearch(true)}
                />
                {
                    openDropSearch &&
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-black size-7" viewBox="0 0 16 16" 
                        onClick={()=>setOpenDropSearch((prev)=>!prev)}>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                }
                {   
                    !openDropSearch &&
                    <div>                
                     <button className="bg-black size-12 p-2">Hola</button>
                    </div>

                }
               
            </div>
            {
                openDropSearch && 
                <DropDownSearchBar/>
            }
            

        </div>

    );

}