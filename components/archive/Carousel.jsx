import { useState, useRef } from "react";
import ExpandableCard from "./Expandable";
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Carousel({ title, items }) {
  const slideRef = useRef(null);
  const [activeCard, setActiveCard] = useState(null);

  const next = () => {
    const first = slideRef.current.children[0];
    slideRef.current.appendChild(first);
  };

  const prev = () => {
    const last = slideRef.current.children[slideRef.current.children.length - 1];
    slideRef.current.prepend(last);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg bg-gray-100">
      <div className="flex transition-transform duration-500 ease-in-out h-full" ref={slideRef}>
        {items.map((item, i) => (
          <div
            key={i}
            className="min-w-full h-full bg-cover bg-center relative flex items-end"
            style={{ backgroundImage: `url(${item.src})` }}
          >
            <div className="bg-gradient-to-t from-black/70 to-transparent p-6 w-full text-white">
              <div className="text-2xl font-bold mb-2">{item.title}</div>
              <div className="text-sm opacity-90 mb-1">{item.autor}</div>
              <div className="text-sm opacity-90 mb-4">{item.tecnica}</div>
              <button 
                onClick={() => setActiveCard(item)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Ver mas
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 left-4 right-4 flex justify-between items-center -translate-y-1/2">
        <button 
          onClick={prev} 
          className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <button 
          onClick={next} 
          className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      {activeCard && (
        <ExpandableCard card={activeCard} onClose={() => setActiveCard(null)} />
      )}
    </div>
  );
}
