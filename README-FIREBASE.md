# ВакансияРФ — Firebase Setup Guide

## 1. Создать Firebase проект

1. Открыть https://console.firebase.google.com
2. Нажать "Add project" → назвать проект
3. Отключить Google Analytics (не нужно) → "Create project"

---

## 2. Включить Authentication

1. Firebase Console → Build → **Authentication**
2. "Get started"
3. Sign-in method → **Email/Password** → Enable → Save
4. (опционально) Templates → язык писем → Russian

---

## 3. Включить Firestore

1. Firebase Console → Build → **Firestore Database**
2. "Create database"
3. Выбрать регион: **europe-west3** (Frankfurt) — ближайший к РФ
4. Start in **production mode** (rules задеплоим позже)

---

## 4. Получить конфиги

### 4а. Клиентский конфиг (NEXT_PUBLIC_*)
1. Project Settings → General → Your apps
2. Нажать "</>" (Web app) → Register app
3. Скопировать firebaseConfig → вставить в .env.local

### 4б. Admin SDK (серверный)
1. Project Settings → **Service accounts**
2. "Generate new private key" → скачать JSON
3. Из JSON заполнить в .env.local:
   - FIREBASE_ADMIN_PROJECT_ID    = project_id
   - FIREBASE_ADMIN_CLIENT_EMAIL  = client_email
   - FIREBASE_ADMIN_PRIVATE_KEY   = private_key (со всеми \n)

---

## 5. Установить Firebase CLI и задеплоить rules

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase use your_project_id

# Деплой rules и indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
\`\`\`

---

## 6. Создать начальные данные

\`\`\`bash
# Установить ts-node если нет
npm install -D ts-node dotenv

# Создать документ settings/main в Firestore
npx ts-node scripts/seed-firestore.ts
\`\`\`

---

## 7. Создать первого admin-пользователя

После регистрации через сайт — вручную в Firestore Console:

1. Firestore → users → найти свой документ по uid
2. Поле role: изменить с "candidate" на "admin"
3. Сохранить

---

## 8. Настройка шаблона сброса пароля

1. Authentication → Templates → Password reset
2. Customize action URL:
   \`https://your-domain.com/auth/reset-password\`
3. Это важно! Без этого ссылка в письме поведёт
   на дефолтную Firebase страницу, а не на нашу.

---

## 9. Структура коллекций Firestore

\`\`\`
/users/{uid}
  email:      string
  name:       string (опционально)
  role:       'admin' | 'hr' | 'candidate'
  avatar_url: string (опционально)
  created_at: Timestamp

/jobs/{jobId}
  title:            string
  company:          string
  description:      string
  sphere:           string
  experience_level: string
  job_type:         string
  format:           string
  location:         string
  salary_min:       number
  salary_max:       number
  skills:           string[]
  visible:          boolean
  views:            number
  created_by:       string (uid)
  created_at:       Timestamp

/resumes/{resumeId}
  user_id:          string (uid)
  name:             string
  title:            string
  bio:              string
  sphere:           string
  experience_level: string
  experience_years: number
  format:           string
  location:         string
  expected_salary:  number
  portfolio:        string
  skills:           string[]
  visible:          boolean
  created_at:       Timestamp

/settings/main
  telegram_autopost_enabled: boolean
  header_enabled:            boolean
  auto_approve_jobs:         boolean
  auto_approve_telegram:     boolean
\`\`\`

---

## 10. Переменные окружения (.env.local)

\`\`\`env
# Клиентские (публичные)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Серверные (приватные — НИКОГДА не NEXT_PUBLIC_)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

---

## 11. Запуск проекта

\`\`\`bash
cd job-marketplace
npm run dev
# → http://localhost:3000
\`\`\`

---

## Суpabase → Firebase: шпаргалка замен

| Supabase                              | Firebase                                  |
|---------------------------------------|-------------------------------------------|
| supabase.auth.signInWithPassword()    | signInWithEmailAndPassword()              |
| supabase.auth.signUp()                | createUserWithEmailAndPassword()          |
| supabase.auth.signOut()               | signOut(auth)                             |
| supabase.auth.resetPasswordForEmail() | sendPasswordResetEmail()                  |
| supabase.auth.updateUser()            | confirmPasswordReset()                    |
| supabase.auth.onAuthStateChange()     | onAuthStateChanged()                      |
| supabase.from('x').select()           | getDocs(query(collection(db,'x'),...))    |
| supabase.from('x').insert()           | addDoc(collection(db,'x'), data)          |
| supabase.from('x').update()           | updateDoc(doc(db,'x',id), data)           |
| supabase.from('x').delete()           | deleteDoc(doc(db,'x',id))                 |
| supabase.rpc('increment_views')       | updateDoc(..., { views: increment(1) })   |
| .eq() .ilike() .gte() .range()        | where() + клиентская фильтрация/slice()   |
| postgres_changes realtime             | onSnapshot()                              |
| Service Role Key                      | Firebase Admin SDK + serviceAccount.json  |
| RLS политики                          | firestore.rules                           |
| Индексы в миграциях                   | firestore.indexes.json                    |
