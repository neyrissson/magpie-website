import prisma from '../lib/prisma';
import HomeClient from '@/components/HomeClient';

export default async function Home() {
  // Default fallback image
  let heroBgUrl = "/assets/background_2_v2.jpeg";

  try {
    console.log("[Home] Fetching hero image...");
    
    // Safety check for prisma client
    if (prisma?.siteImage) {
      const heroImage = await prisma.siteImage.findUnique({
        where: { key: 'hero_bg' },
        include: { photo: true }
      });
      
      // Use the photo relation if it exists, fallback to legacy url field
      if (heroImage?.photo?.url) {
        heroBgUrl = heroImage.photo.url;
        console.log("[Home] Found dynamic hero:", heroBgUrl);
      } else if (heroImage?.url) {
        heroBgUrl = heroImage.url;
        console.log("[Home] Found legacy hero URL:", heroBgUrl);
      } else {
        console.log("[Home] No dynamic hero set, using default assets.");
      }
    } else {
      console.warn("[Home] Prisma or SiteImage model is not initialized.");
    }
  } catch (error) {
    console.error("[Home] Failed to fetch dynamic hero background:", error.message);
    // Silent catch - we already have our fallback heroBgUrl set
  }

  return <HomeClient heroBgUrl={heroBgUrl} />;
}
