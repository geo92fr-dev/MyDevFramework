# Content Types - Référence d'implémentation

## 🎯 Objectif

Définir la structure de données et les types TypeScript pour le contenu éducatif de FunLearning, avec validation, normalisation et évolutivité.

### Problèmes résolus :
- Structure de données cohérente et évolutive
- Validation stricte des contenus
- Types réutilisables et extensibles
- Migration de données simplifiée

## 📝 Usage

### Quand l'utiliser :
- Création de nouveaux contenus éducatifs
- Validation des données importées
- Migration de base de données
- API et services de contenu

### Contexte d'utilisation :
- Applications SvelteKit/TypeScript
- Base de données Firestore
- API de gestion de contenu
- Système de validation

### Prérequis :
- TypeScript configuré
- Zod pour la validation
- Firestore pour le stockage
- Versionning des données

## 🏗️ Types de base

### 1. Types communs

**Fichier : `src/lib/types/common.ts`**
```typescript
// Identifiants uniques
export type ID = string;
export type Timestamp = string; // ISO 8601

// Métadonnées communes
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
  isActive: boolean;
}

// Contenu localisé
export interface LocalizedContent {
  fr: string;
  en?: string;
  es?: string;
  de?: string;
}

// Niveaux de difficulté
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Statuts d'apprentissage
export type LearningStatus = 'not-started' | 'in-progress' | 'completed' | 'mastered';

// Types de médias
export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'interactive';

// Ressource média
export interface MediaResource {
  id: ID;
  type: MediaType;
  url: string;
  thumbnail?: string;
  alt?: LocalizedContent;
  caption?: LocalizedContent;
  duration?: number; // en secondes pour video/audio
  size?: number; // en bytes
  mimeType: string;
}

// Tags et catégories
export interface Tag {
  id: ID;
  name: LocalizedContent;
  color?: string;
  category: 'subject' | 'skill' | 'level' | 'format';
}

// Auteur/Créateur
export interface Author {
  id: ID;
  name: string;
  email?: string;
  avatar?: string;
  bio?: LocalizedContent;
  specialties: string[];
}
```

### 2. Types éducatifs

**Fichier : `src/lib/types/education.ts`**
```typescript
import type { BaseEntity, LocalizedContent, DifficultyLevel, MediaResource, Tag, Author, ID } from './common';

// Domaine d'apprentissage
export interface LearningDomain extends BaseEntity {
  name: LocalizedContent;
  description: LocalizedContent;
  icon: string;
  color: string;
  parentDomain?: ID;
  subDomains: ID[];
  competences: ID[];
  tags: ID[];
}

// Compétence
export interface Competence extends BaseEntity {
  title: LocalizedContent;
  description: LocalizedContent;
  shortDescription?: LocalizedContent;
  level: DifficultyLevel;
  domain: ID;
  prerequisites: ID[]; // autres compétences
  estimatedTime: number; // en minutes
  objectives: LocalizedContent[];
  skills: string[]; // compétences transversales
  
  // Contenu pédagogique
  exercises: ID[];
  resources: MediaResource[];
  assessments: ID[];
  
  // Métadonnées
  tags: ID[];
  author: ID;
  reviewers: ID[];
  lastReview: Timestamp;
  
  // Configuration
  settings: CompetenceSettings;
}

export interface CompetenceSettings {
  allowRetry: boolean;
  maxAttempts?: number;
  passingScore: number; // pourcentage 0-100
  showHints: boolean;
  showSolutions: boolean;
  randomizeQuestions: boolean;
  timeLimit?: number; // en minutes
  adaptiveDifficulty: boolean;
}

// Cours (collection de compétences)
export interface Course extends BaseEntity {
  title: LocalizedContent;
  description: LocalizedContent;
  summary?: LocalizedContent;
  level: DifficultyLevel;
  
  // Structure
  competences: ID[];
  learningPath: LearningPath;
  estimatedTotalTime: number;
  
  // Contenu
  introduction?: LocalizedContent;
  conclusion?: LocalizedContent;
  resources: MediaResource[];
  
  // Métadonnées
  tags: ID[];
  author: ID;
  category: string;
  
  // Paramètres
  isPublished: boolean;
  isFeatured: boolean;
  enrollmentLimit?: number;
  startDate?: Timestamp;
  endDate?: Timestamp;
}

export interface LearningPath {
  nodes: PathNode[];
  edges: PathEdge[];
  defaultSequence: ID[];
}

export interface PathNode {
  id: ID;
  competenceId: ID;
  position: { x: number; y: number };
  isOptional: boolean;
  unlockConditions: UnlockCondition[];
}

export interface PathEdge {
  from: ID;
  to: ID;
  type: 'prerequisite' | 'recommended' | 'alternative';
  weight: number;
}

export interface UnlockCondition {
  type: 'competence_completed' | 'score_achieved' | 'time_spent';
  targetId?: ID;
  value?: number;
}
```

