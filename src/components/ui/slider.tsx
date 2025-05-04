
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    animated?: boolean
  }
>(({ className, animated = false, ...props }, ref) => {
  const [animatedValue, setAnimatedValue] = React.useState(props.defaultValue || [0]);
  
  // Animation effect for the slider
  React.useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      const maxValue = props.max || 100;
      const nextValue = [...animatedValue];
      
      // Increment by 1 and reset when reaching max
      nextValue[0] = (nextValue[0] + 1) % (maxValue + 1);
      setAnimatedValue(nextValue);
    }, 100);
    
    return () => clearInterval(interval);
  }, [animated, animatedValue, props.max]);
  
  const currentValue = animated ? animatedValue : props.value || props.defaultValue;
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={currentValue}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
