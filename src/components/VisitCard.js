import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, CalendarCheck, CheckCircle2, Clock, Clock3, MapPin, MoreHorizontal } from 'lucide-react-native';

function VisitStatusIcon({ status }) {
  if (status === 'Zatwierdzone') {
    return (
      <View style={[styles.statusIcon, styles.statusApproved]}>
        <CheckCircle2 color="#10b981" size={16} strokeWidth={2.25} />
      </View>
    );
  }

  if (status === 'Zakończone') {
    return (
      <View style={[styles.statusIcon, styles.statusDone]}>
        <CalendarCheck color="#64748b" size={16} strokeWidth={2.25} />
      </View>
    );
  }

  return (
    <View style={[styles.statusIcon, styles.statusPending]}>
      <Clock3 color="#f97316" size={16} strokeWidth={2.25} />
    </View>
  );
}

export function VisitCard({ visit, showActions, onReschedule }) {
  const statusTextStyle =
    visit.status === 'Zatwierdzone'
      ? styles.statusApprovedText
      : visit.status === 'Zakończone'
        ? styles.statusDoneText
        : styles.statusPendingText;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.topRowLeft}>
          <VisitStatusIcon status={visit.status} />
          <View>
            <Text style={styles.visitType}>{visit.type}</Text>
            <Text style={[styles.statusLabel, statusTextStyle]}>{visit.status}</Text>
          </View>
        </View>
        <Pressable hitSlop={8}>
          <MoreHorizontal color="#cbd5e1" size={20} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.animalRow}>
        <Image source={{ uri: visit.animalImage }} style={styles.animalImage} />
        <View style={styles.animalInfo}>
          <Text style={styles.animalName}>{visit.animalName}</Text>
          <View style={styles.metaRow}>
            <Calendar color="#94a3b8" size={14} strokeWidth={2.25} />
            <Text style={styles.metaText}>{visit.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Clock color="#94a3b8" size={14} strokeWidth={2.25} />
            <Text style={styles.metaText}>{visit.time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationBox}>
        <MapPin color="#f97316" size={15} strokeWidth={2.25} />
        <Text style={styles.locationText}>{visit.location}</Text>
      </View>

      {showActions ? (
        <View style={styles.actionsRow}>
          <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.secondaryButtonText}>Anuluj</Text>
          </Pressable>
          <Pressable
            onPress={onReschedule}
            style={({ pressed }) => [styles.primaryGhostButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryGhostButtonText}>Zmień termin</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  topRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusApproved: {
    backgroundColor: '#ecfdf5',
  },
  statusDone: {
    backgroundColor: '#f1f5f9',
  },
  statusPending: {
    backgroundColor: '#fff7ed',
  },
  visitType: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusApprovedText: {
    color: '#10b981',
  },
  statusDoneText: {
    color: '#64748b',
  },
  statusPendingText: {
    color: '#f97316',
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  animalImage: {
    width: 68,
    height: 68,
    borderRadius: 18,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  primaryGhostButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: '#fff7ed',
  },
  primaryGhostButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ea580c',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});