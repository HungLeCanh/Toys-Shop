"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product } from '../types/product';

export default function ProductInfo() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductData() {
      if (!productId) {
        setError("ID sản phẩm không hợp lệ");
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/products?id=${productId}`);
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin sản phẩm');
        }
        
        const data = await response.json();
        setProduct(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        setIsLoading(false);
      }
    }
    
    fetchProductData();
  }, [productId]);

  // Thông tin cửa hàng ở đây
  const address = process.env.NEXT_PUBLIC_ADDRESS;
  const tel = process.env.NEXT_PUBLIC_TEL;
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_LINK;
  if (!address || !tel || !facebookUrl) {
    console.log("Chưa nhập địa chỉ ở .env kìa anh ơi")
    return <p>Lỗi không có thông tin</p>
  }
  const shopName = facebookUrl.split("/").filter(Boolean).pop();
  const messengerLink = `https://m.me/${shopName}`;

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-blue-800">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-center text-gray-800 mb-4">Không thể hiển thị sản phẩm</h1>
          <p className="text-gray-600 text-center">{error || "Không tìm thấy thông tin sản phẩm"}</p>
          <div className="mt-6">
            <Link href="/" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-4 px-3 sm:py-6 sm:px-4 lg:py-8 lg:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Breadcrumbs - cải thiện responsive trên mobile */}
          <div className="bg-blue-100 p-3 sm:p-4">
            <nav className="flex flex-wrap" aria-label="Breadcrumb">
              <ol className="flex items-center flex-wrap space-x-1 sm:space-x-2">
                <li className="mb-1 sm:mb-0">
                  <Link href="/" className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 sm:py-2 sm:px-3 text-sm rounded transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li className="flex items-center mb-1 sm:mb-0">
                  <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="#" className="ml-1 text-blue-800 hover:text-blue-600 text-sm sm:text-base truncate max-w-[100px] sm:max-w-full">{product.category}</a>
                </li>
                <li className="flex items-center w-full sm:w-auto">
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-gray-500 text-sm sm:text-base truncate">{product.name}</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Product content - cải thiện responsive */}
          <div className="flex flex-col md:flex-row">
            {/* Product image - điều chỉnh kích thước hình ảnh */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 bg-white flex items-center justify-center">
              <div className="relative w-full" style={{ height: '280px', maxWidth: '350px', margin: '0 auto' }}>
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-md"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product details - cải thiện padding và spacing */}
            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-6 bg-blue-100">
              <div className="flex flex-col h-full">
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{product.name}</h1>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                      {product.category}
                    </span>
                  </div>

                  {product.priority >= 3 && (
                    <div className="mb-3">
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Sản phẩm nổi bật
                      </span>
                    </div>
                  )}

                  <div className="mt-3">
                    {product.discount && product.discount > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl sm:text-3xl font-bold text-red-600">
                            {(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')} đ
                          </h2>
                          <span className="text-xs bg-yellow-200 text-yellow-800 font-semibold px-2 py-0.5 rounded">
                            -{product.discount}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 line-through mt-1">
                          {product.price.toLocaleString('vi-VN')} đ
                        </div>
                      </>
                    ) : (
                      <h2 className="text-2xl sm:text-3xl font-bold text-red-600">
                        {product.price.toLocaleString('vi-VN')} đ
                      </h2>
                    )}
                    
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Đã bao gồm thuế VAT
                    </p>
                  </div>
                </div>

                {/* Mô tả sản phẩm - cải thiện khoảng cách */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">Mô tả sản phẩm</h3>
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">{product.description}</p>
                  </div>
                </div>

                {/* Tình trạng sản phẩm */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm sm:text-base text-gray-700">
                      Tình trạng: <span className="font-medium">{product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                    </span>
                  </div>
                  {product.quantity > 0 && (
                    <div className="text-xs sm:text-sm text-gray-600">
                      Số lượng còn lại: <span className="font-semibold">{product.quantity}</span> sản phẩm
                    </div>
                  )}
                </div>

                {/* Button tư vấn */}
                <div className="mt-auto space-y-3 sm:space-y-4">
                  <button 
                    onClick={() => window.open(messengerLink, '_blank')} 
                    className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 sm:py-3 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yêu cầu tư vấn
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional information - thêm responsive */}
          <div className="p-4 sm:p-6 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Thông tin bổ sung</h3>
              
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="text-gray-500 text-xs sm:text-sm">Ngày tạo:</span>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : 'Không có thông tin'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <span className="text-gray-500 text-xs sm:text-sm">Danh mục:</span>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{product.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store info - cải thiện với responsive */}
          <div className="bg-blue-100 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="bg-blue-600 p-2 sm:p-3 rounded-full text-white mr-3 sm:mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">Cửa Hàng ABC</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Đồ chơi trẻ em chất lượng cao</p>
                </div>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook mr-1 hidden sm:inline" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                  </svg>
                  Facebook
                </a>
                <Link 
                  href="/" 
                  className="flex-1 sm:flex-auto text-center border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 sm:h-4 sm:w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Quay lại
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}