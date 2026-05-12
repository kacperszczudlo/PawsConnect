# PawsConnect

![Frontend](https://img.shields.io/badge/Frontend-React%20Native%20%2B%20Expo-61DAFB?style=flat-square&logo=react&logoColor=black)
![Backend](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![State](https://img.shields.io/badge/State-Zustand-443E38?style=flat-square)
![Auth](https://img.shields.io/badge/Auth-Supabase%20%2B%20JWT-3ECF8E?style=flat-square&logo=supabase)
![Language](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## About

**PawsConnect** to mobilna platforma **adopcyjno-wolontariacka** (React Native / Expo), która łączy **schroniska** z **opiekunami i wolontariuszami**: przeglądanie zwierząt, ulubione, rezerwacje spacerów, wnioski adopcyjne oraz panel schroniska do ogłoszeń i obsługi wniosków.

---

## Widoki aplikacji (mockupy UI)

Poniżej zestawienie ekranów zgodne z plikami w katalogu [`docs/widoki/`](docs/widoki/). Zdjęcia służą jako **odniesienie wizualne** przy implementacji — przy kolejnych iteracjach można podmieniać pliki w `docs/widoki/` bez zmiany numeracji w README.

> **Uwaga:** Punkty **1–11** i **14** dotyczą głównie **użytkownika** (adoptujący / wolontariusz). Punkty **12–13** to **widok schroniska** (zarządzanie podopiecznymi i nowe ogłoszenie).

### 1 — Logowanie

Ekran startowy: logo, hasło przewodnie, formularz e-mail + hasło, przejście do rejestracji.

![Widok logowania](docs/widoki/1.jpg)

### 2 — Rejestracja konta

Wybór roli (np. „Szukam przyjaciela” / „Jestem schroniskiem”), pola danych kontaktowych i adresowych zgodnie z typem konta.

![Widok rejestracji](docs/widoki/2.jpg)

### 3 — Geolokacja i wybór miasta (API miejscowości)

Modal wyboru lokalizacji: wyszukiwarka miejscowości, przycisk **GPS**, opcja **„Cała Polska”** (bez filtrowania po konkretnym mieście). Integracja z geolokalizacją i źródłem danych o miastach.

![Geolokacja i wybór miasta](docs/widoki/3.jpg)

### 4 — Widok główny (lista zwierząt)

Filtr listy (np. zasięg / miasto), odniesienie do **dystansu od profilu**, wyszukiwarka, filtry zaawansowane, zakładki gatunków oraz karty zwierząt z odległością od punktu użytkownika.

![Widok główny — lista zwierząt](docs/widoki/4.jpg)

### 5 — Szczegóły zwierzaka

Po kliknięciu w kartę: zdjęcie, dane, lokalizacja schroniska, blok kontaktu, atrybuty (wiek, waga, kolor), akcje typu **spacer** / **adopcja**.

![Szczegóły zwierzaka](docs/widoki/5.jpg)

### 6 — Wniosek / rezerwacja spaceru

Formularz z datą i godziną, podsumowanie zwierzęcia, informacja dla użytkownika (np. czas trwania spaceru), przycisk wysłania rezerwacji.

![Rezerwacja spaceru](docs/widoki/6.jpg)

### 7 — Wniosek adopcyjny

Pole tekstowe z uzasadnieniem, dane schroniska, informacje o czasie odpowiedzi, wysłanie wniosku.

![Wniosek adopcyjny](docs/widoki/7.jpg)

### 8 — Ulubione

Lista zapisanych zwierząt z tymi samymi skrótami informacji co na liście głównej.

![Ulubione](docs/widoki/8.jpg)

### 9 — Wizyty (statusy)

Zakładki **nadchodzące** / **historia**, karty wizyt ze statusem (np. oczekujące, zaakceptowane), szczegóły miejsca i kontaktu po akceptacji.

![Statusy wizyt użytkownika](docs/widoki/9.jpg)

### 10 — Profil użytkownika

Nagłówek z avatarem i rolą, dane kontaktowe i lokalizacja, wylogowanie, nawigacja dolna.

![Profil użytkownika](docs/widoki/10.jpg)

### 11 — Ustawienia konta / profilu

Edycja danych podstawowych, miasto, telefon, e-mail tylko do odczytu, zmiana hasła, zapis zmian.

![Ustawienia konta](docs/widoki/11.jpg)

### 12 — Schronisko: lista podopiecznych

Widok **„Podopieczni”**: lista ogłoszeń schroniska, akcje edycji / usunięcia, wejście w formularz nowego zwierzaka.

![Schronisko — lista podopiecznych](docs/widoki/12.jpg)

### 13 — Schronisko: nowe ogłoszenie (zwierzę)

Formularz dodania pupila: zdjęcie, imię, gatunek, płeć, wiek, dane schroniska z profilu, dalsze pola (waga, umaszczenie itd.).

![Schronisko — nowe ogłoszenie](docs/widoki/13.jpg)

### 14 — Schronisko: wnioski (akceptacja / odrzucenie)

Lista wniosków (spacer, adopcja), dane zgłaszającego, status, akcje **akceptuj** / **odrzuć** (oraz ewentualnie zmiana terminu).

![Schronisko — widok wniosków](docs/widoki/14.jpg)

---

## Funkcje (skrót)

### Użytkownik

- Przeglądanie zwierząt z filtrowaniem (miasto / typ / dystans)
- Ulubione zsynchronizowane z bazą
- Wniosek adopcyjny i rezerwacja spaceru
- Lista wizyt (nadchodzące / historia) ze statusami
- Profil i ustawienia konta (w tym miasto, avatar)

### Schronisko (admin)

- Panel wniosków (adopcja + spacery), akceptacja / odrzucenie
- Zarządzanie podopiecznymi i dodawanie ogłoszeń
- Ustawienia profilu schroniska

---

## Stack technologiczny

- React Native + Expo
- TypeScript
- Zustand
- Supabase (PostgreSQL, Auth, RLS)

---

## Struktura projektu

```
PawsConnect/
├── docs/
│   └── widoki/              # mockupy UI (1.jpg … 14.jpg)
├── src/
│   ├── screens/             # ekrany aplikacji
│   ├── components/          # komponenty UI
│   ├── store/               # store Zustand
│   ├── services/            # klient Supabase, geokodowanie miast itd.
│   ├── utils/               # pomocnicze (np. dystanse)
│   └── navigation/          # nawigacja
├── app.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## Uruchomienie lokalne

### Wymagania

- Node.js 16+
- Expo CLI
- Projekt Supabase

### Kroki

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Utwórz plik `.env` w katalogu głównym:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Uruchom aplikację:

   ```bash
   npm start
   ```

---

## Baza danych (Supabase)

Tabele m.in.:

- `animals`
- `applications`
- `favorites`

Włączone jest RLS. Użytkownicy widzą własne ulubione i wnioski; administratorzy schroniska obsługują wnioski zgodnie z regułami dostępu.

---

## Licencja

MIT