### 3. Types d'exercices

**Fichier : `src/lib/types/exercises.ts`**
```typescript
import type { BaseEntity, LocalizedContent, MediaResource, ID } from './common';

// Type d'exercice de base
export interface Exercise extends BaseEntity {
  type: ExerciseType;
  title: LocalizedContent;
  instruction: LocalizedContent;
  competenceId: ID;
  
  // Contenu
  content: ExerciseContent;
  hints: LocalizedContent[];
  explanation?: LocalizedContent;
  
  // Configuration
  difficulty: number; // 1-10
  weight: number; // importance dans l'évaluation
  timeLimit?: number; // en secondes
  
  // Métadonnées
  tags: string[];
  author: ID;
}

export type ExerciseType = 
  | 'multiple-choice'
  | 'single-choice'
  | 'true-false'
  | 'fill-blanks'
  | 'drag-drop'
  | 'text-input'
  | 'code-completion'
  | 'matching'
  | 'ordering'
  | 'interactive';

// Contenu spécifique par type d'exercice
export type ExerciseContent = 
  | MultipleChoiceContent
  | SingleChoiceContent
  | TrueFalseContent
  | FillBlanksContent
  | DragDropContent
  | TextInputContent
  | CodeCompletionContent
  | MatchingContent
  | OrderingContent
  | InteractiveContent;

// Exercice à choix multiples
export interface MultipleChoiceContent {
  question: LocalizedContent;
  options: ChoiceOption[];
  correctAnswers: number[]; // indices des bonnes réponses
  allowMultiple: boolean;
  shuffleOptions: boolean;
  media?: MediaResource[];
}

export interface ChoiceOption {
  id: number;
  text: LocalizedContent;
  explanation?: LocalizedContent;
  media?: MediaResource;
}

// Exercice à choix unique
export interface SingleChoiceContent {
  question: LocalizedContent;
  options: ChoiceOption[];
  correctAnswer: number;
  shuffleOptions: boolean;
  media?: MediaResource[];
}

// Exercice vrai/faux
export interface TrueFalseContent {
  statement: LocalizedContent;
  correctAnswer: boolean;
  explanation?: LocalizedContent;
  media?: MediaResource[];
}

// Exercice de texte à trous
export interface FillBlanksContent {
  text: LocalizedContent; // avec placeholders {0}, {1}, etc.
  blanks: BlankField[];
  caseSensitive: boolean;
  acceptSynonyms: boolean;
  media?: MediaResource[];
}

export interface BlankField {
  id: number;
  correctAnswers: string[]; // réponses acceptées
  hint?: LocalizedContent;
  inputType: 'text' | 'number' | 'date';
  validation?: ValidationRule[];
}

// Exercice de glisser-déposer
export interface DragDropContent {
  instruction: LocalizedContent;
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  allowMultipleInZone: boolean;
  media?: MediaResource[];
}

export interface DraggableItem {
  id: string;
  content: LocalizedContent;
  category?: string;
  media?: MediaResource;
}

export interface DropZone {
  id: string;
  label: LocalizedContent;
  acceptedItems: string[]; // IDs des items acceptés
  maxItems?: number;
}

// Exercice de saisie de texte
export interface TextInputContent {
  prompt: LocalizedContent;
  expectedAnswer?: LocalizedContent;
  validation: TextValidation;
  maxLength?: number;
  placeholder?: LocalizedContent;
  media?: MediaResource[];
}

export interface TextValidation {
  type: 'exact' | 'contains' | 'pattern' | 'ai-evaluated';
  value?: string | string[];
  ignoreCase?: boolean;
  ignorePunctuation?: boolean;
  minWords?: number;
  maxWords?: number;
}

// Exercice de complétion de code
export interface CodeCompletionContent {
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css';
  template: string; // code avec blanks ou zones à compléter
  solution: string;
  testCases?: TestCase[];
  allowedLibraries?: string[];
}

export interface TestCase {
  input: any;
  expectedOutput: any;
  description: LocalizedContent;
}

// Exercice d'association
export interface MatchingContent {
  instruction: LocalizedContent;
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  correctMatches: MatchPair[];
  allowPartialMatching: boolean;
}

export interface MatchItem {
  id: string;
  content: LocalizedContent;
  media?: MediaResource;
}

export interface MatchPair {
  leftId: string;
  rightId: string;
}

// Exercice d'ordonnancement
export interface OrderingContent {
  instruction: LocalizedContent;
  items: OrderItem[];
  correctOrder: string[]; // IDs dans le bon ordre
  allowPartialCredit: boolean;
}

export interface OrderItem {
  id: string;
  content: LocalizedContent;
  media?: MediaResource;
}

// Exercice interactif
export interface InteractiveContent {
  type: 'simulation' | 'game' | 'virtual-lab' | 'widget';
  url?: string; // pour contenu externe
  config: Record<string, any>; // configuration spécifique
  assessmentCriteria: AssessmentCriterion[];
}

export interface AssessmentCriterion {
  id: string;
  name: LocalizedContent;
  weight: number;
  type: 'completion' | 'accuracy' | 'time' | 'interaction';
  target?: number;
}

// Règles de validation
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: LocalizedContent;
}
```

