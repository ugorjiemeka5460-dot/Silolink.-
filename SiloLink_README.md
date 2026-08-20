# SiloLink

**From Farm to Market in 24 Hours.** A Flutter + Firebase marketplace connecting
farmers, produce buyers, and truck drivers in Nigeria.

---

## ⚠️ Read this first

This codebase was written outside a Flutter toolchain (no `flutter pub get`,
no emulator, no compiler available in that environment) — so treat it as a
carefully-written **starting point ready to open in your IDE**, not as
something guaranteed to build with zero edits. Three things in particular
need YOUR action before it runs:

1. **`lib/firebase_options.dart` is a placeholder.** It throws on purpose.
   You must generate the real one with the FlutterFire CLI (steps below) —
   it contains API keys tied to your own Firebase project, which I can't
   create on your behalf.
2. **`paystack_sdk_flutter`'s exact method names may differ** by version.
   `lib/services/paystack_service.dart` uses the common
   "initialize → checkout" pattern shared by most Paystack Flutter
   wrappers, but double-check it against the README of whatever version
   `flutter pub get` resolves for you.
3. **Phone Auth on Firebase's free Spark plan has a small daily SMS quota.**
   It's fine for development and testing with a handful of numbers. For a
   real launch, budget for the pay-as-you-go Blaze plan (it still has a
   generous free monthly allowance — you only pay past it).

---

## 1. Prerequisites

- Flutter SDK (3.22+) — https://docs.flutter.dev/get-started/install
- A Google account (for Firebase)
- A Paystack account — https://paystack.com (free to create; use test keys first)
- Android Studio or Xcode set up for running on a device/emulator

---

## 2. Create the Flutter project shell

I can't generate `android/`, `ios/`, or other platform scaffolding from
outside Flutter, so create a fresh project and drop this code into it:

```bash
flutter create silolink
cd silolink
```

Now replace the generated `pubspec.yaml` and `lib/` folder with the ones
from this delivery. Keep the `android/`, `ios/`, `test/` folders that
`flutter create` made for you.

```bash
flutter pub get
```

---

## 3. Set up Firebase (no billing required to start)

1. Go to https://console.firebase.google.com → **Add project** → name it
   `SiloLink` → you can disable Google Analytics if you want to keep setup
   fast.
2. In the project, enable these products (all free on the Spark plan):
   - **Authentication** → Sign-in method → enable **Phone**
   - **Firestore Database** → Create database → start in **test mode**
     for development (lock it down with real security rules before
     launch — see section 6)
   - **Storage** → Get started → test mode for development
3. Install the FlutterFire CLI (one-time):
   ```bash
   dart pub global activate flutterfire_cli
   npm install -g firebase-tools
   firebase login
   ```
4. From the `silolink/` project root:
   ```bash
   flutterfire configure
   ```
   Select your `SiloLink` project, then select Android and iOS as
   platforms. This overwrites `lib/firebase_options.dart` with real values
   and drops `google-services.json` / `GoogleService-Info.plist` into the
   right native folders automatically.
5. **Android only — Phone Auth needs a SHA-1 fingerprint:**
   ```bash
   cd android && ./gradlew signingReport
   ```
   Copy the `SHA1` value from the `debug` variant, then in the Firebase
   console: Project Settings → your Android app → Add fingerprint.

---

## 4. Set up Paystack

1. Create an account at https://paystack.com and grab your **Test Public
   Key** from Settings → API Keys & Webhooks.
2. Open `lib/main.dart` and replace:
   ```dart
   const String paystackPublicKey = "pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY";
   ```
   with your real test public key.
3. Never put your **secret key** in the app. When you're ready to verify
   payments server-side (recommended before real launch), verify the
   transaction reference from a backend (e.g. a Firebase Cloud Function)
   using the secret key there, not on-device.

---

## 5. Run it

```bash
flutter run
```

Pick Android or iOS depending on what's connected. On first launch you'll
land on Role Selection → enter name + phone → verify the SMS code → you're
in.

---

## 6. Before you let real users in: Firestore security rules

Test-mode Firestore/Storage rules allow anyone to read/write everything —
fine for development, unsafe for production. At minimum, before launch,
lock rules down so:

- A user can only write to their own `users/{uid}` document.
- Only a produce doc's `farmerId` can edit or delete that produce.
- Only an order's `buyerId` or `farmerId` can read/update that order.
- Only a booking's `requesterId` or `driverId` can read/update that
  booking, and only Cloud Functions (not client writes) should ever flip
  an order to `status: paid` in a real launch — right now the app trusts
  the client after a successful Paystack response, which is fine for a
  prototype but is spoofable in production. Verify payment server-side.

---

## 7. Project structure

```
lib/
  models/          # AppUser, Produce, OrderModel, BookingModel
  services/        # Firebase Auth, Firestore, Storage, Location, Paystack wrappers
  providers/        # Provider ChangeNotifiers — the app's state layer
  screens/
    auth/          # Role selection, phone entry, OTP verification
    farmer/        # Farmer dashboard, post produce, find buyers
    buyer/         # Browse produce, product detail, payment, my orders
    driver/        # Driver dashboard, my trips, live trip map
    logistics/     # Book truck (map), find trucks (pricing), live tracking, my bookings
    profile/       # Profile edit, wallet
  utils/           # Theme, constants, enums
  widgets/         # Shared UI: BigButton, ProduceCard, StatusPill, RoleCard
  main.dart
  firebase_options.dart   # ⚠️ placeholder — regenerate with flutterfire configure
```

## 8. Firestore data model

```
users/{uid}                → name, phone, role, lat, lng, locationName, isOnline, walletBalance
produce/{id}                → farmerId, farmerName, farmerPhone, crop, quantity, pricePerKg, photoUrl, lat, lng, locationName, status
orders/{id}                 → buyerId, buyerName, farmerId, farmerName, produceId, crop, quantity, totalPrice, status, paymentRef
bookings/{id}                → requesterId, requesterName, driverId, driverName, truckSize, pickupLat/Lng/Address, dropoffLat/Lng/Address, distanceKm, price, status
driver_locations/{driverId} → lat, lng, timestamp   (written every ~10s while a driver is online)
```

## 9. Maps

Uses `flutter_map` with free OpenStreetMap tiles — no Google Maps API key,
no billing. Please respect OSM's tile usage policy
(https://operations.osmfoundation.org/policies/tiles/) if this goes into
real production traffic — high-volume apps are expected to either self-host
tiles or switch to a paid tile provider (MapTiler, Stadia Maps, etc.) rather
than hammer OSM's free public tile servers.

## 10. What's intentionally simplified for v1

- "Find Buyers" surfaces pending orders as interest signals rather than a
  true page-view tracker — real view analytics is a separate feature.
- Payment verification trusts the client after Paystack responds
  successfully. Fine for a demo; needs server-side verification (Cloud
  Function + Paystack secret key) before handling real money.
- No push notification wiring shown yet beyond the `firebase_messaging`
  dependency — add topic/token registration once you're ready to notify
  drivers of new bookings and farmers of new orders.
