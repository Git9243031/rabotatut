cat > app/dynamic.ts << 'EOF'
// Этот файл импортируй в любую страницу которая использует Firebase
export const dynamic = 'force-dynamic'
EOF

# И добавляем в layout.tsx чтобы применилось ко всему приложению
cat > app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/components/layout/ReduxProvider'
import { AuthProvider }  from '@/components/layout/AuthProvider'
import { Navbar }        from '@/components/layout/Navbar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title:       'ВакансияРФ — Работа в России',
  description: 'Тысячи вакансий от лучших компаний России',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
EOF
echo "✅ app/layout.tsx — force-dynamic глобально"