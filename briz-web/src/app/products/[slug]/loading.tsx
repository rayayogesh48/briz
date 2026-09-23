export default function ProductLoadingSkeleton() {
  return (
    <div className="w-full bg-[#f9f9f9] min-h-screen px-4 sm:px-8 lg:px-12 py-6 animate-pulse">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 h-4 w-64 bg-slate-200 rounded-md" />

        {/* 2-Column Section: First = Image, Second = Details & Store Detail at last */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* First Column: Gallery Skeleton */}
          <div className="w-full lg:w-[52%] flex flex-col gap-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-xl bg-slate-200" />
              <div className="h-20 w-20 rounded-xl bg-slate-200" />
              <div className="h-20 w-20 rounded-xl bg-slate-200" />
              <div className="h-20 w-20 rounded-xl bg-slate-200" />
            </div>
          </div>

          {/* Second Column: Details Skeleton */}
          <div className="w-full lg:w-[48%] flex flex-col gap-6">
            {/* Information */}
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-36 bg-slate-200 rounded-md" />
              <div className="h-6 w-20 bg-slate-200 rounded-md" />
            </div>
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-16 w-full bg-slate-200 rounded-lg" />

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="h-12 w-full bg-slate-200 rounded-xl" />
              <div className="h-12 w-full bg-slate-200 rounded-xl" />
            </div>

            {/* Description */}
            <div className="h-44 w-full bg-slate-200 rounded-2xl" />

            {/* Benefits */}
            <div className="h-32 w-full bg-slate-200 rounded-2xl" />

            {/* Seller at last */}
            <div className="h-28 w-full bg-slate-200 rounded-2xl" />
          </div>
        </div>

        {/* Bottom Full 1-Column Section: Similar Products Skeleton */}
        <div className="w-full pt-8 border-t border-[#ebebeb] flex flex-col gap-4">
          <div className="h-6 w-44 bg-slate-200 rounded-md" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-64 w-full bg-slate-200 rounded-2xl" />
            <div className="h-64 w-full bg-slate-200 rounded-2xl" />
            <div className="h-64 w-full bg-slate-200 rounded-2xl" />
            <div className="h-64 w-full bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
