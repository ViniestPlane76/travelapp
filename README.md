# 🌍 Aplikacja do wspólnego planowania podróży

**Aplikacja do wspólnego planowania podróży** to progresywna aplikacja webowa (PWA) umożliwiająca grupowe planowanie podróży: wspólne czaty, zarządzanie budżetem, tworzenie planów i lokalizacji, a nawet działanie offline.

---

## 🚀 Funkcjonalności

### 👥 Użytkownicy i grupy
- Rejestracja i logowanie przez Firebase Authentication
- Tworzenie i dołączanie do grup podróżników
- Zapraszanie innych użytkowników przez e-mail

### 💬 Czat grupowy
- Czat w czasie rzeczywistym (Firebase Firestore)
- Edytowanie, usuwanie, odpowiadanie na wiadomości
- Widoczność historii czatu tylko dla członków grupy

### 🗺️ Planowanie podróży
- Dodawanie planów z nazwą i opisem
- Powiązane notatki oraz interaktywna mapa (Geoapify + Leaflet)
- Wyszukiwanie lokalizacji przez autouzupełnianie

### 💸 Budżet i koszty
- Dodawanie wydatków dla planu
- Wybór osoby płacącej
- Równy lub niestandardowy podział kosztów między członków grupy
- Automatyczne obliczanie udziałów w złotówkach i procentach

### 🌐 PWA
- Instalowalna aplikacja mobilna
- Dedykowany ekran offline (`offline.html`)
- Przycisk "Zainstaluj" i podziękowanie po instalacji

---

## 🛠️ Technologie

| Frontend             | Backend / BaaS         | Inne                      |
|----------------------|------------------------|---------------------------|
| React + Vite         | Firebase (Auth + DB)   | Tailwind CSS              |
| React Router DOM     | Firestore              | Leaflet + Geoapify        |
| IndexedDB / Cache    |                         | Stripe (do integracji)    |
| Progressive Web App  |                         | Vite Plugin PWA           |

---
## 📦 Instalacja lokalna

### ✅ Wymagania:
- Node.js v18+
- Firebase projekt z:
  - Authentication (email/password)
  - Firestore Database

---

## 📱 Obsługa PWA

- Instalacja możliwa na Android/iOS/desktop (przez `InstallButton`)
- Ikony w `public/icons/`
- `offline.html` jako fallback
- PWA konfiguracja przez `vite.config.js` + `vite-plugin-pwa`


---


## 🙌 Autorzy

Projekt edukacyjny wykonany przez Karol Muziński.
