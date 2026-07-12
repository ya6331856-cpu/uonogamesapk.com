/* Skeleton / shimmer loading placeholders */

export const FeaturedMainSkeleton = () => (
  <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-4">
      <div className="shimmer h-16 w-16 rounded-[16px]" />
      <div className="flex-1 space-y-2">
        <div className="shimmer h-4 w-2/3 rounded-md" />
        <div className="shimmer h-3 w-1/3 rounded-md" />
        <div className="shimmer h-3 w-1/2 rounded-md" />
      </div>
    </div>
    <div className="shimmer mt-4 h-10 w-full rounded-full" />
  </div>
);

export const FeaturedSecondarySkeleton = () => (
  <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
    <div className="shimmer h-12 w-12 rounded-[14px]" />
    <div className="shimmer mt-3 h-3 w-3/4 rounded-md" />
    <div className="shimmer mt-2 h-3 w-1/2 rounded-md" />
    <div className="shimmer mt-3 h-8 w-full rounded-full" />
  </div>
);

export const AppCardSkeleton = () => (
  <div className="flex items-center gap-3 rounded-[20px] border border-[#E5E7EB] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
    <div className="shimmer h-14 w-14 shrink-0 rounded-[14px]" />
    <div className="flex-1 space-y-2">
      <div className="shimmer h-3.5 w-2/3 rounded-md" />
      <div className="shimmer h-3 w-1/2 rounded-md" />
      <div className="shimmer h-3 w-1/3 rounded-md" />
    </div>
    <div className="shimmer h-9 w-24 shrink-0 rounded-full" />
  </div>
);

export const StoreSkeleton = () => (
  <div className="space-y-4">
    <FeaturedMainSkeleton />
    <div className="grid grid-cols-2 gap-3">
      <FeaturedSecondarySkeleton />
      <FeaturedSecondarySkeleton />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <AppCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
