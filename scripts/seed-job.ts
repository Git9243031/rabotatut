import * as dotenv from "dotenv";
import * as https from "https";

dotenv.config({ path: ".env.local" });

const PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

interface Job {
  title: string;
  company: string;
  description: string;
  responsibilities: string;
  requirements: string;
  location: string;
  experience_level: string;
  job_type: string;
  format: string;
  sphere: string;
  sub_sphere: string;
  skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency?: string;
  contact_tg: string;
  contact_email?: string;
  contact_phone?: string;
  created_by: string;
  source_url?: string;
}

const jobs: Job[] = [
  // ============ FRONTEND JOBS ============
  // Из FRONTEND_JOBS_BAZA.docx
  {
    title: "Frontend Developer (React)",
    company: "4finance",
    description:
      "Frontend developer для компании 4finance Казахстан с удаленным форматом работы. Разработка новых пользовательских интерфейсов с использованием React.js, взаимодействие с другими командами (UX, back-end, data science, PO), создание переиспользуемых компонентов и библиотек.",
    responsibilities:
      "— Разработка новых пользовательских интерфейсов с использованием React.js\n— Взаимодействие с другими командами (UX, back-end, data science, PO и др.)\n— Создание переиспользуемых компонентов и библиотек для дальнейшего использования\n— Перевод дизайнов и макетов в высококачественный код\n— Оптимизация компонентов для обеспечения максимальной производительности на различных устройствах и браузерах\n— Участие во всех этапах разработки в рамках agile-проектов",
    requirements:
      "— Свободный английский (от B2)\n— Опыт работы Frontend разработчиком от 3х лет\n— Глубокие знания React.js и его экосистемы (Redux, server-side rendering, Node.js)\n— Опыт работы с Redux, Webpack, Yarn\n— Навыки работы с headless CMS\n— Опыт взаимодействия с REST API\n— Умение создавать переиспользуемые компоненты и библиотеки\n— Знание системы контроля версий GIT\n— Будет плюсом: опыт работы с Webflow, React Native, Jest, Cypress.io, TypeScript",
    location: "Казахстан",
    experience_level: "middle",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "frontend",
    skills: [
      "React",
      "Redux",
      "Node.js",
      "Webpack",
      "Yarn",
      "Git",
      "TypeScript",
      "Jest",
      "Cypress",
      "REST API",
    ],
    salary_min: 2700,
    salary_max: 3000,
    salary_currency: "EUR",
    contact_tg: "Alyona_ITHR",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2831",
  },
  {
    title: "Руководитель Frontend",
    company: "EdTech компания",
    description:
      "Руководитель группы frontend в IT компанию в сфере EdTech. Проектирование архитектуры фронтенда, организация разработки продуктовых фич и компонентов.",
    responsibilities:
      "— Проектирование архитектуры фронтенда\n— Организация разработки продуктовых фич и компонентов\n— Управление командами разработки на React и Vue: планирование спринтов и релизов, распределение задач, оценка сроков\n— Уточнение задач от бизнеса\n— Документирование процессов и архитектуры\n— Оптимизация производительности систем и рефакторинг кода\n— Обеспечение качества кода, контроль качества ревью, контроль покрытия кода тестами\n— Взаимодействие со смежными командами",
    requirements:
      "— Опыт коммерческой разработки на Frontend от 5 лет, уверенные навыки проектирования архитектуры frontend приложений\n— Опыт руководства командой разработки от 2 лет\n— Уверенное владение JS, TS, React.js, Vue.js\n— Знание JS-инструментов тестирования\n— Глубокое понимание RESTful API\n— Опыт написания понятной документации\n— Способность эффективно взаимодействовать с бизнесом\n— Отличные лидерские и коммуникативные навыки",
    location: "Москва",
    experience_level: "lead",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "frontend",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Vue",
      "REST API",
      "Team Leadership",
    ],
    salary_min: 300000,
    salary_max: null,
    salary_currency: "RUB",
    contact_tg: "DinaGet",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2836",
  },
  {
    title: "Middle Frontend Engineer",
    company: "Veranto.tech",
    description:
      "Middle Frontend Engineer (React / TypeScript / FSD / SPA Dockerized) в R&D-отдел (FinTech, внутренние платежи, кроссбордер).",
    responsibilities:
      "— Фронтенды для внутренних финтех-систем и платёжных конструкторов\n— Архитектура по FSD (модули, слои, контракты)\n— Сложные формы, валидации, синхронизация с REST API\n— Инфраструктура фронта (линтеры, docker, тесты)",
    requirements:
      "— 2+ года опыта на React + TS\n— Отличное знание hooks, TS-типизации, Zustand/RHF/Yup\n— Опыт с react-query / tanstack, REST API\n— Навыки настройки Vite, линтеров, Vitest/RTL\n— Будет плюсом: Next.js, k8s, Storybook, e2e-тесты, GitLab CI, WebSocket/Streaming API",
    location: "Москва (Сколково)",
    experience_level: "middle",
    job_type: "full-time",
    format: "hybrid",
    sphere: "development",
    sub_sphere: "frontend",
    skills: [
      "React",
      "TypeScript",
      "FSD",
      "Vite",
      "Vitest",
      "Zustand",
      "React Hook Form",
      "Yup",
      "SASS",
      "Next.js",
      "Docker",
      "Nginx",
      "Storybook",
    ],
    salary_min: 268000,
    salary_max: null,
    salary_currency: "RUB",
    contact_tg: "yanaapon",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2837",
  },
  {
    title: "Front-End разработчик",
    company: "Частный проект",
    description:
      "На частный проект — сайт знакомств с чатом — требуется Front-End разработчик для постоянного сотрудничества. Проект уже готов, требуется поддержка, доработка интерфейса и развитие новых функций.",
    responsibilities:
      "— Поддержка и развитие фронтенда\n— Внесение косметических правок (UI/UX)",
    requirements: "— Опыт работы с Next.js, NestJS, JavaScript, React",
    location: "Удаленно",
    experience_level: "middle",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "frontend",
    skills: ["Next.js", "NestJS", "JavaScript", "React"],
    salary_min: 100,
    salary_max: null,
    salary_currency: "USD",
    contact_tg: "blagobiy1",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2838",
  },
  {
    title: "Фронтендер-стажер",
    company: "Студия Артемия Лебедева",
    description:
      "Команде собственных цифровых продуктов студии нужны фронтендеры-стажеры. Стажировка начнется зимой и продлится 3–6 месяцев. Кандидатам нужно быть крайне внимательными к деталям и справляться с проектами уровня «пиксель-перфект».",
    responsibilities: "— Справляться с проектами уровня «пиксель-перфект»",
    requirements:
      "— Знание HTML, CSS, JavaScript и Git\n— Хороший уровень владения Vue.js\n— Умение создать и развернуть сборку на Docker\n— Будет плюсом: опыт коммерческой разработки",
    location: "Москва",
    experience_level: "intern",
    job_type: "internship",
    format: "hybrid",
    sphere: "development",
    sub_sphere: "frontend",
    skills: ["HTML", "CSS", "JavaScript", "Git", "Vue", "Docker"],
    salary_min: 60000,
    salary_max: 100000,
    salary_currency: "RUB",
    contact_tg: "careerHR_Kate",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2839",
  },
  {
    title: "Senior Front-End Developer",
    company: "Planet 9 Group Corp",
    description:
      "International company looking for a highly experienced Front-End Developer to strengthen the team, improve the development process and contribute to the success of FinTech products.",
    responsibilities:
      "— Strengthen the development team\n— Improve the development process\n— Contribute to the success of FinTech products",
    requirements:
      "— 7+ years of experience as a front-end developer\n— Experience with React and its ecosystem for at least 6 years, solid Typescript experience\n— Next.js/Tanstack Start experience\n— Understanding the principles of developing adaptive and responsive design\n— Strong knowledge of JavaScript, WebSocket and API integration\n— Experience building interfaces for high-frequency, data-driven applications\n— Ability to balance independent work with cross-functional collaboration\n— Experience in application deployment, Gitlab/Docker\n— English – B2+, fluent reading of technical documentation",
    location: "Удаленно",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "frontend",
    skills: [
      "React",
      "TypeScript",
      "Next.js",
      "TanStack",
      "JavaScript",
      "WebSocket",
      "GitLab",
      "Docker",
    ],
    salary_min: null,
    salary_max: null,
    contact_tg: "TatiPashkova",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2841",
  },
  {
    title: "Fullstack Developer",
    company: "Luna Capital",
    description:
      "Проект связан с разработкой внутренних и внешних веб-приложений. Команда использует современный стек технологий для создания интерфейсов и бизнес-логики, обеспечивая стабильность и масштабируемость решений.",
    responsibilities:
      "— Разрабатывать веб-приложения и программное обеспечение на фронтенде и бэкенде\n— Работать с базами данных и писать SQL-запросы (T-SQL, PL/SQL)\n— Создавать интерактивные интерфейсы с использованием HTML, JavaScript и фреймворков JQuery, ExtJS, Kendo UI\n— Разрабатывать и поддерживать программы на OScript, C# или Java",
    requirements:
      "— Опыт разработки на Fullstack уровня Senior\n— Отличное знание SQL, HTML, JavaScript\n— Опыт работы с фронтенд-фреймворками: JQuery, ExtJS, Kendo UI\n— Опыт разработки на OScript, C# или Java\n— Опыт работы с T-SQL и PL/SQL",
    location: "Москва",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "fullstack",
    skills: [
      "HTML",
      "JavaScript",
      "JQuery",
      "ExtJS",
      "Kendo UI",
      "SQL",
      "T-SQL",
      "PL/SQL",
      "OScript",
      "C#",
      "Java",
    ],
    salary_min: 220000,
    salary_max: null,
    salary_currency: "RUB",
    contact_tg: "recruiter_vv",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2842",
  },
  {
    title: "Senior React / Next.js Developer",
    company: "romanov.team",
    description:
      "Продуктовая разработка от торговых бирж до игровых приложений в Telegram. Среди проектов — RFL PRO с аудиторией более 2 млн пользователей. Нужен разработчик, который не просто пишет код, а понимает бизнес-задачи и влияет на продукт.",
    responsibilities:
      "— Разрабатывать и поддерживать веб-интерфейсы на React / Next.js\n— Оптимизировать производительность и рендеринг\n— Работать с API и интеграциями\n— Участвовать в проработке бизнес-логики и влиять на развитие продукта",
    requirements:
      "— Уверенные знания React, Next.js, TypeScript\n— Опыт адаптивной и кроссбраузерной вёрстки\n— Понимание принципов оптимизации фронтенда\n— Готовность глубоко погружаться в продукт и бизнес-задачи",
    location: "Санкт-Петербург",
    experience_level: "senior",
    job_type: "full-time",
    format: "hybrid",
    sphere: "development",
    sub_sphere: "frontend",
    skills: ["React", "Next.js", "TypeScript"],
    salary_min: null,
    salary_max: null,
    contact_tg: "suli_airen",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2843",
  },
  {
    title: "Senior JavaScript Developer",
    company: "Top Selection",
    description:
      "Senior JavaScript Developer для группы компаний Top Selection. Удаленная работа с оформлением по ИП.",
    responsibilities:
      "— Доработка текущего кода\n— Разработка UI-интерфейсов\n— Написание собственных компонентов\n— Разработка компонент видеопроигрывания\n— Верстка согласно макетам в Figma",
    requirements:
      "— Общий опыт frontend-разработки от 6-и лет\n— Знание TypeScript, JavaScript, Angular 2+, RxJS\n— Знание HTML5, CSS3\n— Опыт работы с REST веб-сервисами\n— Понимание шаблонов web-проектирования и умение их правильно применять\n— Умение разрабатывать адаптивные кросс-браузерные кросс-платформенные web-интерфейсы\n— Опыт работы с BFF, NestJS",
    location: "Москва",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "frontend",
    skills: [
      "JavaScript",
      "TypeScript",
      "Angular",
      "RxJS",
      "HTML5",
      "CSS3",
      "REST",
      "BFF",
      "NestJS",
      "Figma",
    ],
    salary_min: 250000,
    salary_max: 280000,
    salary_currency: "RUB",
    contact_tg: "parfenov_mm",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2844",
  },
  {
    title: "React Junior разработчик",
    company: "Минская IT компания",
    description:
      "В поисках начинающего амбициозного разработчика для работы над интерфейсами и интеграцией API.",
    responsibilities:
      "— Разработка интерфейсов\n— Интеграции API с внешними сервисами\n— Развитие и разработка новых функциональных возможностей в проекте\n— Повышение отказоустойчивости и масштабируемости",
    requirements:
      "— Опыт работы в IT сфере - не менее 6 месяцев на стеке React\n— Знание и понимание MVC архитектуры\n— Знание фреймворка Reactjs\n— Знания TypeScript\n— Понимание основ Веб-технологий\n— Опыт работы с React + Typescript + Redux/Zustand\n— Обязательное условие находится в городе Минск",
    location: "Минск",
    experience_level: "junior",
    job_type: "full-time",
    format: "hybrid",
    sphere: "development",
    sub_sphere: "frontend",
    skills: [
      "React",
      "TypeScript",
      "Redux",
      "Zustand",
      "Next.js",
      "Tailwind",
      "Git",
    ],
    salary_min: 600,
    salary_max: 1000,
    salary_currency: "USD",
    contact_tg: "jsconstructor",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/2853",
  },

  // ============ NODE.JS JOBS ============
  // Из NODE_JS_BAZA.docx
  {
    title: "Full-stack Developer (Node.js/React)",
    company: "KVAN",
    description:
      "Платформа для медицинских организаций для создания и отправки электронных рецептов в аптеки. Разрабатывается для рынка США.",
    responsibilities:
      "— Поддержка старого кода\n— Доработка архитектуры\n— Тестирование\n— Оптимизация\n— Добавление нового функционала на Node.js/Express (JS) и React 19 (TS, MobX, Tailwind CSS)",
    requirements:
      "— 5+ лет опыта работы с Node.js/React\n— Уверенные знания Node.js, Express, Sequelize\n— Опыт с брокерами сообщений (Node Resque, RabbitMQ)\n— Опыт с Docker, SQL, REST API\n— Уверенные знания HTML, CSS, JavaScript, TypeScript, React, MobX\n— Опыт с Tailwind CSS, Git, GitLab\n— Способность читать техническую документацию на английском",
    location: "Удаленно",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "fullstack",
    skills: [
      "Node.js",
      "Express",
      "Sequelize",
      "Docker",
      "SQL",
      "REST",
      "HTML",
      "CSS",
      "JavaScript",
      "TypeScript",
      "React",
      "MobX",
      "Tailwind",
      "Git",
      "GitLab",
      "AWS",
      "XML",
      "RabbitMQ",
    ],
    salary_min: 3200,
    salary_max: 4000,
    salary_currency: "USD",
    contact_tg: "yanaapon",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из NODE_JS_BAZA)",
  },
  {
    title: "Node.js Backend Developer",
    company: "ArbiHunter",
    description:
      "HR-платформа в High-risk сфере, развиваем экосистему проектов, объединяя бизнес и специалистов для масштабирования. Переходим на микросервисы с NATS, Prisma и Zod.",
    responsibilities:
      "— Разработка REST API на NestJS (Clean Architecture, DDD, CQRS)\n— Интеграция OAuth, платежей, email/push, webhooks\n— Миграция монолита в микросервисы (event-driven)\n— Работа с асинхронными процессами и очередями\n— Модернизация стека: Prisma, Zod",
    requirements:
      "— 5+ лет коммерческой разработки, 2+ года с NestJS\n— Уверенный TypeScript (generics, decorators)\n— Опыт REST API, PostgreSQL, ORM (TypeORM/Prisma), Redis\n— Понимание Clean Architecture, DDD, CQRS, Event-Driven\n— Опыт OAuth, webhooks, retry/error handling\n— Docker, Git, Jest",
    location: "Удаленно",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "backend",
    skills: [
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "Prisma",
      "Zod",
      "Redis",
      "Docker",
      "Jest",
      "NATS",
      "RabbitMQ",
      "Kafka",
      "DDD",
      "CQRS",
    ],
    salary_min: 2500,
    salary_max: 3500,
    salary_currency: "USDT",
    contact_tg: "AnnaR_arbihunter",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из NODE_JS_BAZA)",
  },
  {
    title: "Node.js Backend Engineer",
    company: "Startlife",
    description:
      "B2C мобильное приложение в сфере mental wellbeing & micro-learning. Основные рынки — US/UK. Ранний стартап с быстрыми итерациями и маркетинг-фокусом.",
    responsibilities:
      "— Развитие backend-архитектуры на Node.js\n— Проектирование API для мобильного приложения\n— Реализация subscription-логики (event-driven, webhooks)\n— Интеграции с внешними API\n— Поддержка A/B тестов и аналитики\n— Обеспечение стабильности backend",
    requirements:
      "— 4+ лет коммерческого backend опыта\n— Уверенный production опыт с Node.js\n— Опыт API разработки для B2C mobile apps\n— Понимание subscription / in-app purchase моделей\n— Опыт event-driven архитектуры\n— Способность принимать архитектурные решения",
    location: "ОАЭ",
    experience_level: "senior",
    job_type: "part-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "backend",
    skills: [
      "Node.js",
      "API Design",
      "Event-Driven Architecture",
      "Subscriptions",
      "Webhooks",
    ],
    salary_min: 30,
    salary_max: 50,
    salary_currency: "USD",
    contact_tg: "m1_robot",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из NODE_JS_BAZA)",
  },
  {
    title: "Senior Node.js Developer",
    company: "GGR Global",
    description:
      "Архитектура и разработка highload платформы в сфере GamblingTech.",
    responsibilities:
      "— Архитектура и разработка highload платформы\n— Настройка и оптимизация баз данных\n— Поддержка CI/CD процессов\n— Анализ и оптимизация производительности\n— Обеспечение безопасности платформы\n— Использование современных подходов и AI-инструментов",
    requirements:
      "— Опыт Node.js от 5 лет\n— Знание Fastify, NestJS\n— Опыт с PostgreSQL, MySQL\n— Работа с RabbitMQ, Kafka, Nats\n— Опыт Docker, Kubernetes\n— Знание Redis, Memcached",
    location: "Удаленно",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "backend",
    skills: [
      "Node.js",
      "Fastify",
      "NestJS",
      "PostgreSQL",
      "MySQL",
      "RabbitMQ",
      "Kafka",
      "NATS",
      "Docker",
      "Kubernetes",
      "Redis",
      "Memcached",
    ],
    salary_min: 3000,
    salary_max: 6000,
    salary_currency: "USD",
    contact_tg: "Alisa_GGR_HR",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из NODE_JS_BAZA)",
  },
  {
    title: "Backend Developer (Node.js/TypeScript)",
    company: "Eshe App",
    description:
      "Разработка и развитие backend-сервисов для мобильного приложения. Требуется высокая автономность и готовность решать сложные нестандартные задачи.",
    responsibilities:
      "— Разработка и развитие backend-сервисов на Node.js / TypeScript (NestJS)\n— Проектирование и реализация API и межсервисных взаимодействий\n— Работа с асинхронными сценариями (RabbitMQ)\n— Использование Redis для кэширования и pub/sub\n— Работа с базами данных MySQL, MongoDB, DynamoDB\n— Работа с облачной инфраструктурой AWS\n— Деплой и эксплуатация сервисов в Kubernetes",
    requirements:
      "— Опыт Backend-разработки от 6 лет, highload сервисов от 2 лет\n— Опыт работы с Node.js от 5 лет в продуктовых компаниях\n— Опыт работы с TypeScript и NestJS от 4 лет\n— Опыт работы с MySQL, Redis, MongoDB, DynamoDB\n— Опыт работы с Kubernetes и AWS (EKS, RDS, DynamoDB, S3)\n— Опыт с распределёнными системами\n— Опыт использования LLM для работы обязательно",
    location: "Москва",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "backend",
    skills: [
      "Node.js",
      "TypeScript",
      "NestJS",
      "RabbitMQ",
      "Redis",
      "MySQL",
      "MongoDB",
      "DynamoDB",
      "Elasticsearch",
      "Kubernetes",
      "Docker",
      "AWS",
    ],
    salary_min: 200000,
    salary_max: 250000,
    salary_currency: "RUB",
    contact_tg: "trixy1606",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из NODE_JS_BAZA)",
  },
  {
    title: "Senior Fullstack Developer (Node.js/React/AI)",
    company: "Unimatch Lab",
    description:
      "Разработка AI-продуктов с нуля и масштабирование продакшн-систем в венчурной студии из Silicon Valley.",
    responsibilities:
      "— Разрабатывать backend и frontend продуктов с нуля до продакшена\n— Проектировать архитектуру (масштабируемость, отказоустойчивость, безопасность)\n— Интегрировать AI/LLM в реальные продукты\n— Настраивать CI/CD, Docker, мониторинг\n— Влиять на технические и продуктовые решения",
    requirements:
      "— Backend: TypeScript, Node.js (5+ лет), NestJS, микросервисы, event-driven (WebSocket, BullMQ / Redis / Kafka)\n— Frontend: React 18+/19, hooks, concurrent features\n— State/Data: TanStack Query / RTK / MobX / Zustand\n— DB: PostgreSQL, Supabase / PlanetScale\n— Infra: Docker, CI/CD, мониторинг (Prometheus, Grafana, Sentry)\n— API: REST / GraphQL, OAuth2, JWT, платежи\n— AI (must have): LLM orchestration (RAG), prompt engineering",
    location: "США",
    experience_level: "senior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "fullstack",
    skills: [
      "TypeScript",
      "Node.js",
      "NestJS",
      "React",
      "PostgreSQL",
      "Supabase",
      "PlanetScale",
      "Docker",
      "Prometheus",
      "Grafana",
      "Sentry",
      "GraphQL",
      "Kubernetes",
      "BullMQ",
      "Redis",
      "Kafka",
      "LLM",
      "RAG",
    ],
    salary_min: 4500,
    salary_max: null,
    salary_currency: "USD",
    contact_tg: "dobysh_v",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из NODE_JS_BAZA)",
  },

  // ============ UX/UI JOBS ============
  // Из UX_XU_BAZa.docx
  {
    title: "UX/UI-дизайнер",
    company: "SellerGroup",
    description:
      "Международная экосистема для селлеров и предпринимателей ищет UX/UI-дизайнера, который готов влиять на продукт, метрики и пользовательский опыт.",
    responsibilities:
      "— Проектирование и оптимизация пользовательских сценариев для логичного и интуитивного взаимодействия с продуктом\n— Разработка продукта и UI-кита с нуля, дальнейшее масштабирование дизайн-системы\n— Повышение конверсии и вовлечённости пользователей: формирование и тестирование гипотез, работа с аналитикой, внедрение эффективных UX/UI-решений\n— Выявление проблемных зон в пользовательском опыте и предложение дизайн-решений\n— Совместная работа с командой над развитием продукта",
    requirements:
      "— Проектирование дизайна сайтов и приложений с учётом адаптивности и требований платформ\n— Уверенное владение Figma (компоненты, стили, Auto Layout)\n— Знание material3 и human interface\n— Навыки пользовательских исследований, выявления болевых точек и предложения эффективных решений\n— Понимание принципов юзабилити\n— Умение работать с типографикой, сетками и композицией\n— Умение переводить бизнес-цели в UX/UI-решения",
    location: "Санкт-Петербург",
    experience_level: "junior",
    job_type: "full-time",
    format: "office",
    sphere: "design",
    sub_sphere: "ux_ui",
    skills: [
      "Figma",
      "Material Design",
      "Human Interface",
      "UX Research",
      "UI Design",
      "User Scenarios",
    ],
    salary_min: null,
    salary_max: null,
    contact_tg: "HRSellerGroup",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из UX_XU_BAZa)",
  },
  {
    title: "Графический Дизайнер",
    company: "Eshe App",
    description:
      "Графический дизайнер для работы в тематике женского здоровья, благополучия женщин, косметики.",
    responsibilities:
      "— Подготовка маркетинговых презентаций и образовательных материалов\n— Подготовка материалов для соцсетей Instagram и LinkedIn\n— Подготовка дизайна печатных материалов для мероприятий\n— Создание визуальных материалов на основе готового контента по бренд-буку\n— Оформление обучающих чекапов, мини-курсов, подготовка контента в формате сториз внутри приложения\n— Подготовка макетов для веба и печати\n— Ведение задач и отчётности в LARK",
    requirements:
      "— Опыт работы графическим дизайнером от 5 лет (НЕ фриланс)\n— Опыт работы с AI-инструментами (Midjourney)\n— Опыт работы с task-менеджерами\n— Способность выполнять задачи в рамках установленных сроков\n— Владение разговорным английским языком на уровне B2 или выше",
    location: "Удаленно",
    experience_level: "senior",
    job_type: "part-time",
    format: "remote",
    sphere: "design",
    sub_sphere: "graphic",
    skills: [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Midjourney",
      "Task Management",
      "Print Design",
      "Social Media Design",
    ],
    salary_min: 800,
    salary_max: null,
    salary_currency: "RUB",
    contact_tg: "trixy1606",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из UX_XU_BAZa)",
  },
  {
    title: "Web & Graphic Designer",
    company: "Quadcode",
    description:
      "Международная финтех-компания разрабатывает экосистему брокерских продуктов. Ищем опытного веб/графического дизайнера.",
    responsibilities:
      "— Развитие и улучшение основного сайта бренда\n— Создание лендингов\n— Создание и поддержка дизайн-систем для веба\n— Дизайн баннеров и других цифровых маркетинговых материалов\n— Помощь в подготовке презентаций\n— Создание интерактивных прототипов\n— Адаптация макетов сайта под различные разрешения экранов",
    requirements:
      "— Уверенное владение Figma, Adobe Photoshop и Adobe Illustrator\n— Базовые знания HTML/CSS\n— Опыт работы веб-дизайнером от 3 лет\n— Глубокое понимание принципов UX/UI\n— Знание типографики, теории цвета и композиции",
    location: "Санкт-Петербург",
    experience_level: "senior",
    job_type: "full-time",
    format: "hybrid",
    sphere: "design",
    sub_sphere: "web",
    skills: [
      "Figma",
      "Adobe Photoshop",
      "Adobe Illustrator",
      "HTML",
      "CSS",
      "Webflow",
      "Framer",
      "Readymag",
      "Typography",
      "Composition",
    ],
    salary_min: 150000,
    salary_max: 300000,
    salary_currency: "RUB",
    contact_tg: "vova_itrecruit",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из UX_XU_BAZa)",
  },
  {
    title: "UI/UX дизайнер",
    company: "Quantum Dev",
    description:
      "Компания по разработке мобильных и веб приложений для e-commerce и технологических стартапов. Также внутри компании разрабатываем свой IT-стартап.",
    responsibilities:
      "— Проектировать интерфейсы мобильных приложений и веб-сайтов\n— Создавать UI-kit, компоненты и интерактивные прототипы в Figma\n— Работать в связке с отделом разработки над реализацией дизайна\n— Адаптировать дизайн под требования iOS, Android и веб-платформ с учётом гайдлайнов\n— Использовать AI-инструменты для оптимизации рабочих процессов",
    requirements:
      "— Работал UX/UI дизайнером от 1,5 лет с мобильными приложениями и веб-сайтами\n— Знаешь гайдлайны iOS, Android и Material Design\n— Уверенно владеешь Figma: auto layout, свойства, UI-kit, переменные, интерактивные прототипы\n— Имеешь опыт работы с AI-инструментами в дизайне\n— Можешь объяснить логику своих дизайн-решений",
    location: "Москва",
    experience_level: "junior",
    job_type: "full-time",
    format: "remote",
    sphere: "design",
    sub_sphere: "ux_ui",
    skills: [
      "Figma",
      "UI/UX",
      "Mobile Design",
      "Web Design",
      "iOS Guidelines",
      "Android Guidelines",
      "Material Design",
      "AI Tools",
      "Prototyping",
    ],
    salary_min: 60000,
    salary_max: 80000,
    salary_currency: "RUB",
    contact_tg: "hrquantum",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из UX_XU_BAZa)",
  },
  {
    title: "Продуктовый дизайнер",
    company: "BotConversa",
    description:
      "Международная платформа для автоматизации общения в WhatsApp. Помогаем компаниям создавать умные чат-боты.",
    responsibilities:
      "— Анализировать лучшие практики рынка, изучать пользовательский путь и формулировать гипотезы\n— Создавать прототипы, тестировать решения и улучшать их на основе обратной связи\n— Тесно взаимодействовать с разработчиками и менеджерами\n— Прорабатывать UX/UI для веб-продуктов компании\n— Участвовать в дизайн-ревью\n— Создавать новые компоненты дизайн-системы",
    requirements:
      "— Опыт работы продуктовым/UX/UI-дизайнером от 2 лет\n— Отличное понимание принципов дизайна и UX-паттернов\n— Практический опыт создания веб-интерфейсов\n— Умение вести задачу от исследования до финального результата\n— Уверенная работа в Figma (компоненты, auto-layout, прототипирование)\n— Портфолио с примерами реальных проектов",
    location: "Удаленно",
    experience_level: "middle",
    job_type: "full-time",
    format: "remote",
    sphere: "design",
    sub_sphere: "product",
    skills: [
      "Figma",
      "UX/UI",
      "Product Design",
      "Prototyping",
      "Design Systems",
      "User Research",
      "SaaS Design",
    ],
    salary_min: 2000,
    salary_max: 2500,
    salary_currency: "USD",
    contact_tg: "OrlisEvgeniya",
    created_by: "BOT",
    source_url: "https://t.me/it_match_frontend/??? (из UX_XU_BAZa)",
  },
];

