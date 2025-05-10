import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Gift, Star } from "lucide-react";
import { Product } from '../types/product';
import Image from "next/image";

enum Tab {
  Home = 'home',
  Featured = 'featured',
  All = 'all'
}

interface HomeProps {
  products: Product[];
  handleTabChange: (tab: Tab) => void;
}

const Home: React.FC<HomeProps> = ({ products, handleTabChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Get products with highest priority or discount
    const sorted = [...products]
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 8);
    setDisplayProducts(sorted.slice(0, 4));
  }, [products]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide]);


  const carouselItems = [
    {
      url: "/theme4.webp",
      title: "Giảm giá đến 50%",
      description: "Ưu đãi đặc biệt cho tất cả đồ chơi giáo dục",
      buttonText: "Xem ngay",
      bgColor: "bg-purple-100",
    },
    {
      url: "/theme5.jpg",
      title: "Đồ chơi chất lượng cao",
      description: "An toàn và bền bỉ cho bé yêu của bạn",
      buttonText: "Xem ngay",
      bgColor: "bg-green-100",
    },
    {
      url: "/theme4.webp",
      title: "Freeship nội thành",
      description: "Miễn phí giao hàng cho mọi đơn hàng từ 300k",
      buttonText: "Xem ngay",
      bgColor: "bg-yellow-100",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };



  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8">
      {/* Hero Carousel */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg shadow-lg mb-8 sm:mb-12">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {carouselItems.map((item, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-full h-full ${item.bgColor} flex relative`}
            >
              {/* Full width image with gradient overlay on mobile */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  fill 
                  src={item.url}
                  alt="Toy showcase" 
                  className="object-cover md:object-contain md:object-left z-0"
                />
                {/* Gradient overlay for mobile - visible only on small screens */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent md:hidden"></div>
              </div>

              {/* Desktop layout - row based, hidden on mobile */}
              <div className="hidden md:flex md:flex-row md:w-full md:h-full md:items-center md:justify-between md:relative">
                {/* Image container for desktop - takes half width */}
                <div className="md:w-1/2 md:h-full md:flex md:items-start md:justify-start md:relative">
                  {/* Image is handled by the full width background on desktop */}
                </div>
                
                {/* Text content for desktop - right side */}
                <div className="md:w-1/2 md:text-left md:p-4 md:relative md:z-10">
                  <h2 className="md:text-4xl font-bold text-purple-800 md:mb-3">
                    {item.title}
                  </h2>
                  <p className="md:text-lg text-gray-700 md:mb-6">
                    {item.description}
                  </p>
                  <button className="z-10 bg-pink-500 hover:bg-pink-600 text-white md:px-8 md:py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer md:text-base"
                          onClick={() => {
                            handleTabChange(Tab.Featured);
                          }}>
                    {item.buttonText}
                  </button>
                </div>
              </div>

              {/* Mobile layout - overlay text on image, hidden on desktop */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 pb-12 text-center md:hidden">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                  {item.title}
                </h2>
                <p className="text-sm sm:text-base text-white mb-3 sm:mb-6">
                  {item.description}
                </p>
                <button className="z-10 bg-pink-500 hover:bg-pink-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer text-sm sm:text-base"
                        onClick={() => {
                          handleTabChange(Tab.Featured);
                        }}>
                  {item.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 sm:p-2 rounded-full shadow-md z-20"
        >
          <ChevronLeft className="text-gray-800 w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white p-1 sm:p-2 rounded-full shadow-md z-20"
        >
          <ChevronRight className="text-gray-800 w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Dots indicators */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                index === currentSlide ? "bg-pink-500" : "bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="w-full px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl text-black font-bold">Sản phẩm nổi bật</h2>
        <button 
          className="text-blue-600 hover:underline"
          onClick={() => {
            handleTabChange(Tab.All);
          }}
        >
          Xem tất cả
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
            {/* Image container with padding to create space for rounded frame */}
            <div className="p-3">
              {/* Rounded image container with fixed aspect ratio */}
              <div className="relative w-full pt-[100%] rounded-lg overflow-hidden">
                {product.image ? (
                  <Image
                    fill
                    src={product.image}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                {product.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                    -{product.discount}%
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-lg text-black font-semibold mb-2 line-clamp-2 h-14">{product.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2 h-12">{product.description}</p>
              
              <div className="mt-auto">
                <div className="flex items-center gap-2 mb-3">
                  {product.discount ? (
                    <>
                      <span className="text-red-600 font-bold">
                        {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()}đ
                      </span>
                      <span className="text-gray-500 line-through text-sm">
                        {product.price.toLocaleString()}đ
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-800 font-bold">
                      {product.price.toLocaleString()}đ
                    </span>
                  )}
                </div>
                <button
                  className="w-full bg-cyan-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
                  onClick={() => {
                    handleTabChange(Tab.All);
                  }}
                >
                  Xem thêm
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination removed as requested */}
    </div>

      {/* Categories showcase */}
      <div className="mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
          Khám phá danh mục
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative h-60 sm:h-70 md:h-80 bg-pink-100 rounded-lg overflow-hidden group">
            <Image
              fill
              src="/educational-toy.webp"
              alt="Educational toys"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 to-transparent flex items-end p-4 sm:p-6">
              <div>
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Đồ chơi giáo dục</h3>
                <button className="bg-white text-pink-700 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-medium text-xs sm:text-sm"
                onClick={() => {
                  handleTabChange(Tab.All);
                }}>
                  Khám phá ngay
                </button>
              </div>
            </div>
          </div>
          <div className="relative h-60 sm:h-70 md:h-80 bg-purple-100 rounded-lg overflow-hidden group">
            <Image
              fill
              src="/outdoor-toy.jpg"
              alt="Outdoor toys"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent flex items-end p-4 sm:p-6">
              <div>
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Đồ chơi vận động</h3>
                <button className="bg-white text-purple-700 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-medium text-xs sm:text-sm"
                onClick={() => {
                  handleTabChange(Tab.All);
                }}>
                  Khám phá ngay
                </button>
              </div>
            </div>
          </div>
          <div className="relative h-60 sm:h-70 md:h-80 bg-green-100 rounded-lg overflow-hidden group sm:col-span-2 md:col-span-1">
            <Image
              fill
              src="/creative-toy.webp"
              alt="Creative toys"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent flex items-end p-4 sm:p-6">
              <div>
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Đồ chơi sáng tạo</h3>
                <button className="bg-white text-green-700 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-medium text-xs sm:text-sm"
                onClick={() => {
                  handleTabChange(Tab.All);
                }}>
                  Khám phá ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Benefits Section */}
      <div className="bg-purple-50 rounded-lg p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8 md:mb-10">
          Tại sao chọn Shop ABC?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-pink-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <ShieldCheck size={20} className="text-pink-500 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="font-semibold text-base text-black sm:text-lg mb-1 sm:mb-2">An toàn & Chất lượng</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Đồ chơi của chúng tôi được kiểm định nghiêm ngặt, đảm bảo an toàn cho trẻ
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Truck size={20} className="text-purple-500 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="font-semibold text-base text-black sm:text-lg mb-1 sm:mb-2">Giao hàng nhanh chóng</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Freeship cho đơn hàng nội thành và giao hàng toàn quốc
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Gift size={20} className="text-green-500 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="font-semibold text-base text-black sm:text-lg mb-1 sm:mb-2">Quà tặng hấp dẫn</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Nhiều ưu đãi và quà tặng đặc biệt khi mua sắm tại cửa hàng
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md text-center">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Star size={20} className="text-yellow-500 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="font-semibold text-base text-black sm:text-lg mb-1 sm:mb-2">Đa dạng sản phẩm</h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Hàng nghìn mặt hàng đồ chơi phù hợp mọi lứa tuổi và sở thích
            </p>
          </div>
        </div>
      </div>





      {/* Testimonials */}
      <div className="bg-purple-50 rounded-lg p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Khách hàng nói gì về chúng tôi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-full mr-3 sm:mr-4"></div>
              <div>
                <h4 className="font-semibold text-sm text-black sm:text-base">Nguyễn Thanh Hà</h4>
                <div className="flex text-yellow-400">
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 italic text-xs sm:text-sm md:text-base">
            &quot;Đồ chơi chất lượng cao, an toàn cho bé. Dịch vụ giao hàng nhanh và thái độ
              phục vụ rất tốt. Sẽ tiếp tục ủng hộ shop!&quot;
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full mr-3 sm:mr-4"></div>
              <div>
                <h4 className="font-semibold text-sm text-black sm:text-base">Trần Minh Tuấn</h4>
                <div className="flex text-yellow-400">
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 italic text-xs sm:text-sm md:text-base">
            &quot;Con tôi rất thích những món đồ chơi giáo dục từ cửa hàng. Chúng vừa giúp con
              học hỏi vừa mang lại niềm vui. Tuyệt vời!&quot;
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full mr-3 sm:mr-4"></div>
              <div>
                <h4 className="font-semibold text-sm text-black sm:text-base">Phạm Thu Trang</h4>
                <div className="flex text-yellow-400">
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                  <Star size={12} className="sm:w-4 sm:h-4" fill="currentColor" />
                </div>
              </div>
            </div>
            <p className="text-gray-600 italic text-xs sm:text-sm md:text-base">
            &quot;Đa dạng mẫu mã, giá cả hợp lý và chương trình khuyến mãi thường xuyên. Đặc biệt
              ấn tượng với dịch vụ bảo hành chu đáo.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;