### 4. Types de progression

**Fichier : `src/lib/types/progress.ts`**
```typescript
import type { BaseEntity, LearningStatus, ID, Timestamp } from './common';

// Progression utilisateur
export interface UserProgress extends BaseEntity {
  userId: ID;
  competences: Record<ID, CompetenceProgress>;
  courses: Record<ID, CourseProgress>;
  globalStats: GlobalStats;
  achievements: Achievement[];
  streaks: StreakData;
  preferences: LearningPreferences;
}

// Progression sur une compétence
export interface CompetenceProgress {
  competenceId: ID;
  status: LearningStatus;
  progression: number; // 0-100
  score: number; // 0-100
  timeSpent: number; // en minutes
  startedAt: Timestamp;
  lastAccessed: Timestamp;
  completedAt?: Timestamp;
  
  // Détails des exercices
  exercises: Record<ID, ExerciseAttempt[]>;
  currentExercise?: ID;
  
  // Statistiques
  totalAttempts: number;
  successfulAttempts: number;
  hintsUsed: number;
  averageTimePerExercise: number;
  
  // Adaptatif
  difficultyAdjustment: number; // -2 à +2
  recommendedNextActions: RecommendedAction[];
}

// Progression sur un cours
export interface CourseProgress {
  courseId: ID;
  status: LearningStatus;
  enrolledAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  
  // Progression
  competencesCompleted: number;
  totalCompetences: number;
  overallScore: number;
  timeSpent: number;
  
  // Parcours
  currentCompetence?: ID;
  completedPath: ID[];
  availableCompetences: ID[];
}

// Tentative d'exercice
export interface ExerciseAttempt {
  id: ID;
  exerciseId: ID;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  timeSpent: number; // en secondes
  
  // Réponses
  answers: ExerciseAnswer[];
  score: number; // 0-100
  isCorrect: boolean;
  
  // Aide utilisée
  hintsUsed: number;
  solutionViewed: boolean;
  
  // Contexte
  difficultyLevel: number;
  attemptNumber: number;
}

export interface ExerciseAnswer {
  questionId?: string;
  value: any; // réponse de l'utilisateur
  isCorrect: boolean;
  timeToAnswer: number; // en secondes
  hintsUsedForQuestion: number;
}

// Statistiques globales
export interface GlobalStats {
  totalTimeSpent: number; // en minutes
  totalCompetencesStarted: number;
  totalCompetencesCompleted: number;
  totalCompetencesMastered: number;
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  averageScore: number;
  averageSessionTime: number;
  totalSessions: number;
  lastSessionDate: Timestamp;
  longestStreak: number;
  currentStreak: number;
  favoriteSubjects: string[];
  learningVelocity: number; // compétences par semaine
}

// Achievements
export interface Achievement {
  id: ID;
  type: AchievementType;
  name: LocalizedContent;
  description: LocalizedContent;
  icon: string;
  earnedAt: Timestamp;
  criteria: AchievementCriteria;
}

export type AchievementType = 
  | 'streak'
  | 'completion'
  | 'speed'
  | 'accuracy'
  | 'exploration'
  | 'milestone'
  | 'special';

export interface AchievementCriteria {
  type: 'streak_days' | 'competences_completed' | 'perfect_scores' | 'time_based';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

// Données de série
export interface StreakData {
  current: number; // jours consécutifs
  longest: number;
  lastActivity: Timestamp;
  milestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  achievedAt: Timestamp;
  reward?: Achievement;
}

// Préférences d'apprentissage
export interface LearningPreferences {
  difficultyMode: 'adaptive' | 'fixed';
  preferredDifficulty: number; // 1-10
  showHints: boolean;
  autoPlayMedia: boolean;
  notificationSettings: NotificationSettings;
  studyReminders: StudyReminder[];
  accessibilitySettings: AccessibilitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sound: boolean;
  streakReminders: boolean;
  achievementAlerts: boolean;
  weeklyProgress: boolean;
}

export interface StudyReminder {
  id: ID;
  days: number[]; // 0-6 (dimanche-samedi)
  time: string; // HH:MM
  message: LocalizedContent;
  isActive: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// Actions recommandées
export interface RecommendedAction {
  type: 'review' | 'practice' | 'advance' | 'break';
  competenceId?: ID;
  reason: LocalizedContent;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // en minutes
}
```

