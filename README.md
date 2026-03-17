
 **MyPet — Dijital Evcil Hayvan** 
 **Projenin Amacı **: MyPet, kullanıcıların farklı türlerde dijital evcil hayvanlar sahiplenip onlarla etkileşime geçerek ilerleme kaydettiği, aynı zamanda mini oyunlarla ödül kazanabildiği bir mobil uygulamadır. 
 Amaç; bakım + etkileşim + ödül döngüsüyle kullanıcıya sürdürülebilir bir oyunlaştırılmış deneyim sunmaktır.
 **Oyunlaştırma Özellikleri- Sahiplenme sistemi:** Farklı türlerde (Kedi, Köpek, Balık, Kaplumbağa, Kuş, Tavşan) dostlar sahiplenilebilir.
 **Stat sistemi:** Açlık, mutluluk, enerji ve temizlik değerleri zamanla değişir; kullanıcı aksiyonlarıyla yönetilir.
** XP & Seviye:**  - Kullanıcı profili XP kazanarak seviye atlar.  - Evcil hayvanlar da kendi XP’leriyle seviye/stage (Bebek/Genç/Yetişkin/Yaşlı) ilerlemesi yaşar.
 **Coin sistemi:** Etkileşimler ve mini oyunlar Coin kazandırır.
 **Market (Shop)**: Coin ile satın alınabilen **aksesuarlar (şapkalar)** bulunur ve evcil hayvanlara takılabilir.- **Mini oyunlar** :  - **Blok Kırma (Brick Breaker)**: Platformu hareket ettirip top ile blokları kırarak ödül kazanma.  - **Zıpla Yüksel (Jump Up)**: Zıplayarak platformlardan yükselme; yatay hareket cihazın sağ/sol hareketine bağlıdır.  - **Balon Patlatma (Balloons)**: Ekranda beliren balonları patlatma; 3 balon kaçırınca oyun biter.
  Nasıl Çalıştırılır? (Installation & Run)### Gereksinimler- Node.js (LTS önerilir)- npm (Node ile gelir)- Expo Go (telefon testleri için) / Android Studio Emulator (opsiyonel)### Kurulum1) Repoyu klonla:git clone <REPO_URL>cd MyPet
2) Paketleri yükle:
npm install
3) Projeyi çalıştır:
npx expo start
4) Çalıştırma seçenekleri:
Android emülatör: Expo ekranında a
Gerçek cihaz: Expo Go ile QR kodu okut
Web:
npx expo start --web
APK (İndirilebilir)
APK Linki: https://expo.dev/accounts/busssnrrr/projects/MyPet/builds/f3343713-824f-48d8-a265-8bcbdf2fd625

> Not: APK üretimi için EAS Build kullanıyorsanız örnek komut:
eas build -p android --profile preview
Tanıtım Videosu
YouTube Linki: https://youtube.com/shorts/6qYDJwp58og?feature=share
Kullanılan Teknolojiler
React Native
Expo + Expo Router
AsyncStorage / Web için localStorage uyumu
(Cihaz hareketi) expo-sensors (Accelerometer)
