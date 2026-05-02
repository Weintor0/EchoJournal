import { useRef } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";
import { FontSizes } from "../constants/typography";

const SLIDER_STEP = 0.1;

export default function RatingSlider({
  value = 0,
  onChange,
  min = 0,
  max = 10,
  step = SLIDER_STEP,
  showValue = true,
}) {
  const sliderWidthRef = useRef(0);

  function normalizeValue(val) {
    const clamped = Math.max(min, Math.min(max, val));
    const stepped =
      Math.round(clamped * (1 / step)) / (1 / step);
    return stepped;
  }

  function updateFromPosition(positionX) {
    if (sliderWidthRef.current <= 0) return;

    const clampedPosition = Math.max(
      0,
      Math.min(sliderWidthRef.current, positionX)
    );

    const ratio = clampedPosition / sliderWidthRef.current;
    const rawValue = min + ratio * (max - min);

    const finalValue = normalizeValue(rawValue);
    onChange(finalValue);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        updateFromPosition(e.nativeEvent.locationX);
      },
      onPanResponderMove: (e) => {
        updateFromPosition(e.nativeEvent.locationX);
      },
    })
  ).current;

  const percentage = (value - min) / (max - min);

  return (
    <View style={styles.container}>
      {showValue && (
        <Text style={styles.valueText}>
          {value.toFixed(1)}
        </Text>
      )}

      <View
        style={styles.track}
        onLayout={(e) => {
          sliderWidthRef.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View style={[styles.filled, { width: `${percentage * 100}%` }]} />

        <View
          style={[
            styles.thumb,
            { left: `${percentage * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  valueText: {
    textAlign: "start",
    marginBottom: 5,
    fontWeight: "600",
    fontSize: FontSizes.l,
  },
  track: {
    height: 10,
    backgroundColor: '#C4C8D1',
    borderRadius: 999,
    position: 'relative',
    justifyContent: 'center',
    marginTop: 6,
  },
  filled: {
    position: "absolute",
    height: 6,
    backgroundColor: "rgb(90, 111, 178)",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 16,
    height: 16,
    backgroundColor: "rgb(90, 111, 178)",
    borderRadius: 8,
    transform: [{ translateX: -8 }],
  },
});