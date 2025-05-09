
import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin[]
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  autoplay?: boolean
  interval?: number
  marquee?: boolean
  speed?: number
  marqueeDirection?: "ltr" | "rtl"
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof React.useRef<HTMLDivElement>>
  api: ReturnType<typeof useEmblaCarousel>[1]
  opts: CarouselOptions
  orientation: Exclude<CarouselProps["orientation"], undefined>
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      autoplay = false,
      interval = 3000,
      className,
      children,
      marquee,
      speed = 1,
      marqueeDirection = "ltr",
      ...props
    },
    ref
  ) => {
    const options = {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
      loop: marquee || opts?.loop,
      draggable: marquee ? false : opts?.draggable ?? true,
      dragFree: marquee ? true : opts?.dragFree ?? false,
    }

    const carouselRef = React.useRef<HTMLDivElement>(null)
    const [emblaRef, emblaApi] = useEmblaCarousel(options, plugins)
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const scrollPrev = React.useCallback(() => {
      emblaApi?.scrollPrev()
    }, [emblaApi])

    const scrollNext = React.useCallback(() => {
      emblaApi?.scrollNext()
    }, [emblaApi])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault()
          scrollPrev()
        } else if (event.key === "ArrowRight") {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext]
    )

    const onSelect = React.useCallback(() => {
      if (!emblaApi) return

      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }, [emblaApi, setCanScrollPrev, setCanScrollNext])

    React.useEffect(() => {
      if (!emblaApi) {
        return
      }

      onSelect()
      emblaApi.on("select", onSelect)
      emblaApi.on("reInit", onSelect)

      if (setApi) {
        setApi(emblaApi)
      }
    }, [emblaApi, onSelect, setApi])

    React.useEffect(() => {
      if (marquee && emblaApi) {
        const autoplayTimer = setInterval(() => {
          const scrollDirection = marqueeDirection === "ltr" ? 1 : -1
          const scrollSnaps = emblaApi.scrollSnapList()
          const lastSnap = scrollSnaps.length - 1

          if (lastSnap === 0) {
            return
          }

          const targetIndex =
            marqueeDirection === "ltr" ? 1 : emblaApi.selectedScrollSnap() - 1

          if (targetIndex < 0) {
            emblaApi.scrollTo(lastSnap)
            return
          }

          if (targetIndex > lastSnap) {
            emblaApi.scrollTo(0)
            return
          }

          emblaApi.scrollTo(targetIndex)
        }, 100 / speed)

        return () => clearInterval(autoplayTimer)
      }

      if (autoplay && emblaApi) {
        const autoplayTimer = setInterval(() => {
          if (!emblaApi.canScrollNext()) {
            emblaApi.scrollTo(0)
            return
          }

          emblaApi.scrollNext()
        }, interval)

        return () => clearInterval(autoplayTimer)
      }
    }, [autoplay, emblaApi, interval, marquee, marqueeDirection, speed])

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: emblaApi,
          opts: options,
          orientation,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          autoplay,
          interval,
        }}
      >
        <div
          ref={ref}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          onKeyDownCapture={handleKeyDown}
          {...props}
        >
          <div ref={carouselRef} className="overflow-hidden">
            <div ref={emblaRef} className="flex">
              {children}
            </div>
          </div>
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
        className
      )}
      {...props}
    />
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 top-1/2 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 top-1/2 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
