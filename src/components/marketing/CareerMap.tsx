import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@rivet-gg/components";
import {
  getCountryFlagEmoji,
  getCountryName,
  normalizeCountryCode,
  type CareerLocation,
} from "@/data/career-locations";
import {
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";

const MAP_WIDTH = 201;
const MAP_HEIGHT = 97;
const LOCATION_HIT_RADIUS_PX = 14;

interface CareerMapProps {
  locations: readonly CareerLocation[];
}

interface TouchIntent {
  locationKey: string;
  pointerId: number;
  wasOpen: boolean;
}

type InteractionSource = "focus" | "hover" | "touch";

function getLocationKey(location: Pick<CareerLocation, "city">) {
  return location.city.trim().normalize("NFKC").toLocaleLowerCase("en-US");
}

function getLocationSlug(location: CareerLocation) {
  return `${location.city}-${location.countryCode}`
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isCareerLocation(value: unknown): value is CareerLocation {
  if (!value || typeof value !== "object") return false;

  const location = value as Partial<CareerLocation>;
  if (
    typeof location.city !== "string" ||
    location.city.trim().length === 0 ||
    typeof location.countryCode !== "string" ||
    typeof location.x !== "number" ||
    !Number.isFinite(location.x) ||
    typeof location.y !== "number" ||
    !Number.isFinite(location.y) ||
    location.x < 0 ||
    location.x > MAP_WIDTH ||
    location.y < 0 ||
    location.y > MAP_HEIGHT
  ) {
    return false;
  }

  try {
    normalizeCountryCode(location.countryCode);
    return true;
  } catch {
    return false;
  }
}

function normalizeLocation(location: CareerLocation): CareerLocation {
  return {
    city: location.city.trim(),
    countryCode: normalizeCountryCode(location.countryCode),
    x: location.x,
    y: location.y,
  };
}

function normalizeLocations(
  locations: readonly CareerLocation[],
): CareerLocation[] {
  const normalizedLocations = locations.map(normalizeLocation);
  const locationKeys = new Set<string>();
  const pointKeys = new Set<string>();

  for (const location of normalizedLocations) {
    const locationKey = getLocationKey(location);
    const pointKey = `${location.x}:${location.y}`;
    if (
      !isCareerLocation(location) ||
      locationKeys.has(locationKey) ||
      pointKeys.has(pointKey)
    ) {
      throw new TypeError(
        "Career locations must be valid, unique by city, and use distinct map dots.",
      );
    }
    locationKeys.add(locationKey);
    pointKeys.add(pointKey);
  }

  return normalizedLocations;
}

function findNearestLocation(
  clientX: number,
  clientY: number,
  bounds: DOMRect,
  locations: readonly CareerLocation[],
): CareerLocation | null {
  const pointerX = clientX - bounds.left;
  const pointerY = clientY - bounds.top;
  let nearestLocation: CareerLocation | null = null;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;

  for (const location of locations) {
    const locationX = (location.x / MAP_WIDTH) * bounds.width;
    const locationY = (location.y / MAP_HEIGHT) * bounds.height;
    const distanceSquared =
      (locationX - pointerX) ** 2 + (locationY - pointerY) ** 2;

    if (distanceSquared < nearestDistanceSquared) {
      nearestDistanceSquared = distanceSquared;
      nearestLocation = location;
    }
  }

  return nearestDistanceSquared <= LOCATION_HIT_RADIUS_PX ** 2
    ? nearestLocation
    : null;
}

function LocationMarker({
  location,
  openLocationKey,
  onFocus,
  onBlur,
  onOpenChange,
  onEscapeKeyDown,
}: {
  location: CareerLocation;
  openLocationKey: string | null;
  onFocus: (locationKey: string) => void;
  onBlur: (locationKey: string) => void;
  onOpenChange: (locationKey: string, open: boolean) => void;
  onEscapeKeyDown: (locationKey: string) => void;
}) {
  const locationKey = getLocationKey(location);
  const countryName = getCountryName(location.countryCode);
  const flag = getCountryFlagEmoji(location.countryCode);
  const accessibleName = `${location.city}, ${countryName}`;
  const isOpen = openLocationKey === locationKey;

  return (
    <Tooltip
      open={isOpen}
      disableHoverableContent
      onOpenChange={(open) => onOpenChange(locationKey, open)}
    >
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Team location: ${accessibleName}`}
          data-employee-location={getLocationSlug(location)}
          data-location-key={locationKey}
          className={`group pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${isOpen ? "z-20" : "z-10"}`}
          style={{
            left: `${(location.x / MAP_WIDTH) * 100}%`,
            top: `${(location.y / MAP_HEIGHT) * 100}%`,
          }}
          onFocus={() => onFocus(locationKey)}
          onBlur={() => onBlur(locationKey)}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full bg-accent-deep transition-transform duration-150 group-focus-visible:scale-125 motion-reduce:transition-none ${isOpen ? "scale-125" : ""}`}
          />
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          side="top"
          sideOffset={8}
          collisionPadding={12}
          avoidCollisions
          aria-label={accessibleName}
          data-location-pill
          onEscapeKeyDown={() => onEscapeKeyDown(locationKey)}
          className="!inline-flex !max-w-none items-center gap-1.5 !whitespace-nowrap !rounded-full !border-ink/10 !bg-white !px-3 !py-1 !text-xs !font-medium !text-ink shadow-[0_8px_24px_-12px_rgba(27,25,22,0.35)] motion-reduce:!animate-none"
        >
          <span aria-hidden="true">{flag}</span>
          <span>{location.city}</span>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}

export function CareerMap({ locations }: CareerMapProps) {
  const normalizedLocations = useMemo(
    () => normalizeLocations(locations),
    [locations],
  );
  const [openLocationKey, setOpenLocationKey] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const focusedLocationKeyRef = useRef<string | null>(null);
  const hoverSuppressedLocationKeyRef = useRef<string | null>(null);
  const interactionSourceRef = useRef<InteractionSource | null>(null);
  const touchIntentRef = useRef<TouchIntent | null>(null);

  const openLocation = (
    locationKey: string,
    interactionSource: InteractionSource,
  ) => {
    interactionSourceRef.current = interactionSource;
    setOpenLocationKey(locationKey);
  };

  const closeLocation = (locationKey?: string) => {
    setOpenLocationKey((current) => {
      if (locationKey && current !== locationKey) return current;
      interactionSourceRef.current = null;
      return null;
    });
  };

  const getLocationMarker = (locationKey: string) =>
    Array.from(
      mapRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-location-key]",
      ) ?? [],
    ).find((marker) => marker.dataset.locationKey === locationKey);

  const getPointerLocation = (event: ReactPointerEvent<HTMLDivElement>) =>
    findNearestLocation(
      event.clientX,
      event.clientY,
      event.currentTarget.getBoundingClientRect(),
      normalizedLocations,
    );

  const handleMapPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === "touch" ||
      focusedLocationKeyRef.current ||
      interactionSourceRef.current === "touch"
    ) {
      return;
    }

    const location = getPointerLocation(event);
    if (location) {
      const locationKey = getLocationKey(location);
      if (hoverSuppressedLocationKeyRef.current === locationKey) {
        if (interactionSourceRef.current === "hover") closeLocation();
        return;
      }

      hoverSuppressedLocationKeyRef.current = null;
      openLocation(locationKey, "hover");
    } else {
      hoverSuppressedLocationKeyRef.current = null;
      if (interactionSourceRef.current === "hover") closeLocation();
    }
  };

  const handleMapPointerLeave = () => {
    hoverSuppressedLocationKeyRef.current = null;
    if (interactionSourceRef.current === "hover") closeLocation();
  };

  const handleMapPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;

    hoverSuppressedLocationKeyRef.current = null;
    const location = getPointerLocation(event);
    if (!location) {
      touchIntentRef.current = null;
      return;
    }

    const locationKey = getLocationKey(location);
    touchIntentRef.current = {
      locationKey,
      pointerId: event.pointerId,
      wasOpen: openLocationKey === locationKey,
    };
  };

  const handleMapPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;

    const touchIntent = touchIntentRef.current;
    touchIntentRef.current = null;
    if (!touchIntent || touchIntent.pointerId !== event.pointerId) return;

    const location = getPointerLocation(event);
    if (!location || getLocationKey(location) !== touchIntent.locationKey) {
      return;
    }

    event.preventDefault();
    if (touchIntent.wasOpen) {
      getLocationMarker(touchIntent.locationKey)?.blur();
      closeLocation(touchIntent.locationKey);
    } else {
      openLocation(touchIntent.locationKey, "touch");
      window.requestAnimationFrame(() => {
        getLocationMarker(touchIntent.locationKey)?.focus({
          preventScroll: true,
        });
      });
    }
  };

  const handleMapPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (touchIntentRef.current?.pointerId === event.pointerId) {
      touchIntentRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-[660px]" data-employee-map>
      <TooltipProvider delayDuration={100} skipDelayDuration={100}>
        <div
          ref={mapRef}
          role="group"
          aria-label="Rivet team locations"
          className="relative aspect-[201/97] w-full"
          onPointerMove={handleMapPointerMove}
          onPointerLeave={handleMapPointerLeave}
          onPointerDown={handleMapPointerDown}
          onPointerUp={handleMapPointerUp}
          onPointerCancel={handleMapPointerCancel}
        >
          <img
            src="/images/world-map.svg"
            alt=""
            aria-hidden="true"
            width="660"
            height="320"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full select-none opacity-[0.22] brightness-0"
          />

          {normalizedLocations.map((location) => (
            <LocationMarker
              key={getLocationKey(location)}
              location={location}
              openLocationKey={openLocationKey}
              onFocus={(locationKey) => {
                focusedLocationKeyRef.current = locationKey;
                hoverSuppressedLocationKeyRef.current = null;
                openLocation(locationKey, "focus");
              }}
              onBlur={(locationKey) => {
                if (focusedLocationKeyRef.current === locationKey) {
                  focusedLocationKeyRef.current = null;
                }
                closeLocation(locationKey);
              }}
              onOpenChange={(locationKey, open) => {
                if (open) {
                  openLocation(locationKey, "focus");
                } else {
                  closeLocation(locationKey);
                }
              }}
              onEscapeKeyDown={(locationKey) => {
                hoverSuppressedLocationKeyRef.current = locationKey;
                closeLocation(locationKey);
              }}
            />
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
