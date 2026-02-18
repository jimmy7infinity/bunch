export interface RankColors {
  name: string;
  pfpBorder: {
    topLeft: string;
    bottomRight: string;
    middle?: string[]; // Optional array for additional gradient stops
  };
  rankBorder: {
    topLeft: string;
    bottomRight: string;
    middle?: string[]; // Optional array for additional gradient stops
  };
  rankText: string;
  rankFill: string;
  order: number;
  category: 'user' | 'staff' | 'performance' | 'special';
  hasAccent: boolean;
  accentFile?: string;
  isAnimated?: boolean; // True for GIF accents
  accentOffsetY?: number; // Custom vertical offset for accent (in pixels at base scale)
  accentOffsetX?: number; // Custom horizontal offset for accent (in pixels at base scale)
}

/**
 * Get the display rank for a user (equipped accent takes priority over base rank)
 */
export const getDisplayRank = (user: { rank?: string; equipped_accent?: string } | null | undefined): string => {
  if (!user) return 'RECRUIT';
  return user.equipped_accent || user.rank || 'RECRUIT';
};

export const RANKS: Record<string, RankColors> = {
  // ==================== REGULAR RANKS ====================
  RECRUIT: {
    name: 'RECRUIT',
    pfpBorder: {
      topLeft: '#918E8E',
      bottomRight: '#2A2929',
    },
    rankBorder: {
      topLeft: '#918E8E',
      bottomRight: '#2A2929',
    },
    rankText: '#B9B7B7',
    rankFill: '#282828',
    order: 1,
    category: 'user',
    hasAccent: false,
  },
  VETERAN: {
    name: 'VETERAN',
    pfpBorder: {
      topLeft: '#B2FF00',
      bottomRight: '#009B3E',
    },
    rankBorder: {
      topLeft: '#B2FF00',
      bottomRight: '#009B3E',
    },
    rankText: '#BFFF00',
    rankFill: '#16280D',
    order: 2,
    category: 'user',
    hasAccent: false,
  },
  CAPTAIN: {
    name: 'CAPTAIN',
    pfpBorder: {
      topLeft: '#00FFFB',
      bottomRight: '#001EFF',
    },
    rankBorder: {
      topLeft: '#00FFFB',
      bottomRight: '#001EFF',
    },
    rankText: '#00E1FF',
    rankFill: '#001455',
    order: 3,
    category: 'user',
    hasAccent: false,
  },
  CHAMP: {
    name: 'CHAMP',
    pfpBorder: {
      topLeft: '#FFB200',
      bottomRight: '#FF2600',
    },
    rankBorder: {
      topLeft: '#FFB200',
      bottomRight: '#FF2600',
    },
    rankText: '#FFB200',
    rankFill: '#550E00',
    order: 4,
    category: 'user',
    hasAccent: false,
  },
  HERO: {
    name: 'HERO',
    pfpBorder: {
      topLeft: '#37FFDA',
      bottomRight: '#00FF59',
    },
    rankBorder: {
      topLeft: '#37FFDA',
      bottomRight: '#00FF59',
    },
    rankText: '#00FFD0',
    rankFill: '#002F26',
    order: 5,
    category: 'user',
    hasAccent: false,
  },
  TITAN: {
    name: 'TITAN',
    pfpBorder: {
      topLeft: '#F701FF',
      bottomRight: '#FF0000',
    },
    rankBorder: {
      topLeft: '#F701FF',
      bottomRight: '#FF0000',
    },
    rankText: '#FF31DD',
    rankFill: '#2E0014',
    order: 6,
    category: 'user',
    hasAccent: false,
  },
  ICON: {
    name: 'ICON',
    pfpBorder: {
      topLeft: '#BF00FF',
      bottomRight: '#5100FF',
    },
    rankBorder: {
      topLeft: '#BF00FF',
      bottomRight: '#5100FF',
    },
    rankText: '#FF31FF',
    rankFill: '#000038',
    order: 7,
    category: 'user',
    hasAccent: false,
  },
  LEGEND: {
    name: 'LEGEND',
    pfpBorder: {
      topLeft: '#D9FF00',
      bottomRight: '#FF8C00',
    },
    rankBorder: {
      topLeft: '#D9FF00',
      bottomRight: '#FF8C00',
    },
    rankText: '#F2FF64',
    rankFill: '#4E3C00',
    order: 8,
    category: 'user',
    hasAccent: false,
  },

  // ==================== + RANKS (After LEGEND) ====================
  'VETERAN+': {
    name: 'VETERAN+',
    pfpBorder: {
      topLeft: '#B2FF00',
      bottomRight: '#009B3E',
    },
    rankBorder: {
      topLeft: '#B2FF00',
      bottomRight: '#009B3E',
    },
    rankText: '#BFFF00',
    rankFill: '#16280D',
    order: 9,
    category: 'user',
    hasAccent: true,
    accentFile: 'veteran.png',
  },
  'CAPTAIN+': {
    name: 'CAPTAIN+',
    pfpBorder: {
      topLeft: '#00FFFB',
      bottomRight: '#001EFF',
    },
    rankBorder: {
      topLeft: '#00FFFB',
      bottomRight: '#001EFF',
    },
    rankText: '#00E1FF',
    rankFill: '#001455',
    order: 10,
    category: 'user',
    hasAccent: true,
    accentFile: 'captain.png',
  },
  'CHAMP+': {
    name: 'CHAMP+',
    pfpBorder: {
      topLeft: '#FFB200',
      bottomRight: '#FF2600',
    },
    rankBorder: {
      topLeft: '#FFB200',
      bottomRight: '#FF2600',
    },
    rankText: '#FFB200',
    rankFill: '#550E00',
    order: 11,
    category: 'user',
    hasAccent: true,
    accentFile: 'champ.png',
  },
  'HERO+': {
    name: 'HERO+',
    pfpBorder: {
      topLeft: '#37FFDA',
      bottomRight: '#00FF59',
    },
    rankBorder: {
      topLeft: '#37FFDA',
      bottomRight: '#00FF59',
    },
    rankText: '#00FFD0',
    rankFill: '#002F26',
    order: 12,
    category: 'user',
    hasAccent: true,
    accentFile: 'hero.png',
  },
  'TITAN+': {
    name: 'TITAN+',
    pfpBorder: {
      topLeft: '#F701FF',
      bottomRight: '#FF0000',
    },
    rankBorder: {
      topLeft: '#F701FF',
      bottomRight: '#FF0000',
    },
    rankText: '#FF31DD',
    rankFill: '#2E0014',
    order: 13,
    category: 'user',
    hasAccent: true,
    accentFile: 'titan.png',
  },
  'ICON+': {
    name: 'ICON+',
    pfpBorder: {
      topLeft: '#BF00FF',
      bottomRight: '#5100FF',
    },
    rankBorder: {
      topLeft: '#BF00FF',
      bottomRight: '#5100FF',
    },
    rankText: '#FF31FF',
    rankFill: '#000038',
    order: 14,
    category: 'user',
    hasAccent: true,
    accentFile: 'icon.png',
  },
  'LEGEND+': {
    name: 'LEGEND+',
    pfpBorder: {
      topLeft: '#D9FF00',
      bottomRight: '#FF8C00',
    },
    rankBorder: {
      topLeft: '#D9FF00',
      bottomRight: '#FF8C00',
    },
    rankText: '#F2FF64',
    rankFill: '#4E3C00',
    order: 15,
    category: 'user',
    hasAccent: true,
    accentFile: 'legend.png',
  },

  // ==================== TEAM/STAFF RANKS ====================
  CREATOR: {
    name: 'CREATOR',
    pfpBorder: {
      topLeft: '#D4F4FF',
      bottomRight: '#BCBCBC',
    },
    rankBorder: {
      topLeft: '#D4F4FF',
      bottomRight: '#BCBCBC',
    },
    rankText: '#E9F3FF',
    rankFill: '#1E1E1E',
    order: 16,
    category: 'staff',
    hasAccent: true,
    accentFile: 'creator.png',
  },
  ADMIN: {
    name: 'ADMIN',
    pfpBorder: {
      topLeft: '#0915FF',
      bottomRight: '#1D0931',
    },
    rankBorder: {
      topLeft: '#0915FF',
      bottomRight: '#1D0931',
    },
    rankText: '#FF1115',
    rankFill: '#370F0F',
    order: 17,
    category: 'staff',
    hasAccent: true,
    accentFile: 'admin.png',
  },
  MOD: {
    name: 'MOD',
    pfpBorder: {
      topLeft: '#FF1115',
      bottomRight: '#3C0000',
    },
    rankBorder: {
      topLeft: '#FF1115',
      bottomRight: '#3C0000',
    },
    rankText: '#0062FF',
    rankFill: '#111535',
    order: 18,
    category: 'staff',
    hasAccent: true,
    accentFile: 'mod.png',
  },

  // ==================== PERFORMANCE RANKS (TEMPORARY) ====================
  DIAMOND: {
    name: 'DIAMOND',
    pfpBorder: {
      topLeft: '#93E2FF',
      bottomRight: '#4C93FF',
    },
    rankBorder: {
      topLeft: '#93E2FF',
      bottomRight: '#4C93FF',
    },
    rankText: '#E3E3FF',
    rankFill: '#1D1954',
    order: 19,
    category: 'performance',
    hasAccent: true,
    accentFile: 'diamond.gif',
    isAnimated: true,
    accentOffsetY: -4.5,
  },
  'ON FIRE': {
    name: 'ON FIRE',
    pfpBorder: {
      topLeft: '#FEFF41',
      bottomRight: '#E61212',
    },
    rankBorder: {
      topLeft: '#FEFF41',
      bottomRight: '#E61212',
    },
    rankText: '#FF4800',
    rankFill: '#340808',
    order: 20,
    category: 'performance',
    hasAccent: true,
    accentFile: 'on-fire.gif',
    isAnimated: true,
    accentOffsetY: -3,
  },
  DANK: {
    name: 'DANK',
    pfpBorder: {
      topLeft: '#0301EC',
      middle: ['#16FCFE', '#1BFF05', '#F6FF00'],
      bottomRight: '#E612C6',
    },
    rankBorder: {
      topLeft: '#0301EC',
      middle: ['#16FCFE', '#1BFF05', '#F6FF00'],
      bottomRight: '#E612C6',
    },
    rankText: '#DFFF6D',
    rankFill: '#150038',
    order: 21,
    category: 'performance',
    hasAccent: true,
    accentFile: 'dank.gif',
    isAnimated: true,
  },
  SIZE: {
    name: 'SIZE',
    pfpBorder: {
      topLeft: '#FFFFFF',
      middle: ['#14141A', '#444444'],
      bottomRight: '#000000',
    },
    rankBorder: {
      topLeft: '#FFFFFF',
      middle: ['#14141A', '#444444'],
      bottomRight: '#000000',
    },
    rankText: '#E8E8E8',
    rankFill: '#151515',
    order: 22,
    category: 'performance',
    hasAccent: true,
    accentFile: 'size.gif',
    isAnimated: true,
  },

  // ==================== SPECIAL RANKS ====================
  EARLY: {
    name: 'EARLY',
    pfpBorder: {
      topLeft: '#FFF4BB',
      bottomRight: '#FFBAA3',
    },
    rankBorder: {
      topLeft: '#FFF4BB',
      bottomRight: '#FFBAA3',
    },
    rankText: '#FFF872',
    rankFill: '#202129',
    order: 23,
    category: 'special',
    hasAccent: true,
    accentFile: 'early.png',
  },
  NINJA: {
    name: 'NINJA',
    pfpBorder: {
      topLeft: '#2A2929',
      bottomRight: '#0A0A0A',
    },
    rankBorder: {
      topLeft: '#2A2929',
      bottomRight: '#0A0A0A',
    },
    rankText: '#B6B6B6',
    rankFill: '#0B0B0B',
    order: 24,
    category: 'special',
    hasAccent: true,
    accentFile: 'ninja.png',
  },
  TESTER: {
    name: 'TESTER',
    pfpBorder: {
      topLeft: '#00FF9D',
      bottomRight: '#66AD16',
    },
    rankBorder: {
      topLeft: '#00FF9D',
      bottomRight: '#66AD16',
    },
    rankText: '#98FF59',
    rankFill: '#13382F',
    order: 25,
    category: 'special',
    hasAccent: true,
    accentFile: 'tester.png',
  },
};

