"use client";

import { useRouter } from "next/navigation";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

export function Hero() {
  const router = useRouter();

  return (
    <PixelHero
      eyebrow="Your follow-ups, handled."
      word1="Don't let important conversations"
      word2="go cold."
      description="Ghosted AI watches the conversations you choose to track and reminds you when someone hasn't replied. It can also write the follow-up for you."
      primaryCta="Get started"
      primaryCtaMobile="Get started"
      secondaryCta="Login"
      secondaryCtaMobile="Login"
      onPrimaryClick={() => router.push("/onboarding")}
      onSecondaryClick={() => router.push("/login")}
      githubUrl="/login"
      secondaryHref="/login"
      secondaryExternal={false}
      secondaryIcon={null}
    />
  );
}
