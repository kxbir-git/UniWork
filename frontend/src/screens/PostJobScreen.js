import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../services/api';

const CATEGORIES = [
  'Software Development',
  'Data Science & AI',
  'Design & Creative',
  'Academic Writing & Research',
  'Business & Consulting',
];

export default function PostJobScreen({ onNavigate }) {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [budgetType, setBudgetType] = useState('fixed');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('entry');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePostJob = async () => {
    if (!title || !description || !budgetMin) {
      alert('Please fill in the project title, budget, and description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/jobs', {
        title,
        category,
        budgetType,
        budgetMin: Number(budgetMin),
        budgetMax: budgetMax ? Number(budgetMax) : Number(budgetMin),
        experienceLevel,
        skillsRequired,
        description,
      });

      if (res.data.success) {
        alert('Job posted successfully! Freelancers can now view and submit proposals.');
        onNavigate('JobDetail', { jobId: res.data.job._id });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.card, theme.shadows.sm]}>
        <Text style={styles.badgeLabel}>CLIENT CONSOLE</Text>
        <Text style={styles.title}>Post a New Project</Text>
        <Text style={styles.subtitle}>
          Connect with vetted university talent for research, software, AI, and design assignments.
        </Text>

        {/* Project Title */}
        <Text style={styles.label}>Project Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Build an NLP Literature Summarizer in Python"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Discipline / Category</Text>
        <View style={styles.categoryWrap}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pricing Model */}
        <Text style={styles.label}>Pricing Model</Text>
        <View style={styles.budgetTypeRow}>
          <TouchableOpacity
            style={[styles.budgetBox, budgetType === 'fixed' && styles.budgetBoxActive]}
            onPress={() => setBudgetType('fixed')}
          >
            <Text style={[styles.budgetBoxTitle, budgetType === 'fixed' && styles.budgetBoxTitleActive]}>
              Fixed Price
            </Text>
            <Text style={styles.budgetBoxSub}>Set total milestone amount for deliverable</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.budgetBox, budgetType === 'hourly' && styles.budgetBoxActive]}
            onPress={() => setBudgetType('hourly')}
          >
            <Text style={[styles.budgetBoxTitle, budgetType === 'hourly' && styles.budgetBoxTitleActive]}>
              Hourly Rate
            </Text>
            <Text style={styles.budgetBoxSub}>Pay per hour of verified student work</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Min / Max */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.label}>Estimated Budget ($USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={budgetMin}
              onChangeText={setBudgetMin}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Max Budget (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 800"
              keyboardType="numeric"
              value={budgetMax}
              onChangeText={setBudgetMax}
            />
          </View>
        </View>

        {/* Experience Level */}
        <Text style={styles.label}>Experience Level Needed</Text>
        <View style={styles.expRow}>
          {['entry', 'intermediate', 'expert'].map((exp) => (
            <TouchableOpacity
              key={exp}
              style={[styles.expChip, experienceLevel === exp && styles.expChipActive]}
              onPress={() => setExperienceLevel(exp)}
            >
              <Text style={[styles.expText, experienceLevel === exp && styles.expTextActive]}>
                {exp.charAt(0).toUpperCase() + exp.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Required Skills */}
        <Text style={styles.label}>Required Skills (Comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. React Native, Node.js, PyTorch, MongoDB"
          value={skillsRequired}
          onChangeText={setSkillsRequired}
        />

        {/* Detailed Description */}
        <Text style={styles.label}>Comprehensive Project Scope & Deliverables</Text>
        <TextInput
          style={[styles.input, { height: 130, textAlignVertical: 'top' }]}
          multiline
          numberOfLines={6}
          placeholder="Outline the problem statement, functional specifications, deliverables, and university project acceptance criteria..."
          value={description}
          onChangeText={setDescription}
        />

        <Button
          title="Publish Project to Marketplace"
          size="lg"
          variant="primary"
          loading={submitting}
          onPress={handlePostJob}
          style={{ marginTop: 10 }}
        />
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
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 32,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: 14,
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
    outlineStyle: 'none',
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgSubtle,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  budgetTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  budgetBox: {
    flex: 1,
    padding: 14,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgSubtle,
  },
  budgetBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySubtle,
  },
  budgetBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  budgetBoxTitleActive: {
    color: theme.colors.primary,
  },
  budgetBoxSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  row: {
    flexDirection: 'row',
  },
  expRow: {
    flexDirection: 'row',
    gap: 8,
  },
  expChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.bgSubtle,
  },
  expChipActive: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primary,
  },
  expText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  expTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
