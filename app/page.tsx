'use client'

import React, { useEffect, useState, useRef } from 'react';
import FeaturedProducts from './components/FeaturedProducts';
import AllProducts from './components/AllProducts';
import Home from './components/Home';
import { Product } from './types/product';
import { Search, X} from 'lucide-react';
import Image from 'next/image';
import ContactButton from './components/ContactButton';

enum Tab {
  Home = 'home',
  Featured = 'featured',
  All = 'all'
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [mobileSearchActive, setMobileSearchActive] = useState<boolean>(false);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Tự động cuộn lên đầu trang khi đổi tab
  useEffect(() => {
    const handleTabChange = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    handleTabChange();
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false); // cuộn xuống -> ẩn
      } else {
        setShowHeader(true); // cuộn lên -> hiện
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/all');
        
        if (!response.ok) {
          throw new Error('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        }
        
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải sản phẩm');
        console.error('Lỗi khi tải sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      const lowercasedSearch = searchTerm.toLowerCase();
      const results = products.filter(product => 
        product.name.toLowerCase().includes(lowercasedSearch) || 
        (product.description && product.description.toLowerCase().includes(lowercasedSearch)) ||
        (product.category && product.category.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredProducts(results);
      setShowSearchResults(true);
    } else {
      setFilteredProducts(products);
      setShowSearchResults(false);
    }
  }, [searchTerm, products]);
  
  // Xử lý click bên ngoài kết quả tìm kiếm
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

    // THông tin cửa hàng ở đây
    const shopName = process.env.NEXT_PUBLIC_SHOP_NAME;
    const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_LINK;
    const tel = process.env.NEXT_PUBLIC_TEL;
    if (!facebookUrl || !shopName) {
      console.log("Chưa nhập địa chỉ ở .env kìa anh ơi")
      return <p>Lỗi không có thông tin</p>
    }
    const shopNameUrl = facebookUrl.split("/").filter(Boolean).pop();
    const messengerLink = `https://m.me/${shopNameUrl}`;
    const zaloLink = `https://zalo.me/${tel}`;

  


  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== '') {
      setShowSearchResults(true);
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const handleSelectProduct = (product: Product) => {
    // Xử lý khi người dùng chọn một sản phẩm từ kết quả tìm kiếm
    window.open(`/product-info?id=${product.id}`, '_blank');
    setShowSearchResults(false);
    setMobileSearchActive(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchActive(!mobileSearchActive);
    // Khi bật tìm kiếm, focus vào input
    if (!mobileSearchActive && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-yellow-50">
      {/* Header */}
      <header
        className={`bg-blue-100 flex items-center fixed top-0 left-0 w-full z-40 shadow-md h-[110px] md:h-[80px] transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          {/* Desktop Header */}
          <div className="hidden md:flex md:flex-row items-center justify-between p-4 gap-4">
            <h1 className="text-3xl font-bold text-blue-700">{shopName}</h1>
            
            {/* Ô tìm kiếm */}
            <div className="relative w-full md:w-1/3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full text-black pl-10 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              {searchTerm && (
                <button 
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
              
              {/* Kết quả tìm kiếm xổ xuống */}
              {showSearchResults && searchTerm.trim() !== '' && (
                <div 
                  ref={searchResultsRef}
                  className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
                >
                  {filteredProducts.length > 0 ? (
                    <ul className="py-2">
                      {filteredProducts.slice(0, 8).map((product) => (
                        <li 
                          key={product.id} 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleSelectProduct(product)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                              {product.image ? (
                                <Image 
                                  width={48}
                                  height={48}
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                              {product.category && (
                                <p className="text-xs text-gray-500 truncate">{product.category}</p>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                      {filteredProducts.length > 8 && (
                        <li className="px-4 py-2 text-center text-sm text-blue-600 font-medium">
                          + {filteredProducts.length - 8} sản phẩm khác
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="py-6 px-4 text-center text-gray-500">
                      <p>Không tìm thấy sản phẩm phù hợp</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Tab điều hướng */}
            <div className="flex space-x-2">
              <button
                className={`px-6 py-2 rounded-full transition-all font-medium cursor-pointer ${
                  activeTab === Tab.Home
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTabChange(Tab.Home)}
              >
                Trang chủ
              </button>

              <button
                className={`px-6 py-2 rounded-full transition-all font-medium cursor-pointer ${
                  activeTab === Tab.Featured
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTabChange(Tab.Featured)}
              >
                Nổi bật
              </button>
              
              <button
                className={`px-6 py-2 rounded-full transition-all font-medium cursor-pointer ${
                  activeTab === Tab.All
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTabChange(Tab.All)}
              >
                Tất cả
              </button>
            </div>
          </div>

          {/* Mobile Header */}
          <div
            className= "md:hidden"
          >
            {/* Thanh trên cùng mobile */}
            <div className="flex items-center justify-between p-3">
              <h1 className="text-xl font-bold text-blue-700">{shopName}</h1>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleMobileSearch}
                  className="p-2 rounded-full hover:bg-blue-200 transition-colors"
                >
                  <Search size={20} className="text-blue-700" />
                </button>
              </div>
            </div>

            {/* Thanh tìm kiếm mobile */}
            {mobileSearchActive && (
              <div className="px-3 pb-3 pt-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full text-black pl-8 pr-8 py-2 rounded-full border border-gray-300 focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  {searchTerm && (
                    <button 
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={toggleMobileSearch}
                  className="text-blue-700 font-medium text-sm"
                >
                  Hủy
                </button>
              </div>
            )}

            {/* Kết quả tìm kiếm mobile */}
            {showSearchResults && searchTerm.trim() !== '' && mobileSearchActive && (
              <div 
                ref={searchResultsRef}
                className="absolute z-[999] left-0 right-0 bg-white border-t border-gray-200 shadow-md max-h-96 overflow-y-auto"
              >
                {filteredProducts.length > 0 ? (
                  <ul className="py-1">
                    {filteredProducts.slice(0, 8).map((product) => (
                      <li 
                        key={product.id} 
                        className="px-4 py-2 hover:bg-gray-50 active:bg-gray-100 z-40 cursor-pointer transition-colors"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
                            {product.image ? (
                              <Image 
                                width={40}
                                height={40}
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            {product.category && (
                              <p className="text-xs text-gray-500 truncate">{product.category}</p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                    {filteredProducts.length > 8 && (
                      <li className="px-4 py-2 text-center text-sm text-blue-600 font-medium">
                        + {filteredProducts.length - 8} sản phẩm khác
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="py-6 px-4 text-center text-gray-500">
                    <p>Không tìm thấy sản phẩm phù hợp</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab điều hướng mobile */}
            <div className="flex px-3 pb-3">
              <div className="flex w-full rounded-full overflow-hidden bg-gray-100 p-1">
                <button
                  className={`flex-1 py-2 text-center text-sm transition-all font-medium rounded-full ${
                    activeTab === Tab.Home
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700'
                  }`}
                  onClick={() => handleTabChange(Tab.Home)}
                >
                  Trang chủ
                </button>

                <button
                  className={`flex-1 py-2 text-center text-sm transition-all font-medium rounded-full ${
                    activeTab === Tab.Featured
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700'
                  }`}
                  onClick={() => handleTabChange(Tab.Featured)}
                >
                  Nổi bật
                </button>
                
                <button
                  className={`flex-1 py-2 text-center text-sm transition-all font-medium rounded-full ${
                    activeTab === Tab.All
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700'
                  }`}
                  onClick={() => handleTabChange(Tab.All)}
                >
                  Tất cả
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-1 py-0 md:py-6 mt-[120px] md:mt-[80px]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="mt-4 text-gray-600 text-sm md:text-base">Đang tải sản phẩm...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 rounded shadow-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 md:h-6 md:w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-medium text-sm md:text-base">{error}</p>
            </div>
          </div>
        ) : 
        filteredProducts.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 md:p-4 rounded shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 md:h-6 md:w-6 mr-2 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs md:text-sm text-yellow-700">{`Không tìm thấy sản phẩm phù hợp với từ khóa "${searchTerm}"`}</p>
            </div>
          </div>
        ) : (
          <>
            {searchTerm && (
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">{`Kết quả tìm kiếm: ${filteredProducts.length}`} sản phẩm</h2>
                <div className="h-1 w-16 md:w-20 bg-blue-500 rounded-full"></div>
              </div>
            )}

            {activeTab === Tab.Home && (<Home products={filteredProducts} handleTabChange={handleTabChange} />)}
            {activeTab === Tab.Featured && <FeaturedProducts products={filteredProducts} />}
            {activeTab === Tab.All && <AllProducts products={filteredProducts} />}
          </>
        )}
      </main>

      {/* Messenger button */}
      <div>
        {/* Các phần tử khác của component cha */}
        
        <ContactButton
          messengerLink={messengerLink}
          zaloLink={zaloLink}
        />
      </div>

      {/* Footer */}
      <footer className="bg-blue-100 border-t border-gray-200 mt-auto">
        <div className="container mx-auto max-w-6xl px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-lg md:text-xl font-bold text-blue-700">{shopName}</h3>
              <p className="text-sm md:text-base text-gray-600 mt-1">Nơi mua sắm đáng tin cậy</p>
            </div>
            {/* FACEbook link */}
            <div className="flex space-x-6 my-2 md:my-0">
              <a href={facebookUrl} className="text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
          
          <hr className="my-4 md:my-6 border-gray-200" />
          
          <p className="text-center text-gray-500 text-xs md:text-sm">
            © {new Date().getFullYear()} {shopName}.
          </p>
        </div>
      </footer>
    </div>
  );
};