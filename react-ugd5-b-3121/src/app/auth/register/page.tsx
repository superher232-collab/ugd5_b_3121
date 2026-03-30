'use client';
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthFromWrapper from "@/app/components/AuthFormWrapper";
import SocialAuth from "@/app/components/SocialAuth";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";

interface RegisterFormData {
  username: string;
  email: string;
  nomortelp: string;
  password: string;
  confirmPassword: string;
}

const generateCaptcha = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getStrengthColor = (strength: number): string => {
  if (strength <= 25) return "#ef4444"; // merah
  if (strength <= 50) return "#f97316"; // orange
  if (strength <= 75) return "#eab308"; // kuning
  return "#22c55e"; // hijau
};

const getStrengthLabel = (strength: number): string => {
  if (strength <= 0) return "";
  if (strength <= 25) return "Lemah";
  if (strength <= 50) return "Cukup";
  if (strength <= 75) return "Kuat";
  return "Sangat Kuat";
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState<string>(generateCaptcha());

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const watchedPassword = watch("password", "");

  useEffect(() => {
    const password = watchedPassword || "";
    const strength = Math.min(
      (password.length > 7 ? 25 : 0) +
      (/[A-Z]/.test(password) ? 25 : 0) +
      (/[0-9]/.test(password) ? 25 : 0) +
      (/[^A-Za-z0-9]/.test(password) ? 25 : 0)
    );
    setPasswordStrength(strength);
  }, [watchedPassword]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const onSubmit = (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Konfirmasi password tidak cocok!", { theme: "dark", position: "top-right" });
      return;
    }
    if (!captchaInput.trim()) {
      toast.error("Captcha belum diisi!", { theme: "dark", position: "top-right" });
      return;
    }
    if (captchaInput !== captcha) {
      toast.error("Captcha salah!", { theme: "dark", position: "top-right" });
      return;
    }
    toast.success("Register Berhasil!", { theme: "dark", position: "top-right" });
    router.push("/auth/login");
  };

  return (
    <AuthFromWrapper title="Register">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Username */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            {...register("username", {
              required: "Username tidak boleh kosong",
              minLength: { value: 3, message: "Username minimal 3 karakter" },
              maxLength: { value: 8, message: "Username maksimal 8 karakter" }
            })}
            className={`w-full p-2.5 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Username (3-8 karakter)"
          />
          {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Email tidak boleh kosong",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.(com|net|co)$/,
                message: "Email harus memiliki pattern yang valid (@ dan .com/.net/.co)"
              }
            })}
            className={`w-full p-2.5 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Email"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>

        {/* Nomor Telepon */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
          <input
            type="tel"
            {...register("nomortelp", {
              required: "Nomor telepon tidak boleh kosong",
              minLength: { value: 10, message: "Nomor telepon minimal 10 karakter" },
              pattern: { value: /^[0-9]+$/, message: "Nomor telepon harus berupa angka" }
            })}
            className={`w-full p-2.5 rounded-lg border ${errors.nomortelp ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Nomor Telepon (min 10 digit)"
          />
          {errors.nomortelp && <p className="text-red-500 text-xs">{errors.nomortelp.message}</p>}
        </div>

        {/* Password & Confirm Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password tidak boleh kosong",
                  minLength: { value: 8, message: "Password minimal 8 karakter" }
                })}
                className={`w-full p-2.5 rounded-lg border pr-9 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", {
                  required: "Konfirmasi password wajib diisi"
                })}
                className={`w-full p-2.5 rounded-lg border pr-9 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ulangi Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}

          {/* Password Strength Indicator */}
          {watchedPassword && (
            <div className="mt-2">
              <div className="strength-bar-container">
                <div
                  className="strength-bar"
                  style={{
                    width: `${passwordStrength}%`,
                    backgroundColor: getStrengthColor(passwordStrength)
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: getStrengthColor(passwordStrength) }}>
                Kekuatan Password: {getStrengthLabel(passwordStrength)}
              </p>
            </div>
          )}
        </div>

        {/* Captcha Section dengan refresh */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Captcha:</span>
            <span className="font-mono font-bold bg-gray-100 px-3 py-1.5 rounded select-none tracking-widest">
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
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300"
            placeholder="Masukkan Captcha"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Register
        </button>

        <SocialAuth />

        <p className="text-center text-sm text-gray-600">
          Sudah punya akun? <Link href="/auth/login" className="text-blue-600 font-semibold hover:text-blue-800">Login</Link>
        </p>
      </form>
    </AuthFromWrapper>
  );
}
