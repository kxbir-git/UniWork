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

export default function JobDetailScreen({ route, onNavigate }) {
  const { jobId } = route.params;
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [userProposal, setUserProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proposal form state
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('7');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [jobId]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${jobId}`);
      if (res.data.success) {
        setJob(res.data.job);
        setUserProposal(res.data.userProposal);
        if (res.data.job.budgetMin) {
          setBidAmount(res.data.job.budgetMin.toString());
        }
      }
    } catch (err) {
      console.log('Error loading job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!user) {
      onNavigate('Login');
      return;
    }

    if (!bidAmount || !coverLetter) {
      alert('Please enter your bid amount and cover letter.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/proposals', {
        jobId: job._id,
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays) || 7,
        coverLetter,
      });

      if (res.data.success) {
        setUserProposal(res.data.proposal);
        alert('Proposal submitted successfully! The client will review your submission.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !job) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isOwner = user && job.client && user._id === job.client._id;
  const isFreelancer = user && user.isFreelancer;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Button
        title="← Back to Opportunities"
        variant="ghost"
        size="sm"
        style={styles.backButton}
        onPress={() => onNavigate('Jobs')}
      />

      <View style={styles.layout}>
        {/* Main Details */}
        <View style={styles.mainCol}>
          <View style={[styles.card, theme.shadows.sm]}>
            <View style={styles.topBadges}>
              <Badge label={job.category} variant="primary" />
              <Badge
                label={job.status === 'open' ? 'Open for Proposals' : 'In Progress'}
                variant={job.status === 'open' ? 'success' : 'warning'}
              />
            </View>

            <Text style={styles.title}>{job.title}</Text>

            {/* Budget Highlight */}
            <View style={styles.budgetBox}>
              <View>
                <Text style={styles.boxLabel}>Budget</Text>
                <Text style={styles.boxValue}>{job.budgetDisplay}</Text>
                <Text style={styles.boxSub}>{job.budgetType === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}</Text>
              </View>
              <View>
                <Text style={styles.boxLabel}>Experience</Text>
                <Text style={styles.boxValueMedium}>{job.experienceLevel || 'Entry'}</Text>
              </View>
              <View>
                <Text style={styles.boxLabel}>Proposals</Text>
                <Text style={styles.boxValueMedium}>{job.proposalsCount || 0} bids</Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Project Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>

            <Text style={styles.sectionHeading}>Required Skills & Technologies</Text>
            <View style={styles.skillsRow}>
              {job.skillsRequired && job.skillsRequired.map((s) => (
                <View key={s} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Proposal Action Box */}
          <View style={[styles.card, theme.shadows.sm, { marginTop: 20 }]}>
            {isOwner ? (
              <View style={styles.ownerBox}>
                <Text style={styles.ownerTitle}>You posted this project</Text>
                <Text style={styles.ownerSub}>
                  You have received {job.proposalsCount || 0} candidate proposals for this task.
                </Text>
                <Button
                  title={`Review Proposals (${job.proposalsCount || 0}) →`}
                  size="md"
                  variant="primary"
                  onPress={() => onNavigate('Dashboard')}
                />
              </View>
            ) : userProposal ? (
              <View style={styles.submittedBox}>
                <Text style={styles.submittedIcon}>✅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.submittedTitle}>Proposal Submitted</Text>
                  <Text style={styles.submittedText}>
                    You placed a bid of <Text style={{ fontWeight: '700' }}>${userProposal.bidAmount}</Text> ({userProposal.estimatedDays} days).
                  </Text>
                  <Badge
                    label={`Status: ${userProposal.status.toUpperCase()}`}
                    variant={userProposal.status === 'accepted' ? 'success' : 'primary'}
                    style={{ marginTop: 8 }}
                  />
                </View>
              </View>
            ) : isFreelancer ? (
              <View>
                <Text style={styles.proposalHeader}>Submit a Tailored Proposal</Text>
                <Text style={styles.proposalSub}>
                  Clients review your profile, GitHub links, and proposal pitch. Funds are held in simulated escrow upon hire.
                </Text>

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.inputLabel}>Your Bid Amount ($USD)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={bidAmount}
                      onChangeText={setBidAmount}
                      placeholder="e.g. 850"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Estimated Delivery (Days)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={estimatedDays}
                      onChangeText={setEstimatedDays}
                      placeholder="e.g. 7"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Cover Letter & Approach</Text>
                <TextInput
                  style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
                  multiline
                  numberOfLines={4}
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  placeholder="Detail your university background, relevant tools, and how you will tackle the deliverables..."
                />

                <Button
                  title="Submit Proposal to Client"
                  size="md"
                  variant="success"
                  loading={submitting}
                  onPress={handleSubmitProposal}
                  style={{ marginTop: 14 }}
                />
              </View>
            ) : !user ? (
              <View style={styles.loginCta}>
                <Text style={styles.loginCtaTitle}>Interested in this opportunity?</Text>
                <Text style={styles.loginCtaText}>Sign in as a student freelancer to submit your bid.</Text>
                <Button
                  title="Sign In to Bid"
                  size="md"
                  variant="primary"
                  onPress={() => onNavigate('Login')}
                />
              </View>
            ) : (
              <Text style={styles.clientNotice}>
                You are currently signed in as a Client. To bid on jobs, use a Freelancer account.
              </Text>
            )}
          </View>
        </View>

        {/* Client Sidebar Summary */}
        <View style={styles.sideCol}>
          <View style={[styles.card, theme.shadows.sm]}>
            <Text style={styles.sideHeader}>About the Client</Text>
            <View style={styles.clientCardHeader}>
              <View style={styles.clientAvatar}>
                <Text style={styles.clientAvatarText}>
                  {job.client?.firstName?.charAt(0) || 'C'}
                </Text>
              </View>
              <View>
                <Text style={styles.clientName}>
                  {job.client?.clientProfile?.companyName || `${job.client?.firstName} ${job.client?.lastName}`}
                </Text>
                <Text style={styles.clientLocation}>📍 {job.client?.location || 'Campus Partner'}</Text>
              </View>
            </View>

            <View style={styles.clientMetrics}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Spent:</Text>
                <Text style={styles.metricVal}>${job.client?.clientProfile?.totalSpent || 0}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Member Since:</Text>
                <Text style={styles.metricVal}>{new Date(job.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>

            {job.client?.clientProfile?.description ? (
              <Text style={styles.clientBio}>{job.client.clientProfile.description}</Text>
            ) : null}
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
    paddingVertical: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
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
    padding: 24,
  },
  topBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  budgetBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 16,
    marginBottom: 20,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  boxValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.success,
  },
  boxValueMedium: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  boxSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 24,
    marginBottom: 18,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: theme.radii.pill,
  },
  skillText: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '500',
  },
  ownerBox: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 10,
  },
  ownerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  ownerSub: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  submittedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.successSubtle,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: theme.radii.md,
    padding: 16,
  },
  submittedIcon: {
    fontSize: 28,
  },
  submittedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.successText,
    marginBottom: 2,
  },
  submittedText: {
    fontSize: 13,
    color: theme.colors.successText,
  },
  proposalHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  proposalSub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 14,
    outlineStyle: 'none',
  },
  loginCta: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginCtaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  loginCtaText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  clientNotice: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  sideHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  clientCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  clientLocation: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  clientMetrics: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clientBio: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
