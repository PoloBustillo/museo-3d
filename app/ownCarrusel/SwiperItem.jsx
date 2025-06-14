import { Swiper, SwiperSlide } from 'swiper/react';
export default function SwiperItem ({title,img, description,categories}){
    return(
        <SwiperSlide>
            <img src={img} alt={title} className="img" />
            <div className="title">
                <h1>{title}</h1>
            </div>
            <div className="content">
                <div className="text-box">
                    <p>{description}</p>
                </div>
                <div className="footer">
                    <div className="category">
                    {categories.map((cat, i) => (
                        <span key={i} style={{ "--i": i + 1 }}>{cat}</span>
                    ))}
                    </div>
                    <button>
                    <span className="label">More...</span>
                    </button>
                </div>
                </div>
        </SwiperSlide>
    );
}