"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import SharePreparationStatus from "./SharePreparationStatus";

export default function SharePreparation() {
  const router = useRouter();
  const postId = useSearchParams().get("id");
  const processingPostIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (postId === null) {
      router.replace("/?shareError=invalid");
      return;
    }
    if (processingPostIdRef.current === postId) {
      return;
    }
    processingPostIdRef.current = postId;

    const saveDraft = async () => {
      try {
        const response = await fetch(
          `/api/share-drafts/${encodeURIComponent(postId)}`,
          { method: "POST" },
        );

        if (response.status === 401) {
          const callbackUrl = new URL("/share/prepare", window.location.origin);
          callbackUrl.searchParams.set("id", postId);
          window.location.assign(
            `/api/auth/signin?callbackUrl=${encodeURIComponent(
              callbackUrl.toString(),
            )}`,
          );
          return;
        }

        if (response.status === 403) {
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to save shared post as draft");
        }

        router.replace(`/posts/${postId}/edit?shared=1`);
      } catch (error) {
        console.error("Error preparing shared post:", error);
        router.replace("/?shareError=failed");
      }
    };

    void saveDraft();
  }, [postId, router]);

  return <SharePreparationStatus />;
}
