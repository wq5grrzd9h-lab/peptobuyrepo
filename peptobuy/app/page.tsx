import Hero from "@/components/sections/Hero";
import CategoryStrip from "@/components/sections/CategoryStrip";
import BestSellers from "@/components/sections/BestSellers";
import TrustBar from "@/components/sections/TrustBar";
import FAQ from "@/components/sections/FAQ";
import CTABanner from "@/components/sections/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <BestSellers />
      <TrustBar />
      <FAQ />
      <CTABanner />
    </>
  );
}
