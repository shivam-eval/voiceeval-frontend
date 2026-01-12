import { useState } from "react";
import { toast } from "react-toastify";
import { loginUser, signupUser } from "../../api";

const AuthScreen = ({ onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        // Signup flow
        const res = await signupUser({ name, email, password });
        toast.success(res.data.message || "Signup successful! Please log in.");
        // Switch to login mode after successful signup
        setIsSignup(false);
        setName("");
        setPassword("");
      } else {
        // Login flow
        const res = await loginUser({ email, password });
        localStorage.setItem("authToken", res.data.access_token);
        localStorage.setItem("userEmail", email);
        if (res.data.user_name) {
          localStorage.setItem("userName", res.data.user_name);
        }
        onAuthSuccess();
      }
    } catch (err) {
      // Show user-friendly error messages
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message;

      if (err.response?.status === 401) {
        toast.error("Invalid email or password. Please try again.");
      } else if (err.response?.status === 404) {
        toast.error("Account not found. Please check your email.");
      } else if (err.response?.status === 400) {
        toast.error(errorMessage || "Bad request. Please check your input.");
      } else {
        toast.error(errorMessage || `${isSignup ? "Signup" : "Login"} failed. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? (isSignup ? "Creating Account..." : "Logging in...") : (isSignup ? "Sign Up" : "Login")}
          </button>
        </form>

        {/* Toggle between login and signup */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setName("");
                setPassword("");
              }}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;

