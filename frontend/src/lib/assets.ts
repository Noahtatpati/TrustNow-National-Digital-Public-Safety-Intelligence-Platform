type AssetSource = {
  path: string
  fallback?: string
  alt: string
  caption?: string
  credit?: string
}

type AssetConfig = {
  baseUrl: string
  provider: 'local' | 'cloudinary' | 's3' | 'gcs' | 'azure' | 'supabase' | 'cdn'
}

const config: AssetConfig = {
  baseUrl: '',
  provider: 'local',
}

export function setAssetProvider(provider: AssetConfig) {
  Object.assign(config, provider)
}

export function assetUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${config.baseUrl}${path}`
}

export const hero = {
  counterfeitCurrency: {
    path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=800&fit=crop',
    alt: 'Police officers examining evidence during a counterfeit currency investigation',
    caption: 'Bureau of Investigation raid operation in Gujarat, July 2026',
    credit: 'PTI',
  },
  cyberFraud: {
    path: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=800&fit=crop',
    alt: 'Cyber crime investigation unit at work',
    caption: 'Cyber crime cell investigating digital fraud syndicate',
    credit: 'Reuters',
  },
}

export const investigations: Record<string, AssetSource> = {
  counterfeit: {
    path: 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&h=600&fit=crop',
    alt: 'Forensic evidence being examined in a financial crime investigation',
    caption: 'Forensic analysis of counterfeit currency at state lab',
  },
  cyber: {
    path: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
    alt: 'Digital forensics investigation setup',
    caption: 'Digital evidence processing unit',
  },
  trafficking: {
    path: 'https://images.unsplash.com/photo-1444652584051-ce6a5c48d990?w=800&h=600&fit=crop',
    alt: 'Government building facade',
    caption: 'Joint task force headquarters',
  },
  deepfake: {
    path: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
    alt: 'Server room with network equipment',
    caption: 'Corporate IT infrastructure used in espionage case',
  },
  narcotics: {
    path: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop',
    alt: 'Maritime surveillance of coastline',
    caption: 'Indian Coast Guard patrol along eastern seaboard',
  },
}

export const evidence: Record<string, AssetSource> = {
  forensicReport: {
    path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop',
    alt: 'Forensic analysis documents',
  },
  seizedEquipment: {
    path: 'https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&h=400&fit=crop',
    alt: 'Seized printing equipment',
    caption: 'Offset printing machines seized from Surat warehouse',
  },
  transactionTrail: {
    path: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=600&h=400&fit=crop',
    alt: 'Financial documents and bank statements',
    caption: 'Bank account statements showing suspicious transactions',
  },
  surveillance: {
    path: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=400&fit=crop',
    alt: 'CCTV surveillance footage still',
    caption: 'CCTV footage from raid operation on July 18',
  },
}

export const crime: AssetSource = {
  path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  alt: 'Crime scene investigation',
}

export const banking: AssetSource = {
  path: 'https://images.unsplash.com/photo-1604681630513-69474e4e253f?w=400&h=300&fit=crop',
  alt: 'Banking and financial district',
}

export const currency: AssetSource = {
  path: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400&h=300&fit=crop',
  alt: 'Indian currency notes',
}

export const cities: Record<string, AssetSource> = {
  delhi: {
    path: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop',
    alt: 'Delhi city skyline',
  },
  mumbai: {
    path: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&h=600&fit=crop',
    alt: 'Mumbai skyline',
  },
}

export const police: AssetSource = {
  path: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
  alt: 'Police officers on duty',
}

export const government: AssetSource = {
  path: 'https://images.unsplash.com/photo-1444652584051-ce6a5c48d990?w=400&h=300&fit=crop',
  alt: 'Government building',
}
