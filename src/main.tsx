import React from 'react'
import ReactDOM from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import './styles/globals.css'

if (Capacitor.isNativePlatform()) {
  document.body.classList.add('cap-native')

  Promise.all([
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
  ]).then(([{ StatusBar, Style }, { SplashScreen }]) => {
    StatusBar.setStyle({ style: Style.Dark })
    StatusBar.setBackgroundColor({ color: '#0a0a0a' })
    SplashScreen.hide()
  })

  if (Capacitor.getPlatform() === 'android') {
    import('@capacitor/app').then(({ App: CapApp }) => {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) window.history.back()
        else CapApp.exitApp()
      })
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
