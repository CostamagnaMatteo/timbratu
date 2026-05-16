"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const now = new Date();
    if (user) {
      router.replace(`/mese/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`);
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return null;
}
