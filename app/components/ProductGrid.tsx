import Image from 'next/image';
import { Product } from '../types/product';
import { useEffect, useRef, useState } from 'react';

interface ProductGridProps {
  products: Product[];
  title: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 8;
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  
  // Get current products
  const indexOfLastProduct = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - ITEMS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page
  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: gridRef.current?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleOpenProductInfo = (productId: number) => {
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
          }, index * 100); // 100ms delay between each item
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
    const maxPagesToShow = 5; // Adjust as needed
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      if (currentPage <= 3) {
        // If current page is near the beginning
        pageNumbers.push(2, 3, 4);
        pageNumbers.push('...');
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages - 1; i++) {
          pageNumbers.push(i);
        }
      } else {
        // If current page is in the middle
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
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
      <div className="flex items-center justify-center h-32 sm:h-48 bg-gray-100 rounded-lg shadow">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mt-2 sm:mt-4 mb-1 sm:mb-2 px-1 sm:px-0">{title}</h2>
        <span className="text-gray-400 text-sm">Không có sản phẩm nào</span>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl sm:text-4xl font-bold text-blue-900 mt-2 sm:mt-4 mb-1 sm:mb-2 px-1 sm:px-0 ">
        {title}
      </h2>
      <div 
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-10"
      >
        {currentProducts.map((product) => (
          <div
            onClick={() => handleOpenProductInfo(product.id)}
            key={product.id}
            className="product-item bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer opacity-0 translate-y-4 transition-all duration-500 ease-out"
            style={{ transitionDelay: '0ms' }}
          >
            <div className="relative h-32 sm:h-48 overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400 text-xs sm:text-sm">Không có hình ảnh</span>
                </div>
              )}
            <div className="absolute top-0 right-0 bg-red-600 text-white px-1 sm:px-2 py-0.5 sm:py-1 m-1 sm:m-2 text-xs font-bold uppercase rounded">
                {(product.discount ?? 0)> 0 ? `-${product.discount}%` : 'Hot'}
            </div>

            </div>
            <div className="p-2 sm:p-4 bg-blue-50 flex flex-col flex-grow hover:bg-orange-300">
              <div className="flex flex-col mb-1 sm:mb-2">
                <h3 className="font-semibold text-sm sm:text-lg text-gray-800 line-clamp-1">{product.name}</h3>
                <span className="text-xs text-blue-800 truncate">{product.category}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2 flex-grow">
                {product.description}
              </p>
              <div className="flex justify-between items-end mt-auto">
                <div className="flex flex-col">
                    {product.discount && product.discount > 0 ? (
                    <>
                        <span className="text-gray-400 text-sm line-through">
                        {product.price.toLocaleString('vi-VN')} đ
                        </span>
                        <div className="flex items-center gap-1">
                        <span className="font-bold text-red-600 text-sm sm:text-lg">
                            {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-[10px] bg-yellow-200 text-yellow-800 font-semibold px-1.5 py-0.5 rounded">
                            -{product.discount}%
                        </span>
                        </div>
                    </>
                    ) : (
                    <span className="font-bold text-red-600 text-sm sm:text-lg">
                        {product.price.toLocaleString('vi-VN')} đ
                    </span>
                    )}
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    Còn {product.quantity}
                </span>
                </div>

              <button
                className="mt-2 sm:mt-3 w-full bg-yellow-300 text-blue-900 hover:bg-yellow-400 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenProductInfo(product.id);
                }}
              >
                Thông tin chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls - only show if there are multiple pages */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 mb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Previous page button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md flex items-center justify-center transition-colors ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            {getPaginationNumbers().map((pageNumber, index) => (
              pageNumber === '...' ? (
                <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500">...</span>
              ) : (
                <button
                  key={`page-${pageNumber}`}
                  onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                  className={`px-2 sm:px-3 py-1 sm:py-2 rounded-md min-w-[30px] sm:min-w-[36px] text-center transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
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
                  : 'text-blue-600 hover:bg-blue-100'
              }`}
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style jsx global>{`
        .product-item {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .product-item.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
};

export default ProductGrid;