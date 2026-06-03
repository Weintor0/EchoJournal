import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import HtmlNoteText from "./HtmlNoteText";
import { FontSizes } from "../constants/typography";
import { useLanguage } from "../hooks/useLanguage";
import TypeTag from "./TypeTag";

const starIcon = require("../assets/icons/star.png");
const calendarIcon = require("../assets/icons/calendar.png");
const deleteIcon = require("../assets/icons/delete.png");
const noImagePlaceholder = require("../assets/no-image.png");
const CARD_IMAGE_WIDTH = 72;
const CARD_IMAGE_HEIGHT = 100;

export default function EntryCard({ entry, onPress, onDelete }) {
  const safeEntry = entry ?? {};
  const { width } = useWindowDimensions();
  const { t } = useLanguage();
  const isCompact = width < 380;
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const imageUrl =
  typeof safeEntry.image === "string" && safeEntry.image.trim()
    ? safeEntry.image
    : typeof safeEntry.imageUrl === "string"
    ? safeEntry.imageUrl
    : "";
  const ratingText =
    safeEntry.rating != null && String(safeEntry.rating).trim()
      ? `${safeEntry.rating}/10`
      : "-";

  function confirmDelete() {
    if (typeof onDelete !== "function" || isDeleting) {
      return;
    }

    setIsDeleteModalVisible(true);
  }

  async function handleDeletePress() {
    if (typeof onDelete !== "function") {
      return;
    }

    try {
      setIsDeleting(true);
      setIsDeleteModalVisible(false);
      await onDelete(entry);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <TouchableOpacity style={[styles.card, isCompact && styles.cardCompact]} onPress={onPress}>
        <View style={[styles.imageSection, isCompact && styles.imageSectionCompact]}>
          <Image
            source={imageUrl ? { uri: imageUrl } : noImagePlaceholder}
            style={styles.image}
            resizeMode={imageUrl ? "cover" : "contain"}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title} numberOfLines={2}>{safeEntry.title ?? t("untitled")}</Text>

          <HtmlNoteText
            html={safeEntry.note}
            fallback={t("noNotesYet")}
            style={styles.preview}
            numberOfLines={2}
            preview
          />

          <View style={styles.footer}>
            <TypeTag type={safeEntry.type} />
            <View style={styles.ratingRow}>
              <Image source={starIcon} style={styles.ratingIcon} />
              <Text style={styles.rating}>{ratingText}</Text>
            </View>
            <View style={styles.dateRow}>
              <Image source={calendarIcon} style={styles.dateIcon} />
              <Text style={styles.date}>{safeEntry.date ?? "-"}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.detailsSection, isCompact && styles.detailsSectionCompact]}>
          {typeof onDelete === "function" ? (
            <Pressable onPress={confirmDelete} disabled={isDeleting}>
              <Image source={deleteIcon} style={styles.deleteIcon} />
            </Pressable>
          ) : (
            <View style={styles.deleteIconSpacer} />
          )}
          <Text style={styles.details}>{t("details")}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!isDeleting) {
              setIsDeleteModalVisible(false);
            }
          }}
        >
          <Pressable style={styles.deleteModal} onPress={() => {}}>
            <Text style={styles.deleteModalTitle}>{t("deleteEntry")}</Text>
            <Text style={styles.deleteModalText}>
              {t("deleteEntryDescription")}
            </Text>
            <View style={styles.deleteModalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.actionButtonText}>{t("cancel")}</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteButton, isDeleting && styles.actionButtonDisabled]}
                onPress={handleDeletePress}
                disabled={isDeleting}
              >
                <Text style={styles.actionButtonText}>
                  {isDeleting ? t("deleting") : t("delete")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#cad2e4",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "flex-start",
    minHeight: 120,
  },
  cardCompact: {
    flexWrap: "wrap",
  },
  imageSection: {
    width: "22%",
    maxWidth: CARD_IMAGE_WIDTH,
    minWidth: 58,
    height: CARD_IMAGE_HEIGHT,
    paddingRight: 10,
    flexShrink: 0,
  },
  imageSectionCompact: {
    width: "28%",
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: "#C4C8D1",
    borderRadius: 5,
    overflow: "hidden",
  },
  infoSection: {
    flex: 1,
    minHeight: CARD_IMAGE_HEIGHT,
    justifyContent: "space-between",
    paddingLeft: 6,
    minWidth: 0,
    flexShrink: 1,
  },
  title: {
    fontWeight: "600",
    fontSize: FontSizes.m,
  },
  preview: {
    fontSize: FontSizes.s,
    color: "#333",
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    //gap: 8,
  },
  rating: {
    fontSize: FontSizes.s,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  ratingIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  deleteIcon: {
    width: 16,
    height: 16,
  },
  deleteIconSpacer: {
    width: 16,
    height: 16,
  },
  date: {
    fontSize: FontSizes.s,
    flexShrink: 1,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
  },
  dateIcon: {
    width: 14,
    height: 14,
    resizeMode: "contain",
  },
  detailsSection: {
    width: "14%",
    maxWidth: 56,
    minWidth: 42,
    minHeight: CARD_IMAGE_HEIGHT,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingLeft: 6,
    flexShrink: 0,
  },
  detailsSectionCompact: {
    width: "100%",
    maxWidth: "100%",
    minHeight: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    paddingLeft: 0,
    paddingTop: 8,
  },
  details: {
    fontSize: FontSizes.xxs,
    textAlign: "right",
  },
  actionButtonText: {
    color: "#000000",
    fontSize: FontSizes.m,
    fontWeight: "600",
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    padding: 20,
  },
  deleteModal: {
    backgroundColor: "#F4F5F7",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  deleteModalTitle: {
    fontSize: FontSizes.l,
    fontWeight: "600",
    color: "#000000",
  },
  deleteModalText: {
    fontSize: FontSizes.m,
    color: "#333333",
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#C4C8D1",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#B45151",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
});
