"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingRedirect() {
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const exempt = ["/onboarding", "/login", "/privacy", "/terms"];
    if (exempt.some(p => path.startsWith(p))) return;
    if (!localStorage.getItem("onboarding_done")) {
      router.replace("/onboarding");
    }
  }, [path, router]);

  return null;
}
