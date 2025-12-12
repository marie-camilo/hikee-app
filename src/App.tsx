import { Outlet } from "react-router-dom"
import Header from "./components/Navbar"
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from "react-hot-toast"

export default function App() {
  return (
    <div>
      <Header/>
      <main>
        <ScrollToTop />
        <Outlet/>
      </main>
      <Footer/>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'font-medium',
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            color: '#f8fafc',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          },
          success: {
            style: {
              background: 'rgba(122, 155, 118, 0.95)',
              borderColor: 'rgba(44, 62, 46, 0.5)',
              color: '#f8fafc',
            },
            iconTheme: { primary: '#ffffff', secondary: '#A8B99C' },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.95)',
              borderColor: 'rgba(127, 29, 29, 0.5)',
              color: '#f8fafc',
            },
            iconTheme: { primary: '#ffffff', secondary: '#7f1d1d' },
          },
        }}
      />

    </div>
  )
}
