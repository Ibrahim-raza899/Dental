import { Inter } from 'next/font/google'
import './globals.css'
import ReduxProvider from '../store/ReduxProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Odontogenic LMS',
  description: 'Enterprise Educational Application in Odontogenic Oral Pathology',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
