"use client";

import { Button } from "@/components/ui/button";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ProductDescription from "./description";
import ProductImages from "./images";
import PriceAvailability from "./price-availability";

export default function AddProduct() {
  return (
    <DndProvider backend={HTML5Backend}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <ProductDescription />

        <PriceAvailability />

        <ProductImages />

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline">
            Draft
          </Button>
          <Button type="submit" variant="default">
            Publish Product
          </Button>
        </div>
      </form>
    </DndProvider>
  );
}

export { PriceAvailability, ProductDescription, ProductImages };
