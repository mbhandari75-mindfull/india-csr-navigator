export function exportCSV(orgs: any[]) {
  const headers = [
    'Name','Type','Parent Company','Founded','Team Size',
    'Annual Spend','Spend Min (Cr)','Spend Max (Cr)',
    'Gender Score (1-10)','NGO Size Preference','Grant Tier',
    'Focus Areas','Menstrual Health Note','Grant Size',
    'Geography','Website',
    'Contact Name','Contact Title','Contact Email',
    'Verified','Description',
  ]
  const rows = orgs.map(o => [
    o.name, o.type, o.parent_company, o.founded, o.team_size,
    o.spend_label, o.spend_min_cr, o.spend_max_cr,
    o.gender_score, o.ngo_size_preference, o.grant_tier,
    (o.focus_areas || []).join('; '),
    o.menstrual_note, o.grant_size,
    o.geography, o.website,
    o.contact_name, o.contact_title, o.contact_email,
    o.verified ? 'Yes' : 'No', o.description,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`))
  const csv = [headers.map(h => `"${h}"`).join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadBlob(csv, 'india-csr-navigator.csv', 'text/csv')
}

export function exportJSON(orgs: any[]) {
  downloadBlob(JSON.stringify(orgs, null, 2), 'india-csr-navigator.json', 'application/json')
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
