import Image from 'next/image';
import { Product } from '../types/product';
import { useEffect, useRef, useState } from 'react';

interface ProductGridProps {
  products: Product[];
  title: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  // Thiết lập ITEMS_PER_PAGE theo kích thước màn hình
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(products.length / itemsPerPage));
  
  // Get current products
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Theo dõi kích thước màn hình và điều chỉnh số lượng sản phẩm
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) { // Mobile
        setItemsPerPage(4);
      } else if (width < 1024) { // Tablet
        setItemsPerPage(6);
      } else { // Desktop
        setItemsPerPage(8);
      }
    };

    // Khởi tạo ban đầu
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cập nhật tổng số trang khi itemsPerPage thay đổi
  useEffect(() => {
    setTotalPages(Math.ceil(products.length / itemsPerPage));
    // Reset về trang 1 khi thay đổi số lượng hiển thị
    setCurrentPage(1);
  }, [itemsPerPage, products.length]);

  // Change page
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    
    // Cuộn mượt đến đầu grid với offset nhỏ hơn để người dùng thấy tiêu đề
    const offsetTop = gridRef.current?.offsetTop || 0;
    const headerHeight = 60; // Chiều cao ước tính của header
    window.scrollTo({ 
      top: Math.max(0, offsetTop - headerHeight), 
      behavior: 'smooth' 
    });
  };

  const handleOpenProductInfo = (productId: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    window.open(`/product-info?id=${productId}`, '_blank');
  };

  useEffect(() => {
    // Function to check if an element is in viewport
    const isInViewport = (element: Element) => {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85
      );
    };

    // Function to handle scroll and show elements
    const handleScroll = () => {
      if (!gridRef.current) return;
      
      const items = gridRef.current.querySelectorAll('.product-item');
      
      items.forEach((item, index) => {
        if (isInViewport(item)) {
          // Add a staggered delay based on the item's position
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 50); // Giảm delay xuống còn 50ms để tạo hiệu ứng mượt hơn
        }
      });
    };

    // Initial check on mount
    handleScroll();

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  // Generate page numbers array for pagination
  const getPaginationNumbers = () => {
    const pageNumbers = [];
    const isMobile = window.innerWidth < 640;
    const maxPagesToShow = isMobile ? 3 : 5; // Hiển thị ít trang hơn trên mobile
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      if (currentPage <= 2) {
        // If current page is near the beginning
        pageNumbers.push(2);
        if (!isMobile) pageNumbers.push(3);
        pageNumbers.push('...');
      } else if (currentPage >= totalPages - 1) {
        // If current page is near the end
        pageNumbers.push('...');
        if (!isMobile && totalPages > 3) pageNumbers.push(totalPages - 2);
        pageNumbers.push(totalPages - 1);
      } else {
        // If current page is in the middle
        pageNumbers.push('...');
        pageNumbers.push(currentPage);
        if (!isMobile) {
          if (currentPage + 1 < totalPages) pageNumbers.push(currentPage + 1);
        }
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 sm:h-48 bg-gray-100 rounded-lg shadow mx-2 sm:mx-0">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mt-2 sm:mt-4 mb-1 sm:mb-2 px-1 sm:px-0">{title}</h2>
        <span className="text-gray-400 text-sm">Không có sản phẩm nào</span>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-0 pb-4 sm:pb-8">
      <h2 className="text-xl sm:text-3xl font-bold text-red-600 mt-4 sm:mt-6 mb-3 sm:mb-4">
        {title}
      </h2>
      <div 
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-10"
      >
        {currentProducts.map((product) => (
          <div
            onClick={() => handleOpenProductInfo(product.id)}
            key={product.id}
            className="product-item bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-200 group flex flex-col h-full cursor-pointer opacity-0 translate-y-4"
          >
            <div className="relative h-36 sm:h-48 overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 25vw"
                  className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400 text-xs sm:text-sm">Không có hình ảnh</span>
                </div>
              )}
              {/* Discount badge hoặc tag "Hot" */}
              {(product.discount && product.discount > 0) ? (
                <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 m-2 text-xs font-bold uppercase rounded">
                  -{product.discount}%
                </div>
              ) : (
                <div className="absolute top-0 right-0 bg-orange-500 text-white px-2 py-1 m-2 text-xs font-bold uppercase rounded">
                  Hot
                </div>
              )}
            </div>
            
            <div className="p-3 sm:p-4 bg-blue-50 flex flex-col flex-grow group-hover:bg-orange-50 transition-colors duration-200">
              <div className="flex flex-col mb-1 sm:mb-2">
                <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 line-clamp-2">{product.name}</h3>
                <span className="text-xs sm:text-sm text-blue-800 truncate">{product.category}</span>
              </div>
              
              {/* Hide description on small screens to save space */}
              <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 flex-grow">
                {product.description}
              </p>
              
              <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-col">
                  {product.discount && product.discount > 0 ? (
                    <>
                      <span className="text-gray-400 text-xs sm:text-sm line-through">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-red-600 text-sm sm:text-base md:text-lg">
                          {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] bg-yellow-200 text-yellow-800 font-semibold px-1 py-0.5 rounded hidden sm:inline-block">
                          -{product.discount}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="font-bold text-red-600 text-sm sm:text-base md:text-lg">
                      {product.price.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                </div>
                
                <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  Còn {product.quantity}
                </span>
              </div>

              <button
                className="mt-2 sm:mt-3 w-full bg-yellow-300 text-blue-900 hover:bg-yellow-400 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                onClick={(e) => handleOpenProductInfo(product.id, e)}
                aria-label={`Xem chi tiết ${product.name}`}
              >
                Thông tin chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls - responsive design */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 mb-6 sm:mb-8">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Previous page button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'
              }`}
              aria-label="Trang trước"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {getPaginationNumbers().map((pageNumber, index) => (
              pageNumber === '...' ? (
                <span key={`ellipsis-${index}`} className="px-1 sm:px-2 py-1 sm:py-2 text-gray-500">...</span>
              ) : (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md min-w-[32px] sm:min-w-[36px] text-center transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                  }`}
                  aria-label={`Trang ${pageNumber}`}
                >
                  {pageNumber}
                </button>
              )
            ))}
            
            {/* Next page button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md flex items-center justify-center transition-colors ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:bg-blue-100 active:bg-blue-200'
              }`}
              aria-label="Trang sau"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom page information - helpful on mobile */}
      {totalPages > 1 && (
        <div className="text-center text-xs sm:text-sm text-gray-500 mb-4">
          Trang {currentPage} / {totalPages}
        </div>
      )}

      {/* CSS for animation */}
      <style jsx global>{`
        .product-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out, box-shadow 0.2s ease;
        }
        
        .product-item.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Cải thiện hiệu ứng chạm trên thiết bị di động */
        @media (max-width: 640px) {
          .product-item:active {
            transform: scale(0.98);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;