export const getRankColors = (rankName: string): RankColors => {
  return RANKS[rankName.toUpperCase()] || RANKS.RECRUIT;
};

export const getPFPBorderStyle = (rankName: string): string => {
  const colors = getRankColors(rankName);
  
  // Handle multi-color gradients
  if (colors.pfpBorder.middle && colors.pfpBorder.middle.length > 0) {
    const allColors = [
      colors.pfpBorder.topLeft,
      ...colors.pfpBorder.middle,
      colors.pfpBorder.bottomRight,
    ];
    
    // Calculate even distribution
    const stops = allColors.map((color, i) => {
      const position = (i / (allColors.length - 1)) * 100;
      return `${color} ${position}%`;
    }).join(', ');
    
    return `linear-gradient(135deg, ${stops})`;
  }
  
  // Standard 2-color gradient
  return `linear-gradient(135deg, ${colors.pfpBorder.topLeft}, ${colors.pfpBorder.bottomRight})`;
};

export const getRankBorderStyle = (rankName: string): string => {
  const colors = getRankColors(rankName);
  
  // Handle multi-color gradients
  if (colors.rankBorder.middle && colors.rankBorder.middle.length > 0) {
    const allColors = [
      colors.rankBorder.topLeft,
      ...colors.rankBorder.middle,
      colors.rankBorder.bottomRight,
    ];
    
    // Calculate even distribution
    const stops = allColors.map((color, i) => {
      const position = (i / (allColors.length - 1)) * 100;
      return `${color} ${position}%`;
    }).join(', ');
    
    return `linear-gradient(135deg, ${stops})`;
  }
  
  // Standard 2-color gradient
  return `linear-gradient(135deg, ${colors.rankBorder.topLeft}, ${colors.rankBorder.bottomRight})`;
};

export const getAllRanks = (): RankColors[] => {
  return Object.values(RANKS).sort((a, b) => a.order - b.order);
};

export const getUserRanks = (): RankColors[] => {
  return getAllRanks().filter(rank => rank.category === 'user');
};

export const getStaffRanks = (): RankColors[] => {
  return getAllRanks().filter(rank => rank.category === 'staff');
};

export const getPerformanceRanks = (): RankColors[] => {
  return getAllRanks().filter(rank => rank.category === 'performance');
};

export const getSpecialRanks = (): RankColors[] => {
  return getAllRanks().filter(rank => rank.category === 'special');
};
