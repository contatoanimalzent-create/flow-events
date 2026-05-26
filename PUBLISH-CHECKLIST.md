# Pulse — Checklist de Publicação nas Lojas

Este checklist cobre 100% dos requisitos Apple App Store + Google Play Store. Marque cada item antes de submeter.

---

## 🟢 Status atual — JÁ ESTÁ PRONTO

### Compliance Apple App Store
- ✅ **Account deletion in-app** (Guideline 5.1.1.v) — página `/delete-account`
- ✅ **Privacy Policy publicada** em `/privacy` (PT + EN)
- ✅ **Terms of Service** em `/terms` (PT + EN)
- ✅ **App Tracking Transparency** — não trackamos pra ads (não precisa do prompt)
- ✅ **Sign in with Apple** — não usamos OAuth de terceiros, então não exigido
- ✅ **Permission strings (NSCamera, NSPhotoLibrary, NSLocation, etc.)** no Info.plist
- ✅ **ITSAppUsesNonExemptEncryption=false** (sem export compliance)
- ✅ **Universal Links** configurado (`pulse.animalzgroup.com`)
- ✅ **Bundle ID alinhado ao domínio** (`com.animalzgroup.pulse`)
- ✅ **Status bar dark** + safe areas

### Compliance Google Play
- ✅ **Network Security Config** — bloqueia HTTP cleartext
- ✅ **Data Extraction Rules** — não vaza tokens em backup
- ✅ **App Links autoVerify** — `pulse.animalzgroup.com`
- ✅ **Account deletion** — mesma URL `/delete-account`
- ✅ **ProGuard rules** — preserva Capacitor + Sentry
- ✅ **targetSdkVersion 36** (Android 14, exigência atual da Play Store)
- ✅ **allowBackup=false** — Play Console aprova
- ✅ **POST_NOTIFICATIONS permission** (Android 13+)
- ✅ **Foreground service não usado** (GPS apenas com app aberto)

### Features funcionais
- ✅ Auto-cadastro de staff via link `/staff/join/[token]`
- ✅ Timeclock staff `/timeclock`
- ✅ GPS staff (schema `staff_location_events` + plugin Capacitor)
- ✅ Push notifications wiring (`setupPushNotifications` + tabela `push_tokens`)
- ✅ Deep link routing (Universal Links → React Router)
- ✅ Background/foreground detection (`pulse:app-resumed` event)
- ✅ Camera (QR check-in)
- ✅ Splash + ícones gerados nas 131 variações

---

## 🔴 Bloqueadores ANTES de submeter

### Apple (precisa fazer 1x)
- [ ] **Registrar Apple Developer Program** ($99/ano) — você vai fazer com CPF
- [ ] Pegar **Team ID** em https://developer.apple.com/account → Membership
- [ ] Criar **App ID** `com.animalzgroup.pulse` no portal com capabilities:
  - [ ] Push Notifications
  - [ ] Associated Domains (`applinks:pulse.animalzgroup.com`)
- [ ] Criar **App Store Connect** entry → Nome "Pulse", SKU `pulse-ios`
- [ ] Trocar `YOUR_TEAM_ID` em 2 arquivos:
  - [ ] `public/.well-known/apple-app-site-association`
  - [ ] `ios/ExportOptions.plist`
- [ ] Re-deploy Vercel pra publicar o AASA atualizado
- [ ] Criar **APNs Authentication Key (.p8)** em Apple Developer → Keys
- [ ] Subir chave APNs no Supabase Edge Functions ou serviço de push

### Google (precisa fazer 1x)
- [ ] Criar conta **Google Play Console** ($25 lifetime, paga uma vez)
- [ ] Gerar **release keystore**:
  ```bash
  keytool -genkey -v -keystore pulse-release.keystore \
    -alias pulse -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Backup do keystore em local seguro (**se perder, não consegue mais atualizar o app**)
- [ ] Criar `android/keystore.properties` (não commitar):
  ```properties
  storeFile=/caminho/seguro/pulse-release.keystore
  storePassword=xxx
  keyAlias=pulse
  keyPassword=xxx
  ```
- [ ] Adicionar `signingConfigs` no `android/app/build.gradle` (instruções em BUILD-NATIVE.md)
- [ ] Pegar **SHA-256** do keystore:
  ```bash
  keytool -list -v -keystore pulse-release.keystore -alias pulse | grep SHA256
  ```
- [ ] Substituir em `public/.well-known/assetlinks.json`:
  - [ ] SHA-256 do release keystore
  - [ ] SHA-256 do debug keystore (`~/.android/debug.keystore`, password `android`)
- [ ] Criar projeto **Firebase Console** + baixar `google-services.json` em `android/app/`
- [ ] Re-deploy Vercel

### Domínio
- [ ] Confirmar que `https://pulse.animalzgroup.com/.well-known/apple-app-site-association` retorna JSON 200
- [ ] Confirmar que `https://pulse.animalzgroup.com/.well-known/assetlinks.json` retorna JSON 200
- [ ] Confirmar HTTPS válido (não self-signed)

---

## 📋 Conteúdo das lojas (você prepara em texto/imagem)

