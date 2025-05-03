'use client'

import { useEffect, useState } from "react"
import { UploadCloud, X, ChevronDown, ChevronUp, Eye, Info } from "lucide-react"
import { useSession } from "next-auth/react"
import ProductDetail from "./ProductDetail"
import { Product } from '../types/product';
import { categories } from '../types/categories';
import  Image  from 'next/image';
const defaultForm: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  image: '',
  category: '',
  quantity: 0,
  priority: 3,
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<Omit<Product, 'id'>>(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showPriorityInfo, setShowPriorityInfo] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    fetchProducts()
  }, [])

  // Update form category field when selected categories change
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      category: selectedCategories.join(', ')
    }))
  }, [selectedCategories])

  // Set selected categories when editing a product
  useEffect(() => {
    if (form.category) {
      setSelectedCategories(form.category.split(', ').filter(Boolean))
    } else {
      setSelectedCategories([])
    }
  }, [form.category])

  // Thông tin cửa hàng ở đây
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME;
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_LINK;

  if (!facebookUrl || !shopName) {
    console.log("Chưa nhập địa chỉ ở .env kìa anh ơi");
    return <p>Lỗi không có thông tin</p>;
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/all')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error)
    }
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Tạo bản sao của form để xử lý
      let formToSubmit = { ...form }
      
      // Upload ảnh nếu có file được chọn
      if (selectedFile) {
        setUploadingImage(true)
        
        try {
          // Nếu có ảnh cũ và đang chỉnh sửa và người dùng đã chọn ảnh mới
          if (editingId && form.image && selectedFile) {
            try {
              await fetch(`/api/upload?url=${encodeURIComponent(form.image)}`, {
                method: 'DELETE',
              })
            } catch (imageDeleteError) {
              console.error("Không thể xoá ảnh cũ:", imageDeleteError)
              // Không dừng, chỉ log lỗi
            }
          }

          const formData = new FormData()
          formData.append('file', selectedFile)
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (uploadRes.ok) {
            const data = await uploadRes.json()
            formToSubmit = { ...formToSubmit, image: data.url }
          } else {
            throw new Error("Lỗi khi upload ảnh")
          }
        } catch (error) {
          console.error("Lỗi khi upload ảnh:", error)
          alert("Không thể tải ảnh lên. Vui lòng thử lại.")
          setUploadingImage(false)
          return // Dừng nếu không upload được ảnh
        } finally {
          setUploadingImage(false)
        }
      }
      
      // Lưu sản phẩm
      const method = editingId ? 'PUT' : 'POST'
      const url = '/api/products'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...formToSubmit } : formToSubmit),
      })
      
      if (res.ok) {
        // Reset form
        setForm(defaultForm)
        setEditingId(null)
        setSelectedFile(null)
        setLocalImagePreview(null)
        setSelectedCategories([])
        fetchProducts()
        
        if (!editingId) {
          // Nếu là thêm mới, có thể ẩn form
          setShowForm(false)
        }
        alert(editingId ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!")
      } else {
        throw new Error("Lỗi khi lưu sản phẩm")
      }
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error)
      alert("Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.")
    }
  }

  // Hàm xử lý khi component ProductDetail cập nhật sản phẩm thành công
  const handleEditSuccess = (updatedProduct: Product) => {
    // Cập nhật lại danh sách sản phẩm
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    )
  }

  // Hàm xử lý khi component ProductDetail xóa sản phẩm thành công
  const handleDeleteSuccess = (deletedId: number) => {
    // Xóa sản phẩm khỏi danh sách
    setProducts(prevProducts => prevProducts.filter(p => p.id !== deletedId))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setSelectedFile(file)
    
    // Tạo preview từ file đã chọn
    const reader = new FileReader()
    reader.onload = (e) => {
      setLocalImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null)
    setLocalImagePreview(null)
  }

  const handleRemoveExistingImage = () => {
    // Chỉ xoá URL ảnh trong form, không gọi API xoá
    setForm({ ...form, image: '' })
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const getPriorityDescription = (priority: number) => {
    switch (priority) {
      case 1: return "Ưu tiên thấp - Hiển thị ở cuối trang"
      case 2: return "Ưu tiên trung bình thấp - Ít xuất hiện"
      case 3: return "Ưu tiên trung bình - Hiển thị trên trang chính"
      case 4: return "Ưu tiên cao - Hiển thị nổi bật trên trang chính"
      case 5: return "Ưu tiên cao nhất - Hiển thị đầu tiên, nổi bật nhất"
      default: return "Ưu tiên trung bình"
    }
  }

  if (status === "loading") {
    return <div className="text-center mt-10">Đang tải...</div>
  }
  
  if (!session || session.user.email !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 text-lg font-semibold">
          Bạn không có quyền truy cập trang quản trị.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 p-6 bg-white rounded-lg shadow-md">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
          <Image 
            src="/default-avatar.jpg" 
            alt="Logo cửa hàng" 
            className="w-full h-full object-cover"
            width={300}
            height={200}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/64";
            }}
          />
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-gray-800">{shopName}</h1>
          <p className="text-gray-600">Quản lý sản phẩm</p>
        </div>
      </div>

      {/* Form Toggle Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          {showForm ? (
            <>
              <ChevronUp className="w-5 h-5 mr-2" />
              Ẩn form thêm sản phẩm
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5 mr-2" />
              {editingId ? "Hiện form sửa sản phẩm" : "Thêm sản phẩm mới"}
            </>
          )}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <h2 className="text-xl font-bold mb-5 pb-2 border-b">
            {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="Tên sản phẩm"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                  <span>Danh mục <span className="text-red-500">*</span></span>
                  <span className="text-xs text-gray-500">(Chọn nhiều danh mục nếu muốn)</span>
                </label>
                <div className="border rounded-md p-2 bg-gray-50 max-h-36 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="ml-2 block text-sm text-gray-700 truncate cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedCategories.map(cat => (
                      <span 
                        key={cat} 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {cat}
                        <button 
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="ml-1 h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    placeholder="Giá"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price === 0 ? "" : form.price}
                    onChange={e => setForm({ ...form, price: e.target.value === "" ? 0 : +e.target.value })}
                    className="w-full p-2.5 pl-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    đ
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  placeholder="Số lượng"
                  type="number"
                  min="0"
                  value={form.quantity === 0 ? "" : form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value === "" ? 0 : +e.target.value })}
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>Mức ưu tiên (1-5)</span>
                  <button 
                    type="button" 
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPriorityInfo(!showPriorityInfo)}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: +e.target.value })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                  </div>
                  <div className={`flex items-center px-3 py-2 rounded-md ${form.priority >= 3 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'}`}>
                    <div className="mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star}
                          className={`text-lg ${star <= form.priority ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm">{getPriorityDescription(form.priority)}</span>
                  </div>
                </div>
                {showPriorityInfo && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                    <p className="font-medium mb-1">Hướng dẫn mức ưu tiên:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Mức 1-2: Sản phẩm thông thường, hiển thị ít nổi bật</li>
                      <li>Mức 3: Sản phẩm sẽ hiển thị trên trang chính</li>
                      <li>Mức 4-5: Sản phẩm được ưu tiên cao, hiển thị nổi bật nhất trên trang chính</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  placeholder="Mô tả sản phẩm"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Hiển thị preview ảnh đã chọn (chưa upload) */}
                  {localImagePreview && (
                    <div className="relative w-32 h-32 border rounded-md overflow-hidden shadow-sm">
                      <Image
                        src={localImagePreview}
                        alt="Ảnh đã chọn"
                        fill
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveSelectedFile}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Hiển thị ảnh hiện tại (đã upload) */}
                  {!localImagePreview && form.image && (
                    <div className="relative w-32 h-32 border rounded-md overflow-hidden shadow-sm">
                      <Image
                        src={form.image}
                        alt="Ảnh sản phẩm"
                        fill
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveExistingImage}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Button để chọn file từ máy tính */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center w-40 h-12 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <div className="flex items-center">
                        <UploadCloud className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">Chọn ảnh</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input cho URL ảnh */}
                  <div className="flex-1 min-w-[200px]">
                    <input
                      value={form.image}
                      onChange={e => setForm({ ...form, image: e.target.value })}
                      className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      placeholder="Hoặc nhập URL ảnh"
                    />
                  </div>
                </div>
                {uploadingImage && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    Đang tải ảnh lên, vui lòng đợi...
                  </div>
                )}
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-500">
                    Đã chọn: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setForm(defaultForm)
                  setEditingId(null)
                  setSelectedCategories([])
                  setLocalImagePreview(null)
                  setSelectedFile(null)
                  if (!products.length) {
                    setShowForm(false)
                  }
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors shadow-sm"
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md transition-colors shadow-sm"
              >
                {editingId ? "Cập nhật" : "Thêm sản phẩm"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-5 pb-2 border-b flex items-center justify-between">
          <span>Danh sách sản phẩm</span>
          <span className="text-sm font-normal text-gray-500">Tổng: {products.length} sản phẩm</span>
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 mb-3">
              <UploadCloud className="w-12 h-12 mx-auto" />
            </div>
            <div className="text-gray-500">
              Chưa có sản phẩm nào. Hãy thêm sản phẩm đầu tiên!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map(product => (
              <div 
                key={product.id} 
                className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-100 overflow-hidden relative">
                  <Image
                    src={product.image || "https://via.placeholder.com/300x200?text=No+Image"}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover"
                  />
                  {product.priority >= 3 && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                      Nổi bật
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.category.split(', ').map((cat, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-lg font-bold text-red-600">
                      {product.price.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-sm text-gray-500">
                      Còn {product.quantity} sản phẩm
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">Mức ưu tiên:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`text-sm ${star <= product.priority ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="text-white bg-blue-600 hover:bg-blue-700 rounded-md px-3 py-1.5 flex items-center text-sm shadow-sm transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ProductDetail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onEditSuccess={handleEditSuccess}
          onDeleteSuccess={handleDeleteSuccess}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}