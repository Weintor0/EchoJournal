import Slider from "@react-native-community/slider";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { FontSizes } from "../constants/typography";

const SLIDER_STEP = 0.1;
const VALUE_INPUT_MIN_WIDTH = 12;
const VALUE_INPUT_CHAR_WIDTH = 11;
const VALUE_INPUT_EXTRA_WIDTH = 4;

function normalizeValue(value, min, max, step) {
  const clamped = Math.max(min, Math.min(max, Number(value) || 0));
  const stepped = Math.round(clamped / step) * step;
  return Math.round(stepped * 10) / 10;
}

function formatValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function estimateInputWidth(value) {
  return Math.max(
    VALUE_INPUT_MIN_WIDTH,
    String(value).length * VALUE_INPUT_CHAR_WIDTH + VALUE_INPUT_EXTRA_WIDTH
  );
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
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(formatValue(sliderValue));
  const inputWidth = estimateInputWidth(inputValue);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(formatValue(sliderValue));
    }
  }, [isEditing, sliderValue]);

  function commitInputValue() {
    setIsEditing(false);

    const parsedValue = Number.parseFloat(inputValue.replace(",", "."));

    if (Number.isNaN(parsedValue)) {
      setInputValue(formatValue(sliderValue));
      return;
    }

    const nextValue = normalizeValue(parsedValue, min, max, step);
    setInputValue(formatValue(nextValue));
    onChange?.(nextValue);
  }

  return (
    <View style={styles.container}>
      {showValue && (
        <View style={styles.valueRow}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            onFocus={() => {
              setIsEditing(true);
              setInputValue(formatValue(sliderValue));
            }}
            onBlur={commitInputValue}
            onSubmitEditing={commitInputValue}
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            maxLength={4}
            style={[styles.valueInput, { width: inputWidth }]}
          />
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
          const normalizedValue = normalizeValue(nextValue, min, max, step);
          setInputValue(formatValue(normalizedValue));
          onChange?.(normalizedValue);
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
    alignItems: "center",
    marginBottom: 2,
  },
  valueInput: {
    height: 26,
    padding: 0,
    paddingVertical: 0,
    color: "#000000",
    fontWeight: "600",
    fontSize: FontSizes.xl,
    lineHeight: 24,
    textAlign: "left",
    textAlignVertical: "center",
  },
  maxText: {
    flexShrink: 0,
    marginLeft: 2,
    color: "#555555",
    fontSize: FontSizes.s,
    lineHeight: 18,
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
