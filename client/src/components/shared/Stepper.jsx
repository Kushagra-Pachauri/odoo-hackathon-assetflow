/**
 * <Stepper /> — Horizontal workflow stepper.
 * Filled ink dot = completed, filled accent dot with ring = current,
 * empty line-colored circle = future. Connected by a 1px line.
 */

export default function Stepper({ steps = [], currentIndex = 0 }) {
  return (
    <div className="flex items-start gap-0 w-full">
      {steps.map((label, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={label} className="flex items-start flex-1 last:flex-none">
            {/* Dot + label column */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-4 h-4">
                {isCompleted && (
                  <span className="w-[8px] h-[8px] rounded-full bg-ink" />
                )}
                {isCurrent && (
                  <>
                    <span className="absolute w-[14px] h-[14px] rounded-full border border-accent opacity-40" />
                    <span className="w-[8px] h-[8px] rounded-full bg-accent" />
                  </>
                )}
                {isFuture && (
                  <span className="w-[8px] h-[8px] rounded-full border border-line bg-transparent" />
                )}
              </div>
              <span className="font-sans text-[10.5px] text-center mt-1 leading-tight max-w-[72px] text-ink/60">
                {label}
              </span>
            </div>

            {/* Connecting line (not after the last dot) */}
            {i < steps.length - 1 && (
              <div className="flex-1 flex items-center pt-[7px] px-0.5">
                <div
                  className="h-[1px] w-full"
                  style={{
                    backgroundColor: i < currentIndex ? "#1E7F91" : "#D8D9D2",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
