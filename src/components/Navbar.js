// src/components/Navbar.js
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import addIcon from "../assets/icons/add.png";
import homeIcon from "../assets/icons/home.png";
import journalIcon from "../assets/icons/journal.png";
import profileIcon from "../assets/icons/profile.png";
import searchIcon from "../assets/icons/search.png";

export default function Navbar() {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Image source={homeIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image source={searchIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image source={addIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image source={journalIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity>
        <Image source={profileIcon} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: "#5A6FB2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});