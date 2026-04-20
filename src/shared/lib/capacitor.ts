import { Capacitor } from '@capacitor/core'

export const isNative = () => Capacitor.isNativePlatform()
export const getPlatform = () => Capacitor.getPlatform()
export const isAndroid = () => Capacitor.getPlatform() === 'android'
export const isIOS = () => Capacitor.getPlatform() === 'ios'
