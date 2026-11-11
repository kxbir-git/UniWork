import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme/colors';
import Badge from '../components/Badge';
import Button from '../components/Button';
import api from '../services/api';

const CATEGORIES = [
  'All Categories',
  'Software Development',
  'Data Science & AI',
  'Design & Creative',
  'Academic Writing & Research',
  'Business & Consulting',
];

export default function JobListScreen({ route, onNavigate }) {
  const initialQuery = route?.params?.query || '';
  const initialCategory = route?.params?.category || '';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, selectedBudget, selectedExperience]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let url = '/jobs?';
      if (search) url += `q=${encodeURIComponent(search)}&`;
      if (selectedCategory && selectedCategory !== 'All Categories') {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (selectedBudget) url += `budgetType=${selectedBudget}&`;
      if (selectedExperience) url += `experienceLevel=${selectedExperience}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.log('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    fetchJobs();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Explore Opportunities</Text>
          <Text style={styles.pageSubtitle}>Find student-friendly and academic freelance jobs</Text>
        </View>
      </View>

      <View style={styles.layout}>
        {/* Filter Sidebar */}
        <View style={[styles.sidebar, theme.shadows.sm]}>
          <Text style={styles.filterTitle}>Filter Projects</Text>

          {/* Search Input */}
          <Text style={styles.filterLabel}>Keyword Search</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="e.g. React Native, NLP..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
          />

          {/* Category Filter */}
          <Text style={styles.filterLabel}>Discipline / Category</Text>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat || (!selectedCategory && cat === 'All Categories');
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                onPress={() => setSelectedCategory(cat === 'All Categories' ? '' : cat)}
              >
                <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Budget Type */}
          <Text style={[styles.filterLabel, { marginTop: 16 }]}>Pricing Model</Text>
          <View style={styles.budgetRow}>
            <TouchableOpacity
              style={[styles.chipButton, !selectedBudget && styles.chipActive]}
              onPress={() => setSelectedBudget('')}
            >
              <Text style={[styles.chipText, !selectedBudget && styles.chipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chipButton, selectedBudget === 'fixed' && styles.chipActive]}
              onPress={() => setSelectedBudget('fixed')}
            >
              <Text style={[styles.chipText, selectedBudget === 'fixed' && styles.chipTextActive]}>Fixed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chipButton, selectedBudget === 'hourly' && styles.chipActive]}
              onPress={() => setSelectedBudget('hourly')}
            >
              <Text style={[styles.chipText, selectedBudget === 'hourly' && styles.chipTextActive]}>Hourly</Text>
            </TouchableOpacity>
          </View>

          {/* Reset button */}
          <Button
            title="Reset All Filters"
            variant="outline"
            size="sm"
            style={{ marginTop: 20 }}
            onPress={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedBudget('');
              setSelectedExperience('');
            }}
          />
        </View>

        {/* Jobs List */}
        <View style={styles.jobsContainer}>
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsCount}>Showing {jobs.length} opportunities</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          ) : jobs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>No matching jobs found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search query or selecting a different discipline.</Text>
            </View>
          ) : (
            jobs.map((job) => (
              <View key={job._id} style={[styles.jobCard, theme.shadows.sm]}>
                <View style={styles.jobTopRow}>
                  <View style={styles.badgesWrap}>
                    <Badge label={job.category} variant="primary" style={{ marginRight: 6 }} />
                    <Badge
                      label={job.status === 'open' ? 'Open' : 'In Progress'}
                      variant={job.status === 'open' ? 'success' : 'warning'}
                    />
                  </View>
                  <Text style={styles.budgetDisplay}>{job.budgetDisplay}</Text>
                </View>

                <TouchableOpacity onPress={() => onNavigate('JobDetail', { jobId: job._id })}>
                  <Text style={styles.jobTitleText}>{job.title}</Text>
                </TouchableOpacity>

                <Text style={styles.jobDescriptionText} numberOfLines={3}>
                  {job.description}
                </Text>

                <View style={styles.skillsContainer}>
                  {job.skillsRequired && job.skillsRequired.map((s) => (
                    <View key={s} style={styles.skillItem}>
                      <Text style={styles.skillItemText}>{s}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.jobBottomBar}>
                  <Text style={styles.postedByText}>
                    🏢 {job.client?.clientProfile?.companyName || `${job.client?.firstName} ${job.client?.lastName}`}
                  </Text>
                  <View style={styles.proposalsPill}>
                    <Text style={styles.proposalsText}>{job.proposalsCount || 0} proposals</Text>
                  </View>
                  <Button
                    title="View & Bid"
                    size="sm"
                    variant="primary"
                    onPress={() => onNavigate('JobDetail', { jobId: job._id })}
                  />
                </View>
              </View>
            ))
          )}
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
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  layout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  sidebar: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 20,
    width: 280,
    alignSelf: 'flex-start',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: theme.colors.textMuted,
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  filterInput: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.text,
    marginBottom: 10,
    outlineStyle: 'none',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radii.sm,
    marginBottom: 2,
  },
  filterOptionActive: {
    backgroundColor: theme.colors.primarySubtle,
  },
  filterOptionText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: theme.colors.primaryText,
    fontWeight: '700',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chipButton: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  chipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  jobsContainer: {
    flex: 1,
    minWidth: 320,
  },
  resultsInfo: {
    marginBottom: 14,
  },
  resultsCount: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 22,
    marginBottom: 16,
  },
  jobTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetDisplay: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.success,
  },
  jobTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  jobDescriptionText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  skillItem: {
    backgroundColor: theme.colors.bgMuted,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
  },
  skillItemText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  jobBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
    flexWrap: 'wrap',
    gap: 10,
  },
  postedByText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  proposalsPill: {
    backgroundColor: theme.colors.bgSubtle,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
  },
  proposalsText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
