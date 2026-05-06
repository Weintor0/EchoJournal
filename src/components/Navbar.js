import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import addIcon from "../assets/icons/add.png";
import homeIcon from "../assets/icons/home.png";
import journalIcon from "../assets/icons/journal.png";
import profileIcon from "../assets/icons/profile.png";
import searchIcon from "../assets/icons/search.png";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (route) => {
    if (pathname !== route) {
      if (typeof document !== "undefined" && document.activeElement) {
        document.activeElement.blur();
      }
      router.replace(route);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigate("/")}>
        <Image source={homeIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigate("/search")}>
        <Image source={searchIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigate("/add")}>
        <Image source={addIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigate("/journal")}>
        <Image source={journalIcon} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => navigate("/profile")}>
        <Image source={profileIcon} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 50,
    backgroundColor: "#5A6FB2",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: "4%",
    paddingVertical: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "20%",
  },
  icon: {
    width: 26,
    height: 26,
    resizeMode: "contain",
  },
});