## 🔍 Validation avec Zod

### Schémas de validation

**Fichier : `src/lib/validation/content-schemas.ts`**
```typescript
import { z } from 'zod';

// Schémas de base
export const TimestampSchema = z.string().datetime();
export const IDSchema = z.string().min(1);

export const LocalizedContentSchema = z.object({
  fr: z.string().min(1),
  en: z.string().optional(),
  es: z.string().optional(),
  de: z.string().optional()
});

export const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
export const LearningStatusSchema = z.enum(['not-started', 'in-progress', 'completed', 'mastered']);

export const BaseEntitySchema = z.object({
  id: IDSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
  version: z.number().int().min(1),
  isActive: z.boolean()
});

export const MediaResourceSchema = z.object({
  id: IDSchema,
  type: z.enum(['image', 'video', 'audio', 'document', 'interactive']),
  url: z.string().url(),
  thumbnail: z.string().url().optional(),
  alt: LocalizedContentSchema.optional(),
  caption: LocalizedContentSchema.optional(),
  duration: z.number().positive().optional(),
  size: z.number().positive().optional(),
  mimeType: z.string()
});

// Schéma pour les compétences
export const CompetenceSchema = BaseEntitySchema.extend({
  title: LocalizedContentSchema,
  description: LocalizedContentSchema,
  shortDescription: LocalizedContentSchema.optional(),
  level: DifficultyLevelSchema,
  domain: IDSchema,
  prerequisites: z.array(IDSchema),
  estimatedTime: z.number().positive(),
  objectives: z.array(LocalizedContentSchema),
  skills: z.array(z.string()),
  exercises: z.array(IDSchema),
  resources: z.array(MediaResourceSchema),
  assessments: z.array(IDSchema),
  tags: z.array(IDSchema),
  author: IDSchema,
  reviewers: z.array(IDSchema),
  lastReview: TimestampSchema,
  settings: z.object({
    allowRetry: z.boolean(),
    maxAttempts: z.number().positive().optional(),
    passingScore: z.number().min(0).max(100),
    showHints: z.boolean(),
    showSolutions: z.boolean(),
    randomizeQuestions: z.boolean(),
    timeLimit: z.number().positive().optional(),
    adaptiveDifficulty: z.boolean()
  })
});

// Schéma pour les exercices
export const ChoiceOptionSchema = z.object({
  id: z.number(),
  text: LocalizedContentSchema,
  explanation: LocalizedContentSchema.optional(),
  media: MediaResourceSchema.optional()
});

export const MultipleChoiceContentSchema = z.object({
  question: LocalizedContentSchema,
  options: z.array(ChoiceOptionSchema).min(2),
  correctAnswers: z.array(z.number()),
  allowMultiple: z.boolean(),
  shuffleOptions: z.boolean(),
  media: z.array(MediaResourceSchema).optional()
}).refine(data => {
  // Valider que les indices de réponses correctes existent
  const maxIndex = data.options.length - 1;
  return data.correctAnswers.every(index => index >= 0 && index <= maxIndex);
}, {
  message: "Les indices de réponses correctes doivent correspondre aux options disponibles"
});

export const ExerciseSchema = BaseEntitySchema.extend({
  type: z.enum([
    'multiple-choice', 'single-choice', 'true-false', 'fill-blanks',
    'drag-drop', 'text-input', 'code-completion', 'matching',
    'ordering', 'interactive'
  ]),
  title: LocalizedContentSchema,
  instruction: LocalizedContentSchema,
  competenceId: IDSchema,
  content: z.union([
    MultipleChoiceContentSchema,
    // Ajouter d'autres schémas selon le type
  ]),
  hints: z.array(LocalizedContentSchema),
  explanation: LocalizedContentSchema.optional(),
  difficulty: z.number().min(1).max(10),
  weight: z.number().positive(),
  timeLimit: z.number().positive().optional(),
  tags: z.array(z.string()),
  author: IDSchema
});

// Utilitaires de validation
export function validateCompetence(data: unknown) {
  return CompetenceSchema.parse(data);
}

export function validateExercise(data: unknown) {
  return ExerciseSchema.parse(data);
}

// Validation conditionnelle selon le type
export function validateExerciseContent(type: string, content: unknown) {
  switch (type) {
    case 'multiple-choice':
      return MultipleChoiceContentSchema.parse(content);
    // Ajouter d'autres cas
    default:
      throw new Error(`Type d'exercice non supporté: ${type}`);
  }
}
```

## 🔄 Migration et versionning

### Système de migration

**Fichier : `src/lib/migration/content-migration.ts`**
```typescript
interface MigrationScript {
  version: number;
  description: string;
  up: (data: any) => any;
  down: (data: any) => any;
}

