import HeroSection from '../components/HeroSection'
import BrandsBar from '../components/BrandsBar'
import CategoriesGrid from '../components/CategoriesGrid'
import ProductsGrid from '../components/ProductsGrid'
import FAQSection from '../components/FAQSection'

function HomePage() {
  return (
    <main className="bg-off-white">
      <HeroSection />

      <div className="py-16">
        <BrandsBar />
      </div>

      <div className="py-16">
        <CategoriesGrid />
      </div>

      <ProductsGrid />

      <FAQSection />
    </main>
  )
}

export default HomePage
