'use client'

import { useState, useEffect } from "react"
import { X, Edit, Trash2, UploadCloud } from "lucide-react"
import Image from "next/image"
import { Product } from '../types/product';

type ProductDetailProps = {
  product: Product
  onEditSuccess: (updatedProduct: Product) => void
  onDeleteSuccess: (deletedId: number) => void
  onClose: () => void
}

export default function ProductDetail({ product, onEditSuccess, onDeleteSuccess, onClose }: ProductDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Product>(product)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    // Reset the form when product changes
    setEditForm(product)
    setIsEditing(false)
    setSelectedFile(null)
    setLocalImagePreview(null)
    setFormErrors({})
  }, [product])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!editForm.name.trim()) errors.name = "Tên sản phẩm là bắt buộc"
    if (!editForm.category.trim()) errors.category = "Danh mục là bắt buộc"
    if (editForm.price <= 0) errors.price = "Giá phải lớn hơn 0"
    if (editForm.quantity < 0) errors.quantity = "Số lượng không được âm"
    if (editForm.priority < 1 || editForm.priority > 5) errors.priority = "Ưu tiên phải từ 1-5"
    if (editForm.discount != null && (editForm.discount < 0 || editForm.discount > 100)) {
      errors.discount = "Giảm giá phải từ 0 đến 100 (%)"
    }
    
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
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
    setEditForm({ ...editForm, image: '' })
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      // Tạo bản sao của form để xử lý
      let formToSubmit = { ...editForm }
      
      // Upload ảnh nếu có file được chọn
      if (selectedFile) {
        setUploadingImage(true)
        
        try {
          // Nếu có ảnh cũ và người dùng đã chọn ảnh mới
          if (editForm.image && selectedFile) {
            try {
              await fetch(`/api/upload?url=${encodeURIComponent(editForm.image)}`, {
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
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formToSubmit),
      })
      
      if (res.ok) {
        const updatedProduct = await res.json()
        // Reset states
        setSelectedFile(null)
        setLocalImagePreview(null)
        setIsEditing(false)
        
        // Thông báo cho component cha để refresh danh sách
        onEditSuccess(updatedProduct)
        alert("Cập nhật sản phẩm thành công!")
      } else {
        throw new Error("Lỗi khi lưu sản phẩm")
      }
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error)
      alert("Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.")
    }
  }

  const handleDeleteProduct = async () => {
    if (!confirm("Xác nhận xoá sản phẩm này?")) return
    
    try {
      // Xoá sản phẩm
      const res = await fetch(`/api/products?id=${product.id}`, { method: 'DELETE' })
      
      if (res.ok) {
        // Nếu sản phẩm có ảnh, xoá ảnh trên Cloudinary
        if (product.image) {
          try {
            await fetch(`/api/upload?url=${encodeURIComponent(product.image)}`, {
              method: 'DELETE',
            })
          } catch (imageError) {
            console.error("Lỗi khi xoá ảnh:", imageError)
            // Tiếp tục xử lý ngay cả khi không xoá được ảnh
          }
        }
        
        // Thông báo cho component cha để refresh danh sách
        onDeleteSuccess(product.id)
        onClose() // Đóng modal sau khi xoá
        alert("Xoá sản phẩm thành công!")
      } else {
        throw new Error("Lỗi khi xoá sản phẩm")
      }
    } catch (error) {
      console.error("Lỗi khi xoá sản phẩm:", error)
      alert("Có lỗi xảy ra khi xoá sản phẩm. Vui lòng thử lại.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">
            {isEditing ? "Chỉnh sửa sản phẩm" : "Chi tiết sản phẩm"}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {isEditing ? (
            // Form chỉnh sửa
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Tên sản phẩm"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Danh mục"
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.category ? 'border-red-500' : ''}`}
                  />
                  {formErrors.category && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Giá"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price === 0 ? "" : editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value === "" ? 0 : +e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.price ? 'border-red-500' : ''}`}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                  )}
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
                    value={editForm.quantity === 0 ? "" : editForm.quantity}
                    onChange={e => setEditForm({ ...editForm, quantity: e.target.value === "" ? 0 : +e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.quantity ? 'border-red-500' : ''}`}
                  />
                  {formErrors.quantity && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mức ưu tiên (1-5)
                  </label>
                  <input
                    placeholder="Ưu tiên (1-5)"
                    type="number"
                    min="1"
                    max="5"
                    value={editForm.priority === 0 ? "" : editForm.priority}
                    onChange={e => setEditForm({ ...editForm, priority: e.target.value === "" ? 3 : +e.target.value })}
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.priority ? 'border-red-500' : ''}`}
                  />
                  {formErrors.priority && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.priority}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá (%)
                  </label>
                  <input
                    placeholder="Giảm giá (0-100)"
                    type="number"
                    min="0"
                    max="100"
                    value={editForm.discount ?? ""}
                    onChange={e =>
                      setEditForm({ ...editForm, discount: e.target.value === "" ? 0 : +e.target.value })
                    }
                    className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${formErrors.discount ? 'border-red-500' : ''}`}
                  />
                  {formErrors.discount && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.discount}</p>
                  )}
                </div>
  
                  
                  {/* Mô tả sản phẩm */}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    placeholder="Mô tả sản phẩm"
                    value={editForm.description}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                {/* Upload ảnh */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh
                  </label>
                  <div className="flex items-center space-x-4">
                    {/* Hiển thị preview ảnh đã chọn (chưa upload) */}
                    {localImagePreview && (
                      <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                        <Image
                          src={localImagePreview}
                          alt="Ảnh đã chọn"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveSelectedFile}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Hiển thị ảnh hiện tại (đã upload) */}
                    {!localImagePreview && editForm.image && (
                      <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                        <Image
                          src={editForm.image}
                          alt="Ảnh sản phẩm"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveExistingImage}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Button để chọn file từ máy tính */}
                    {!localImagePreview && !editForm.image && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex items-center justify-center w-40 h-10 border-2 border-dashed border-gray-300 rounded-md">
                          <div className="flex items-center">
                            <UploadCloud className="w-5 h-5 mr-1 text-gray-500" />
                            <span className="text-sm text-gray-500">Chọn ảnh</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Input cho URL ảnh (nếu đã chọn ảnh hoặc có URL) */}
                    {(localImagePreview || editForm.image) && (
                      <input
                        value={editForm.image}
                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                        className="flex-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Hoặc nhập URL ảnh"
                      />
                    )}
                  </div>
                  {uploadingImage && (
                    <div className="mt-2 text-sm text-blue-600">
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

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm(product) // Reset form về dữ liệu gốc
                    setSelectedFile(null)
                    setLocalImagePreview(null)
                    setFormErrors({})
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          ) : (
            // Chi tiết sản phẩm
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.image || "https://via.placeholder.com/300x300?text=No+Image"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{product.name}</h2>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2">
                        {product.category}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {product.price.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Số lượng trong kho</p>
                      <p className="font-medium">{product.quantity} sản phẩm</p>
                    </div>

                    {product.discount != null && product.discount > 0 && (
                    <div>
                      <p className="text-gray-500">Giảm giá</p>
                      <p className="font-medium text-green-600">{product.discount}%</p>
                    </div>
                  )}

                    <div>
                      <p className="text-gray-500">Mức ưu tiên hiển thị</p>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            className={`text-lg ${star <= product.priority ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {product.createdAt && (
                      <div>
                        <p className="text-gray-500">Ngày tạo</p>
                        <p className="font-medium">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    )}
                    {product.updatedAt && (
                      <div>
                        <p className="text-gray-500">Cập nhật lần cuối</p>
                        <p className="font-medium">{new Date(product.updatedAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-gray-500 mb-2">Mô tả sản phẩm</p>
                    <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                      {product.description || <span className="text-gray-400 italic">Không có mô tả</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xoá sản phẩm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}