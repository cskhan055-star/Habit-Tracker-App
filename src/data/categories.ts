import { HabitCategory, HabitCategoryId } from '../types/habit';

export const HABIT_CATEGORIES: HabitCategory[] = [
  { id: 'health', label: 'Health', color: '#3E8471' }, // Refined emerald
  { id: 'work', label: 'Work', color: '#4A729A' },     // Deep sapphire
  { id: 'mindset', label: 'Mindset', color: '#8E6B9E' }, // Royal amethyst
  { id: 'craft', label: 'Craft', color: '#C6A15B' },   // Aurum gold
  { id: 'ritual', label: 'Ritual', color: '#B06868' },  // Warm ruby bronze
];

export const getCategoryById = (id?: string | null): HabitCategory => {
  if (!id) return HABIT_CATEGORIES[0];
  return HABIT_CATEGORIES.find((c) => c.id === id) || HABIT_CATEGORIES[0];
};
