import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import api from '../services/api';

export default function WalletScreen({ onNavigate }) {
  const { user, walletBalance, setWalletBalance } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallet');
      if (res.data.success) {
        setWallet(res.data.wallet);
        setTransactions(res.data.transactions);
        setWalletBalance(res.data.wallet.balance);
      }
    } catch (err) {
      console.log('Error loading wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    try {
      setDepositing(true);
      const res = await api.post('/wallet/deposit', {
        amount: Number(amount),
        description: description || 'Simulated top-up',
      });

      if (res.data.success) {
        alert(`Successfully deposited $${amount} to your wallet!`);
        setAmount('');
        setDescription('');
        fetchWallet();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Simulated Wallet & Escrow Ledger</Text>
          <Text style={styles.subtitle}>
            Double-entry milestone accounting mechanics for university project evaluation
          </Text>
        </View>
        <Badge label="Test Environment Balance" variant="primary" />
      </View>

      {/* Balance Cards */}
      <View style={styles.balanceRow}>
        <View style={[styles.balanceCard, styles.balanceCardPrimary, theme.shadows.sm]}>
          <Text style={styles.cardHeaderSmallLight}>AVAILABLE WALLET BALANCE</Text>
          <Text style={styles.cardBigNumberLight}>${wallet?.balance?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.cardSubTextLight}>Ready to fund project milestones or withdraw</Text>
        </View>

        <View style={[styles.balanceCard, styles.balanceCardWarning, theme.shadows.sm]}>
          <Text style={styles.cardHeaderSmallDark}>ACTIVE ESCROW HELD</Text>
          <Text style={styles.cardBigNumberDark}>${wallet?.escrowHeld?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.cardSubTextDark}>Locked in ongoing contracts awaiting approval</Text>
        </View>
      </View>

      {/* Deposit Form */}
      <View style={[styles.card, theme.shadows.sm, { marginBottom: 24 }]}>
        <Text style={styles.cardTitle}>Deposit Simulated Test Funds</Text>
        <Text style={styles.cardSub}>
          Top up your test balance instantly to fund project milestones or test bidding fees.
        </Text>

        <View style={styles.depositFormRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.inputLabel}>Deposit Amount ($USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          <View style={{ flex: 2, marginRight: 12 }}>
            <Text style={styles.inputLabel}>Transaction Note / Memo</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Funding Phase 1 milestone"
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <Button
            title="Top-Up Balance"
            variant="success"
            size="md"
            loading={depositing}
            onPress={handleDeposit}
            style={{ alignSelf: 'flex-end', marginBottom: 2 }}
          />
        </View>
      </View>

      {/* Ledger History */}
      <View style={[styles.card, theme.shadows.sm]}>
        <Text style={styles.cardTitle}>Escrow Ledger & Transaction Audit Log</Text>
        <Text style={styles.cardSub}>Complete double-entry record of all platform deposits and milestone releases.</Text>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No ledger transactions recorded yet.</Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 1.5 }]}>DATE</Text>
              <Text style={[styles.th, { flex: 1 }]}>TYPE</Text>
              <Text style={[styles.th, { flex: 3 }]}>DESCRIPTION</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>AMOUNT</Text>
            </View>

            {transactions.map((tx) => (
              <View key={tx._id} style={styles.tableBodyRow}>
                <Text style={[styles.td, { flex: 1.5, color: theme.colors.textMuted }]}>
                  {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <View style={{ flex: 1 }}>
                  <Badge
                    label={tx.transactionType.toUpperCase()}
                    variant={
                      tx.transactionType === 'deposit'
                        ? 'success'
                        : tx.transactionType === 'escrow_release'
                        ? 'primary'
                        : tx.transactionType === 'escrow_lock'
                        ? 'warning'
                        : 'neutral'
                    }
                  />
                </View>
                <Text style={[styles.td, { flex: 3 }]}>{tx.description}</Text>
                <Text
                  style={[
                    styles.td,
                    {
                      flex: 1,
                      textAlign: 'right',
                      fontWeight: '700',
                      color: tx.amount > 0 ? theme.colors.success : theme.colors.danger,
                    },
                  ]}
                >
                  {tx.amount > 0 ? `+$${tx.amount}` : `-$${Math.abs(tx.amount)}`}
                </Text>
              </View>
            ))}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
  balanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  balanceCard: {
    flex: 1,
    minWidth: 280,
    borderRadius: theme.radii.lg,
    padding: 24,
  },
  balanceCardPrimary: {
    backgroundColor: theme.colors.primary,
  },
  balanceCardWarning: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeaderSmallLight: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  cardBigNumberLight: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardSubTextLight: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  cardHeaderSmallDark: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    marginBottom: 6,
  },
  cardBigNumberDark: {
    fontSize: 34,
    fontWeight: '800',
    color: theme.colors.warning,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  cardSubTextDark: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  depositFormRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    outlineStyle: 'none',
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 14,
  },
  table: {
    marginTop: 6,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  td: {
    fontSize: 13,
    color: theme.colors.text,
  },
});
