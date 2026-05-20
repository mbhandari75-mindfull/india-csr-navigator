'use client'

interface Props { totalSpend: number; orgCount: number }

export default function InsightsStrip({ totalSpend, orgCount }: Props) {
  const insights = [
    { stat: '₹34,909 Cr', label: 'Total India CSR spend FY2024', sub: '8.74% CAGR since FY2020' },
    { stat: '35%', label: 'Goes to education', sub: 'Largest single sector' },
    { stat: '29%', label: 'Goes to healthcare', sub: '2nd largest sector' },
    { stat: '4.43 lakh', label: 'NGOs registered in India', sub: 'Most struggle to find CSR funding' },
    { stat: '84%', label: 'From private companies', sub: 'PSUs contribute just 16%' },
    { stat: 'Maharashtra', label: 'Top recipient state', sub: '17% of all CSR spend' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 1, marginBottom: 28, border: '1px solid #e0ddd4', borderRadius: 6, overflow: 'hidden', background: '#e0ddd4' }}>
      {insights.map((ins, i) => (
        <div key={i} style={{ background: i === 0 ? '#1a1a1a' : '#fff', padding: '14px 16px' }}>
          <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 20, fontWeight: 700, color: i === 0 ? '#faf9f6' : '#1a1a1a', lineHeight: 1.1 }}>{ins.stat}</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: i === 0 ? '#9a9a96' : '#3d3d3a', marginTop: 4, lineHeight: 1.4 }}>{ins.label}</div>
          <div style={{ fontSize: 10, color: i === 0 ? '#6b6b67' : '#9a9a96', marginTop: 2 }}>{ins.sub}</div>
        </div>
      ))}
    </div>
  )
}
