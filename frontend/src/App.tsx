import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TodaysBrief } from '@/pages/todays-brief'
import { ThreatMapPage } from '@/pages/threat-map'
import { ScamAnalyzer } from '@/pages/scam-analyzer'
import { CounterfeitScanner } from '@/pages/counterfeit-scanner'
import { FraudNetworkPage } from '@/pages/fraud-network'
import { CitizenShield } from '@/pages/citizen-shield'
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TodaysBrief />} />
        <Route path="/threat-map" element={<ThreatMapPage />} />
        <Route path="/scam-analyzer" element={<ScamAnalyzer />} />
        <Route path="/counterfeit-scanner" element={<CounterfeitScanner />} />
        <Route path="/fraud-network" element={<FraudNetworkPage />} />
        <Route path="/citizen-shield" element={<CitizenShield />} />
      </Routes>
    </BrowserRouter>
  )
}
