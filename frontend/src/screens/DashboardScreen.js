import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import StatTile from '../components/StatTile';
import Badge from '../components/Badge';
import Button from '../components/Button';
import api from '../services/api';

export default function DashboardScreen({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const endpoint = user?.isClient ? '/dashboard/client' : '/dashboard/freelancer';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.log('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isClient = user?.isClient;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.welcomeRow}>
        <View>
          <Badge
            label={isClient ? 'Client Console' : 'Student Freelancer Console'}
            variant={isClient ? 'primary' : 'success'}
            style={{ marginBottom: 8 }}
          />
          <Text style={styles.welcomeTitle}>Welcome back, {user?.firstName}!</Text>
          <Text style={styles.welcomeSub}>
            {isClient
              ? user?.clientProfile?.companyName || 'Manage your active projects, proposals, and milestones'
              : user?.freelancerProfile?.title || 'Track your active bids, deliverables, and wallet earnings'}
          </Text>
        </View>

        <View style={styles.topActions}>
          {isClient ? (
            <Button
              title="+ Post a New Project"
              variant="primary"
              size="md"
              onPress={() => onNavigate('PostJob')}
            />
          ) : (
            <Button
              title="🔍 Find More Jobs"
              variant="primary"
              size="md"
              onPress={() => onNavigate('Jobs')}
            />
          )}
          <Button
            title="Wallet & Ledger"
            variant="outline"
            size="md"
            onPress={() => onNavigate('Wallet')}
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        {isClient ? (
          <>
            <StatTile
              label="Open Projects"
              value={(dashboardData?.activeJobsCount || 0).toString()}
              valueColor={theme.colors.primary}
            />
            <StatTile
              label="Proposals to Review"
              value={(dashboardData?.pendingProposalsCount || 0).toString()}
              valueColor={theme.colors.warning}
            />
            <StatTile
              label="Active Contracts"
              value={(dashboardData?.activeContracts?.length || 0).toString()}
              valueColor={theme.colors.sky}
            />
            <StatTile
              label="Total Escrow Spent"
              value={`$${user?.clientProfile?.totalSpent || 0}`}
              valueColor={theme.colors.success}
            />
          </>
        ) : (
          <>
            <StatTile
              label="Available Wallet"
              value={`$${dashboardData?.wallet?.balance?.toFixed(2) || '0.00'}`}
              valueColor={theme.colors.success}
            />
            <StatTile
              label="Active Contracts"
              value={(dashboardData?.activeContracts?.length || 0).toString()}
              valueColor={theme.colors.primary}
            />
            <StatTile
              label="Pending Bids"
              value={(dashboardData?.activeProposalsCount || 0).toString()}
              valueColor={theme.colors.warning}
            />
            <StatTile
              label="Total Earned"
              value={`$${user?.freelancerProfile?.totalEarned || 0}`}
              valueColor={theme.colors.sky}
            />
          </>
        )}
      </View>

      {/* Main Content Layout */}
      <View style={styles.layout}>
        {/* Left Column: Active Contracts & Jobs/Proposals */}
        <View style={styles.mainCol}>
          {/* Active Workroom Contracts */}
          <View style={[styles.card, theme.shadows.sm, { marginBottom: 20 }]}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Active Workroom Contracts</Text>
              <TouchableOpacity onPress={() => onNavigate('Contracts')}>
                <Text style={styles.viewAll}>View All →</Text>
              </TouchableOpacity>
            </View>

            {dashboardData?.activeContracts?.length === 0 ? (
              <Text style={styles.emptyText}>No contracts currently in progress.</Text>
            ) : (
              dashboardData?.activeContracts?.map((c) => (
                <View key={c._id} style={styles.contractListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contractJobTitle}>{c.job?.title || 'Contract Room'}</Text>
                    <Text style={styles.contractMeta}>
                      {isClient
                        ? `Freelancer: ${c.freelancer?.firstName} ${c.freelancer?.lastName}`
                        : `Client: ${c.client?.clientProfile?.companyName || c.client?.firstName}`}
                    </Text>
                  </View>
                  <Button
                    title="Enter Room →"
                    variant="primary"
                    size="sm"
                    onPress={() => onNavigate('ContractRoom', { contractId: c._id })}
                  />
                </View>
              ))
            )}
          </View>

          {/* Client: Posted Jobs | Freelancer: Submitted Proposals */}
          <View style={[styles.card, theme.shadows.sm]}>
            <Text style={styles.cardTitle}>
              {isClient ? 'Your Posted Projects' : 'Your Submitted Bids & Proposals'}
            </Text>

            {isClient ? (
              dashboardData?.postedJobs?.length === 0 ? (
                <Text style={styles.emptyText}>You have not posted any projects yet.</Text>
              ) : (
                dashboardData?.postedJobs?.map((job) => (
                  <View key={job._id} style={styles.tableRow}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.rowTitle}>{job.title}</Text>
                      <Text style={styles.rowSub}>{job.category}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Badge
                        label={job.status.toUpperCase()}
                        variant={job.status === 'open' ? 'success' : 'warning'}
                      />
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Button
                        title={`Review (${job.proposalsCount || 0})`}
                        size="sm"
                        variant="outline-primary"
                        onPress={() => onNavigate('JobDetail', { jobId: job._id })}
                      />
                    </View>
                  </View>
                ))
              )
            ) : dashboardData?.proposals?.length === 0 ? (
              <Text style={styles.emptyText}>You have not placed any bids yet. Browse open jobs to apply!</Text>
            ) : (
              dashboardData?.proposals?.map((prop) => (
                <View key={prop._id} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.rowTitle}>{prop.job?.title || 'Job Proposal'}</Text>
                    <Text style={styles.rowSub}>Bid: ${prop.bidAmount} ({prop.estimatedDays} days)</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Badge
                      label={prop.status.toUpperCase()}
                      variant={prop.status === 'accepted' ? 'success' : prop.status === 'shortlisted' ? 'warning' : 'neutral'}
                    />
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Button
                      title="View Job"
                      size="sm"
                      variant="outline"
                      onPress={() => onNavigate('JobDetail', { jobId: prop.job?._id })}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Right Sidebar: Wallet & Transactions */}
        <View style={styles.sideCol}>
          <View style={[styles.card, theme.shadows.sm, { marginBottom: 20 }]}>
            <Text style={styles.sidebarLabel}>Simulated Wallet Overview</Text>
            <Text style={styles.walletBigVal}>
              ${dashboardData?.wallet?.balance?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.escrowNotice}>
              Locked in Escrow: ${dashboardData?.wallet?.escrowHeld?.toFixed(2) || '0.00'}
            </Text>

            <Button
              title="Deposit / Manage Ledger"
              variant="success"
              size="sm"
              onPress={() => onNavigate('Wallet')}
              style={{ marginTop: 14 }}
            />
          </View>

          {/* Recent Ledger Activity */}
          <View style={[styles.card, theme.shadows.sm]}>
            <Text style={styles.cardTitle}>Recent Escrow Activity</Text>
            {dashboardData?.recentTransactions?.length === 0 ? (
              <Text style={styles.emptyText}>No transactions recorded yet.</Text>
            ) : (
              dashboardData?.recentTransactions?.map((tx, idx) => (
                <View key={idx} style={styles.txRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txType}>{tx.transactionType.toUpperCase()}</Text>
                    <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  </View>
                  <Text style={[styles.txAmount, tx.amount > 0 ? styles.txPos : styles.txNeg]}>
                    {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 26,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 28,
  },
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  mainCol: {
    flex: 2,
    minWidth: 320,
  },
  sideCol: {
    flex: 1,
    minWidth: 280,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 22,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 14,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  contractListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 14,
    marginBottom: 10,
  },
  contractJobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  contractMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  rowSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sidebarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  walletBigVal: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.success,
  },
  escrowNotice: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 10,
  },
  txType: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
  },
  txDesc: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txPos: {
    color: theme.colors.success,
  },
  txNeg: {
    color: theme.colors.danger,
  },
});
