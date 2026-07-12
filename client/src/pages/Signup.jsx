import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import { getDepartments } from "@/services/departmentService";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState([]);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDeps() {
      try {
        const deps = await getDepartments();
        setDepartments(deps);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    }
    fetchDeps();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        email,
        password,
        departmentId: departmentId || null,
      };

      await api.post("/auth/signup", payload);
      toast.success("Account created successfully. Please sign in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to create account.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper bg-dot-grid flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-line rounded-md p-8 relative">
        {/* Punched hole */}
        <span
          aria-hidden="true"
          className="absolute top-3 right-3 w-[6px] h-[6px] rounded-full bg-paper border border-line"
        />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">AssetFlow</h1>
          <p className="font-sans text-sm text-ink/50 mt-1">
            Create an employee account to get started.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-white border border-status-alert text-status-alert rounded-md text-xs font-sans font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="jane.doe@company.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
              Department (Optional)
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Select department</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 text-sm font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90 disabled:opacity-50 mt-2"
          >
            {submitting ? "Creating account…" : "Register Account"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-line text-center text-xs font-sans text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="text-accent font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;