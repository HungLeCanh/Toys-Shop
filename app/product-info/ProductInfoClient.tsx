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


    // THông tin cửa hàng ở đây
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
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-blue-800">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-blue-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-center text-gray-800 mb-4">Không thể hiển thị sản phẩm</h1>
          <p className="text-gray-600 text-center">{error || "Không tìm thấy thông tin sản phẩm"}</p>
          <div className="mt-6">
            <Link href="/" passHref>
              <a className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                Quay lại trang chủ
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Breadcrumbs */}
          <div className="bg-blue-100 p-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" passHref className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                      Quay lại trang chủ
                  </Link>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="#" className="ml-2 text-blue-800 hover:text-blue-600">{product.category}</a>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2 text-gray-500 truncate max-w-xs">{product.name}</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Product content */}
          <div className="flex flex-col md:flex-row">
            {/* Product image */}
            <div className="md:w-1/2 p-6 bg-white flex items-center justify-center">
              <div className="relative h-80 w-full">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product details */}
            <div className="md:w-1/2 p-6 md:p-8 bg-blue-100">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {product.priority >= 3 && (
                    <div className="mb-4">
                      <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Sản phẩm nổi bật
                      </span>
                    </div>
                  )}

                  <div className="mt-4">
                    <h2 className="text-3xl font-bold text-red-600">
                      {product.price.toLocaleString('vi-VN')} đ
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Đã bao gồm thuế VAT
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">Mô tả sản phẩm</h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-700">
                      Tình trạng: <span className="font-medium">{product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}</span>
                    </span>
                  </div>
                  {product.quantity > 0 && (
                    <div className="text-sm text-gray-600">
                      Số lượng còn lại: <span className="font-semibold">{product.quantity}</span> sản phẩm
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-4">

                  
                  <button onClick={() => window.open(messengerLink, '_blank')} className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yêu cầu tư vấn
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional information */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông tin bổ sung</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="text-gray-500 text-sm">Ngày tạo:</span>
                      <p className="font-medium text-gray-800">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('vi-VN') : 'Không có thông tin'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <span className="text-gray-500 text-sm">Danh mục:</span>
                      <p className="font-medium text-gray-800">{product.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store info */}
          <div className="bg-blue-100 p-6">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="bg-blue-600 p-3 rounded-full text-white mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Cửa Hàng ABC</h4>
                  <p className="text-gray-600 text-sm">Đồ chơi trẻ em chất lượng cao</p>
                </div>
              </div>
                <div className="flex space-x-2">
                <a
                  href={facebookUrl}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center"
                >
                  FACEBOOK - {shopName}
                </a>
                <Link href="/" passHref className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
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