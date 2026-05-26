# Pulse — Build Nativo (Android + iOS)

Pulse roda como app nativo via **Capacitor 8**. Esta guia cobre debug local, build de release e publicação nas lojas.

---

## Visão geral

| Item | Valor |
|---|---|
| **App ID** | `com.animalzgroup.pulse` |
| **App Name** | Pulse |
| **Bundle** | `com.animalzgroup.pulse` (alinhado ao domínio pulse.animalzgroup.com) |
| **Web target** | React 18 + Vite → `dist/` |
| **Cor de fundo** | `#060d1f` (dark) |
| **Cor de marca** | `#0A1AFF` (acid blue) |
| **Splash duration** | 2000ms com fade 300ms |
| **Deep link scheme** | `pulse://` |
| **Universal Link** | `pulse.animalzgroup.com` |

### Plugins Capacitor ativos
- `@capacitor/app` — eventos do app
- `@capacitor/camera` — QR check-in e fotos
- `@capacitor/keyboard` — teclado nativo
- `@capacitor/network` — status de rede
- `@capacitor/push-notifications` — push (APNs + FCM)
- `@capacitor/splash-screen` — splash inicial
- `@capacitor/status-bar` — status bar dark

---

## Pré-requisitos

### Android
- **Android Studio** (Hedgehog ou mais recente)
- **JDK 17** (Oracle ou OpenJDK)
- **Android SDK Platform 36** + Build Tools 36
- Variável de ambiente `ANDROID_HOME` apontando para `~/Library/Android/sdk`

### iOS (somente macOS)
- **Xcode 15+** + Command Line Tools
- **CocoaPods** (`sudo gem install cocoapods`)
- Conta Apple Developer ativa ($99/ano) — necessária para device/store

### Compartilhado
- Node 18+ instalado
- `npm install` rodado na raiz

---

## Fluxo padrão de build

```bash
# 1. Web build + sync com plataformas nativas
npm run cap:build

# 2. Abrir IDE nativa (Android Studio / Xcode)
npm run cap:open:android
npm run cap:open:ios

# 3. Rodar em device/emulador
npm run cap:android   # debug
npm run cap:ios       # debug (macOS)
```

---

## Android — debug local

```bash
npm run android:debug
# → gera android/app/build/outputs/apk/debug/app-debug.apk
```

Instalar em device conectado:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Android — release (Play Store)

### 1. Gerar keystore (uma única vez)
```bash
keytool -genkey -v -keystore pulse-release.keystore \
  -alias pulse -keyalg RSA -keysize 2048 -validity 10000
```

Guarde o arquivo em local seguro **fora do repo**. Anote o `storePassword` e `keyPassword`.

### 2. Criar `android/keystore.properties` (não commitar)
```properties
storeFile=/caminho/seguro/pulse-release.keystore
storePassword=********
keyAlias=pulse
keyPassword=********
```

### 3. Configurar `android/app/build.gradle`
Adicione antes de `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

E dentro de `android { ... }`:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Build AAB (formato Play Store)
```bash
npm run android:release
# → android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Upload na Play Console
- Acesse https://play.google.com/console
- Criar app → SKU `pulse-events`
- Subir `app-release.aab` em "Produção" → revisão → publicar

---

## iOS — debug local (macOS)

```bash
npm run cap:open:ios
# Abre Xcode no projeto ios/App/App.xcworkspace
```

No Xcode:
1. Selecione um simulador ou device conectado
2. Vá em **Signing & Capabilities** → escolha seu Team
3. Pressione **▶ Run**

---

## iOS — release (App Store)

