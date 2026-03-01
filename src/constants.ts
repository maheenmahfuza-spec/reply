export interface TextStyles {
  fontFamily: string;
  fill?: string;
  fillAfter?: string;
  fillType?: 'solid' | 'gradient';
  fontStyle: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOpacity?: number;
  letterSpacing?: number;
}

export interface ImagePreset {
  id: string;
  name: string;
  heading: string;
  title: string;
  theme: 'Ramadan' | 'Special Offer' | 'Regular';
  backgroundType: string;
  specialRequirement: string;
  headingStyle: TextStyles;
  titleStyle: TextStyles;
}

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: 'ramadan-mubarak',
    name: '🌙 Ramadan Mubarak',
    heading: 'Ramadan Mubarak',
    title: 'Special Collection',
    theme: 'Ramadan',
    backgroundType: 'Studio',
    specialRequirement: 'Warm lanterns, crescent moon in background, soft lighting',
    headingStyle: {
      fontFamily: "'Cormorant Garamond', serif",
      fill: '#FFD700', // Gold
      fontStyle: 'italic bold',
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOpacity: 0.8,
      letterSpacing: 2
    },
    titleStyle: {
      fontFamily: "'Inter', sans-serif",
      fill: '#FFFFFF',
      fontStyle: 'normal',
      shadowColor: 'black',
      shadowBlur: 5,
      shadowOpacity: 0.5
    }
  },
  {
    id: 'summer-sale',
    name: '☀️ Summer Sale',
    heading: 'SUMMER SALE',
    title: 'Up to 50% OFF',
    theme: 'Special Offer',
    backgroundType: 'Nature',
    specialRequirement: 'Bright sunlight, tropical leaves, vibrant colors',
    headingStyle: {
      fontFamily: "'Anton', sans-serif",
      fill: '#FF4500', // Orange Red
      fontStyle: 'normal',
      shadowColor: 'white',
      shadowBlur: 2,
      shadowOpacity: 1,
      letterSpacing: 4
    },
    titleStyle: {
      fontFamily: "'Inter', sans-serif",
      fill: '#000000',
      fontStyle: 'bold',
      shadowColor: 'white',
      shadowBlur: 5,
      shadowOpacity: 0.8
    }
  },
  {
    id: 'minimal-studio',
    name: '✨ Minimalist Studio',
    heading: '',
    title: 'Premium Quality',
    theme: 'Regular',
    backgroundType: 'Studio',
    specialRequirement: 'Clean white background, soft shadows, high-end look',
    headingStyle: {
      fontFamily: "'Inter', sans-serif",
      fill: '#333333',
      fontStyle: 'normal',
      letterSpacing: 10
    },
    titleStyle: {
      fontFamily: "'Inter', sans-serif",
      fill: '#666666',
      fontStyle: 'italic',
      letterSpacing: 2
    }
  },
  {
    id: 'urban-arrival',
    name: '🏙️ Urban Arrival',
    heading: 'NEW ARRIVAL',
    title: 'Streetwear Series',
    theme: 'Regular',
    backgroundType: 'Urban',
    specialRequirement: 'City street background, cool lighting, edgy feel',
    headingStyle: {
      fontFamily: "'JetBrains Mono', monospace",
      fill: '#00FF00', // Neon Green
      fontStyle: 'bold',
      shadowColor: 'black',
      shadowBlur: 15,
      shadowOpacity: 1,
      letterSpacing: -1
    },
    titleStyle: {
      fontFamily: "'JetBrains Mono', monospace",
      fill: '#FFFFFF',
      fontStyle: 'normal',
      shadowColor: 'black',
      shadowBlur: 5,
      shadowOpacity: 0.5
    }
  },
  {
    id: 'luxury-glow',
    name: '💎 Luxury Glow',
    heading: 'EXCLUSIVELY YOURS',
    title: 'Limited Edition',
    theme: 'Regular',
    backgroundType: 'Gradient',
    specialRequirement: 'Golden lighting, luxury feel, elegant gradient background',
    headingStyle: {
      fontFamily: "'Playfair Display', serif",
      fill: '#FFFFFF',
      fontStyle: 'bold',
      shadowColor: '#B8860B', // Dark Goldenrod
      shadowBlur: 20,
      shadowOpacity: 0.6,
      letterSpacing: 5
    },
    titleStyle: {
      fontFamily: "'Playfair Display', serif",
      fill: '#F5F5F5',
      fontStyle: 'italic',
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOpacity: 0.3
    }
  }
];
