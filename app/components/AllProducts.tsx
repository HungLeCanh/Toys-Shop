'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '../types/product';
import { X } from 'lucide-react';

interface AllProductsProps {
  products: Product[];
}

const AllProducts: React.FC<AllProductsProps> = ({ products }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  // Extract unique categories from all products
  const uniqueCategories = Array.from(
    new Set(
      products.flatMap(product => 
        product.category.split(', ').map(cat => cat.trim())
      ).filter(Boolean)
    )
  ).sort();

  // Filter products when selected categories change
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => {
        const productCategories = product.category.split(', ').map(cat => cat.trim());
        return selectedCategories.some(cat => productCategories.includes(cat));
      });
      setFilteredProducts(filtered);
    }
  }, [selectedCategories, products]);

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
    <div className="space-y-4">
      {/* Category Filter Section */}
      <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Lọc theo danh mục</h2>
          <button 
            onClick={() => setShowCategorySelector(!showCategorySelector)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showCategorySelector ? 'Ẩn danh mục' : 'Hiển thị tất cả danh mục'}
          </button>
        </div>

        {/* Selected Categories Display */}
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCategories.length > 0 ? (
            <>
              {selectedCategories.map(category => (
                <span 
                  key={category} 
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {category}
                  <button 
                    onClick={() => toggleCategory(category)}
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearCategories}
                className="text-xs text-pink-600 hover:text-pink-800 px-2.5 py-1 rounded-full bg-pink-100 border border-pink-200"
              >
                Xóa tất cả
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-500">Chọn danh mục để lọc sản phẩm</span>
          )}
        </div>

        {/* Category Selection Grid */}
        {showCategorySelector && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-3 p-3 bg-white rounded-lg border">
            {uniqueCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 font-medium'
                    : 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Count */}
      <div className="flex justify-between items-center px-2">
        <p className="text-sm text-gray-500">
          Hiển thị {filteredProducts.length} / {products.length} sản phẩm
        </p>
        {selectedCategories.length > 0 && (
          <p className="text-sm text-blue-600">
            Đang lọc: {selectedCategories.join(', ')}
          </p>
        )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
  );
};

export default AllProducts;