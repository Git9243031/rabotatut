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
