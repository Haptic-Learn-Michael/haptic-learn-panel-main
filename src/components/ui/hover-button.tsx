import * as React from 'react';
import { cn } from '@/lib/utils';

interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const HoverButton = React.forwardRef<HTMLButtonElement, HoverButtonProps>(
  ({ className, children, variant = 'secondary', ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [isListening, setIsListening] = React.useState(false);
    const [circles, setCircles] = React.useState<
      Array<{ id: number; x: number; y: number; color: string; fadeState: 'in' | 'out' | null }>
    >([]);
    const lastAddedRef = React.useRef(0);

    const createCircle = React.useCallback((x: number, y: number) => {
      const buttonWidth = buttonRef.current?.offsetWidth || 0;
      const xPos = x / buttonWidth;
      const color = variant === 'primary'
        ? `linear-gradient(to right, rgba(255,255,255,0.7) ${xPos * 100}%, rgba(255,255,255,0.2) ${xPos * 100}%)`
        : `linear-gradient(to right, var(--circle-start) ${xPos * 100}%, var(--circle-end) ${xPos * 100}%)`;
      setCircles((prev) => [...prev, { id: Date.now(), x, y, color, fadeState: null }]);
    }, [variant]);

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!isListening) return;
        const currentTime = Date.now();
        if (currentTime - lastAddedRef.current > 100) {
          lastAddedRef.current = currentTime;
          const rect = event.currentTarget.getBoundingClientRect();
          createCircle(event.clientX - rect.left, event.clientY - rect.top);
        }
      },
      [isListening, createCircle]
    );

    React.useEffect(() => {
      circles.forEach((circle) => {
        if (!circle.fadeState) {
          setTimeout(() => {
            setCircles((prev) =>
              prev.map((c) => (c.id === circle.id ? { ...c, fadeState: 'in' } : c))
            );
          }, 0);
          setTimeout(() => {
            setCircles((prev) =>
              prev.map((c) => (c.id === circle.id ? { ...c, fadeState: 'out' } : c))
            );
          }, 1000);
          setTimeout(() => {
            setCircles((prev) => prev.filter((c) => c.id !== circle.id));
          }, 2200);
        }
      });
    }, [circles]);

    const isPrimary = variant === 'primary';

    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        className={cn(
          'relative isolate cursor-pointer overflow-hidden',
          'rounded-3xl font-semibold leading-6',
          'before:content-[""] before:absolute before:inset-0',
          'before:rounded-[inherit] before:pointer-events-none before:z-[1]',
          'before:transition-transform before:duration-300',
          'active:before:scale-[0.975] active:scale-[0.98]',
          'transition-all duration-200',
          isPrimary && 'bg-[#FF6B35] text-white px-7 py-3',
          isPrimary && 'before:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_0_16px_0_rgba(255,255,255,0.08),inset_0_-3px_10px_0_rgba(0,0,0,0.15),0_2px_6px_0_rgba(0,0,0,0.4),0_4px_20px_0_rgba(255,107,53,0.45)]',
          isPrimary && 'hover:brightness-110',
          !isPrimary && 'bg-[rgba(255,255,255,0.04)] text-white/65 px-7 py-3',
          !isPrimary && 'backdrop-blur-md',
          !isPrimary && 'before:shadow-[inset_0_0_0_1px_rgba(255,107,53,0.18),inset_0_0_16px_0_rgba(255,107,53,0.05),inset_0_-3px_10px_0_rgba(255,107,53,0.06),0_1px_3px_0_rgba(0,0,0,0.5),0_4px_12px_0_rgba(0,0,0,0.45)]',
          !isPrimary && 'hover:text-white/90 hover:bg-[rgba(255,255,255,0.07)]',
          className
        )}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsListening(true)}
        onPointerLeave={() => setIsListening(false)}
        style={{
          '--circle-start': '#FF6B35',
          '--circle-end': '#FFD166',
          fontFamily: "'Outfit', sans-serif",
        } as React.CSSProperties}
        {...props}
      >
        {circles.map(({ id, x, y, color, fadeState }) => (
          <span
            key={id}
            className={cn(
              'absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full',
              'blur-xl pointer-events-none z-[-1] transition-opacity duration-300',
              fadeState === 'in' && 'opacity-80',
              fadeState === 'out' && 'opacity-0 duration-[1.2s]',
              !fadeState && 'opacity-0'
            )}
            style={{ left: x, top: y, background: color }}
          />
        ))}
        {children}
      </button>
    );
  }
);

HoverButton.displayName = 'HoverButton';
export { HoverButton };
