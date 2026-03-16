import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

let schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  let { handleSubmit, register, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
  });

  async function handleLogin(values) {
    setIsLoading(true);
    setApiError("");
    try {
      let { data } = await axios.post(`https://nti-ecommerce.vercel.app/api/v1/auth/signIn`, values);

      if (data.message === "success" || data.token) {
        localStorage.setItem("userToken", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
            Sign in to your account
          </h1>
          {apiError && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">{apiError}</div>}
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(handleLogin)}>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
              <input
                {...register("email")}
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
              <input
                {...register("password")}
                type="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don’t have an account yet?{" "}
              <Link to="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
