import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/stores/auth-context";
import { toast } from "sonner";

type Mode = "signin" | "signup" | "otp" | "forgot" | "verify";

export default function SignIn() {
  const navigate = useNavigate();
  const {
    signInWithEmail,
    verifyOtp,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    resendVerification,
    signInWithGoogle,
  } = useAuth();

  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [infoMsg, setInfoMsg] = React.useState<string | null>(null);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    setInfoMsg(null);
    const { error } = await signInWithPassword(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Welcome to Three Guys!");
    navigate("/account");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.error("Please fill in all fields"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    setInfoMsg(null);
    const { error, needsVerification } = await signUpWithPassword(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    if (needsVerification) {
      setInfoMsg("Account created! Check your email for a verification link to activate your account.");
      setMode("verify");
    } else {
      toast.success("Welcome to Three Guys!");
      navigate("/account");
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await signInWithEmail(email);
    setLoading(false);
    if (error) { toast.error(error); return; }
    setMode("otp");
    toast.success("Verification code sent to your email");
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { toast.error("Please enter the code"); return; }
    setLoading(true);
    const { error } = await verifyOtp(email, otp);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Welcome to Three Guys!");
    navigate("/account");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { toast.error(error); return; }
    setInfoMsg("Password reset link sent! Check your email to reset your password.");
  };

  const handleResendVerification = async () => {
    if (!email.trim()) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await resendVerification(email);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Verification email resent");
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) toast.error(error);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold text-primary-foreground">
              <span className="font-display text-xl font-bold">3</span>
            </div>
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold">Welcome to Three Guys</h1>
          <p className="mt-2 text-muted-foreground">Sign in or create your account</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          {mode === "verify" ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Mail className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-display text-xl font-semibold">Verify your email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a verification link to <span className="font-medium text-foreground">{email}</span>.
                Click the link in the email to activate your account.
              </p>
              {infoMsg && (
                <p className="rounded-lg bg-accent/5 p-3 text-sm text-accent">{infoMsg}</p>
              )}
              <Button className="w-full" onClick={handleResendVerification} disabled={loading}>
                {loading ? "Sending..." : "Resend verification email"}
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => { setMode("signin"); setInfoMsg(null); }}>
                Back to sign in
              </Button>
            </div>
          ) : mode === "otp" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="mt-1.5 text-center text-lg tracking-widest"
                />
                <p className="mt-2 text-xs text-muted-foreground">Code sent to {email}</p>
              </div>
              <Button className="w-full" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => setMode("signin")}>
                Use a different method
              </Button>
            </div>
          ) : mode === "forgot" ? (
            <div className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Reset your password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
              {infoMsg && (
                <p className="rounded-lg bg-accent/5 p-3 text-sm text-accent">{infoMsg}</p>
              )}
              <Button variant="ghost" className="w-full text-sm" onClick={() => { setMode("signin"); setInfoMsg(null); }}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Tabs defaultValue="password" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="otp">Email Code</TabsTrigger>
                </TabsList>

                <TabsContent value="password" className="space-y-4">
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin">
                      <form onSubmit={handlePasswordSignIn} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <button
                              type="button"
                              onClick={() => { setMode("forgot"); setInfoMsg(null); }}
                              className="text-xs text-accent hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="px-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Signing in..." : <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div>
                          <Label htmlFor="signup-email">Email</Label>
                          <div className="relative mt-1.5">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="At least 8 characters"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="px-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <div className="relative mt-1.5">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="confirm-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Re-enter password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Creating account..." : <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="otp" className="space-y-4">
                  <div>
                    <Label htmlFor="otp-email">Email</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleSendOtp} disabled={loading}>
                    {loading ? "Sending..." : <>Send Code <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-accent hover:underline">Terms</Link> and{" "}
          <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
