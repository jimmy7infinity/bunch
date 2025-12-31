export interface RankColors {
  name: string;
  pfpBorder: {
    topLeft: string;
    bottomRight: string;
  };
  rankBorder: {
    topLeft: string;
    bottomRight: string;
  };
  rankText: string;
  rankFill: string;
  order: number;
  category: 'user' | 'staff';
  hasAccent: boolean;
  accentFile?: string;
}

export const RANKS: Record<string, RankColors> = {
  RECRUIT: {
    name: 'RECRUIT',
    pfpBorder: {
      topLeft: '#888888',
      bottomRight: '#555555',
    },
    rankBorder: {
      topLeft: '#888888',
      bottomRight: '#555555',
    },
    rankText: '#888888',
    rankFill: '#2A2A2A',
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
      topLeft: '#84FF00',
      bottomRight: '#045900',
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
      topLeft: '#00CCFF',
      bottomRight: '#3200A5',
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
      topLeft: '#FFB300',
      bottomRight: '#FF2600',
    },
    rankBorder: {
      topLeft: '#FF9D00',
      bottomRight: '#A51300',
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
      topLeft: '#00FF88',
      bottomRight: '#006222',
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
      topLeft: '#FF0000',
      bottomRight: '#530056',
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
      topLeft: '#B700FF',
      bottomRight: '#00205C',
    },
    rankText: '#BF00FF',
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
      topLeft: '#EBEF00',
      bottomRight: '#981900',
    },
    rankText: '#F2FF64',
    rankFill: '#4E3C00',
    order: 8,
    category: 'user',
    hasAccent: false,
  },
  // After LEGEND, + ranks begin
  'VETERAN+': {
    name: 'VETERAN+',
    pfpBorder: {
      topLeft: '#B2FF00',
      bottomRight: '#009B3E',
    },
    rankBorder: {
      topLeft: '#84FF00',
      bottomRight: '#045900',
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
      topLeft: '#00CCFF',
      bottomRight: '#3200A5',
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
      topLeft: '#FFB300',
      bottomRight: '#FF2600',
    },
    rankBorder: {
      topLeft: '#FF9D00',
      bottomRight: '#A51300',
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
      topLeft: '#00FF88',
      bottomRight: '#006222',
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
      topLeft: '#FF0000',
      bottomRight: '#530056',
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
      topLeft: '#B700FF',
      bottomRight: '#00205C',
    },
    rankText: '#BF00FF',
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
      topLeft: '#EBEF00',
      bottomRight: '#981900',
    },
    rankText: '#F2FF64',
    rankFill: '#4E3C00',
    order: 15,
    category: 'user',
    hasAccent: true,
    accentFile: 'legend.png',
  },
  // Staff ranks (always have accents)
  MOD: {
    name: 'MOD',
    pfpBorder: {
      topLeft: '#FF1115',
      bottomRight: '#3C0000',
    },
    rankBorder: {
      topLeft: '#FF1115',
      bottomRight: '#630000',
    },
    rankText: '#0062FF',
    rankFill: '#111535',
    order: 16,
    category: 'staff',
    hasAccent: true,
    accentFile: 'mod.png',
  },
  ADMIN: {
    name: 'ADMIN',
    pfpBorder: {
      topLeft: '#0915FF',
      bottomRight: '#1D0931',
    },
    rankBorder: {
      topLeft: '#0915FF',
      bottomRight: '#010649',
    },
    rankText: '#FF1115',
    rankFill: '#3E0000',
    order: 17,
    category: 'staff',
    hasAccent: true,
    accentFile: 'admin.png',
  },
  CREATOR: {
    name: 'CREATOR',
    pfpBorder: {
      topLeft: '#D4F4FF',
      bottomRight: '#BCBCBC',
    },
    rankBorder: {
      topLeft: '#FDFDFD',
      bottomRight: '#646464',
    },
    rankText: '#E9F3FF',
    rankFill: '#2B2B2B',
    order: 18,
    category: 'staff',
    hasAccent: true,
    accentFile: 'creator.png',
  },
};

export const getRankColors = (rankName: string): RankColors => {
  return RANKS[rankName.toUpperCase()] || RANKS.RECRUIT;
};

export const getPFPBorderStyle = (rankName: string): string => {
  const colors = getRankColors(rankName);
  return `linear-gradient(135deg, ${colors.pfpBorder.topLeft}, ${colors.pfpBorder.bottomRight})`;
};

export const getRankBorderStyle = (rankName: string): string => {
  const colors = getRankColors(rankName);
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

