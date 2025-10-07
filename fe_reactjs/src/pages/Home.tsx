import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Star, Truck, Shield, Leaf } from 'lucide-react'
import { useQuery } from 'react-query'
import { productApi } from '@/services/api'
import ProductSection from '@/components/ProductSection'
import { useCart } from '@/contexts/CartContext'
import toast from 'react-hot-toast'

export default function Home() {
  const { addToCart } = useCart()

  // Load featured products
  const { data: featuredProductsResp } = useQuery(
    ['featured-products'],
    () => productApi.getFeaturedProducts(25).then(r => r.data),
    { keepPreviousData: true }
  )

  // Load categories
  const { data: categoriesResp } = useQuery(
    ['home-categories'],
    () => productApi.getCategories().then(r => r.data),
    { keepPreviousData: true }
  )

  // Load products for first 4 categories individually
  const categories = categoriesResp?.data || []
  
  const { data: category1Products } = useQuery(
    ['products-by-category', categories[0]?.slug],
    () => categories[0] ? productApi.getProductsByCategory(categories[0].slug, 5).then(r => r.data) : Promise.resolve(null),
    { keepPreviousData: true, enabled: !!categories[0] }
  )

  const { data: category2Products } = useQuery(
    ['products-by-category', categories[1]?.slug],
    () => categories[1] ? productApi.getProductsByCategory(categories[1].slug, 5).then(r => r.data) : Promise.resolve(null),
    { keepPreviousData: true, enabled: !!categories[1] }
  )

  const { data: category3Products } = useQuery(
    ['products-by-category', categories[2]?.slug],
    () => categories[2] ? productApi.getProductsByCategory(categories[2].slug, 5).then(r => r.data) : Promise.resolve(null),
    { keepPreviousData: true, enabled: !!categories[2] }
  )

  const { data: category4Products } = useQuery(
    ['products-by-category', categories[3]?.slug],
    () => categories[3] ? productApi.getProductsByCategory(categories[3].slug, 5).then(r => r.data) : Promise.resolve(null),
    { keepPreviousData: true, enabled: !!categories[3] }
  )

  const handleAddToCart = async (productId: number, variantId: number | null) => {
    try {
      await addToCart(productId, variantId, 1)
      toast.success('Đã thêm vào giỏ hàng!')
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng. Cần Phải Đăng Nhập')
    }
  }

  const featuredProducts = featuredProductsResp?.data?.products || []

  // Prepare category data for rendering
  const categoryData = [
    { category: categories[0], products: category1Products?.data?.products || [] },
    { category: categories[1], products: category2Products?.data?.products || [] },
    { category: categories[2], products: category3Products?.data?.products || [] },
    { category: categories[3], products: category4Products?.data?.products || [] }
  ].filter(item => item.category && item.products.length > 0)

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-500 to-blue-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left copy */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Nông Sản Tươi Ngon
                <span className="block text-yellow-300">Địa Phương</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100">
                Mang đến những sản phẩm nông sản chất lượng cao, tươi ngon từ các trang trại địa phương
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link to="/products">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                    Mua sắm ngay
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right slider */}
            {(() => {
              const slides = [
                'https://media.istockphoto.com/id/1130497489/vi/anh/n%C3%B4ng-d%C3%A2n-s%E1%BB%AD-d%E1%BB%A5ng-robot-%C4%91i%E1%BB%81u-khi%E1%BB%83n-m%C3%A1y-t%C3%ADnh-b%E1%BA%A3ng-k%E1%BB%B9-thu%E1%BA%ADt-s%E1%BB%91-%C4%91%E1%BB%83-thu-ho%E1%BA%A1ch-c%C3%A0-chua-trong-ng%C3%A0nh.jpg?s=1024x1024&w=is&k=20&c=_bJJVA7s2u7vSrbBtmxBdX7uHMHPyTFUdzpTZ_QzTq4=',
                'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1400&auto=format&fit=crop',
              ]
              const [idx, setIdx] = useState(0)
              useEffect(() => {
                const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 4000)
                return () => clearInterval(t)
              }, [])
              return (
                <div className="relative h-72 md:h-96 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                  {slides.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt="banner"
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, i) => (
                      <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`}></span>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn Emo Nông Sản?
            </h2>
            <p className="text-lg text-gray-600">
              Chúng tôi cam kết mang đến những sản phẩm tốt nhất cho bạn
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Tự Nhiên</h3>
              <p className="text-gray-600">Nông sản được trồng theo phương pháp hữu cơ, không sử dụng hóa chất</p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Giao Hàng Nhanh</h3>
              <p className="text-gray-600">Giao hàng trong vòng 24h, đảm bảo sản phẩm tươi ngon nhất</p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">An Toàn Tuyệt Đối</h3>
              <p className="text-gray-600">Kiểm tra chất lượng nghiêm ngặt, đảm bảo an toàn thực phẩm</p>
            </Card>

            <Card className="text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chất Lượng Cao</h3>
              <p className="text-gray-600">Được đánh giá cao bởi hàng nghìn khách hàng tin tưởng</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá đa dạng các loại nông sản tươi ngon
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {categories.slice(0, 5).map((c: any) => {
              const pickEmoji = (slug: string) => {
                if (!slug) return '🛒'
                if (slug.includes('rau')) return '🥬'
                if (slug.includes('trai') || slug.includes('tao')) return '🍎'
                if (slug.includes('dac') || slug.includes('san')) return '🌽'
                if (slug.includes('huu') || slug.includes('co')) return '🌱'
                if (slug.includes('gia') || slug.includes('vi')) return '🌿'
                return '🛒'
              }

              return (
                <Link key={c.id} to={`/products?category=${encodeURIComponent(c.slug)}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                    <div className="aspect-w-16 aspect-h-9 bg-gradient-to-r from-green-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-6xl">{pickEmoji(c.slug)}</span>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{c.name}</h3>
                      <p className="text-gray-600 flex-1">{c.description || 'Khám phá sản phẩm nổi bật'}</p>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <ProductSection
        title="Sản Phẩm Nổi Bật"
        subtitle="Những sản phẩm được yêu thích nhất"
        products={featuredProducts}
        onAddToCart={handleAddToCart}
      />

      {/* Products by Category Sections */}
      {categoryData.map((item) => {
        const { category, products } = item
        
        if (!category || products.length === 0) return null

        return (
          <ProductSection
            key={category.slug}
            title={category.name}
            subtitle={category.description || 'Khám phá sản phẩm đa dạng'}
            products={products}
            categorySlug={category.slug}
            onAddToCart={handleAddToCart}
          />
        )
      })}

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Khách Hàng Nói Gì Về Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600">
              Phản hồi từ những khách hàng đã tin tưởng sử dụng dịch vụ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Sản phẩm rất tươi ngon, giao hàng nhanh. Tôi rất hài lòng với dịch vụ của Emo Nông Sản."
              </p>
              <div className="font-semibold text-gray-900">Chị Minh Anh</div>
              <div className="text-sm text-gray-500">Khách hàng thân thiết</div>
            </Card>

            <Card className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Chất lượng sản phẩm vượt ngoài mong đợi. Đặc biệt là rau củ rất tươi và ngon."
              </p>
              <div className="font-semibold text-gray-900">Anh Văn Đức</div>
              <div className="text-sm text-gray-500">Khách hàng VIP</div>
            </Card>

            <Card className="text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Dịch vụ chăm sóc khách hàng tuyệt vời. Tôi sẽ tiếp tục ủng hộ Emo Nông Sản."
              </p>
              <div className="font-semibold text-gray-900">Cô Thu Hà</div>
              <div className="text-sm text-gray-500">Khách hàng mới</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bắt Đầu Mua Sắm Ngay Hôm Nay
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Khám phá thế giới nông sản tươi ngon với Emo Nông Sản
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Xem Tất Cả Sản Phẩm
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}