export const contentMigrations: MigrationScript[] = [
  {
    version: 1,
    description: "Ajout du champ shortDescription aux compétences",
    up: (competence) => ({
      ...competence,
      shortDescription: competence.shortDescription || null
    }),
    down: (competence) => {
      const { shortDescription, ...rest } = competence;
      return rest;
    }
  },
  {
    version: 2,
    description: "Migration des tags vers le nouveau système",
    up: (content) => ({
      ...content,
      tags: Array.isArray(content.tags) ? content.tags : []
    }),
    down: (content) => content
  }
];

export async function migrateContent(content: any, targetVersion: number): Promise<any> {
  let currentVersion = content.version || 0;
  let migrated = { ...content };

  for (const migration of contentMigrations) {
    if (migration.version > currentVersion && migration.version <= targetVersion) {
      migrated = migration.up(migrated);
      migrated.version = migration.version;
    }
  }

  return migrated;
}
```

## 📚 Liens

- **Roadmap principale** : [DOC_ROADMAP_LEARNING.md](../../DOC_ROADMAP_LEARNING.md)
- **Référence Real-time System** : [realtime-system.md](./realtime-system.md)
- **Zod Documentation** : https://zod.dev/
- **TypeScript Handbook** : https://www.typescriptlang.org/docs/

## 🔄 Historique des versions

- **v1.0.0** - Types de base et structures éducatives
- **v1.1.0** - Types d'exercices et validation
- **v1.2.0** - Système de progression utilisateur
- **v1.3.0** - Validation Zod et migration
- **v1.4.0** - Types interactifs et adaptatifs

## 🤝 Contribution

Pour modifier cette référence :
1. Maintenir la compatibilité descendante
2. Ajouter des validations Zod pour nouveaux types
3. Créer des migrations pour les changements de structure
4. Documenter les nouvelles propriétés
5. Tester avec des données réelles
