import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import Badge from '../components/Badge';
import Button from '../components/Button';
import api from '../services/api';

export default function ContractRoomScreen({ route, onNavigate }) {
  const { contractId } = route.params;
  const { user, refreshMe } = useContext(AuthContext);

  const [contract, setContract] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Deliverable submission state
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [workNotes, setWorkNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submittingWork, setSubmittingWork] = useState(false);

  useEffect(() => {
    fetchContractRoom();
  }, [contractId]);

  const fetchContractRoom = async () => {
    try {
      setLoading(true);
      const [contractRes, messagesRes] = await Promise.all([
        api.get(`/contracts/${contractId}`),
        api.get(`/contracts/${contractId}/messages`),
      ]);

      if (contractRes.data.success) {
        setContract(contractRes.data.contract);
      }
      if (messagesRes.data.success) {
        setMessages(messagesRes.data.messages);
      }
    } catch (err) {
      console.log('Error loading contract room:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post(`/contracts/${contractId}/messages`, {
        content: newMessage.trim(),
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMessage('');
      }
    } catch (err) {
      alert('Error sending message');
    }
  };

  const handleSubmitDeliverable = async (mId) => {
    if (!workNotes.trim()) {
      alert('Please add submission notes explaining the deliverable.');
      return;
    }

    try {
      setSubmittingWork(true);
      const res = await api.post(`/contracts/${contractId}/milestones/${mId}/submit`, {
        workNotes,
        attachmentUrl,
      });

      if (res.data.success) {
        alert('Work deliverable submitted for client review!');
        setWorkNotes('');
        setAttachmentUrl('');
        setActiveMilestoneId(null);
        fetchContractRoom();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting deliverable');
    } finally {
      setSubmittingWork(false);
    }
  };

  const handleApproveMilestone = async (mId, amount) => {
    const confirmed = confirm(`Are you sure you want to approve this milestone and release $${amount} from escrow to the freelancer's wallet?`);
    if (!confirmed) return;

    try {
      const res = await api.post(`/contracts/${contractId}/milestones/${mId}/approve`);
      if (res.data.success) {
        alert(`Milestone approved! $${amount} has been released to freelancer.`);
        fetchContractRoom();
        refreshMe();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error approving milestone');
    }
  };

  if (loading || !contract) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isClient = user && (contract.client._id === user._id || contract.client === user._id);
  const isFreelancer = user && (contract.freelancer._id === user._id || contract.freelancer === user._id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Button
        title="← Back to Contracts"
        variant="ghost"
        size="sm"
        style={styles.backButton}
        onPress={() => onNavigate('Contracts')}
      />

      {/* Contract Top Banner */}
      <View style={[styles.headerCard, theme.shadows.sm]}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Badge
              label={contract.status === 'active' ? 'Active Contract Room' : 'Completed & Closed'}
              variant={contract.status === 'active' ? 'warning' : 'success'}
            />
            <Text style={styles.jobTitle}>{contract.job?.title || 'Contract Room'}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                🏢 Client: <Text style={styles.metaBold}>{contract.client?.clientProfile?.companyName || contract.client?.firstName}</Text>
              </Text>
              <Text style={styles.metaText}>
                🎓 Freelancer: <Text style={styles.metaBold}>{contract.freelancer?.firstName} {contract.freelancer?.lastName}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Progress Strip */}
        <View style={styles.financialStrip}>
          <View style={styles.finCol}>
            <Text style={styles.finLabel}>Total Contract Value</Text>
            <Text style={styles.finVal}>${contract.totalAmount}</Text>
          </View>
          <View style={styles.finCol}>
            <Text style={styles.finLabel}>Escrow Released</Text>
            <Text style={[styles.finVal, { color: theme.colors.success }]}>${contract.amountPaid || 0}</Text>
          </View>
          <View style={[styles.finCol, { flex: 2 }]}>
            <View style={styles.progressHeader}>
              <Text style={styles.finLabel}>Milestones Completed</Text>
              <Text style={styles.progressPercent}>{contract.progressPercentage}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${contract.progressPercentage}%` }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.layout}>
        {/* Milestones Left Column */}
        <View style={styles.leftCol}>
          <View style={[styles.card, theme.shadows.sm]}>
            <Text style={styles.sectionTitle}>Milestones & Deliverables</Text>
            <Text style={styles.sectionSubtitle}>
              Milestone progress ledger backed by simulated escrow.
            </Text>

            {contract.milestones && contract.milestones.map((m, index) => (
              <View key={m._id} style={styles.milestoneItem}>
                <View style={styles.mHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mTitle}>{m.title}</Text>
                    {m.dueDate && (
                      <Text style={styles.mDueDate}>Due: {new Date(m.dueDate).toLocaleDateString()}</Text>
                    )}
                  </View>
                  <View style={styles.mAmountWrap}>
                    <Text style={styles.mAmount}>${m.amount}</Text>
                    <Badge
                      label={m.isApproved ? 'Approved & Paid' : m.status === 'submitted' ? 'Work Submitted' : 'In Progress'}
                      variant={m.isApproved ? 'success' : m.status === 'submitted' ? 'sky' : 'warning'}
                    />
                  </View>
                </View>

                {m.description ? <Text style={styles.mDesc}>{m.description}</Text> : null}

                {/* Submissions List */}
                {m.submissions && m.submissions.length > 0 && (
                  <View style={styles.submissionsBox}>
                    <Text style={styles.subTitle}>Delivered Work:</Text>
                    {m.submissions.map((sub, sIdx) => (
                      <View key={sIdx} style={styles.subItem}>
                        <Text style={styles.subNotes}>"{sub.workNotes}"</Text>
                        {sub.attachmentUrl ? (
                          <Text style={styles.subLink}>📎 Attachment: {sub.attachmentUrl}</Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.mActions}>
                  {isClient && !m.isApproved && (
                    <Button
                      title={`Approve & Release $${m.amount}`}
                      variant="success"
                      size="sm"
                      onPress={() => handleApproveMilestone(m._id, m.amount)}
                    />
                  )}

                  {isFreelancer && !m.isApproved && activeMilestoneId !== m._id && (
                    <Button
                      title="Submit Work for Review"
                      variant="primary"
                      size="sm"
                      onPress={() => setActiveMilestoneId(m._id)}
                    />
                  )}

                  {m.isApproved && (
                    <Text style={styles.approvedNotice}>
                      ✓ Milestone approved & funds transferred to freelancer's wallet.
                    </Text>
                  )}
                </View>

                {/* Freelancer Submission Form */}
                {activeMilestoneId === m._id && (
                  <View style={styles.submitFormBox}>
                    <Text style={styles.formHead}>Upload Deliverable for: {m.title}</Text>
                    <Text style={styles.inputLabel}>Submission Notes</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Describe the completed work, links, code, or documentation..."
                      value={workNotes}
                      onChangeText={setWorkNotes}
                      multiline
                    />
                    <Text style={styles.inputLabel}>Deliverable Link / Attachment (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. https://github.com/my-repo or ZIP URL"
                      value={attachmentUrl}
                      onChangeText={setAttachmentUrl}
                    />

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                      <Button
                        title="Confirm Submission"
                        variant="success"
                        size="sm"
                        loading={submittingWork}
                        onPress={() => handleSubmitDeliverable(m._id)}
                      />
                      <Button
                        title="Cancel"
                        variant="outline"
                        size="sm"
                        onPress={() => setActiveMilestoneId(null)}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Workroom Chat Right Column */}
        <View style={styles.rightCol}>
          <View style={[styles.card, theme.shadows.sm, { flex: 1, minHeight: 460 }]}>
            <Text style={styles.sectionTitle}>Workroom Direct Chat</Text>
            <Text style={styles.sectionSubtitle}>Communicate directly between client & student</Text>

            {/* Chat Messages */}
            <ScrollView style={styles.chatBox} contentContainerStyle={{ paddingVertical: 10 }}>
              {messages.map((msg, idx) => {
                const isMe = user && msg.sender?._id === user._id;
                if (msg.isSystem) {
                  return (
                    <View key={idx} style={styles.systemBubble}>
                      <Text style={styles.systemText}>{msg.content}</Text>
                    </View>
                  );
                }
                return (
                  <View key={idx} style={[styles.msgRow, isMe && styles.msgRowMe]}>
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                      {!isMe && <Text style={styles.senderName}>{msg.sender?.firstName || 'Client'}</Text>}
                      <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{msg.content}</Text>
                      <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Chat Input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message or update..."
                value={newMessage}
                onChangeText={setNewMessage}
                onSubmitEditing={handleSendMessage}
              />
              <Button
                title="Send"
                size="sm"
                variant="primary"
                onPress={handleSendMessage}
              />
            </View>
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
    marginBottom: 14,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 24,
    marginBottom: 24,
  },
  headerTop: {
    marginBottom: 18,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
    marginTop: 8,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  metaBold: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  financialStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 16,
    gap: 20,
  },
  finCol: {
    minWidth: 120,
  },
  finLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  finVal: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.success,
  },
  progressBarBg: {
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.radii.pill,
  },
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  leftCol: {
    flex: 1.3,
    minWidth: 320,
  },
  rightCol: {
    flex: 1,
    minWidth: 320,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 18,
    marginTop: 2,
  },
  milestoneItem: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: 18,
    marginBottom: 14,
  },
  mHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  mDueDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  mAmountWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  mAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.success,
  },
  mDesc: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  submissionsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    padding: 12,
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  subItem: {
    marginBottom: 6,
  },
  subNotes: {
    fontSize: 13,
    color: theme.colors.text,
    fontStyle: 'italic',
  },
  subLink: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 2,
  },
  mActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  approvedNotice: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.successText,
  },
  submitFormBox: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  formHead: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.text,
    outlineStyle: 'none',
  },
  chatBox: {
    flex: 1,
    maxHeight: 340,
    marginBottom: 14,
  },
  systemBubble: {
    backgroundColor: theme.colors.warningSubtle,
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: theme.radii.md,
    padding: 10,
    marginVertical: 4,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  systemText: {
    fontSize: 12,
    color: theme.colors.warningText,
    textAlign: 'center',
    fontWeight: '500',
  },
  msgRow: {
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  msgRowMe: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  msgTextMe: {
    color: '#ffffff',
  },
  msgTime: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  msgTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.text,
    outlineStyle: 'none',
  },
});
