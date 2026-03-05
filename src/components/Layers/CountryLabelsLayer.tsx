import { useEffect } from "react";
import { useCesium } from "resium";
import {
  Cartesian2,
  Cartesian3,
  Color,
  DistanceDisplayCondition,
  HorizontalOrigin,
  LabelCollection,
  LabelStyle,
  NearFarScalar,
  VerticalOrigin,
} from "cesium";
import { buildCountryLabels } from "../../lib/countryLabels";
import { useLayerStore } from "../../stores/useLayerStore";

const COUNTRY_LABELS = buildCountryLabels();

const LABEL_NEAR = 0;
const LABEL_FAR = 5_000_000;

const LABEL_FILL = Color.fromCssColorString("#66ddff").withAlpha(0.95);
const LABEL_OUTLINE = Color.fromCssColorString("#00161d").withAlpha(0.95);
const LABEL_BG = Color.fromCssColorString("#000000").withAlpha(0.75);

export function CountryLabelsLayer() {
  const { viewer } = useCesium();
  const setCount = useLayerStore((s) => s.setCount);

  useEffect(() => {
    if (!viewer) return;

    const labels = new LabelCollection({ scene: viewer.scene });
    viewer.scene.primitives.add(labels);

    for (const country of COUNTRY_LABELS) {
      labels.add({
        position: Cartesian3.fromDegrees(country.lon, country.lat, 1000),
        text: country.name.toUpperCase(),
        font: "13px 'JetBrains Mono', monospace",
        style: LabelStyle.FILL_AND_OUTLINE,
        fillColor: LABEL_FILL,
        outlineColor: LABEL_OUTLINE,
        outlineWidth: 1.5,
        showBackground: true,
        backgroundColor: LABEL_BG,
        backgroundPadding: new Cartesian2(8, 4),
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.CENTER,
        pixelOffset: new Cartesian2(0, 0),
        distanceDisplayCondition: new DistanceDisplayCondition(
          LABEL_NEAR,
          LABEL_FAR,
        ),
        translucencyByDistance: new NearFarScalar(2_500_000, 1, LABEL_FAR, 0),
        scaleByDistance: new NearFarScalar(1_000_000, 1.1, LABEL_FAR, 0.65),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      } as never);
    }

    setCount("countryLabels", COUNTRY_LABELS.length);

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.primitives.remove(labels);
      }
      setCount("countryLabels", 0);
    };
  }, [viewer, setCount]);

  return null;
}
