import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertCircle, Shield, Github } from "lucide-react";
import { useAuthState } from "@/contexts/AuthStateContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuthState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, color: 'text-gray-400', label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const strengthLevels = [
      { strength: 0, color: 'text-red-400', label: 'Very Weak' },
      { strength: 1, color: 'text-red-400', label: 'Weak' },
      { strength: 2, color: 'text-yellow-400', label: 'Fair' },
      { strength: 3, color: 'text-blue-400', label: 'Good' },
      { strength: 4, color: 'text-green-400', label: 'Strong' },
      { strength: 5, color: 'text-green-500', label: 'Very Strong' },
    ];

    return strengthLevels[Math.min(strength, 5)];
  };

  const getEmailError = () => {
    if (!email) return '';
    if (!validateEmail(email)) return 'Please enter a valid email address';
    return '';
  };

  const getPasswordError = () => {
    if (!password) return '';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Validate inputs
    const emailError = getEmailError();
    const passwordError = getPasswordError();
    
    if (emailError || passwordError) {
      setError(emailError || passwordError || "Invalid credentials");
      setIsLoading(false);
      return;
    }
    
    // Simulate login delay
    setTimeout(() => {
      if (email && password.length >= 6) {
        setIsLoading(false);
        setShowSuccess(true);
        login(); // Set auth state to logged in
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setLocation("/dashboard");
        }, 2000);
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth
    alert("Google login coming soon! This will integrate with Google OAuth.");
  };

  const handleGitHubLogin = () => {
    // Placeholder for GitHub OAuth
    alert("GitHub login coming soon! This will integrate with GitHub OAuth.");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 max-w-sm"
          >
            <Check className="w-5 h-5 text-white" />
            <div>
              <p className="font-semibold">Login Successful!</p>
              <p className="text-sm opacity-90">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-20 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/60 backdrop-blur-xl border-primary/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-primary/10 to-secondary/10 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-secondary" />
            
            {/* Back Button */}
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
            
            <div className="space-y-2 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <span className="font-heading font-bold text-primary">AI</span>
                </div>
              </div>
              <h1 className="text-3xl font-heading font-bold text-white">Welcome Back</h1>
              <p className="text-muted-foreground text-sm">Master your interview skills with AI</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 text-white placeholder:text-muted-foreground h-11 rounded-lg transition-all ${
                    getEmailError() ? 'border-red-500/50' : ''
                  }`}
                  data-testid="input-email"
                />
              </div>
              {getEmailError() && (
                <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {getEmailError()}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 text-white placeholder:text-muted-foreground h-11 rounded-lg transition-all ${
                    getPasswordError() ? 'border-red-500/50' : ''
                  }`}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getPasswordError() && (
                <div className="flex items-center gap-2 mt-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {getPasswordError()}
                </div>
              )}
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-sm ${getPasswordStrength(password).color}`}>
                    Password Strength: {getPasswordStrength(password).label}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary" 
                />
                Remember me
              </label>
              <a 
                href="#" 
                className="text-primary hover:text-primary/80 transition-colors font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Password reset coming soon! This will send a reset link to your email.");
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* OAuth Buttons */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="px-4 bg-card/60 backdrop-blur-md text-sm text-muted-foreground">Or continue with</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.138-.055-.298-.12-.464-.12-.665 0-.498.38-.665.38-.464.12-.12H5.817c-.289 0-.498.12-.665.12-.464-.12-.665C3.196 7.015 3 8.325c0 1.31.496 2.28.665.12.464.12.665.38.12.464.12.665.38.12.464.12.665C1.653 12.25 2.848 12.25 4.5c0 1.195-.496 2.28-.665-.12-.464-.12-.665C2.848 4.5 2.848 6.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 6.5 2.848 6.5 8.325c0 1.31.496 2.28.665.12.464.12.665.38.12.464.12.665C3.196 8.325 3 9.5c0 1.31.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 9.5 2.848 9.5 11.25c0 1.195-.496 2.28-.665-.12-.464-.12-.665C2.848 11.25 2.848 12.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 12.5 2.848 12.5 14.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C3.196 14.5 3 15.5c0 1.31.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 15.5 2.848 15.5 17.25c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C2.848 17.25 2.848 18.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 18.5 2.848 18.5 19.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C3.196 19.5 3 20.5c0 1.31.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 20.5 2.848 20.5 21.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C2.848 21.5 2.848 22.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C1.653 22.5 2.848 22.5 23.5c0 1.195.496 2.28.665.12.464.12.665.38.12.464.12.665C3.196 23.5 3 24.5z" fill="#4285F4"/>
                  </svg>
                  Sign in with Google
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGitHubLogin}
                  className="w-full h-11 border-white/10 bg-white/5 hover:bg-white/10 text-white hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Sign in with GitHub
                </Button>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-muted-foreground">
              <p className="font-mono mb-1">Demo Credentials:</p>
              <p>Email: demo@example.com</p>
              <p>Password: password123</p>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 bg-white/5 border-t border-white/5 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a 
              href="#" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                alert("Account creation coming soon! This will open the registration page.");
              }}
            >
              Create New Account
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}