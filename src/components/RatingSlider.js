import Slider from "@react-native-community/slider";
import { StyleSheet, Text, View } from "react-native";
import { FontSizes } from "../constants/typography";

const SLIDER_STEP = 0.5;

function normalizeValue(value, min, max, step) {
  const clamped = Math.max(min, Math.min(max, Number(value) || 0));
  const stepped = Math.round(clamped / step) * step;
  return Math.round(stepped * 10) / 10;
}

function formatValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function RatingSlider({
  value = 0,
  onChange,
  min = 0,
  max = 10,
  step = SLIDER_STEP,
  showValue = true,
}) {
  const sliderValue = normalizeValue(value, min, max, step);

  return (
    <View style={styles.container}>
      {showValue && (
        <View style={styles.valueRow}>
          <Text style={styles.valueText}>{formatValue(sliderValue)}</Text>
          <Text style={styles.maxText}>/ {formatValue(max)}</Text>
        </View>
      )}

      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={sliderValue}
        minimumTrackTintColor="#5A6FB2"
        maximumTrackTintColor="#C4C8D1"
        thumbTintColor="#5A6FB2"
        onValueChange={(nextValue) => {
          onChange?.(normalizeValue(nextValue, min, max, step));
        }}
      />

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>{formatValue(min)}</Text>
        <Text style={styles.rangeText}>{formatValue(max)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 6,
    marginBottom: 10,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 2,
  },
  valueText: {
    fontWeight: "600",
    fontSize: FontSizes.xl,
  },
  maxText: {
    marginLeft: 4,
    color: "#555555",
    fontSize: FontSizes.s,
  },
  slider: {
    width: "100%",
    height: 42,
  },
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  rangeText: {
    color: "#555555",
    fontSize: FontSizes.xs,
  },
});
