import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouterV2 } from '@/app/router'

export default function App() {
  return (
    <AppProviders>
      <AppRouterV2 />
    </AppProviders>
  )
}
