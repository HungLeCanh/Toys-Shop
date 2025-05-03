// app/product-info/page.tsx
import { Suspense } from "react";
import ProductInfoClient from "./ProductInfoClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductInfoClient />
    </Suspense>
  );
}
