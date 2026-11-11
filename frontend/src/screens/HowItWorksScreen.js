import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme/colors';
import Button from '../components/Button';

export default function HowItWorksScreen({ onNavigate }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.badge}>TRANSPARENT WORKFLOW</Text>
        <Text style={styles.title}>How UniWork Operates</Text>
        <Text style={styles.subtitle}>
          A clear, milestone-driven freelance platform designed specifically for university students, faculty, and industry partners.
        </Text>
      </View>

      <View style={styles.columns}>
        {/* For Clients */}
        <View style={[styles.card, theme.shadows.sm]}>
          <Text style={styles.colTitle}>🏢 For Clients & Research Labs</Text>

          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Post Project Specifications</Text>
              <Text style={styles.stepText}>Specify exact deliverables, required university skills, and budget type (fixed or hourly).</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Review Proposals & Portfolios</Text>
              <Text style={styles.stepText}>Inspect candidate pitches, GitHub/Dribbble portfolios, hourly rates, and university backgrounds.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Accept & Lock Escrow Funds</Text>
              <Text style={styles.stepText}>Accepting a proposal creates an active contract and locks funds safely in simulated escrow.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNum}>4</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Approve Deliverables & Release</Text>
              <Text style={styles.stepText}>Inspect student deliverables. Click approve to release funds instantly to student's wallet.</Text>
            </View>
          </View>

          <Button
            title="Post a Project →"
            variant="primary"
            size="md"
            onPress={() => onNavigate('PostJob')}
            style={{ marginTop: 14 }}
          />
        </View>

        {/* For Freelancers */}
        <View style={[styles.card, theme.shadows.sm]}>
          <Text style={styles.colTitle}>🎓 For Student Freelancers</Text>

          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Browse Real Opportunities</Text>
              <Text style={styles.stepText}>Discover projects in software engineering, AI/ML, UI/UX, academic writing, and consulting.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Submit Targeted Proposals</Text>
              <Text style={styles.stepText}>Submit your bid, delivery timeline, and a personalized cover letter highlighting relevant coursework.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Collaborate in the Contract Room</Text>
              <Text style={styles.stepText}>Use the workroom direct chat to clarify specs and upload milestone deliverables and code repositories.</Text>
            </View>
          </View>

          <View style={styles.step}>
            <Text style={styles.stepNum}>4</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepHead}>Earn Guaranteed Payouts</Text>
              <Text style={styles.stepText}>Upon milestone approval, funds land in your wallet ledger and build your verified portfolio.</Text>
            </View>
          </View>

          <Button
            title="Browse Open Jobs →"
            variant="outline-primary"
            size="md"
            onPress={() => onNavigate('Jobs')}
            style={{ marginTop: 14 }}
          />
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
    paddingVertical: 36,
  },
  header: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 36,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textMuted,
    maxWidth: 640,
    textAlign: 'center',
    lineHeight: 22,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 28,
    flex: 1,
    minWidth: 320,
  },
  colTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 20,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySubtle,
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
  },
  stepHead: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  stepText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
