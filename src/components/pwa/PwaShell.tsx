import { OfflineBanner } from '@/components/pwa/OfflineBanner'
import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner'
import { UpdateBanner } from '@/components/pwa/UpdateBanner'

export function PwaShell() {
  return (
    <>
      <UpdateBanner />
      <OfflineBanner />
      <PwaInstallBanner />
    </>
  )
}
