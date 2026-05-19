const DEMO_IMAGE = "/images/map/regrid-auto-outline-demo.png";

/** Static Regrid parcel map for demo (Auto outlines mode). Matches live map chrome. */
export default function RegridDemoMap() {
  return (
    <div className="fm-location-map-wrap">
      <div className="fm-basemap-toggle">
        <button type="button" className="active" aria-current="true">
          Satellite
        </button>
      </div>
      <div className="fm-location-map fm-location-map--demo" aria-label="Satellite map with parcel boundaries">
        <img src={DEMO_IMAGE} alt="" className="fm-location-map-demo-img" draggable={false} />
      </div>
    </div>
  );
}
