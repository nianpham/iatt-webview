import AppHome from "@/modules/app-home";
import React, { Suspense } from 'react';

export default function AppAlbum() {
  return (
    <Suspense fallback={<div>...</div>}>
      <AppHome />
    </Suspense>
  );
}
