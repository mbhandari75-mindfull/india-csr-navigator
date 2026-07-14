'use client'

import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

export default function TrackDetailView({
  entityType,
  slug,
}: {
  entityType: 'grant' | 'incubator' | 'ngo'
  slug: string
}) {
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog) {
      posthog.capture('funder_detail_viewed', { entity_type: entityType, slug })
    }
  }, [posthog, entityType, slug])

  return null
}
