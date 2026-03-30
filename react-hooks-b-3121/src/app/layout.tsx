import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'Auth System - UGD5',
  description: 'Login and Register System',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4">
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{ borderRadius: '8px', fontFamily: 'inherit', fontSize: '14px' }}
        />
      </body>
    </html>
  );
}
