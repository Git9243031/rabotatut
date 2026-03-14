// Чтобы запустить скрипт npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-job.ts
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
  contact_tg: string;
  created_by: string;
}

const jobs: Job[] = [
  {
    title: "UX/UI-дизайнер",
    company: "SellerGroup",
    description:
      "Дизайн интерфейсов для eCommerce платформы. Работа с Material Design и Human Interface Guidelines, проведение UX-исследований, создание адаптивных макетов с Auto Layout.",
    responsibilities:
      "— Разработка UI-компонентов в Figma\n— Проведение UX-исследований и интервью\n— Создание адаптивных макетов с Auto Layout\n— Взаимодействие с командой разработки",
    requirements:
      "— Опыт работы в продуктовой команде от 1 года\n— Уверенное владение Figma\n— Понимание Material Design и HIG\n— Портфолио с кейсами eCommerce",
    location: "Санкт-Петербург",
    experience_level: "junior",
    job_type: "full-time",
    format: "office",
    sphere: "design",
    sub_sphere: "design_product",
    skills: [
      "Figma",
      "Material Design",
      "Human Interface",
      "UX Research",
      "Auto Layout",
    ],
    salary_min: null,
    salary_max: null,
    contact_tg: "HRSellerGroup",
    created_by: "BOT",
  },
  {
    title: "Backend Developer (Node.js)",
    company: "TechCorp",
    description:
      "Разработка высоконагруженных API на Node.js. Оптимизация запросов к базе данных, интеграция с внешними сервисами.",
    responsibilities:
      "— Проектирование и разработка REST API\n— Оптимизация производительности\n— Работа с PostgreSQL и MongoDB\n— Code review и документация",
    requirements:
      "— Опыт работы с Node.js от 2 лет\n— Знание TypeScript\n— Опыт с PostgreSQL и MongoDB\n— Понимание принципов REST API",
    location: "Москва",
    experience_level: "middle",
    job_type: "full-time",
    format: "hybrid",
    sphere: "development",
    sub_sphere: "backend",
    skills: ["Node.js", "TypeScript", "PostgreSQL", "MongoDB", "REST API"],
    salary_min: 200000,
    salary_max: 300000,
    contact_tg: "HRTechCorp",
    created_by: "BOT",
  },
  {
    title: "Frontend Developer (React)",
    company: "WebStudio",
    description:
      "Разработка интерфейсов для внутренних и внешних продуктов компании. Работа с современным стеком технологий.",
    responsibilities:
      "— Разработка новых компонентов и фич\n— Оптимизация производительности\n— Участие в код-ревью\n— Работа с дизайнерами",
    requirements:
      "— Опыт работы с React от 1 года\n— Знание TypeScript\n— Опыт с Next.js\n— Понимание CSS и HTML",
    location: "Удаленно",
    experience_level: "junior",
    job_type: "full-time",
    format: "remote",
    sphere: "development",
    sub_sphere: "frontend",
    skills: ["React", "TypeScript", "Next.js", "CSS", "HTML"],
    salary_min: 150000,
    salary_max: 200000,
    contact_tg: "HRWebStudio",
    created_by: "BOT",
  },
  {
    title: "iOS Developer",
    company: "MobileApps",
    description:
      "Разработка нативных iOS приложений. Работа с новыми технологиями Apple, участие в полном цикле разработки.",
    responsibilities:
      "— Разработка новых фич\n— Рефакторинг существующего кода\n— Написание тестов\n— Code review",
    requirements:
      "— Опыт разработки под iOS от 2 лет\n— Знание Swift и UIKit/SwiftUI\n— Понимание архитектурных паттернов\n— Опыт работы с REST API",
    location: "Санкт-Петербург",
    experience_level: "middle",
    job_type: "full-time",
    format: "office",
    sphere: "development",
    sub_sphere: "mobile",
    skills: ["Swift", "UIKit", "SwiftUI", "REST API", "Git"],
    salary_min: 250000,
    salary_max: 350000,
    contact_tg: "HRMobileApps",
    created_by: "BOT",
  },
  {
    title: "Product Manager",
    company: "ProductLab",
    description:
      "Управление продуктовой разработкой. Анализ рынка, работа с требованиями, коммуникация с командой и стейкхолдерами.",
    responsibilities:
      "— Сбор и анализ требований\n— Формирование бэклога\n— Работа с командой разработки\n— Анализ метрик",
    requirements:
      "— Опыт работы Product Manager от 2 лет\n— Понимание Agile/Scrum\n— Аналитическое мышление\n— Английский от Intermediate",
    location: "Москва",
    experience_level: "middle",
    job_type: "full-time",
    format: "hybrid",
    sphere: "management",
    sub_sphere: "product_manager",
    skills: ["Agile", "Scrum", "Jira", "Аналитика", "English C1"],
    salary_min: 300000,
    salary_max: 400000,
    contact_tg: "HRProductLab",
    created_by: "BOT",
  },
  {
    title: "QA Engineer",
    company: "TestOps",
    description:
      "Ручное и автоматизированное тестирование веб-приложений. Участие в улучшении качества продуктов.",
    responsibilities:
      "— Составление тест-кейсов и чек-листов\n— Ручное тестирование\n— Написание автотестов\n— Регрессионное тестирование",
    requirements:
      "— Опыт тестирования от 1 года\n— Знание теории тестирования\n— Опыт с Postman\n— Базовые знания SQL",
    location: "Удаленно",
    experience_level: "junior",
    job_type: "full-time",
    format: "remote",
    sphere: "testing",
    sub_sphere: "qa_manual",
    skills: ["Postman", "SQL", "Test Design", "Jira", "Git"],
    salary_min: 120000,
    salary_max: 160000,
    contact_tg: "HRTestOps",
    created_by: "BOT",
  },
  {
    title: "DevOps Engineer",
    company: "CloudInfra",
    description:
      "Поддержка и развитие инфраструктуры. Настройка CI/CD, работа с облачными провайдерами, контейнеризация.",
    responsibilities:
      "— Настройка CI/CD пайплайнов\n— Управление Kubernetes кластерами\n— Мониторинг и логирование\n— Автоматизация",
    requirements:
      "— Опыт работы DevOps от 2 лет\n— Знание Docker и Kubernetes\n— Опыт с AWS/GCP\n— Написание Terraform",
    location: "Москва",
    experience_level: "senior",
    job_type: "full-time",
    format: "hybrid",
    sphere: "devops",
    sub_sphere: "devops",
    skills: ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"],
    salary_min: 350000,
    salary_max: 450000,
    contact_tg: "HRCloudInfra",
    created_by: "BOT",
  },
  {
    title: "Data Scientist",
    company: "DataLab",
    description:
      "Разработка и внедрение моделей машинного обучения. Анализ данных, подготовка датасетов, эксперименты.",
    responsibilities:
      "— Исследование данных\n— Построение ML моделей\n— A/B тестирование\n— Визуализация результатов",
    requirements:
      "— Опыт работы Data Scientist от 1 года\n— Знание Python и библиотек\n— Понимание статистики\n— Опыт с SQL",
    location: "Санкт-Петербург",
    experience_level: "middle",
    job_type: "full-time",
    format: "hybrid",
    sphere: "data",
    sub_sphere: "data_science",
    skills: ["Python", "SQL", "Pandas", "Scikit-learn", "Jupyter"],
    salary_min: 250000,
    salary_max: 350000,
    contact_tg: "HRDataLab",
    created_by: "BOT",
  },
  {
    title: "Системный аналитик",
    company: "Analytica",
    description:
      "Анализ требований, проектирование архитектуры, написание технической документации, взаимодействие с командой.",
    responsibilities:
      "— Сбор и анализ требований\n— Проектирование API\n— Написание спецификаций\n— Коммуникация с командой",
    requirements:
      "— Опыт системного анализа от 1 года\n— Понимание REST API\n— Умение рисовать диаграммы\n— Техническое мышление",
    location: "Москва",
    experience_level: "middle",
    job_type: "full-time",
    format: "hybrid",
    sphere: "management",
    sub_sphere: "analyst",
    skills: ["REST API", "SQL", "Swagger", "BPMN", "UML"],
    salary_min: 200000,
    salary_max: 280000,
    contact_tg: "HRAnalytica",
    created_by: "BOT",
  },
  {
    title: "Technical Writer",
    company: "DocuTech",
    description:
      "Написание технической документации для разработчиков и пользователей. Ведение базы знаний, подготовка инструкций.",
    responsibilities:
      "— Написание API документации\n— Создание пользовательских гайдов\n— Ведение базы знаний\n— Редактура текстов",
    requirements:
      "— Опыт технического писателя от 1 года\n— Понимание REST API\n— Грамотный русский и английский\n— Внимательность к деталям",
    location: "Удаленно",
    experience_level: "junior",
    job_type: "full-time",
    format: "remote",
    sphere: "management",
    sub_sphere: "technical_writer",
    skills: ["API Documentation", "Markdown", "English C1", "Git", "Swagger"],
    salary_min: 120000,
    salary_max: 160000,
    contact_tg: "HRDocuTech",
    created_by: "BOT",
  },
  {
    title: "Android Developer",
    company: "MobileApps",
    description:
      "Разработка нативных Android приложений. Работа с Kotlin, современными библиотеками и архитектурами.",
    responsibilities:
      "— Разработка новых фич\n— Рефакторинг\n— Написание тестов\n— Участие в код-ревью",
    requirements:
      "— Опыт разработки под Android от 1 года\n— Знание Kotlin\n— Понимание MVVM\n— Опыт с REST API",
    location: "Санкт-Петербург",
    experience_level: "middle",
    job_type: "full-time",
    format: "office",
    sphere: "development",
    sub_sphere: "mobile",
    skills: ["Kotlin", "Android SDK", "MVVM", "REST API", "Coroutines"],
    salary_min: 220000,
    salary_max: 300000,
    contact_tg: "HRMobileApps",
    created_by: "BOT",
  },
  {
    title: "UI/UX Designer",
    company: "DesignStudio",
    description:
      "Дизайн интерфейсов для мобильных и веб-приложений. Создание прототипов, работа с дизайн-системами.",
    responsibilities:
      "— Создание прототипов\n— Дизайн интерфейсов\n— Работа с дизайн-системой\n— Презентация решений",
    requirements:
      "— Опыт работы дизайнером от 1 года\n— Владение Figma\n— Понимание UX принципов\n— Портфолио",
    location: "Москва",
    experience_level: "junior",
    job_type: "full-time",
    format: "hybrid",
    sphere: "design",
    sub_sphere: "design_product",
    skills: [
      "Figma",
      "UI/UX",
      "Prototyping",
      "User Research",
      "Design Systems",
    ],
    salary_min: 150000,
    salary_max: 200000,
    contact_tg: "HRDesignStudio",
    created_by: "BOT",
  },
  {
    title: "SEO-специалист",
    company: "MarketingPro",
    description:
      "Оптимизация сайтов под поисковые системы. Анализ позиций, работа с контентом, внешняя оптимизация.",
    responsibilities:
      "— Аудит сайтов\n— Сбор семантики\n— Оптимизация контента\n— Анализ конкурентов",
    requirements:
      "— Опыт работы SEO от 1 года\n— Знание основных метрик\n— Опыт с инструментами\n— Понимание HTML/CSS",
    location: "Удаленно",
    experience_level: "junior",
    job_type: "full-time",
    format: "remote",
    sphere: "marketing",
    sub_sphere: "seo",
    skills: [
      "Google Analytics",
      "Ahrefs",
      "HTML",
      "WordPress",
      "Key Collector",
    ],
    salary_min: 80000,
    salary_max: 120000,
    contact_tg: "HRMarketingPro",
    created_by: "BOT",
  },
  {
    title: "Project Manager",
    company: "PMO",
    description:
      "Управление проектами разработки. Планирование, контроль сроков, коммуникация с заказчиком и командой.",
    responsibilities:
      "— Планирование проектов\n— Контроль сроков\n— Управление рисками\n— Отчетность",
    requirements:
      "— Опыт управления проектами от 2 лет\n— Знание Agile\n— Опыт с Jira\n— Коммуникабельность",
    location: "Москва",
    experience_level: "middle",
    job_type: "full-time",
    format: "office",
    sphere: "management",
    sub_sphere: "project_manager",
    skills: ["Jira", "Agile", "Scrum", "Risk Management", "English B2"],
    salary_min: 250000,
    salary_max: 350000,
    contact_tg: "HRPMO",
    created_by: "BOT",
  },
  {
    title: "1C Разработчик",
    company: "SoftService",
    description:
      "Разработка и доработка конфигураций 1С. Интеграция с внешними системами, оптимизация запросов.",
    responsibilities:
      "— Доработка конфигураций\n— Написание отчетов\n— Интеграции\n— Консультация пользователей",
    requirements:
      "— Опыт разработки 1С от 1 года\n— Знание платформы 8.3\n— Опыт с SQL\n— Понимание бухгалтерии",
    location: "Санкт-Петербург",
    experience_level: "junior",
    job_type: "full-time",
    format: "office",
    sphere: "development",
    sub_sphere: "1c",
    skills: ["1С 8.3", "SQL", "Бухгалтерия", "Отчеты", "Обмены данными"],
    salary_min: 130000,
    salary_max: 180000,
    contact_tg: "HRSoftService",
    created_by: "BOT",
  },
  {
    title: "SMM-менеджер",
    company: "SocialBoost",
    description:
      "Ведение социальных сетей компании. Создание контента, анализ метрик, взаимодействие с аудиторией.",
    responsibilities:
      "— Планирование контента\n— Создание постов\n— Анализ метрик\n— Коммуникация с подписчиками",
    requirements:
      "— Опыт ведения соцсетей от 1 года\n— Умение писать тексты\n— Знание таргета\n— Креативность",
    location: "Удаленно",
    experience_level: "junior",
    job_type: "full-time",
    format: "remote",
    sphere: "marketing",
    sub_sphere: "smm",
    skills: ["Instagram", "Telegram", "TikTok", "Canva", "SMM Planning"],
    salary_min: 70000,
    salary_max: 100000,
    contact_tg: "HRSocialBoost",
    created_by: "BOT",
  },
  {
    title: "Product Analyst",
    company: "DataLab",
    description:
      "Анализ продуктовых метрик, построение отчетов, проведение A/B тестов, работа с большими данными.",
    responsibilities:
      "— Сбор и анализ данных\n— Построение дашбордов\n— A/B тестирование\n— Формирование гипотез",
    requirements:
      "— Опыт аналитики от 1 года\n— Знание SQL\n— Опыт с Python\n— Понимание продуктовых метрик",
    location: "Москва",
    experience_level: "middle",
    job_type: "full-time",
    format: "hybrid",
    sphere: "data",
    sub_sphere: "product_analyst",
    skills: ["SQL", "Python", "Tableau", "A/B testing", "Product metrics"],
    salary_min: 200000,
    salary_max: 280000,
    contact_tg: "HRDataLab",
    created_by: "BOT",
  },
  {
    title: "Java Developer",
    company: "EnterpriseSoft",
    description:
      "Разработка корпоративных приложений на Java. Работа с микросервисами, Spring Boot, Hibernate.",
    responsibilities:
      "— Разработка новых фич\n— Рефакторинг\n— Написание тестов\n— Code review",
    requirements:
      "— Опыт работы с Java от 2 лет\n— Знание Spring Boot\n— Опыт с Hibernate\n— Понимание микросервисов",
    location: "Москва",
    experience_level: "middle",
    job_type: "full-time",
    format: "office",
    sphere: "development",
    sub_sphere: "backend",
    skills: ["Java", "Spring Boot", "Hibernate", "PostgreSQL", "Kafka"],
    salary_min: 280000,
    salary_max: 380000,
    contact_tg: "HREnterpriseSoft",
    created_by: "BOT",
  },
  {
    title: "HR-менеджер",
    company: "PeopleFirst",
    description:
      "Полный цикл подбора персонала. Ведение кадрового учета, адаптация сотрудников, развитие HR-бренда.",
    responsibilities:
      "— Поиск и подбор кандидатов\n— Проведение интервью\n— Адаптация сотрудников\n— Ведение HR-документов",
    requirements:
      "— Опыт в HR от 1 года\n— Знание методов подбора\n— Коммуникабельность\n— Навык работы с HR-системами",
    location: "Санкт-Петербург",
    experience_level: "junior",
    job_type: "full-time",
    format: "hybrid",
    sphere: "hr",
    sub_sphere: "recruiter",
    skills: [
      "Recruiting",
      "Interviewing",
      "Onboarding",
      "HR Docs",
      "People Management",
    ],
    salary_min: 90000,
    salary_max: 130000,
    contact_tg: "HRPeopleFirst",
    created_by: "BOT",
  },
  {
    title: "QA Automation (Python)",
    company: "TestOps",
    description:
      "Автоматизация тестирования на Python. Разработка и поддержка автотестов, интеграция в CI/CD.",
    responsibilities:
      "— Разработка автотестов\n— Интеграция в CI/CD\n— Анализ результатов\n— Оптимизация",
    requirements:
      "— Опыт автоматизации от 1 года\n— Знание Python и Pytest\n— Опыт с Selenium\n— Понимание CI/CD",
    location: "Удаленно",
    experience_level: "middle",
    job_type: "full-time",
    format: "remote",
    sphere: "testing",
    sub_sphere: "qa_auto",
    skills: ["Python", "Pytest", "Selenium", "CI/CD", "Git"],
    salary_min: 200000,
    salary_max: 270000,
    contact_tg: "HRTestOps",
    created_by: "BOT",
  },
];

async function addJob(job: Job): Promise<void> {
  return new Promise((resolve, reject) => {
    const jobData = {
      fields: {
        title: { stringValue: job.title },
        company: { stringValue: job.company },
        description: { stringValue: job.description },
        responsibilities: { stringValue: job.responsibilities },
        requirements: { stringValue: job.requirements },
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
        contact_tg: { stringValue: job.contact_tg },
        visible: { booleanValue: true },
        views: { integerValue: 0 },
        created_by: { stringValue: job.created_by },
        created_at: { timestampValue: new Date().toISOString() },
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
  console.log(`🚀 Начинаем добавление ${jobs.length} вакансий...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    try {
      await addJob(job);
      successCount++;
    } catch (error) {
      console.error(`❌ Ошибка при добавлении вакансии ${job.title}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Итоги:`);
  console.log(`✅ Успешно добавлено: ${successCount}`);
  console.log(`❌ Ошибок: ${errorCount}`);
  console.log(`📝 Всего вакансий: ${jobs.length}`);
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
