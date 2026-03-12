import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlockType = 'hero' | 'products' | 'about' | 'social' | 'banner';

export interface Block {
  id: string;
  type: BlockType;
  enabled: boolean;
  order: number;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta?: string;
  heroCoverUrl?: string;
  productsTitle?: string;
  productsLimit?: number;
  aboutTitle?: string;
  aboutText?: string;
  aboutImageUrl?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerImageUrl?: string;
  bannerLink?: string;
  instagram?: string;
  vk?: string;
  youtube?: string;
  telegram?: string;
}

export interface CreatorConfig {
  slug: string;
  name: string;
  tagline: string;
  bio: string;
  photo: string;
  coverPhoto?: string;
  mobileHeroBg?: string; // High-aspect ratio banner for mobile WB-style
  accentColor: string;
  accentText: string;
  heroBg: string; // Used as the desktop wide banner
  heroText: string;
  subscribers: string;
  platform: string;
  collections: { id: string; title: string; type: 'grid' | 'carousel' }[]; // WB-style sections
  blocks: Block[];
}

// ─── Default block factories ──────────────────────────────────────────────────

const defaultBlocks = (name: string): Block[] => [
  {
    id: 'hero', type: 'hero', enabled: true, order: 0,
    heroTitle: `Официальный мерч ${name}`,
    heroSubtitle: 'Авторские принты на качественных базовых вещах',
    heroCta: 'Смотреть коллекцию',
  },
  {
    id: 'products', type: 'products', enabled: true, order: 1,
    productsTitle: 'Коллекция',
    productsLimit: 12,
  },
  {
    id: 'about', type: 'about', enabled: true, order: 2,
    aboutTitle: 'О создателе',
  },
  {
    id: 'social', type: 'social', enabled: true, order: 3,
  },
];

const DEFAULT_CREATORS: CreatorConfig[] = [
  {
    slug: 'bashkirka',
    name: 'Башкирская домохозяка',
    tagline: 'Уютный мерч для дома и души',
    bio: 'Привет! Я Башкирская домохозяка. В моем магазине вы найдете самый душевный и качественный мерч для всей семьи.',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop',
    mobileHeroBg: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=800&fit=crop',
    accentColor: '#10b981', // Emerald green
    accentText: '#ffffff',
    heroBg: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
    heroText: '#ffffff',
    subscribers: '100K',
    platform: 'YouTube',
    collections: [
      { id: 'hits', title: 'Хиты продаж', type: 'carousel' },
      { id: 'new', title: 'Новинки', type: 'carousel' },
      { id: 'all', title: 'Весь каталог', type: 'grid' }
    ],
    blocks: defaultBlocks('Башкирской домохозяйки'),
  }
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface CreatorState {
  creators: CreatorConfig[];
  getCreator: (slug: string) => CreatorConfig | undefined;
  updateCreator: (slug: string, patch: Partial<CreatorConfig>) => void;
  updateBlock: (slug: string, blockId: string, patch: Partial<Block>) => void;
  reorderBlocks: (slug: string, blocks: Block[]) => void;
  toggleBlock: (slug: string, blockId: string) => void;
}

export const useCreatorStore = create<CreatorState>()(
  persist(
    (set, get) => ({
      creators: DEFAULT_CREATORS,

      getCreator: (slug) => get().creators.find(c => c.slug === slug),

      updateCreator: (slug, patch) =>
        set(s => ({
          creators: s.creators.map(c => c.slug === slug ? { ...c, ...patch } : c),
        })),

      updateBlock: (slug, blockId, patch) =>
        set(s => ({
          creators: s.creators.map(c =>
            c.slug === slug
              ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, ...patch } : b) }
              : c
          ),
        })),

      reorderBlocks: (slug, blocks) =>
        set(s => ({
          creators: s.creators.map(c => c.slug === slug ? { ...c, blocks } : c),
        })),

      toggleBlock: (slug, blockId) =>
        set(s => ({
          creators: s.creators.map(c =>
            c.slug === slug
              ? { ...c, blocks: c.blocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b) }
              : c
          ),
        })),
    }),
    { name: 'creator-store-v2', version: 2 }
  )
);
