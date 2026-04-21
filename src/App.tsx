import React, { useState, useEffect, useMemo } from "react";
import { 
  BookOpen, 
  Video, 
  ClipboardList, 
  BarChart3, 
  User, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertCircle,
  Menu,
  X,
  PlayCircle,
  FileText,
  ExternalLink,
  BrainCircuit,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { apiRequest } from "@/src/lib/api";
import { generateDailyQuestions } from "@/src/lib/gemini";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";

// --- Types ---
type Role = "admin" | "student";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface Question {
  id: string;
  section: "Quantitative" | "DILR" | "VARC";
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? "bg-primary text-primary-foreground shadow-md" 
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiRequest("/profile")
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col md:flex-row">
      <Toaster position="top-right" />
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">CAT Prep Pro</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-background border-r w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="hidden md:flex items-center gap-3 mb-8 px-2">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">CAT Prep Pro</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={BookOpen} label="Course Materials" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={Video} label="Video Lectures" active={activeTab === "videos"} onClick={() => { setActiveTab("videos"); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={ClipboardList} label="Daily Practice" active={activeTab === "daily-test"} onClick={() => { setActiveTab("daily-test"); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={History} label="Test History" active={activeTab === "history"} onClick={() => { setActiveTab("history"); setIsMobileMenuOpen(false); }} />
            <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === "analytics"} onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }} />
            
            {user.role === "admin" && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</div>
                <SidebarItem icon={ShieldCheck} label="Admin Dashboard" active={activeTab === "admin"} onClick={() => { setActiveTab("admin"); setIsMobileMenuOpen(false); }} />
              </>
            )}
          </nav>

          <div className="pt-4 border-t mt-auto">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
              </div>
            </div>
            <SidebarItem icon={LogOut} label="Logout" active={false} onClick={handleLogout} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <Dashboard user={user} setActiveTab={setActiveTab} />}
            {activeTab === "courses" && <CourseMaterials />}
            {activeTab === "videos" && <VideoLectures />}
            {activeTab === "daily-test" && <DailyTest user={user} />}
            {activeTab === "history" && <TestHistory user={user} />}
            {activeTab === "analytics" && <Analytics user={user} />}
            {activeTab === "admin" && <AdminDashboard user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-Pages ---

function LoginPage({ onLogin }: { onLogin: (u: UserProfile) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
      toast.success("Welcome back!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
              <BrainCircuit className="text-white" size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">CAT Prep Pro</CardTitle>
          <CardDescription>Enter your credentials to access the LMS</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="student@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-11 text-base" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-muted-foreground">
            Demo: student@example.com / password123<br/>
            Admin: admin@example.com / admin123
          </p>
        </div>
      </Card>
    </div>
  );
}

function Dashboard({ user, setActiveTab }: { user: UserProfile, setActiveTab: (t: string) => void }) {
  const [stats, setStats] = useState({ attempted: 0, avgScore: 0, streak: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    apiRequest("/performance").then(results => {
      if (results.length > 0) {
        const avg = results.reduce((acc: number, r: any) => acc + r.totalScore, 0) / results.length;
        setStats({
          attempted: results.length,
          avgScore: Math.round(avg),
          streak: 3 // Mock streak
        });
      }
    });
    apiRequest("/announcements").then(setAnnouncements);
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your CAT preparation today.</p>
        </div>
        <div className="flex items-center gap-2 bg-background p-1 rounded-lg border shadow-sm">
          <Button variant="ghost" size="sm" className="gap-2">
            <Clock size={16} />
            <span>IST: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Tests Attempted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.attempted}</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgScore}%</div>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {stats.streak} Days 🔥
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard size={20} className="text-primary" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Daily Test", icon: ClipboardList, tab: "daily-test", color: "bg-orange-500" },
              { label: "Courses", icon: BookOpen, tab: "courses", color: "bg-blue-500" },
              { label: "Videos", icon: Video, tab: "videos", color: "bg-purple-500" },
              { label: "Analytics", icon: BarChart3, tab: "analytics", color: "bg-green-500" },
              { label: "History", icon: History, tab: "history", color: "bg-slate-500" },
              { label: "Profile", icon: User, tab: "profile", color: "bg-pink-500" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className="group flex flex-col items-center justify-center p-6 bg-background rounded-2xl border shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
              >
                <div className={`${item.color} p-3 rounded-xl text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle size={20} className="text-primary" />
            Announcements
          </h2>
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="shadow-sm border-l-4 border-l-primary">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold">{ann.title}</CardTitle>
                  <CardDescription className="text-xs">{new Date(ann.createdDate).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{ann.content}</p>
                </CardContent>
              </Card>
            ))}
            {announcements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 bg-background rounded-xl border border-dashed">No new announcements</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiRequest("/course-materials").then(setMaterials);
  }, []);

  const filtered = materials.filter(m => 
    (filter === "All" || m.section === filter) &&
    (m.topicName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
          <p className="text-muted-foreground">Access comprehensive study guides and resources.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search topics..." 
              className="pl-10 w-[200px] md:w-[300px]" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Sections</SelectItem>
              <SelectItem value="Quantitative">Quantitative</SelectItem>
              <SelectItem value="DILR">DILR</SelectItem>
              <SelectItem value="VARC">VARC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="font-semibold">
                  {item.section}
                </Badge>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Added {new Date(item.dateAdded).toLocaleDateString()}</span>
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.topicName}</CardTitle>
              <CardDescription className="line-clamp-2">{item.description}</CardDescription>
            </CardHeader>
            <CardFooter className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={item.googleSheetLink} target="_blank" rel="noopener noreferrer">
                  <FileText size={16} />
                  Sheets
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={item.googleDriveLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} />
                  Drive
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function VideoLectures() {
  const [videos, setVideos] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    apiRequest("/video-lectures").then(setVideos);
  }, []);

  const filtered = videos.filter(v => filter === "All" || v.section === filter);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Video Lectures</h1>
        <p className="text-muted-foreground">Learn from expert instructors at your own pace.</p>
      </header>

      <Tabs defaultValue="All" onValueChange={setFilter} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="All">All Lectures</TabsTrigger>
          <TabsTrigger value="Quantitative">Quantitative</TabsTrigger>
          <TabsTrigger value="DILR">DILR</TabsTrigger>
          <TabsTrigger value="VARC">VARC</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((video) => (
            <Card key={video.id} className="overflow-hidden group hover:shadow-xl transition-all">
              <div className="aspect-video bg-slate-100 relative flex items-center justify-center">
                <PlayCircle className="text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all" size={64} />
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {video.duration} MIN
                </div>
              </div>
              <CardHeader className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">{video.section}</Badge>
                  <span className="text-xs text-muted-foreground">• {video.instructorName}</span>
                </div>
                <CardTitle className="text-lg leading-tight">{video.topicName}</CardTitle>
              </CardHeader>
              <CardFooter className="p-5 pt-0 gap-2">
                <Button className="flex-1 gap-2" asChild>
                  <a href={video.googleDriveLink} target="_blank" rel="noopener noreferrer">
                    <PlayCircle size={16} />
                    Watch Now
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href={video.googleSheetLink} target="_blank" rel="noopener noreferrer">
                    <FileText size={18} />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

function DailyTest({ user }: { user: UserProfile }) {
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(40 * 60); // 40 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    apiRequest("/daily-test")
      .then(setTest)
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (test && !isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit();
    }
  }, [test, isSubmitted, timeLeft]);

  const handleSubmit = async () => {
    if (!test) return;
    
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const sectionScores = { Quantitative: 0, DILR: 0, VARC: 0 };

    test.questions.forEach((q: Question) => {
      const ans = answers[q.id];
      if (!ans) {
        skipped++;
      } else if (ans === q.correctAnswer) {
        correct++;
        sectionScores[q.section]++;
      } else {
        wrong++;
      }
    });

    const totalScore = Math.round((correct / test.questions.length) * 100);
    
    try {
      const res = await apiRequest("/test-results", {
        method: "POST",
        body: JSON.stringify({
          testId: test.id,
          totalScore,
          correctAnswers: correct,
          wrongAnswers: wrong,
          skippedQuestions: skipped,
          timeSpent: 40 * 60 - timeLeft,
          sectionScores,
          studentAnswers: answers
        })
      });
      setResult(res);
      setIsSubmitted(true);
      toast.success("Test submitted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="text-center py-20">Loading test...</div>;
  if (!test) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="bg-orange-100 p-4 rounded-full text-orange-600">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-2xl font-bold">No Test Available</h2>
      <p className="text-muted-foreground max-w-md">The daily test for today hasn't been published yet. Please check back later or contact your administrator.</p>
    </div>
  );

  if (isSubmitted && result) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Test Results</h1>
          <p className="text-muted-foreground">Great job completing today's practice!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center p-6">
            <p className="text-sm text-muted-foreground mb-1">Score</p>
            <p className="text-3xl font-bold text-primary">{result.totalScore}%</p>
          </Card>
          <Card className="text-center p-6">
            <p className="text-sm text-muted-foreground mb-1">Correct</p>
            <p className="text-3xl font-bold text-green-600">{result.correctAnswers}</p>
          </Card>
          <Card className="text-center p-6">
            <p className="text-sm text-muted-foreground mb-1">Wrong</p>
            <p className="text-3xl font-bold text-red-600">{result.wrongAnswers}</p>
          </Card>
          <Card className="text-center p-6">
            <p className="text-sm text-muted-foreground mb-1">Time</p>
            <p className="text-3xl font-bold">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</p>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Review Questions</h2>
          {test.questions.map((q: Question, idx: number) => (
            <Card key={q.id} className={`border-l-4 ${
              answers[q.id] === q.correctAnswer ? "border-l-green-500" : 
              !answers[q.id] ? "border-l-yellow-500" : "border-l-red-500"
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline">{q.section}</Badge>
                  {answers[q.id] === q.correctAnswer ? (
                    <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><CheckCircle2 size={14} /> Correct</span>
                  ) : !answers[q.id] ? (
                    <span className="text-yellow-600 flex items-center gap-1 text-xs font-bold"><AlertCircle size={14} /> Skipped</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1 text-xs font-bold"><XCircle size={14} /> Incorrect</span>
                  )}
                </div>
                <CardTitle className="text-base">Q{idx + 1}: {q.questionText}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt) => (
                    <div 
                      key={opt} 
                      className={`p-3 rounded-lg border text-sm ${
                        opt === q.correctAnswer ? "bg-green-50 border-green-200 text-green-800 font-medium" :
                        opt === answers[q.id] ? "bg-red-50 border-red-200 text-red-800" : "bg-secondary/20"
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg text-sm">
                  <p className="font-bold mb-1">Explanation:</p>
                  <p className="text-muted-foreground">{q.explanation}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentQ = test.questions[currentQuestionIndex];
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-background/80 backdrop-blur-md p-4 rounded-xl border z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
            Q {currentQuestionIndex + 1} / {test.questions.length}
          </div>
          <div className="hidden sm:block">
            <Badge variant="secondary">{currentQ.section}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-primary"}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
          <Button variant="destructive" size="sm" onClick={handleSubmit}>Submit Test</Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl leading-relaxed">
              {currentQ.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={answers[currentQ.id]} 
              onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQ.id]: val }))}
              className="grid grid-cols-1 gap-3"
            >
              {currentQ.options.map((opt, idx) => (
                <Label 
                  key={opt}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[currentQ.id] === opt 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "hover:border-primary/30 hover:bg-secondary/50"
                  }`}
                >
                  <RadioGroupItem value={opt} id={`q-${idx}`} className="sr-only" />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${
                    answers[currentQ.id] === opt ? "bg-primary text-white border-primary" : "bg-secondary text-muted-foreground"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className="text-base font-medium">{opt}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setAnswers(prev => {
                  const newAns = { ...prev };
                  delete newAns[currentQ.id];
                  return newAns;
                })}
              >
                Clear
              </Button>
              <Button 
                onClick={() => {
                  if (currentQuestionIndex < test.questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1);
                  } else {
                    handleSubmit();
                  }
                }}
              >
                {currentQuestionIndex === test.questions.length - 1 ? "Finish" : "Next Question"}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {test.questions.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`h-10 rounded-lg font-bold text-xs transition-all ${
                currentQuestionIndex === idx ? "ring-2 ring-primary ring-offset-2" : ""
              } ${
                answers[test.questions[idx].id] ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestHistory({ user }: { user: UserProfile }) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    apiRequest("/performance").then(setResults);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Test History</h1>
        <p className="text-muted-foreground">Review your past performance and learn from mistakes.</p>
      </header>

      <div className="space-y-4">
        {results.map((res) => (
          <Card key={res.id} className="hover:shadow-md transition-all">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-bold ${
                  res.totalScore >= 80 ? "bg-green-500" : res.totalScore >= 50 ? "bg-orange-500" : "bg-red-500"
                }`}>
                  <span className="text-xl">{res.totalScore}</span>
                  <span className="text-[10px] opacity-80">%</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Daily Practice Test</h3>
                  <p className="text-sm text-muted-foreground">{new Date(res.testDate).toLocaleDateString()} • {Math.floor(res.timeSpent / 60)}m spent</p>
                </div>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Correct</p>
                  <p className="font-bold text-green-600">{res.correctAnswers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Wrong</p>
                  <p className="font-bold text-red-600">{res.wrongAnswers}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Skipped</p>
                  <p className="font-bold text-slate-500">{res.skippedQuestions}</p>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Search size={16} />
                Review
              </Button>
            </CardContent>
          </Card>
        ))}
        {results.length === 0 && (
          <div className="text-center py-20 bg-background rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No test results found. Start your first practice test today!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Analytics({ user }: { user: UserProfile }) {
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    apiRequest("/performance").then(setResults);
  }, []);

  const chartData = useMemo(() => {
    return results.slice(-10).map(r => ({
      date: new Date(r.testDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: r.totalScore
    }));
  }, [results]);

  const sectionData = useMemo(() => {
    if (results.length === 0) return [];
    const totals = { Quantitative: 0, DILR: 0, VARC: 0 };
    results.forEach(r => {
      totals.Quantitative += r.sectionScores.Quantitative;
      totals.DILR += r.sectionScores.DILR;
      totals.VARC += r.sectionScores.VARC;
    });
    return [
      { name: "Quantitative", value: totals.Quantitative, color: "#3b82f6" },
      { name: "DILR", value: totals.DILR, color: "#f59e0b" },
      { name: "VARC", value: totals.VARC, color: "#8b5cf6" },
    ];
  }, [results]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground">Visualize your progress and identify areas for improvement.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Score Trend (Last 10 Tests)</CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Section-wise Performance</CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {sectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground font-bold uppercase mb-2">Overall Accuracy</p>
          <div className="text-4xl font-black text-primary">
            {results.length > 0 ? Math.round(results.reduce((a, b) => a + b.totalScore, 0) / results.length) : 0}%
          </div>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground font-bold uppercase mb-2">Total Questions</p>
          <div className="text-4xl font-black">
            {results.length * 20}
          </div>
        </Card>
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground font-bold uppercase mb-2">Improvement</p>
          <div className="text-4xl font-black text-green-500">
            +12%
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard({ user }: { user: UserProfile }) {
  const [unverified, setUnverified] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    apiRequest("/unverified-questions").then(setUnverified);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const questions = await generateDailyQuestions();
      await apiRequest("/questions/save-unverified", {
        method: "POST",
        body: JSON.stringify({ questions })
      });
      const updated = await apiRequest("/unverified-questions");
      setUnverified(updated);
      toast.success("Generated 20 new questions!");
    } catch (err: any) {
      toast.error("Generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleVerify = async (ids: string[], action: 'approve' | 'reject') => {
    try {
      await apiRequest("/questions/verify", {
        method: "POST",
        body: JSON.stringify({ questionIds: ids, action })
      });
      setUnverified(prev => prev.filter(q => !ids.includes(q.id)));
      toast.success(`Questions ${action}ed successfully`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage questions, students, and system settings.</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} className="gap-2 h-11 px-6">
          <BrainCircuit size={20} />
          {generating ? "Generating with AI..." : "Generate Daily Questions"}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList size={20} className="text-primary" />
              Question Verification Queue
              <Badge variant="secondary">{unverified.length}</Badge>
            </h2>
            {unverified.length > 0 && (
              <Button size="sm" onClick={() => handleVerify(unverified.map(q => q.id), 'approve')}>Approve All</Button>
            )}
          </div>

          <div className="space-y-4">
            {unverified.map((q) => (
              <Card key={q.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge>{q.section}</Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleVerify([q.id], 'reject')} className="text-red-500 hover:text-red-600">Reject</Button>
                      <Button size="sm" onClick={() => handleVerify([q.id], 'approve')}>Approve</Button>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{q.questionText}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {q.options.map((opt: string) => (
                      <div key={opt} className={`p-2 rounded border text-xs ${opt === q.correctAnswer ? "bg-green-50 border-green-200 font-bold" : ""}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded">
                    <span className="font-bold">Explanation:</span> {q.explanation}
                  </p>
                </CardContent>
              </Card>
            ))}
            {unverified.length === 0 && (
              <div className="text-center py-20 bg-background rounded-2xl border border-dashed">
                <p className="text-muted-foreground">Queue is empty. Generate new questions to begin.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <User size={18} />
              Manage Students
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <BookOpen size={18} />
              Add Course Material
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Video size={18} />
              Upload Lecture
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <AlertCircle size={18} />
              Post Announcement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
