import { SmallSectionWrapper } from "@/app/_components/global/Wrapper";

export default function Loading() {
  return (
    <SmallSectionWrapper id="loading-post">
      <div className="w-full flex gap-[92px] xl:gap-0 xl:justify-between xl:flex-row flex-col animate-pulse">
        {/* Main Content Area */}
        <div className="w-full xl:w-[60%] flex flex-col gap-[52px]">
          {/* Header Skeleton */}
          <div className="w-full block">
            <div className="flex gap-[18px] lg:gap-[32px] items-center mb-8">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
              <div className="flex flex-col gap-2 w-full">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/2 block lg:hidden" />
              </div>
            </div>
            <div className="w-full flex md:items-center gap-4 md:gap-0 flex-col md:flex-row md:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-24 hidden md:block" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>

          {/* Body Skeleton */}
          <div>
            <div className="w-full h-[253px] md:h-[450px] bg-gray-200 rounded-[20px] mb-[52px] lg:mb-[72px]" />
            <div className="w-full">
              <div className="mb-[42px] flex flex-col lg:flex-row justify-between items-start gap-[32px] lg:items-center">
                <div className="flex flex-wrap gap-[10px]">
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-10 bg-gray-200 rounded-lg w-24" />
              </div>
              
              {/* Text paragraphs skeleton */}
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-full mt-8" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="flex flex-col xl:w-[34%] gap-[52px] w-full">
          <div className="h-8 bg-gray-200 rounded w-48" />
          
          <div className="flex flex-col gap-[62px] w-full mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-full h-[200px] bg-gray-200 rounded-[20px]" />
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SmallSectionWrapper>
  );
}
