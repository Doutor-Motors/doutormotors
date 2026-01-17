# 📱 Guia de Build - Doutor Motors App Nativo

Este guia explica como compilar o app Doutor Motors para Android e iOS usando Capacitor.

---

## 📋 Pré-requisitos

### Para Android:
- **Node.js** 18+ e npm
- **Android Studio** Arctic Fox ou superior
- **JDK 17** ou superior
- **Android SDK** (API 24+)
- Dispositivo Android ou Emulador

### Para iOS (requer Mac):
- **Node.js** 18+ e npm
- **Xcode** 14+
- **CocoaPods** (`sudo gem install cocoapods`)
- Conta de Desenvolvedor Apple (para dispositivo real)
- Dispositivo iOS ou Simulador

---

## 🚀 Setup Inicial

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/doutor-motors.git
cd doutor-motors
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Instalar Plugins Nativos OBD2

```bash
# Plugin Bluetooth Serial (ELM327 Bluetooth)
npm install @nicklason/capacitor-bluetooth-serial

# Plugin TCP Socket (ELM327 WiFi)
npm install capacitor-tcp-socket

# Plugins opcionais úteis
npm install @capacitor/splash-screen @capacitor/status-bar
```

### 4. Build do Projeto Web

```bash
npm run build
```

### 5. Adicionar Plataformas

```bash
# Adicionar Android
npx cap add android

# Adicionar iOS (somente Mac)
npx cap add ios
```

### 6. Sincronizar

```bash
npx cap sync
```

---

## 🤖 Build Android

### Configurar Permissões

Edite `android/app/src/main/AndroidManifest.xml` e adicione dentro de `<manifest>`:

```xml
<!-- Permissões Bluetooth (OBD2) -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-feature android:name="android.hardware.bluetooth" android:required="false" />

<!-- Localização (necessária para Bluetooth no Android 6+) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- WiFi/Internet (OBD2 WiFi) -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
```

### Registrar Plugin Bluetooth

Edite `android/app/src/main/java/.../MainActivity.java`:

```java
package app.lovable.016972b3e5134fb2984d3dfb425d3809;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.nicklason.bluetoothserial.BluetoothSerial;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BluetoothSerial.class);
        super.onCreate(savedInstanceState);
    }
}
```

### Executar no Emulador/Dispositivo

```bash
# Sincronizar mudanças
npx cap sync android

# Opção 1: Abrir no Android Studio
npx cap open android
# No Android Studio: Run > Run 'app'

# Opção 2: Executar diretamente (requer dispositivo conectado)
npx cap run android
```

### Gerar APK de Release

1. Abra o Android Studio: `npx cap open android`
2. Menu: **Build > Generate Signed Bundle/APK**
3. Selecione **APK**
4. Crie ou selecione sua keystore
5. Escolha **release** como build variant
6. O APK estará em `android/app/release/`

### Gerar AAB para Play Store

1. Siga os passos acima, mas selecione **Android App Bundle**
2. O AAB estará em `android/app/release/`

---

## 🍎 Build iOS (Mac apenas)

### Configurar Permissões

Edite `ios/App/App/Info.plist` e adicione:

```xml
<!-- Bluetooth (OBD2) -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Doutor Motors usa Bluetooth para conectar ao adaptador OBD2 do seu veículo e realizar diagnósticos.</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>Doutor Motors precisa de acesso ao Bluetooth para comunicar com o scanner OBD2.</string>

<!-- WiFi Local (OBD2 WiFi) -->
<key>NSLocalNetworkUsageDescription</key>
<string>Doutor Motors usa a rede local para conectar ao adaptador OBD2 WiFi.</string>

<!-- Localização (para Bluetooth) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Localização é necessária para usar Bluetooth em segundo plano.</string>
```

### Instalar Pods

```bash
cd ios/App
pod install
cd ../..
```

### Executar no Simulador/Dispositivo

```bash
# Sincronizar mudanças
npx cap sync ios

# Abrir no Xcode
npx cap open ios

# No Xcode:
# 1. Selecione o dispositivo/simulador
# 2. Clique no botão Play (▶)
```

### Gerar IPA para App Store

1. Abra o Xcode: `npx cap open ios`
2. Selecione **Any iOS Device** como destino
3. Menu: **Product > Archive**
4. Após o archive, clique em **Distribute App**
5. Siga as instruções para App Store Connect

---

## 🔄 Fluxo de Desenvolvimento

### Desenvolvimento com Hot Reload

O `capacitor.config.ts` já está configurado para hot reload. O app carregará diretamente do servidor Lovable:

```bash
# Apenas sincronize e rode
npx cap sync
npx cap run android  # ou ios
```

### Build de Produção

1. **Remova ou comente** a seção `server` em `capacitor.config.ts`:

```typescript
// server: {
//   url: 'https://...',
//   cleartext: true
// },
```

2. Faça o build e sync:

```bash
npm run build
npx cap sync
```

3. Gere o APK/IPA conforme instruções acima

---

## 🔧 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Build do projeto web |
| `npx cap sync` | Sincroniza web + plugins com nativo |
| `npx cap copy` | Copia apenas arquivos web |
| `npx cap update` | Atualiza plugins nativos |
| `npx cap open android` | Abre Android Studio |
| `npx cap open ios` | Abre Xcode |
| `npx cap run android` | Build e executa no Android |
| `npx cap run ios` | Build e executa no iOS |
| `npx cap doctor` | Verifica problemas no setup |

---

## ❓ Solução de Problemas

### "Plugin not found" no Android

```bash
npx cap sync android
# Depois recompile no Android Studio
```

### Erro de permissão Bluetooth no Android 12+

Adicione ao AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
    android:usesPermissionFlags="neverForLocation" />
```

### Pod install falha no iOS

```bash
cd ios/App
pod deintegrate
pod install --repo-update
cd ../..
```

### App não conecta ao adaptador OBD2

1. Verifique se o adaptador está pareado nas configurações do sistema
2. Verifique se as permissões foram concedidas
3. Tente desparear e parear novamente
4. Reinicie o adaptador (remova e reconecte ao veículo)

---

## 📚 Recursos

- [Documentação Capacitor](https://capacitorjs.com/docs)
- [Plugin Bluetooth Serial](https://github.com/nicklason/capacitor-bluetooth-serial)
- [Documentação ELM327](https://www.elmelectronics.com/wp-content/uploads/2016/07/ELM327DS.pdf)

---

## 📱 Informações do App

- **App ID**: `app.lovable.016972b3e5134fb2984d3dfb425d3809`
- **Nome**: Doutor Motors
- **Versão Web**: Sync com Lovable
- **Plataformas**: Android 7.0+ (API 24), iOS 13+
