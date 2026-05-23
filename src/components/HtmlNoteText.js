import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { FontSizes } from '../constants/typography';
import { escapeHtml, htmlToPlainText, noteToHtml } from '../utils/htmlNote';

export default function HtmlNoteText({ html, fallback, style, numberOfLines, preview = false }) {
  const { width } = useWindowDimensions();
  const safeHtml = noteToHtml(html);
  const source = useMemo(
    () => ({ html: safeHtml || `<p>${escapeHtml(fallback ?? '')}</p>` }),
    [fallback, safeHtml]
  );

  if (preview) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {htmlToPlainText(safeHtml) || fallback}
      </Text>
    );
  }

  return (
    <View style={style}>
      <RenderHtml
        contentWidth={width - 64}
        source={source}
        baseStyle={styles.base}
        tagsStyles={tagsStyles}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    color: '#000000',
    fontSize: FontSizes.m,
    lineHeight: 22,
  },
});

const tagsStyles = {
  body: {
    color: '#000000',
  },
  p: {
    marginTop: 0,
    marginBottom: 8,
  },
  div: {
    marginTop: 0,
    marginBottom: 8,
  },
  ul: {
    marginTop: 0,
    marginBottom: 8,
    paddingLeft: 20,
  },
  ol: {
    marginTop: 0,
    marginBottom: 8,
    paddingLeft: 20,
  },
};
