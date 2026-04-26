import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import profileIcon from "../assets/icons/profile.png";
import Header from "../components/Header";
import Navbar from '../components/Navbar';
import { FontSizes } from '../constants/typography';


export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={profileIcon} style={styles.icon} />
        <Text style={styles.title}>User Name</Text>
        <Text style={styles.logout}>Log Out</Text>

        <View style={styles.statsContainer}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.statRow}>
              <Text>Stat{i + 1}</Text>
              <Text>6514</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, backgroundColor: '#E6E6E6' 
  },
  
  content: { 
    padding: 16,
    paddingBottom: 24,
  },

  icon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 20
  },

  title: { 
    fontSize: FontSizes.xxl, fontWeight: 'bold', textAlign: 'center' 
  },

  logout: { 
    textAlign: 'center', color: 'gray', marginBottom: 20 
  },

  statsContainer: { 
    marginTop: 20 
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
});
