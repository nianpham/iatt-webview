import AppFrameClient from "@/modules/app-frame";
import AppFrameFunc1Client from "@/modules/app-frame-function-01";
import React, { Suspense } from "react";

export default function AppFrame() {
  return (
    <Suspense fallback={<div></div>}>
      <AppFrameFunc1Client />
    </Suspense>
  );
}
