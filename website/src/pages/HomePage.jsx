import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Hero from "../components/sections/Hero";
import StatsBar from "../components/sections/StatsBar";
import SolutionsGrid from "../components/sections/SolutionsGrid";
import HowItWorks from "../components/sections/HowItWorks";
import DaleSection from "../components/sections/DaleSection";
import PricingTable from "../components/sections/PricingTable";
import Testimonials from "../components/sections/Testimonials";
import CtaBanner from "../components/sections/CtaBanner";
import SalesChatWidget from "../components/sales-chat/SalesChatWidget";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-fm-cream">
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <SolutionsGrid />
        <HowItWorks />
        <PricingTable />
        <DaleSection />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
      <SalesChatWidget />
    </div>
  );
}
