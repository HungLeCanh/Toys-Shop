import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Product } from '../types/product';
import ProductGrid from './ProductGrid';

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  // lọc sang các sản phẩm nổi bật
  const featuredProducts = products.filter(product => product.priority >= 3);
  // sắp xếp theo độ ưu tiên cao nhất trước
  featuredProducts.sort((a, b) => b.priority - a.priority);
  // lọc các sản phẩm có giảm giá
  const discountProducts = products.filter(product => product.discount && product.discount > 0);
  // lọc các sản phẩm số lượng bé hơn 10
  const lowStockProducts = featuredProducts.filter(product => product.quantity < 10);


  useEffect(() => {
    const interval = setInterval(() => {
      if (featuredProducts.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  useEffect(() => {
    if (sliderRef.current) {
      const translateValue = currentSlide * -100;
      sliderRef.current.style.transform = `translateX(${translateValue}%)`;
    }
  }, [currentSlide]);

  // THông tin cửa hàng ở đây
  const address = process.env.NEXT_PUBLIC_ADDRESS;
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME;
  const tel = process.env.NEXT_PUBLIC_TEL;
  const email = process.env.NEXT_PUBLIC_EMAIL;
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_LINK;
  if (!address || !tel || !email || !facebookUrl || !shopName) {
    console.log("Chưa nhập địa chỉ ở .env kìa anh ơi")
    return <p>Lỗi không có thông tin</p>
  }
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://www.google.com/maps?q=${encodedAddress}`;
  const shopNameUrl = facebookUrl.split("/").filter(Boolean).pop();
  const messengerLink = `https://m.me/${shopNameUrl}`;



  if (featuredProducts.length === 0) {
    return <div className="text-center p-4">Không có sản phẩm nổi bật nào!</div>;
  }
  


  return (
    <div className=" flex flex-col gap-4 p-2 sm:p-4 ">
      {/* Banner Section - Stacked vertically on mobile, side by side on desktop */}
      <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-md overflow-hidden">
        {/* Slider Image & Info - Full width on mobile */}
        <div className="md:w-1/2 h-full flex flex-col justify-between">
          {/* Slider Image & Info */}
          <div className="relative w-full">
            {featuredProducts.map((product, index) => (
              <div
                key={index}
                className={`featured-product-slide w-full transition-opacity duration-300 cursor-pointer ${
                  currentSlide === index ? 'block' : 'hidden'
                }`}
                onClick={() => window.open(`/product-info?id=${product.id}`, '_blank')}
              >
                {/* Product Image - Reduced height on mobile */}
                <div className="w-full h-64 sm:h-80 bg-white relative flex items-center justify-center rounded-t-xl overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain w-full h-full p-2 sm:p-4"
                    />
                  ) : (
                    <div className="text-gray-500 text-center p-4">
                      Không có hình ảnh các mặt hàng nổi bật
                    </div>
                  )}
                </div>

                {/* Product Info - More compact on mobile */}
                <div className="bg-white shadow-inner rounded-b-xl p-3 flex flex-col gap-1 sm:gap-2">
                  <span className="bg-red-500 to-yellow-400 text-white text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full w-fit">
                    Nổi bật
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1 sm:line-clamp-2">{product.name}</h3>
                  <p className="text-base sm:text-lg font-bold text-primary">
                    {product.price.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <div className="slider-controls flex justify-center items-center gap-1 sm:gap-2 h-4 sm:h-5 my-2">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 border border-gray-400 cursor-pointer ${
                  currentSlide === index ? 'bg-primary scale-125' : 'bg-gray-300'
                }`}
                aria-label={`Chuyển đến sản phẩm ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Store Information - More compact on mobile */}
        <div className="md:w-1/2 flex flex-col p-4 sm:p-6 justify-between bg-blue-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-800 mb-2 sm:mb-4">{shopName}</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-6">Chào mừng quý khách đến với {shopName} - nơi cung cấp đồ chơi chất lượng cao với giá cả phải chăng.</p>
            
            <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-blue-800">Địa chỉ</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-blue-800">Điện thoại / Zalo</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{tel}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg text-white mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-blue-800">Email</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{email}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex gap-2 mb-3 sm:mb-4">
              <a href={messengerLink} className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors flex-1 text-center font-medium">Liên hệ Messenger</a>
              <a href={mapUrl} className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm transition-colors flex-1 text-center font-medium">Xem bản đồ</a>
            </div>
            
            <div className="flex justify-center space-x-3">
              {/* facebook link */}
              <a href={facebookUrl} className="text-blue-600 flex hover:text-blue-800">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
                {shopName}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sử dụng ProductGrid component cho Sản phẩm nổi bật */}
      <ProductGrid 
        products={featuredProducts} 
        title="Sản phẩm nổi bật" 
      />

      {/* Sử dụng ProductGrid component cho Sản phẩm giảm giá */}
      <ProductGrid 
        products={discountProducts} 
        title="Sản phẩm giảm giá"
      />

      {/* Sử dụng ProductGrid component cho Sản phẩm bán chạy nhất tháng */}
      <ProductGrid 
        products={lowStockProducts} 
        title="Sản phẩm bán chạy nhất tháng" 
      />
    </div>
  );
};

export default FeaturedProducts;