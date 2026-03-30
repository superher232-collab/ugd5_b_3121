'use client';
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthFromWrapper from "@/app/components/AuthFormWrapper";
import SocialAuth from "@/app/components/SocialAuth";
import Link from "next/link";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";

interface LoginFormData {
  email: string;
  password: string;
  captchaInput: string;
  rememberMe: boolean;
}

interface ErrorObject {
  email?: string;
  password?: string;
  captcha?: string;
}

const generateCaptcha = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    captchaInput: "",
    rememberMe: false
  });

  const [errors, setErrors] = useState<ErrorObject>({});

  const [captcha, setCaptcha] = useState<string>(generateCaptcha());

  const [showPassword, setShowPassword] = useState(false);

  const [loginAttempts, setLoginAttempts] = useState(3);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setFormData(prev => ({ ...prev, captchaInput: "" }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleResetAttempts = () => {
    if (loginAttempts === 0) {
      setLoginAttempts(3);
      setErrors({});
      refreshCaptcha();
      toast.info("Kesempatan login telah direset!", { theme: "dark", position: "top-right" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loginAttempts <= 0) {
      toast.error("Kesempatan login habis! Silakan reset kesempatan.", { theme: "dark", position: "top-right" });
      return;
    }

    let newErrors: ErrorObject = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong";
    } else if (formData.email.trim() !== "3121@gmail.com") {
      newErrors.email = "Email harus sesuai dengan NPM (cth. 3121@gmail.com)";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (formData.password !== "241713121") {
      newErrors.password = "Password harus sesuai dengan NPM (cth. 241713121)";
    }

    if (!formData.captchaInput.trim()) {
      newErrors.captcha = "Captcha belum diisi";
    } else if (formData.captchaInput !== captcha) {
      newErrors.captcha = "Captcha salah";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const newAttempts = Math.max(0, loginAttempts - 1);
      setLoginAttempts(newAttempts);

      if (newAttempts === 0) {
        toast.error(`Login Gagal! Kesempatan login habis.`, { theme: "dark", position: "top-right" });
      } else {
        toast.error(`Login Gagal! Sisa Kesempatan: ${newAttempts}`, { theme: "dark", position: "top-right" });
      }
    } else {
      sessionStorage.setItem("isLoggedIn", "true");
      toast.success("Login Berhasil!", { theme: "dark", position: "top-right" });
      router.push("/home");
    }
  };

  return (
    <AuthFromWrapper title="Login">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Sisa Kesempatan Login */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            Sisa Kesempatan: <span className={`font-bold ${loginAttempts === 0 ? 'text-red-600' : 'text-green-600'}`}>{loginAttempts}</span>
          </span>
          <button
            type="button"
            onClick={handleResetAttempts}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              loginAttempts === 0
                ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Reset Kesempatan
          </button>
        </div>

        {/* Input Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"}`}
            placeholder="Masukkan email"
          />
          {errors.email && <p className="text-red-600 text-xs italic mt-1">{errors.email}</p>}
        </div>

        {/* Input Password dengan toggle visibility */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
              placeholder="Masukkan password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && <p className="text-red-600 text-xs italic mt-1">{errors.password}</p>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
              className="mr-2 h-4 w-4 rounded border-gray-300"
            />
            Ingat Saya
          </label>
          <Link href="/auth/forgot-password" title="Coming Soon" className="text-blue-600 hover:text-blue-800 font-semibold">
            Forgot Password?
          </Link>
        </div>

        {/* Captcha Section dengan refresh */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Captcha:</span>
            <span className="font-mono text-lg font-bold bg-gray-100 px-3 py-1.5 rounded text-gray-900 select-none tracking-widest">
              {captcha}
            </span>
            <button
              type="button"
              onClick={refreshCaptcha}
              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
              title="Refresh Captcha"
            >
              <FaSyncAlt />
            </button>
          </div>
          <input
            name="captchaInput"
            type="text"
            value={formData.captchaInput}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-lg border ${errors.captcha ? "border-red-500" : "border-gray-300"}`}
            placeholder="Masukkan captcha"
          />
          {errors.captcha && <p className="text-red-600 text-xs italic mt-1">{errors.captcha}</p>}
        </div>

        {/* Submit Button - disabled jika kesempatan habis */}
        <button
          type="submit"
          disabled={loginAttempts <= 0}
          className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-colors ${
            loginAttempts <= 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Sign In
        </button>

        {/* Social Login Component */}
        <SocialAuth />

        <p className="mt-6 text-center text-sm text-gray-600">
          Tidak punya akun?
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-semibold ml-1">
            Daftar
          </Link>
        </p>
      </form>
    </AuthFromWrapper>
  );
}
