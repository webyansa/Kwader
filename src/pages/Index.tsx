import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import UrgentJobsBar from "@/components/home/UrgentJobsBar";
import FeaturedJobsSection from "@/components/home/FeaturedJobsSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import LatestJobsSection from "@/components/home/LatestJobsSection";
import OrgsSection from "@/components/home/OrgsSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import PricingPreview from "@/components/home/PricingPreview";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <UrgentJobsBar />
        <FeaturedJobsSection />
        <CategoriesSection />
        <LatestJobsSection />
        <OrgsSection />
        <WhyUsSection />
        <HowItWorksSection />
        <PricingPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