async function addJob(job: Job): Promise<void> {
  return new Promise((resolve, reject) => {
    // Формируем описание из responsibilities если оно пустое
    const responsibilities = job.responsibilities || job.description;
    const requirements =
      job.requirements || "Требования уточняются на собеседовании";

    const jobData = {
      fields: {
        title: { stringValue: job.title },
        company: { stringValue: job.company },
        description: { stringValue: job.description },
        responsibilities: { stringValue: responsibilities },
        requirements: { stringValue: requirements },
        location: { stringValue: job.location },
        experience_level: { stringValue: job.experience_level },
        job_type: { stringValue: job.job_type },
        format: { stringValue: job.format },
        sphere: { stringValue: job.sphere },
        sub_sphere: { stringValue: job.sub_sphere },
        skills: {
          arrayValue: {
            values: job.skills.map((skill) => ({ stringValue: skill })),
          },
        },
        salary_min: job.salary_min
          ? { integerValue: job.salary_min }
          : { nullValue: null },
        salary_max: job.salary_max
          ? { integerValue: job.salary_max }
          : { nullValue: null },
        salary_currency: job.salary_currency
          ? { stringValue: job.salary_currency }
          : { nullValue: null },
        contact_tg: { stringValue: job.contact_tg },
        contact_email: job.contact_email
          ? { stringValue: job.contact_email }
          : { nullValue: null },
        contact_phone: job.contact_phone
          ? { stringValue: job.contact_phone }
          : { nullValue: null },
        visible: { booleanValue: true },
        views: { integerValue: 0 },
        created_by: { stringValue: job.created_by },
        created_at: { timestampValue: new Date().toISOString() },
        source_url: job.source_url
          ? { stringValue: job.source_url }
          : { nullValue: null },
      },
    };

    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/jobs?key=${API_KEY}`;
    const body = JSON.stringify(jobData);

    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.name) {
              const id = parsed.name.split("/").pop();
              console.log(
                `✅ Вакансия добавлена: ${job.title} (${job.company}), id: ${id}`,
              );
              resolve();
            } else {
              console.error(
                `❌ Ошибка при добавлении ${job.title}:`,
                JSON.stringify(parsed, null, 2),
              );
              reject(new Error(`Failed to add job: ${job.title}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function addAllJobs() {
  console.log(
    `🚀 Начинаем добавление ${jobs.length} вакансий из документов...\n`,
  );

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(
      `[${i + 1}/${jobs.length}] Добавляем: ${job.title} (${job.company})`,
    );

    try {
      await addJob(job);
      successCount++;
    } catch (error) {
      console.error(`❌ Ошибка при добавлении вакансии ${job.title}:`, error);
      errorCount++;
    }

    // Небольшая задержка между запросами чтобы не перегружать API
    if (i < jobs.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log(`\n📊 Итоги:`);
  console.log(`✅ Успешно добавлено: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
  console.log(`📝 Всего вакансий: ${jobs.length}`);

  // Группировка по сферам
  const bySphere = jobs.reduce(
    (acc, job) => {
      acc[job.sphere] = (acc[job.sphere] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log(`\n📊 По сферам:`);
  Object.entries(bySphere).forEach(([sphere, count]) => {
    console.log(`   ${sphere}: ${count} вакансий`);
  });
}

// Проверка наличия необходимых переменных окружения
if (!PROJECT_ID || !API_KEY) {
  console.error(
    "❌ Ошибка: Необходимо указать PROJECT_ID и API_KEY в .env.local файле",
  );
  process.exit(1);
}

// Запуск
addAllJobs().catch((error) => {
  console.error("❌ Критическая ошибка:", error);
  process.exit(1);
});