### 1. Configurar Team ID
Edite `ios/ExportOptions.plist` e troque `YOUR_TEAM_ID` pelo seu Team ID (encontre em https://developer.apple.com/account → Membership).

### 2. Criar App ID no portal
- https://developer.apple.com/account/resources/identifiers/list
- Criar novo **App ID** explícito com bundle `com.animalzgroup.pulse`
- Habilitar capacidades: Push Notifications, Sign in with Apple (se usar), Associated Domains

### 3. Criar registro na App Store Connect
- https://appstoreconnect.apple.com
- Meus Apps → + → Novo App
- Nome: **Pulse**
- Bundle: `com.animalzgroup.pulse`
- SKU: `pulse-ios`

### 4. Archive + export
```bash
npm run ios:archive
npm run ios:export
# → build/ios/App.ipa
```

### 5. Upload via Transporter
- Abrir **Transporter** (Mac App Store)
- Arrastar `App.ipa`
- Entregar → aguardar processamento (5–15min)
- Voltar pra App Store Connect → adicionar build à versão → revisão

---

## Assets nativos (ícones + splash)

Os assets vivem em `assets/`:
- `assets/icon.png` (1024×1024, fundo do logo)
- `assets/icon-foreground.png` (1024×1024, transparente — só o símbolo)
- `assets/splash.png` (2732×2732, logo centralizado)
- `assets/splash-dark.png` (2732×2732, versão dark)

### Gerar todos os tamanhos automaticamente
```bash
npm run cap:assets
```
Isso popula `android/app/src/main/res/mipmap-*` e `ios/App/App/Assets.xcassets/AppIcon.appiconset/`.

### Fallback manual
Se o `sharp` não instalar no Windows (problema conhecido), use a ferramenta online:
- https://www.appicon.co — gera todos os tamanhos
- Copie pasta `AppIcon.appiconset` pro Xcode
- Copie `mipmap-*` pro `android/app/src/main/res/`

---

## Universal Links (iOS) & App Links (Android)

Configurado para abrir links de `https://pulse.animalzgroup.com/*` direto no app sem passar pelo navegador.

### Arquivos servidos pelo domínio
- `https://pulse.animalzgroup.com/.well-known/apple-app-site-association` (iOS)
- `https://pulse.animalzgroup.com/.well-known/assetlinks.json` (Android)

Ambos já estão em `public/.well-known/` e o `vercel.json` força `Content-Type: application/json` neles.

### Setup iOS (Universal Links)
1. **Apple Developer Portal** → habilite "Associated Domains" no App ID `com.animalzgroup.pulse`
2. No Xcode → target App → **Signing & Capabilities** → adicione **Associated Domains**
3. Adicione `applinks:pulse.animalzgroup.com` (já está no `App.entitlements`)
4. No arquivo `public/.well-known/apple-app-site-association`, **troque `YOUR_TEAM_ID`** pelo seu Apple Developer Team ID
5. Build + deploy do Vercel → Apple busca o AASA em até 24h

### Setup Android (App Links)
1. Pegue o SHA-256 do seu keystore:
   ```bash
   keytool -list -v -keystore pulse-release.keystore -alias pulse | grep SHA256
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android | grep SHA256
   ```
2. Edite `public/.well-known/assetlinks.json` substituindo os dois `REPLACE_WITH_*_SHA256`
3. Deploy do Vercel
4. Valide com:
   ```bash
   adb shell pm verify-app-links --re-verify com.animalzgroup.pulse
   adb shell pm get-app-links com.animalzgroup.pulse
   ```

### Teste rápido
- **iOS**: envie `https://pulse.animalzgroup.com/e/festa-x` via Mensagens; toque no link → deve abrir o app
- **Android**: `adb shell am start -W -a android.intent.action.VIEW -d "https://pulse.animalzgroup.com/e/festa-x" com.animalzgroup.pulse`

---

## Push Notifications

### iOS
1. No Apple Developer Portal → seu App ID → habilitar **Push Notifications**
2. Criar APNs Key em **Keys** (.p8)
3. Subir no Supabase Edge Functions ou serviço de push escolhido

### Android (FCM)
1. Criar projeto no Firebase Console
2. Adicionar app Android com package `com.animalzgroup.pulse`
3. Baixar `google-services.json` e colocar em `android/app/`
4. No `android/build.gradle` adicionar `classpath 'com.google.gms:google-services:4.4.0'`
5. No `android/app/build.gradle` adicionar `apply plugin: 'com.google.gms.google-services'`

---

## Versionamento

### Android
Edite `android/app/build.gradle`:
```gradle
versionCode 2        // INCREMENTAR a cada release
versionName "1.0.1"  // visível ao usuário
```

### iOS
No Xcode → target App → General:
- **Version** (CFBundleShortVersionString): ex `1.0.1`
- **Build** (CFBundleVersion): ex `2`

Ou via terminal:
```bash
cd ios/App && xcrun agvtool new-marketing-version 1.0.1
xcrun agvtool new-version -all 2
```

---

## Troubleshooting

### `npx cap sync` falha com plugin não encontrado
```bash
rm -rf node_modules package-lock.json
npm install
npm run cap:sync
```

### Build Android falha com Gradle
```bash
cd android && ./gradlew clean && cd ..
npm run cap:build
```

### iOS pods desatualizados
```bash
cd ios/App && pod install --repo-update && cd ../..
```

### Splash não aparece
Confira `capacitor.config.ts` → `plugins.SplashScreen.launchShowDuration` > 0.
Rebuild com `npm run cap:build`.

### App branco em produção
Geralmente é roteamento — TanStack Router não detecta o `file://` do Capacitor.
Solução: descomente `server.url` em `capacitor.config.ts` apontando para o domínio web.

---

## Scripts disponíveis

| Script | O que faz |
|---|---|
| `npm run cap:build` | Build web + sync nativo |
| `npm run cap:sync` | Apenas sync nativo |
| `npm run cap:android` | Build + run no Android |
| `npm run cap:ios` | Build + run no iOS |
| `npm run cap:open:android` | Abre Android Studio |
| `npm run cap:open:ios` | Abre Xcode |
| `npm run cap:assets` | Gera ícones/splash |
| `npm run android:debug` | Gera APK debug |
| `npm run android:apk` | Gera APK release (precisa keystore) |
| `npm run android:release` | Gera AAB release (precisa keystore) |
| `npm run ios:archive` | Arquiva .xcarchive |
| `npm run ios:export` | Exporta .ipa do archive |

---

## Checklist antes da primeira publicação

### Geral
- [ ] Logos finais (1024×1024) em `assets/`
- [ ] `npm run cap:assets` rodado com sucesso
- [ ] Testado em 1 device Android real
- [ ] Testado em 1 device iOS real
- [ ] Deep link `pulse://callback` testado (Stripe retorno)
- [ ] Push notifications testado

### Android
- [ ] Keystore gerado e backupado
- [ ] `keystore.properties` configurado
- [ ] `versionCode` e `versionName` setados
- [ ] AAB assinado gerado
- [ ] Screenshots (telefone + tablet) em Play Console
- [ ] Política de privacidade publicada
- [ ] Descrição em pt-BR e en preenchida

### iOS
- [ ] Team ID em `ExportOptions.plist`
- [ ] App ID criado no Developer Portal
- [ ] Push capability habilitada
- [ ] Registro criado na App Store Connect
- [ ] Screenshots (6.5" + 5.5") preparados
- [ ] Política de privacidade URL preenchida
- [ ] App Review Information completa
- [ ] Sandbox tester criado pra demo

---

**Última atualização**: 2026-05-12
