import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import { toPng } from "html-to-image";
import schoolPhoto from "@assets/image_1777055309803.png";

type LabelDir = "top" | "bottom" | "left" | "right";

type Station = {
  id: string;
  name: string;
  type: "metro" | "cptm";
  line: string;
  lineColor: string;
  position: [number, number];
  labelDir: LabelDir;
  labelOffset: [number, number];
};

const SCHOOL: { name: string; address: string; position: [number, number] } = {
  name: 'Escola SENAI "Morvan Figueiredo"',
  address: "Rua do Oratório, 215 — Mooca, São Paulo",
  position: [-23.5535, -46.6045],
};

const STATIONS: Station[] = [
  {
    id: "bresser-mooca",
    name: "Bresser-Mooca",
    type: "metro",
    line: "Linha 3 — Vermelha",
    lineColor: "#E20E18",
    position: [-23.5483, -46.6062],
    labelDir: "left",
    labelOffset: [-34, -2],
  },
  {
    id: "belem",
    name: "Belém",
    type: "metro",
    line: "Linha 3 — Vermelha",
    lineColor: "#E20E18",
    position: [-23.5444, -46.5947],
    labelDir: "right",
    labelOffset: [34, -2],
  },
  {
    id: "bras",
    name: "Brás",
    type: "metro",
    line: "Linha 3 — Vermelha / CPTM",
    lineColor: "#E20E18",
    position: [-23.5388, -46.6147],
    labelDir: "top",
    labelOffset: [0, -32],
  },
  {
    id: "mooca-cptm",
    name: "Mooca",
    type: "cptm",
    line: "Linha 10 — Turquesa",
    lineColor: "#00A99D",
    position: [-23.5673, -46.5949],
    labelDir: "right",
    labelOffset: [34, 2],
  },
  {
    id: "ipiranga",
    name: "Ipiranga",
    type: "cptm",
    line: "Linha 10 — Turquesa",
    lineColor: "#00A99D",
    position: [-23.5957, -46.5979],
    labelDir: "bottom",
    labelOffset: [0, 32],
  },
];

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1).replace(".", ",")} km`;
}

function formatWalkTime(m: number): string {
  const minutes = Math.round(m / 80);
  return `aprox. ${minutes} min a pé`;
}

const schoolIcon = L.divIcon({
  className: "school-marker",
  iconSize: [64, 80],
  iconAnchor: [32, 77],
  popupAnchor: [0, -86],
  html: `
    <div class="school-marker-inner-photo">
      <div class="school-photo-wrap">
        <img src="${schoolPhoto}" alt="Escola SENAI Morvan Figueiredo" />
      </div>
      <div class="school-photo-pin"></div>
    </div>
  `,
});

function makeStationIcon(station: Station): L.DivIcon {
  const label = station.type === "metro" ? "M" : "T";
  return L.divIcon({
    className: "station-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
    html: `
      <div style="
        width: 44px; height: 44px;
        background: ${station.lineColor}; color: white;
        border-radius: 10px;
        border: 4px solid white;
        box-shadow: 0 6px 16px rgba(0,0,0,0.35);
        display:flex; align-items:center; justify-content:center;
        font-weight: 900; font-size: 20px; font-family: Inter, sans-serif;
        transform: rotate(45deg);
      ">
        <span style="transform: rotate(-45deg); display:inline-block;">${label}</span>
      </div>
    `,
  });
}

function FitToMarkers({ points }: { points: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, points]);
  return null;
}

type StationWithDistance = Station & { distance: number };

function StationCard({
  station,
  onHighlight,
}: {
  station: StationWithDistance;
  onHighlight: () => void;
}) {
  return (
    <button
      onClick={onHighlight}
      className="group w-full text-left flex gap-4 items-start p-4 rounded-xl bg-card border border-border hover-elevate transition-all"
    >
      <div
        className="shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md"
        style={{ background: station.lineColor }}
      >
        {station.type === "metro" ? "M" : "T"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">
            {station.type === "metro" ? "Metrô" : "CPTM"} — {station.name}
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{station.line}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-bold text-foreground">
            {formatDistance(station.distance)}
          </span>
          <span className="text-muted-foreground">
            {formatWalkTime(station.distance)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function App() {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [schoolPhotoPos, setSchoolPhotoPos] = useState<[number, number]>(
    SCHOOL.position
  );
  const printRef = useRef<HTMLDivElement>(null);

  const stationsWithDistance = useMemo<StationWithDistance[]>(
    () =>
      STATIONS.map((s) => ({
        ...s,
        distance: haversine(SCHOOL.position, s.position),
      })).sort((a, b) => a.distance - b.distance),
    []
  );

  const allPoints: LatLngExpression[] = useMemo(
    () => [SCHOOL.position, ...STATIONS.map((s) => s.position)],
    []
  );

  const photoMoved =
    schoolPhotoPos[0] !== SCHOOL.position[0] ||
    schoolPhotoPos[1] !== SCHOOL.position[1];

  const resetSchoolPhoto = () => setSchoolPhotoPos(SCHOOL.position);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = "mapa-escola-mooca.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Falha ao gerar imagem", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print border-b border-border bg-card/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={schoolPhoto}
              alt="Escola SENAI"
              className="w-10 h-10 rounded-lg object-cover border border-border shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate">
                Escola SENAI "Morvan Figueiredo"
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Estações de metrô e trem mais próximas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-border bg-background hover-elevate font-medium"
            >
              Imprimir
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover-elevate font-medium disabled:opacity-60"
            >
              {downloading ? "Gerando..." : "Baixar imagem"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div
          ref={printRef}
          className="print-area bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
        >
          <div className="px-6 py-5 border-b border-border bg-gradient-to-br from-primary/5 to-accent/5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Como chegar à escola
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {SCHOOL.address}
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-0">
            <div className="relative h-[420px] sm:h-[520px] lg:h-[620px] bg-muted">
              <div
                className="map-overlay no-print"
                style={{ top: 12, right: 12 }}
              >
                <span className="map-hint">
                  Arraste a foto da escola para reposicionar
                </span>
                {photoMoved && (
                  <button
                    type="button"
                    onClick={resetSchoolPhoto}
                    className="map-reset-btn"
                  >
                    Restaurar posição
                  </button>
                )}
              </div>
              <MapContainer
                center={SCHOOL.position}
                zoom={15}
                style={{ width: "100%", height: "100%" }}
                scrollWheelZoom={true}
                attributionControl={true}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}{r}.png"
                  subdomains={["a", "b", "c", "d"]}
                  maxZoom={20}
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}{r}.png"
                  subdomains={["a", "b", "c", "d"]}
                  maxZoom={20}
                  zIndex={650}
                  attribution=""
                />
                <FitToMarkers points={allPoints} />

                <Circle
                  center={SCHOOL.position}
                  radius={300}
                  pathOptions={{
                    color: "#DC2626",
                    weight: 1,
                    fillColor: "#DC2626",
                    fillOpacity: 0.05,
                  }}
                />

                {stationsWithDistance.map((station) => (
                  <Polyline
                    key={`line-${station.id}`}
                    positions={[SCHOOL.position, station.position]}
                    pathOptions={{
                      color: "#ffffff",
                      weight: highlightedId === station.id ? 9 : 7,
                      opacity: 0.95,
                    }}
                  />
                ))}
                {stationsWithDistance.map((station) => (
                  <Polyline
                    key={`line-fg-${station.id}`}
                    positions={[SCHOOL.position, station.position]}
                    pathOptions={{
                      color: station.lineColor,
                      weight: highlightedId === station.id ? 5 : 4,
                      opacity: highlightedId === station.id ? 1 : 0.85,
                      dashArray: highlightedId === station.id ? undefined : "10 6",
                    }}
                  />
                ))}

                {photoMoved && (
                  <>
                    <Polyline
                      positions={[SCHOOL.position, schoolPhotoPos]}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        opacity: 0.9,
                        dashArray: "4 5",
                      }}
                    />
                    <Circle
                      center={SCHOOL.position}
                      radius={18}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        fillColor: "#DC2626",
                        fillOpacity: 1,
                      }}
                    />
                  </>
                )}

                <Marker
                  position={schoolPhotoPos}
                  icon={schoolIcon}
                  zIndexOffset={1000}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const ll = e.target.getLatLng();
                      setSchoolPhotoPos([ll.lat, ll.lng]);
                    },
                  }}
                >
                  <Popup>
                    <div className="font-sans" style={{ minWidth: 200 }}>
                      <img
                        src={schoolPhoto}
                        alt="Escola SENAI"
                        style={{
                          width: "100%",
                          height: 110,
                          objectFit: "cover",
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                      <div className="font-bold text-base">{SCHOOL.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {SCHOOL.address}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {stationsWithDistance.map((station) => (
                  <Marker
                    key={station.id}
                    position={station.position}
                    icon={makeStationIcon(station)}
                    eventHandlers={{
                      click: () => setHighlightedId(station.id),
                    }}
                  >
                    <Tooltip
                      permanent
                      direction={station.labelDir}
                      offset={station.labelOffset}
                      className="station-label"
                    >
                      <div className="station-label-inner">
                        <span
                          className="station-label-dot"
                          style={{ background: station.lineColor }}
                        />
                        <span className="station-label-name">
                          {station.name}
                        </span>
                        <span className="station-label-distance">
                          {formatDistance(station.distance)}
                        </span>
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="font-sans">
                        <div className="font-bold text-base">
                          {station.type === "metro" ? "Metrô" : "CPTM"} —{" "}
                          {station.name}
                        </div>
                        <div
                          className="text-xs font-semibold mt-0.5"
                          style={{ color: station.lineColor }}
                        >
                          {station.line}
                        </div>
                        <div className="text-sm mt-2">
                          <strong>{formatDistance(station.distance)}</strong>{" "}
                          da escola
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatWalkTime(station.distance)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <aside className="border-t lg:border-t-0 lg:border-l border-border p-5 bg-card">
              <div className="mb-4">
                <div className="rounded-xl overflow-hidden border border-border shadow-sm mb-3">
                  <img
                    src={schoolPhoto}
                    alt={SCHOOL.name}
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Escola
                  </span>
                </div>
                <h3 className="mt-1 font-bold text-foreground leading-tight">
                  {SCHOOL.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {SCHOOL.address}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Estações próximas
                </h3>
                <div className="space-y-2">
                  {stationsWithDistance.map((station) => (
                    <StationCard
                      key={station.id}
                      station={station}
                      onHighlight={() =>
                        setHighlightedId((prev) =>
                          prev === station.id ? null : station.id
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
                <p>
                  <strong className="text-foreground">M</strong> = Metrô ·{" "}
                  <strong className="text-foreground">T</strong> = Trem (CPTM)
                </p>
                <p>
                  Distâncias em linha reta. Tempo a pé estimado a 5 km/h.
                </p>
              </div>
            </aside>
          </div>
        </div>

        <p className="no-print text-center text-xs text-muted-foreground mt-6">
          Mapa cartográfico © OpenStreetMap contributors
        </p>
      </main>
    </div>
  );
}
