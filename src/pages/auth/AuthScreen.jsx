import { useState } from "react";
import { loginUser } from "../../api";

const AuthScreen = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Temporary Bypass for Backend Issues
      if (email === "admin@voiceeval.com" && password === "Voiceeval@1234") {
        console.log("Using bypass credentials");
        localStorage.setItem("token", "bypass-token-for-admin");
        localStorage.setItem("userEmail", email);
        onAuthSuccess();
        return;
      }

      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("userEmail", email);
      onAuthSuccess();
    } catch (err) {
      alert(err.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      {/* Branding */}
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-400/20 flex items-center justify-center mb-4">
          <span className="text-4xl font-bold text-teal-400">V</span>
        </div>
        <h1 className="text-3xl font-bold text-white">
          Voice<span className="text-teal-400">Eval</span>
        </h1>
        <p className="text-gray-400 mt-2">Comprehensive Voice Agent Evaluation</p>
      </div>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;
