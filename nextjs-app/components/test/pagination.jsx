"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  itemsPerPage,
  totalItems,
  paginate,
  currentPage,
}) {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center">
      <nav className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="icon"
              onClick={() => paginate(number)}
              className="w-8 h-8"
            >
              {number}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            currentPage < pageNumbers.length && paginate(currentPage + 1)
          }
          disabled={currentPage === pageNumbers.length}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </nav>
    </div>
  );
}
