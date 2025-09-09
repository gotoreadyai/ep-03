export const Background: React.FC = () => {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden p-0 lg:p-2.5 lg:pb-28 pt-0"
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-background rounded-3xl" />
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
          >
            {/* Left large orange blob - positioned at bottom left */}
            <div className="absolute w-[50vw] h-[50vh] bottom-0 left-0 translate-y-[25%] -translate-x-[25%] bg-orange rounded-full blur-[150px] opacity-70 dark:opacity-40" />
            
            {/* Center smaller yellow blob - positioned at bottom center */}
            <div className="absolute w-[30vw] h-[30vh] bottom-0 left-1/2 -translate-x-1/2 translate-y-[20%] bg-yellow rounded-full blur-[100px] opacity-60 dark:opacity-30" />
            
            {/* Right large purple blob - positioned at bottom right */}
            <div className="absolute w-[50vw] h-[50vh] bottom-0 right-0 translate-y-[25%] translate-x-[25%] bg-purple rounded-full blur-[150px] opacity-70 dark:opacity-40" />
          </div>
        </div>
      </div>
    );
  };