"use client";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useEffect, useRef } from 'react';
import './OwnCarrusel.css';


const slidesData = [
  {
    title: "Switzerland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    imgSrc: "https://i.ibb.co/qCkd9jS/img1.jpg",
    categories: ['Bob', 'Nature']
  },
  {
    title: "Italy",
    description: "Dolor sit amet consectetur elit.",
    imgSrc: "https://i.ibb.co/qCkd9jS/img1.jpg",
    categories: ['Alice', 'Travel']
  },
  {
    title: "Norway",
    description: "Eum fugiat sapiente ratione suscipit!",
    imgSrc: "https://i.ibb.co/qCkd9jS/img1.jpg",
    categories: ['Mountains', 'Winter']
  },
   {
    title: "Switzerland",
    description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab, eum!",
    imgSrc: "https://i.ibb.co/qCkd9jS/img1.jpg",
    categories: ['Bob', 'Nature']
  },
  {
    title: "Italy",
    description: "Dolor sit amet consectetur elit.",
    imgSrc: "https://i.ibb.co/qCkd9jS/img1.jpg",
    categories: ['Alice', 'Travel']
  },
  {
    title: "Norway",
    description: "Eum fugiat sapiente ratione suscipit!",
    imgSrc: "https://i.ibb.co/qCkd9jS/img1.jpg",
    categories: ['Mountains', 'Winter']
  },
];

export default function Slides() {
  const swiperWrappedRef = useRef(null);

  function adjustMargin() {
    const screenWidth = window.innerWidth;
    if (swiperWrappedRef.current) {
      swiperWrappedRef.current.style.marginLeft =
        screenWidth <= 520
          ? "0px"
          : screenWidth <= 650
          ? "-50px"
          : screenWidth <= 800
          ? "-100px"
          : "-150px";
    }
  }



  return (
    <div className="main">
      <div className="container">
        <Swiper
        
          modules={[Pagination]}
          grabCursor
          initialSlide={1}
          centeredSlides
          slidesPerView='auto'
          pagination={{ clickable: true }}
          breakpoints={{
            320: { spaceBetween: 40 },
            650: { spaceBetween: 30 },
            1000: { spaceBetween: 20 },
          }}
          onSwiper={(swiper) => {
            swiperWrappedRef.current = swiper.wrapperEl;
          }}
        >
          {slidesData.map((slide, index) => (
            <SwiperSlide key={index}>
              <img className="img" src={slide.imgSrc} alt={slide.title} />
              <div className="title">
                <h1>{slide.title}</h1>
              </div>
              <div className="content">
                <div className="text-box">
                  <p>{slide.description}</p>
                </div>
                <div className="footer">
                  <div className="category">
                    {slide.categories.map((cat, i) => (
                      <span key={i} style={{ "--i": i + 1 }}>{cat}</span>
                    ))}
                  </div>
                  <button>
                    <span className="label">More...</span>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
