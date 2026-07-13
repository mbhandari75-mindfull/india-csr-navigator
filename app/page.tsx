import { Suspense } from 'react'
import ClientApp from '@/components/ClientApp'

export default function Home() {
  return (
    <Suspense fallback={null}>
      <ClientApp />
    </Suspense>
  )
}
