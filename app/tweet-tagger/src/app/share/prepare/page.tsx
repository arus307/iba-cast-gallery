import SharePreparation from "./SharePreparation";
import SharePreparationStatus from "./SharePreparationStatus";
import { Suspense } from "react";

export default function SharePreparationPage() {
  return (
    <Suspense fallback={<SharePreparationStatus />}>
      <SharePreparation />
    </Suspense>
  );
}
