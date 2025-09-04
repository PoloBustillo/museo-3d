import DropDownSearchBar from "./DropDownSearchBar";
import { useGallery } from "../../providers/GalleryProvider";
import { useState } from "react";
import {SearchIcon, EquisIcon, StarsIcon,ArrowLeftIcon} from "../../public/icons"

export default function SearchBar (){
    const [openDropSearch,setOpenDropSearch] = useState(false);
    const {
        stateFilter,
        dispatchFilter,
    } = useGallery();

    const handleSubmitAtSearchBar = (e) => {
        e.preventDefault();
        setOpenDropSearch(false);
        console.log(stateFilter);
        const newKeyword = e.target.search.value.trim();
        console.log('Current world: ',newKeyword);
        console.log('OG world:',stateFilter.filters.keyWord);
        if (stateFilter.isFilter && !stateFilter.aiActive){
            if (newKeyword != stateFilter.filters.keyWord && newKeyword!= "") {
                console.log('dispatch Set KeyWord');
                dispatchFilter({ type: "SET_KEYWORD", keyWord: newKeyword });
                      console.log(stateFilter);
            }
        }else{
            if (newKeyword != stateFilter.filters.keyWord && newKeyword!= "") {
                console.log('dispatch Set ia KeyWord');
                dispatchFilter({ type: "SET_IA_KEYWORD", keyWord: newKeyword });
                      console.log(stateFilter);
            }
        }

    };

    const handleGetBackAtArrow = () => {
        setOpenDropSearch(false);
        console.log('dispatch Get Back');
        dispatchFilter({ type: "GET_BACK"});
    };

    const handleDisplayIA = () =>{
        setOpenDropSearch(false);
        console.log('dispatch IA');
        dispatchFilter({ type: "SET_IA"});
    };


    return (
        <div className="relative w-full mx-auto">
            <div className= {` flex items-center justify-around bg-zinc-100 dark:bg-white h-16 pl-2  w-full ${openDropSearch ? 'rounded-tr-3xl rounded-tl-4xl':'rounded-4xl '}`}>
{
  stateFilter.status !== "NO_ACTION" && (
    <span
      onClick={handleGetBackAtArrow}
      className="rounded-4xl p-2 border-1 border-stone-950 cursor-pointer"
    >
      <ArrowLeftIcon className="size-5 text-stone-950" />
    </span>
  )
}


                <div 
                    className={`pl-2 pr-4 flex items-center gap-2 h-16  w-full`}    
                >
                        
                    {
                        (!openDropSearch && !stateFilter.isFilter) && (
                            <span>
                            <SearchIcon className={'size-5 text-stone-950'} />
                            </span>
                        )
                    }
                    <form
                    onSubmit={handleSubmitAtSearchBar}
                    className="w-full grow"
                    autoComplete="off"
                    >
                    <input
                        className=" w-full focus:pl-0 text-base text-black focus:border-amber-200 focus:border-b-4 focus:outline-none"
                        type="text"
                        name="search"
                        placeholder="Descubre más obras..."
                        onClick={() => setOpenDropSearch(true)}
                    />
                    </form>

                    {
                        openDropSearch &&
                        <span>
                            <EquisIcon className={'size-8 text-stone-950'} onClick={()=>setOpenDropSearch(false)}/>
                        </span>
                    }
                    {   
                        !openDropSearch &&
                        <span onClick={handleDisplayIA} className="border-stone-950 border-b-2 border-r-2 rounded-4xl p-1">                 
                            <StarsIcon className={'size-7 text-stone-950'}/>
                        </span>

                    }
                </div>
            </div>
            {
                openDropSearch && 
                <DropDownSearchBar/>
            }
        </div>
    );
}