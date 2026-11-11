import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import StatTile from '../components/StatTile';
import api from '../services/api';

const POPULAR_TAGS = ['React Native', 'Node.js', 'PyTorch', 'MongoDB', 'Figma', 'NLP'];

const CATEGORIES = [
  { name: 'Software Development', icon: '💻', count: '12 active' },
  { name: 'Data Science & AI', icon: '🤖', count: '8 active' },
  { name: 'Design & Creative', icon: '🎨', count: '6 active' },
  { name: 'Academic Writing & Research', icon: '📚', count: '5 active' },
  { name: 'Business & Consulting', icon: '📊', count: '4 active' },
];

export default function HomeScreen({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalJobs: 4, activeFreelancers: 2, activeClients: 2, completedContracts: 1 });
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/jobs?status=open'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (jobsRes.data.success) {
        setFeaturedJobs(jobsRes.data.jobs.slice(0, 3));
      }
    } catch (err) {
      console.log('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    onNavigate('Jobs', { query: searchQuery });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>✨ University Freelance Ecosystem</Text>
        </View>

        <Text style={styles.heroTitle}>Hire Top University Talent for Real Projects</Text>
        <Text style={styles.heroSubtitle}>
          UniWork bridges ambitious student developers, researchers, and creators with startups, faculty labs, and businesses — backed by simulated milestone escrow.
        </Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search skills, projects e.g. React Native, NLP, Figma..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <Button
            title="Search"
            onPress={handleSearch}
            size="md"
            style={styles.searchButton}
          />
        </View>

        {/* Popular Tags */}
        <View style={styles.tagRow}>
          <Text style={styles.tagLabel}>Popular:</Text>
          {POPULAR_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.skillChip}
              onPress={() => onNavigate('Jobs', { query: tag })}
            >
              <Text style={styles.skillChipText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Platform Stats Row */}
      <View style={styles.statsRow}>
        <StatTile
          label="Projects Posted"
          value={stats.totalJobs.toString()}
          valueColor={theme.colors.primary}
        />
        <StatTile
          label="Student Freelancers"
          value={stats.activeFreelancers.toString()}
          valueColor={theme.colors.success}
        />
        <StatTile
          label="Active Clients"
          value={stats.activeClients.toString()}
          valueColor={theme.colors.sky}
        />
        <StatTile
          label="Contracts Completed"
          value={stats.completedContracts.toString()}
          valueColor={theme.colors.warning}
        />
      </View>

      {/* Categories Grid */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Browse by Discipline</Text>
          <Text style={styles.sectionSubtitle}>Explore specialized academic and professional categories</Text>
        </View>
        <Button
          title="View All Jobs →"
          variant="outline"
          size="sm"
          onPress={() => onNavigate('Jobs')}
        />
      </View>

      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            activeOpacity={0.8}
            style={[styles.categoryCard, theme.shadows.sm]}
            onPress={() => onNavigate('Jobs', { category: cat.name })}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={styles.catName}>{cat.name}</Text>
            <Text style={styles.catCount}>{cat.count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Jobs Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Featured Opportunities</Text>
          <Text style={styles.sectionSubtitle}>Latest campus freelance tasks awaiting proposals</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 30 }} />
      ) : (
        <View style={styles.jobsList}>
          {featuredJobs.map((job) => (
            <View key={job._id} style={[styles.jobCard, theme.shadows.sm]}>
              <View style={styles.jobTop}>
                <Badge label={job.category} variant="primary" />
                <Badge label={job.budgetDisplay} variant="success" />
              </View>

              <TouchableOpacity onPress={() => onNavigate('JobDetail', { jobId: job._id })}>
                <Text style={styles.jobTitle}>{job.title}</Text>
              </TouchableOpacity>

              <Text style={styles.jobDesc} numberOfLines={2}>
                {job.description}
              </Text>

              <View style={styles.skillRow}>
                {job.skillsRequired && job.skillsRequired.map((skill) => (
                  <View key={skill} style={styles.jobSkillChip}>
                    <Text style={styles.jobSkillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.jobFooter}>
                <Text style={styles.jobClient}>
                  By {job.client?.firstName} {job.client?.lastName}
                </Text>
                <Button
                  title="View Details"
                  size="sm"
                  variant="outline-primary"
                  onPress={() => onNavigate('JobDetail', { jobId: job._id })}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* How it works 3-step banner */}
      <View style={styles.howItWorksBanner}>
        <Text style={styles.bannerBadge}>TRUSTED & SECURE</Text>
        <Text style={styles.bannerTitle}>How UniWork Operates</Text>
        <Text style={styles.bannerSubtitle}>Built with simulated milestone escrow for academic safety</Text>

        <View style={styles.stepsContainer}>
          <View style={styles.stepCard}>
            <Text style={styles.stepNum}>01</Text>
            <Text style={styles.stepHeader}>Post or Bid</Text>
            <Text style={styles.stepDesc}>Clients post projects. Students bid with competitive, tailored proposals.</Text>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepNum}>02</Text>
            <Text style={styles.stepHeader}>Escrow Lock</Text>
            <Text style={styles.stepDesc}>When a freelancer is hired, milestone funds are safely locked in simulated escrow.</Text>
          </View>
          <View style={styles.stepCard}>
            <Text style={styles.stepNum}>03</Text>
            <Text style={styles.stepHeader}>Review & Release</Text>
            <Text style={styles.stepDesc}>Students upload deliverables. Clients inspect and approve to instantly release funds.</Text>
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
    paddingBottom: 60,
  },
  hero: {
    paddingVertical: 50,
    alignItems: 'center',
    textAlign: 'center',
  },
  badgePill: {
    backgroundColor: theme.colors.primarySubtle,
    borderColor: '#c0cffe',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: theme.radii.pill,
    marginBottom: 16,
  },
  badgePillText: {
    color: theme.colors.primaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 46,
    maxWidth: 750,
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 680,
    marginBottom: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radii.pill,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    maxWidth: 620,
    width: '100%',
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    outlineStyle: 'none',
  },
  searchButton: {
    paddingHorizontal: 22,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tagLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  skillChip: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.radii.pill,
  },
  skillChipText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 44,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 44,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 18,
    flex: 1,
    minWidth: 200,
  },
  catIcon: {
    fontSize: 26,
    marginBottom: 10,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  catCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  jobsList: {
    gap: 14,
    marginBottom: 44,
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 20,
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  jobDesc: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  jobSkillChip: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: theme.radii.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  jobSkillText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 14,
  },
  jobClient: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  howItWorksBanner: {
    backgroundColor: theme.colors.bgSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    padding: 34,
    alignItems: 'center',
    textAlign: 'center',
  },
  bannerBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 28,
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: 20,
    flex: 1,
    minWidth: 220,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  stepHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
