import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPin, Clock3, CheckCircle2, CalendarCheck, MoreHorizontal, Calendar } from 'lucide-react-native';
import { Visit } from '../../constants/mockData';

interface VisitCardProps {
  visit: Visit;
  mode?: 'upcoming' | 'history' | 'all';
}

export const VisitCard = React.memo(({ visit, mode = 'all' }: VisitCardProps) => {
  const statusStyle =
    visit.status === 'Zatwierdzone'
      ? styles.statusApproved
      : visit.status === 'Oczekujące'
        ? styles.statusPending
        : styles.statusDone;

  const renderStatusIcon = () => {
    if (visit.status === 'Zatwierdzone') {
      return <CheckCircle2 size={14} color="#10b981" />;
    }

    if (visit.status === 'Zakończone') {
      return <CalendarCheck size={14} color="#64748b" />;
    }

    return <Clock3 size={14} color="#f97316" />;
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.statusHead}>
          {renderStatusIcon()}
          <View>
            <Text style={styles.type}>{visit.type}</Text>
            <View style={[styles.statusBadge, statusStyle]}>
              <Text style={styles.statusText}>{visit.status}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
          <MoreHorizontal size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.middleRow}>
        <Image source={{ uri: visit.animalImage }} style={styles.image} />
        <View style={styles.content}>
          <Text style={styles.animal}>{visit.animalName}</Text>

          <View style={styles.metaRow}>
            <Calendar size={13} color="#64748b" />
            <Text style={styles.metaText}>{visit.date}</Text>
          </View>

          <View style={styles.metaRow}>
            <Clock3 size={13} color="#64748b" />
            <Text style={styles.metaText}>{visit.time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationRow}>
        <MapPin size={14} color="#f97316" />
        <Text style={styles.locationText}>{visit.location}</Text>
      </View>

      {mode === 'upcoming' ? (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.9}>
            <Text style={styles.cancelBtnText}>Anuluj</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeBtn} activeOpacity={0.9}>
            <Text style={styles.changeBtnText}>Zmień termin</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 10,
  },
  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  content: {
    flex: 1,
  },
  type: {
    color: '#1e293b',
    fontWeight: '800',
    fontSize: 13,
  },
  animal: {
    color: '#1e293b',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  metaText: {
    color: '#64748b',
    fontSize: 11,
    flex: 1,
  },
  locationRow: {
    marginTop: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 10,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  changeBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
  },
  changeBtnText: {
    color: '#f97316',
    fontWeight: '700',
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef9c3',
  },
  statusDone: {
    backgroundColor: '#e2e8f0',
  },
  statusText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
