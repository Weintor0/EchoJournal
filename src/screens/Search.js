import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';


export default function SearchScreen() {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <TextInput
          placeholder="Search..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
      </View>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6E6E6' 
  },

  content: { 
    flex: 1, 
    padding: 16 
  },

  input: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#D9DCE3',
    paddingHorizontal: 10,
      fontSize: FontSizes.l
  },
});
