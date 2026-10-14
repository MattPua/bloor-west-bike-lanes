/**
 * Cross-section of Bloor West after install: bike lanes curb-side both ways,
 * car lanes in the middle going opposite directions.
 */
export function IntroHook() {
  return (
    <figure className="intro-hook">
      <figcaption className="intro-hook-title">
        Street layout after install
      </figcaption>
      <p className="intro-hook-sub">
        Cars each way in the middle. A bike lane on each side, with a barrier
        between bike and car.
      </p>

      <div className="street-scene" aria-hidden>
        <div className="street-edge">
          <span className="edge-label">Sidewalk</span>
        </div>

        <div className="bike-slot" data-side="left" data-dir="up">
          <div className="bike-lane">
            <span className="dir-chevron" />
            <span className="bike-icon" />
            <span className="bike-tag">Bike</span>
          </div>
          <div className="barrier" />
        </div>

        <div className="car-bed">
          <div className="car-lane" data-dir="up">
            <span className="dir-chevron" />
            <span className="car-icon" />
            <span className="car-tag">Cars</span>
          </div>
          <div className="center-line" aria-hidden />
          <div className="car-lane" data-dir="down">
            <span className="car-tag">Cars</span>
            <span className="car-icon" />
            <span className="dir-chevron" />
          </div>
        </div>

        <div className="bike-slot" data-side="right" data-dir="down">
          <div className="barrier" />
          <div className="bike-lane">
            <span className="bike-tag">Bike</span>
            <span className="bike-icon" />
            <span className="dir-chevron" />
          </div>
        </div>

        <div className="street-edge">
          <span className="edge-label">Sidewalk</span>
        </div>
      </div>

      <p className="intro-hook-caption">
        About 5 km of Bloor Street West. Built 2023 to 2024.
      </p>
    </figure>
  );
}
