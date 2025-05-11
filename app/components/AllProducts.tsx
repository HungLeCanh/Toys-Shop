'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '../types/product';
import { X, Filter, ArrowUp, ArrowDown } from 'lucide-react';

interface AllProductsProps {
  products: Product[];
}

const AllProducts: React.FC<AllProductsProps> = ({ products }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showCategoriesMobile, setShowCategoriesMobile] = useState(false);
  const [showDesktopCategories] = useState(true);
  const [sortMethod, setSortMethod] = useState<string>('');
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Lấy danh sách danh mục duy nhất từ tất cả sản phẩm
  // Sử dụng Set để loại bỏ các danh mục trùng lặp
  const uniqueCategories = Array.from(
    new Set(
      products.flatMap(product => 
        product.category.split(', ').map(cat => cat.trim())
      ).filter(Boolean)
    )
  ).sort();

  // Lọc và sắp xếp sản phẩm
  useEffect(() => {
    let filtered = [...products];
    
    // Lọc theo danh mục
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        const productCategories = product.category.split(', ').map(cat => cat.trim());
        return selectedCategories.some(cat => productCategories.includes(cat));
      });
    }
    
    // Sắp xếp theo phương thức đã chọn
    if (sortMethod === 'price-asc') {
      filtered.sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceA - priceB;
      });
    } else if (sortMethod === 'price-desc') {
      filtered.sort((a, b) => {
        const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price;
        const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price;
        return priceB - priceA;
      });
    } else if (sortMethod === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMethod === 'name-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategories, products, sortMethod]);

  // Xử lý sự kiện click bên ngoài sidebar để đóng
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && showCategoriesMobile) {
        setShowCategoriesMobile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoriesMobile]);

  // Close mobile sidebar on window resize (e.g., when rotating device)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && showCategoriesMobile) {
        setShowCategoriesMobile(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showCategoriesMobile]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  if (products.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm my-4">
        <p className="text-gray-500">Không có sản phẩm nào để hiển thị!</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col md:flex-row pb-4">
      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-0 z-10 bg-white p-3 mb-3 border-b shadow-sm">
        <button 
          onClick={() => setShowCategoriesMobile(true)}
          className="flex items-center justify-center w-full gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Lọc theo danh mục</span>
          {selectedCategories.length > 0 && (
            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Categories Sidebar - Slide from left */}
      <div 
        className={`fixed md:hidden inset-0 z-50 transition-opacity duration-300 ${
          showCategoriesMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          ref={sidebarRef}
          className={`absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ${
            showCategoriesMobile ? 'translate-x-0' : '-translate-x-full'
          } overflow-auto`}
        >
          <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Danh mục sản phẩm</h2>
            <button 
              onClick={() => setShowCategoriesMobile(false)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Đóng menu danh mục"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Sort Options for Mobile */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sắp xếp theo</h3>
            <div className="space-y-2">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Giá:</span>
                  <button
                    onClick={() => setSortMethod('price-asc')}
                    className={`flex items-center px-2 py-1 rounded text-xs ${
                      sortMethod === 'price-asc' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Thấp đến cao
                  </button>
                  <button
                    onClick={() => setSortMethod('price-desc')}
                    className={`flex items-center px-2 py-1 rounded text-xs ${
                      sortMethod === 'price-desc' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Cao đến thấp
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Tên:</span>
                  <button
                    onClick={() => setSortMethod('name-asc')}
                    className={`flex items-center px-2 py-1 rounded text-xs ${
                      sortMethod === 'name-asc' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowUp className="h-3 w-3 mr-1" />
                    A đến Z
                  </button>
                  <button
                    onClick={() => setSortMethod('name-desc')}
                    className={`flex items-center px-2 py-1 rounded text-xs ${
                      sortMethod === 'name-desc' 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Z đến A
                  </button>
                </div>
              </div>
              
              {sortMethod && (
                <button
                  onClick={() => setSortMethod('')}
                  className="text-xs text-pink-600 hover:text-pink-800"
                >
                  Xóa sắp xếp
                </button>
              )}
            </div>
          </div>
          
          {/* Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">Đang lọc</h3>
                <button
                  onClick={clearCategories}
                  className="text-xs text-pink-600 hover:text-pink-800"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(category => (
                  <span 
                    key={category} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {category}
                    <button 
                      onClick={() => toggleCategory(category)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories List for Mobile */}
          <div className="p-4">
            <div className="space-y-1">
              {uniqueCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Categories Sidebar */}
      <div className={`hidden md:block md:w-64 lg:w-72 sticky top-4 self-start ${showDesktopCategories ? 'pr-4' : 'w-auto'}`}>
        {/* Toggle sidebar visibility on desktop */}
        {/* <button 
          onClick={() => setShowDesktopCategories(!showDesktopCategories)}
          className="absolute -right-3 top-4 bg-white z-10 p-1 rounded-full border shadow-sm hover:bg-gray-50"
          aria-label={showDesktopCategories ? "Ẩn danh mục" : "Hiển thị danh mục"}
        >
          {showDesktopCategories ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button> */}

        {showDesktopCategories && (
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden h-[calc(100vh-2rem)] sticky top-4">
            {/* Sort Options for Desktop */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <h2 className="font-bold text-gray-800 mb-2">Sắp xếp theo</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Giá:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortMethod('price-asc')}
                      className={`flex items-center px-2 py-1 rounded text-xs flex-1 justify-center ${
                        sortMethod === 'price-asc' 
                          ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <ArrowUp className="h-3 w-3 mr-1" />
                      Thấp đến cao
                    </button>
                    <button
                      onClick={() => setSortMethod('price-desc')}
                      className={`flex items-center px-2 py-1 rounded text-xs flex-1 justify-center ${
                        sortMethod === 'price-desc' 
                          ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <ArrowDown className="h-3 w-3 mr-1" />
                      Cao đến thấp
                    </button>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Tên:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortMethod('name-asc')}
                      className={`flex items-center px-2 py-1 rounded text-xs flex-1 justify-center ${
                        sortMethod === 'name-asc' 
                          ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <ArrowUp className="h-3 w-3 mr-1" />
                      A đến Z
                    </button>
                    <button
                      onClick={() => setSortMethod('name-desc')}
                      className={`flex items-center px-2 py-1 rounded text-xs flex-1 justify-center ${
                        sortMethod === 'name-desc' 
                          ? 'bg-blue-100 text-blue-700 font-medium border border-blue-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      <ArrowDown className="h-3 w-3 mr-1" />
                      Z đến A
                    </button>
                  </div>
                </div>
                
                {sortMethod && (
                  <button
                    onClick={() => setSortMethod('')}
                    className="text-xs text-pink-600 hover:text-pink-800 block"
                  >
                    Xóa sắp xếp
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-pink-50">
              <h2 className="font-bold text-gray-800 mb-1">Lọc theo danh mục</h2>
              <p className="text-xs text-gray-500">
                {selectedCategories.length === 0 
                  ? "Chọn danh mục để lọc sản phẩm" 
                  : `Đang lọc ${selectedCategories.length} danh mục`
                }
              </p>

              {selectedCategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {selectedCategories.map(category => (
                    <span 
                      key={category} 
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {category}
                      <button 
                        onClick={() => toggleCategory(category)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearCategories}
                    className="text-xs text-pink-600 hover:text-pink-800 px-2 py-0.5 rounded-full bg-pink-50 border border-pink-100"
                  >
                    Xóa tất cả
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-y-auto h-[calc(100%-12rem)]">
              <div className="p-2">
                {uniqueCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-3 py-2 mb-1 rounded-md text-sm transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Products Count */}
        <div className="px-2 py-3 flex flex-wrap justify-between items-center mb-3 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">
            Hiển thị {filteredProducts.length} / {products.length} sản phẩm
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            {sortMethod && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Sắp xếp: {
                  sortMethod === 'price-asc' ? 'Giá thấp đến cao' :
                  sortMethod === 'price-desc' ? 'Giá cao đến thấp' :
                  sortMethod === 'name-asc' ? 'Tên A-Z' :
                  sortMethod === 'name-desc' ? 'Tên Z-A' : ''
                }
              </span>
            )}
            {selectedCategories.length > 0 && (
              <span className="text-xs text-blue-600">
                Đang lọc: {selectedCategories.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow-sm my-4 border border-dashed border-gray-300">
            <p className="text-gray-500">Không tìm thấy sản phẩm phù hợp với danh mục đã chọn!</p>
            <button
              onClick={clearCategories}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => {
              // Determine card background color based on product's priority
              let cardBg = "bg-white";
              if (product.priority >= 4) {
                cardBg = "bg-gradient-to-br from-blue-50 to-pink-50";
              } else if (product.priority === 3) {
                cardBg = "bg-blue-50";
              }
              
              const productCategories = product.category.split(', ').map(cat => cat.trim());
              
              return (
                <div
                  key={product.id}
                  onClick={() => window.open(`/product-info?id=${product.id}`, '_blank')}
                  className={`border rounded-lg overflow-hidden ${cardBg} shadow hover:shadow-md transition-all flex flex-col cursor-pointer hover:scale-[1.01] duration-200`}
                >
                  {/* Phần hình ảnh */}
                  <div className="relative aspect-square w-full bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs md:text-sm">Không có hình ảnh</span>
                      </div>
                    )}
                    
                    {/* Priority indicators */}
                    {product.priority >= 4 && (
                      <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                        Nổi bật
                      </div>
                    )}
                    {product.priority === 3 && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium shadow-sm">
                        Gợi ý
                      </div>
                    )}
                  </div>
                  
                  {/* Phần thông tin sản phẩm */}
                  <div className="p-2.5 md:p-3.5 flex-grow flex flex-col">
                    {/* Tên sản phẩm */}
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1.5 text-gray-800">
                      {product.name}
                    </h3>
                    
                    {/* Mô tả sản phẩm */}
                    <p className="text-xs md:text-sm text-gray-600 mb-2.5 line-clamp-2 flex-grow">
                      {product.description || "Chưa có mô tả chi tiết."}
                    </p>
                    
                    {/* Thông tin danh mục */}
                    <div className="mb-2 flex flex-wrap gap-1">
                      {productCategories.map((cat, index) => (
                        <span 
                          key={index} 
                          className={`text-xs inline-block px-2 py-0.5 rounded-full truncate ${
                            selectedCategories.includes(cat) 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    
                    {/* Phần giá và số lượng */}
                    <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-100">
                      <div className="flex flex-col">
                        {product.discount && product.discount > 0 ? (
                          <>
                            <span className="text-gray-400 text-sm line-through">
                              {product.price.toLocaleString('vi-VN')} đ
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-sm md:text-base text-red-600">
                                {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')} đ
                              </span>
                              <span className="text-[10px] bg-yellow-200 text-yellow-800 font-semibold px-1.5 py-0.5 rounded">
                                -{product.discount}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="font-bold text-sm md:text-base text-red-600">
                            {product.price.toLocaleString('vi-VN')} đ
                          </span>
                        )}
                      </div>
                      
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        product.quantity > 10 
                          ? 'bg-green-100 text-green-700' 
                          : product.quantity > 0 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;