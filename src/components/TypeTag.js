import { StyleSheet, Text, View } from 'react-native';
import { getEntryType } from '../constants/entryTypes';
import { FontSizes } from '../constants/typography';

export default function TypeTag({ type, style, textStyle }) {
  const entryType = getEntryType(type);

  return (
    <View style={[styles.tag, style]}>
      <Text style={[styles.text, textStyle]} numberOfLines={1}>
        {entryType.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#E6E6E6',
    borderWidth: 1,
    borderColor: '#B7BDC9',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    color: '#2F3542',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
});
