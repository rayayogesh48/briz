"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductDescriptionProps {
  description: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > 220;

  return (
    <section
      aria-labelledby="about-product-heading"
      className="flex flex-col gap-3 rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-6 shadow-xs"
    >
      <h2
        id="about-product-heading"
        className="text-base sm:text-lg font-bold tracking-tight text-[#202020]"
      >
        Description
      </h2>

      {/* Clean Readable Description Paragraph */}
      <div className="flex flex-col gap-2">
        <p className="text-sm leading-relaxed text-[#505050]">
          {isLong && !isExpanded ? `${description.slice(0, 220)}...` : description}
        </p>

        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[#3e63dd] transition hover:underline pt-0.5"
          >
            <span>{isExpanded ? "Show less" : "Read more"}</span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </section>
  );
}
