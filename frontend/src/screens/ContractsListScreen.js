import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/colors';
import Badge from '../components/Badge';
import Button from '../components/Button';
import api from '../services/api';

export default function ContractsListScreen({ onNavigate }) {
  const [contracts, setContracts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/contracts' : `/contracts?status=${filter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setContracts(res.data.contracts);
      }
    } catch (err) {
      console.log('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contracts & Engagements</Text>
          <Text style={styles.subtitle}>Active and past freelance contracts with milestone escrow</Text>
        </View>

        {/* Status Filter */}
        <View style={styles.filterRow}>
          {['all', 'active', 'completed'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterBtn, filter === st && styles.filterBtnActive]}
              onPress={() => setFilter(st)}
            >
              <Text style={[styles.filterBtnText, filter === st && styles.filterBtnTextActive]}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : contracts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>📁</Text>
          <Text style={styles.emptyTitle}>No Contracts Found</Text>
          <Text style={styles.emptySub}>You do not have any contracts under this filter criteria.</Text>
          <Button
            title="Browse Open Jobs"
            size="sm"
            variant="primary"
            style={{ marginTop: 14 }}
            onPress={() => onNavigate('Jobs')}
          />
        </View>
      ) : (
        <View style={styles.grid}>
          {contracts.map((c) => (
            <View key={c._id} style={[styles.card, theme.shadows.sm]}>
              <View style={styles.cardTop}>
                <Badge
                  label={c.status === 'active' ? 'Active' : 'Completed'}
                  variant={c.status === 'active' ? 'warning' : 'success'}
                />
                <Text style={styles.totalAmount}>${c.totalAmount}</Text>
              </View>

              <Text style={styles.jobTitle} numberOfLines={2}>
                {c.job?.title || 'Contract Project'}
              </Text>

              <View style={styles.metaBox}>
                <Text style={styles.metaItem}>
                  Client: <Text style={{ fontWeight: '600', color: theme.colors.text }}>{c.client?.clientProfile?.companyName || c.client?.firstName}</Text>
                </Text>
                <Text style={styles.metaItem}>
                  Freelancer: <Text style={{ fontWeight: '600', color: theme.colors.text }}>{c.freelancer?.firstName} {c.freelancer?.lastName}</Text>
                </Text>
              </View>

              {/* Progress */}
              <View style={styles.progressBox}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Milestone Progress</Text>
                  <Text style={styles.progressVal}>{c.progressPercentage}%</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${c.progressPercentage}%` }]} />
                </View>
              </View>

              <Button
                title="Enter Contract Room →"
                size="md"
                variant="primary"
                onPress={() => onNavigate('ContractRoom', { contractId: c._id })}
                style={{ marginTop: 14 }}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgSubtle,
    borderRadius: theme.radii.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.radii.pill,
  },
  filterBtnActive: {
    backgroundColor: '#ffffff',
    ...theme.shadows.sm,
  },
  filterBtnText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 20,
    flex: 1,
    minWidth: 320,
    maxWidth: 380,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.success,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  metaBox: {
    gap: 4,
    marginBottom: 14,
  },
  metaItem: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  progressBox: {
    backgroundColor: theme.colors.bgSubtle,
    padding: 12,
    borderRadius: theme.radii.sm,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  barBg: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.radii.pill,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});