### App Store Connect (iOS)
- [ ] **Nome** (30 chars): `Pulse — Eventos`
- [ ] **Subtítulo** (30 chars): `Gestão completa de eventos`
- [ ] **Descrição** (4000 chars) — escrever em PT-BR + EN
- [ ] **Keywords** (100 chars): `eventos,ingressos,checkin,produtor,QR,festival,show,palestra`
- [ ] **Support URL**: `https://pulse.animalzgroup.com/contato`
- [ ] **Marketing URL**: `https://pulse.animalzgroup.com`
- [ ] **Privacy Policy URL**: `https://pulse.animalzgroup.com/privacy`
- [ ] **Category Primary**: Business
- [ ] **Category Secondary**: Entertainment
- [ ] **Age Rating**: 4+
- [ ] **Screenshots 6.7"** (iPhone 15 Pro Max) — mínimo 3, máximo 10
- [ ] **Screenshots 6.5"** (iPhone 11 Pro Max) — pode reaproveitar
- [ ] **Screenshots 5.5"** (iPhone 8 Plus) — pode reaproveitar
- [ ] **Screenshots 12.9"** (iPad Pro) se quiser publicar pra iPad
- [ ] **App Preview Video** (opcional, 15-30s)
- [ ] **App Review Information**: nome, email, telefone, demo account login
- [ ] **Privacy Nutrition Labels** (declara dados coletados no painel da Apple)

### Google Play Console (Android)
- [ ] **Título** (30 chars): `Pulse - Gestão de Eventos`
- [ ] **Descrição curta** (80 chars)
- [ ] **Descrição completa** (4000 chars)
- [ ] **Ícone** 512×512 (já está em `android/.../mipmap-xxxhdpi`)
- [ ] **Feature graphic** 1024×500 (banner principal da loja)
- [ ] **Screenshots phone** 1080×1920 mínimo 2, máximo 8
- [ ] **Screenshots 7" tablet** opcional
- [ ] **Screenshots 10" tablet** opcional
- [ ] **Category**: Business
- [ ] **Email de contato**: contatopulse@animalzgroup.com
- [ ] **Privacy Policy URL**: `https://pulse.animalzgroup.com/privacy`
- [ ] **Data Safety Form** — declarar dados coletados (formulário extenso)
- [ ] **Target audience**: 18+
- [ ] **Content Rating** questionnaire — gera rating IARC automaticamente

---

## 🚀 Comandos de build

```bash
# Antes de cada release:
npm run cap:assets        # Regenerar ícones/splash se logo mudou
npm run build             # tsc + vite build
npm run cap:sync          # Copia dist + atualiza plugins

# Android
npm run android:release   # → android/app/build/outputs/bundle/release/app-release.aab

# iOS (precisa macOS)
npm run cap:open:ios      # Abre Xcode, Product → Archive
# ou
npm run ios:archive       # CLI archive
npm run ios:export        # Exporta .ipa
```

---

## ✅ Validação final (1h antes de submeter)

### Teste em device real
- [ ] Instalar APK release no Android e testar:
  - [ ] Login + signup
  - [ ] Comprar ingresso (Stripe test mode)
  - [ ] QR check-in (operador)
  - [ ] Push recebido
  - [ ] Deep link `https://pulse.animalzgroup.com/e/[evento]` abre o app
  - [ ] Deletar conta funciona
- [ ] Instalar IPA via TestFlight no iPhone e testar mesmo fluxo

### Validar arquivos públicos
- [ ] `curl https://pulse.animalzgroup.com/.well-known/apple-app-site-association` → JSON sem extensão `.json`
- [ ] `curl https://pulse.animalzgroup.com/.well-known/assetlinks.json` → JSON com SHA-256 correto
- [ ] `adb shell pm verify-app-links --re-verify com.animalzgroup.pulse` → "verified"

### Privacy nutrition (App Store Connect)
Declarar que coletamos:
- Email
- Nome
- Telefone (opcional)
- Localização (apenas staff)
- Dados de uso (analytics)
- Crash data (Sentry)

E **NÃO**:
- Tracking de ads (ATT)
- Histórico de navegação
- Saúde
- Contatos
- Biometria armazenada

---

## 📞 Demo accounts pros revisores

Apple e Google revisam o app **antes** de aprovar. Você precisa fornecer logins:

### App Review Information (Apple)
```
Username: revisor+apple@animalzgroup.com  (ou crie um demo no painel)
Password: PulseReview2026!
Notes:
- Faça login com as credenciais acima
- Navegue por Dashboard, Eventos, Vendas
- Para testar QR check-in, vá em /op e use o código do evento mostrado no Dashboard
- Para testar compra de ingresso, vá em /e/festa-demo (cartão Stripe test: 4242 4242 4242 4242)
```

### Google Play tester account
Mesma estrutura, mas envie como **interno** primeiro:
- https://play.google.com/console → Internal testing → Add testers (seu email)
- Testa por 24-48h antes de promover pra produção

---

## 🎯 Roadmap pós-lançamento

Funcionalidades que ficam pra próxima versão:
- [ ] Pagar.me (hoje só Stripe)
- [ ] Mapa live do staff com pins (componente, schema já existe)
- [ ] In-App Purchases pra plans (taxa Apple 15-30%)
- [ ] Sign in with Apple (quando adicionarmos OAuth Google)
- [ ] Apple Pay direto (sem Stripe)
- [ ] Pix QR direto (Stripe Brasil)
- [ ] Notificações ricas (imagem, ação)

---

**Última atualização**: 2026-05-12
