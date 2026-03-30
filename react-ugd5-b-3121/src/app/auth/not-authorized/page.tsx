'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotAuthorized() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold text-red-600 mb-4">Akses Ditolak!</h2>
      <p className="text-gray-600 mb-2">Anda belum login.</p>
      <p className="text-gray-500 text-sm mb-6">
        Anda akan diarahkan ke halaman login dalam 5 detik...
      </p>
      <Link
        href="/auth/login"
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
      >
        Kembali ke Login
      </Link>
    </div>
  );
}
