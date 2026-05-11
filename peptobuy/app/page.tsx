import Hero from "@/components/sections/Hero";
import CategoryStrip from "@/components/sections/CategoryStrip";
import BestSellers from "@/components/sections/BestSellers";
import TrustBar from "@/components/sections/TrustBar";
import FAQ from "@/components/sections/FAQ";
import CTABanner from "@/components/sections/CTABanner";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PeptoBuy",
  url: "https://peptobuy.com",
  logo: "https://peptobuy.com/Peptobuy LOGO.png",
  contactPoint: {
    "@type": "ContactPoint",
    email: "peptobuy@gmail.com",
    contactType: "customer service",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Hero />
      <CategoryStrip />
      <BestSellers />
      <TrustBar />
      <FAQ />
      <CTABanner />
    </>
  );
}
