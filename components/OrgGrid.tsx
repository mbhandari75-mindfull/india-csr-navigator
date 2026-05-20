'use client'
import OrgCard from './OrgCard'

interface Props { orgs: any[]; onSelect: (org: any) => void }

export default function OrgGrid({ orgs, onSelect }: Props) {
  if (!orgs.length) return (
    <div style={{ textAlign: 'center', padding: 48, color: '#9a9a96' }}>No organisations match your filters.</div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
      {orgs.map(org => <OrgCard key={org.id} org={org} onSelect={onSelect} />)}
    </div>
  )
}
