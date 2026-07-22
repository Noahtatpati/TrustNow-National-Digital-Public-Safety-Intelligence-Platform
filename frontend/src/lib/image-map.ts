import { investigations, evidence, hero, cities } from './assets'

export function getHeroImage(headline: string) {
  if (headline.toLowerCase().includes('counterfeit')) return hero.counterfeitCurrency
  if (headline.toLowerCase().includes('cyber')) return hero.cyberFraud
  return hero.counterfeitCurrency
}

export function getInvestigationImage(headline: string) {
  if (headline.toLowerCase().includes('counterfeit')) return investigations.counterfeit
  if (headline.toLowerCase().includes('cyber')) return investigations.cyber
  if (headline.toLowerCase().includes('trafficking')) return investigations.trafficking
  if (headline.toLowerCase().includes('deepfake')) return investigations.deepfake
  if (headline.toLowerCase().includes('narcotics') || headline.toLowerCase().includes('drug')) return investigations.narcotics
  return investigations.counterfeit
}

export function getEvidenceImage(type: string) {
  switch (type) {
    case 'document':
      return evidence.forensicReport
    case 'image':
      return evidence.seizedEquipment
    case 'video':
      return evidence.surveillance
    default:
      return evidence.forensicReport
  }
}

export function getCityImage(region: string) {
  const regionLower = region.toLowerCase()
  if (regionLower.includes('delhi') || regionLower.includes('new delhi')) return cities.delhi
  if (regionLower.includes('mumbai')) return cities.mumbai
  return cities.delhi
}
