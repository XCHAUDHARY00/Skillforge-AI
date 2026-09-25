import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, ChevronRight, Zap, Clock, TrendingUp, X, Loader2, Sparkles } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import AIAssistant from '../components/ai/AIAssistant';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// Generate projects from skill gaps — ZERO Gemini calls
const deriveProjects = (skillGaps) => {
  const projectTemplates = {
    Docker: {
      title: 'Containerized Microservices App',
      description: 'Build a multi-service application using Docker and Docker Compose. Deploy a Django backend + React frontend + PostgreSQL in containers.',
      skills: ['Docker', 'Docker Compose', 'Django', 'PostgreSQL'],
      milestones: ['Set up Docker environment', 'Containerize Django API', 'Add PostgreSQL container', 'Configure Docker Compose', 'Deploy locally and test'],
      duration: '5–8 hours',
      difficulty: 'Intermediate',
      impact: 'High',
    },
    'System Design': {
      title: 'URL Shortener System Design & Build',
      description: 'Design and implement a URL shortener service like Bitly. Covers load balancing, caching, database design and API design principles.',
      skills: ['System Design', 'REST API', 'PostgreSQL', 'Redis'],
      milestones: ['Design system architecture', 'Implement URL shortener API', 'Add Redis caching layer', 'Write architecture document', 'Add analytics endpoint'],
      duration: '6–10 hours',
      difficulty: 'Advanced',
      impact: 'High',
    },
    Redis: {
      title: 'Real-Time Chat with Redis Pub/Sub',
      description: 'Build a real-time messaging system using Redis pub/sub channels. Includes message queuing, user presence detection, and persistence.',
      skills: ['Redis', 'Django Channels', 'WebSockets', 'PostgreSQL'],
      milestones: ['Set up Redis server', 'Implement pub/sub channels', 'Build WebSocket connection', 'Add message persistence', 'Test real-time functionality'],
      duration: '8–12 hours',
      difficulty: 'Advanced',
      impact: 'High',
    },
    AWS: {
      title: 'Deploy Django App to AWS EC2',
      description: 'Deploy a production-grade Django application to AWS EC2 with Nginx, Gunicorn, SSL certificate and automated deployment.',
      skills: ['AWS EC2', 'Nginx', 'Gunicorn', 'Linux', 'SSL'],
      milestones: ['Launch EC2 instance', 'Configure Nginx + Gunicorn', 'Set up domain and SSL', 'Configure S3 for media files', 'Set up deployment pipeline'],
      duration: '6–10 hours',
      difficulty: 'Advanced',
      impact: 'High',
    },
    Testing: {
      title: 'Test-Driven Django API Development',
      description: 'Rebuild an existing API endpoint using TDD methodology with pytest and Django Test Client. Achieve 90%+ test coverage.',
      skills: ['pytest', 'Django', 'TDD', 'REST API'],
      milestones: ['Set up pytest configuration', 'Write failing tests first', 'Implement API to pass tests', 'Add integration tests', 'Generate coverage report'],
      duration: '4–6 hours',
      difficulty: 'Intermediate',
      impact: 'Medium',
    },
    'CI/CD': {
      title: 'GitHub Actions CI/CD Pipeline',
      description: 'Set up a complete CI/CD pipeline using GitHub Actions that runs tests, linting, and auto-deploys to a staging server on every push.',
      skills: ['GitHub Actions', 'CI/CD', 'Docker', 'pytest'],
      milestones: ['Create workflow file', 'Add test automation step', 'Add linting step', 'Configure Docker build', 'Set up auto-deploy to staging'],
      duration: '3–5 hours',
      difficulty: 'Intermediate',
      impact: 'Medium',
    },
    Kubernetes: {
      title: 'Kubernetes Deployment with Helm',
      description: 'Deploy a containerized application to a local Kubernetes cluster using Helm charts, ConfigMaps, and auto-scaling policies.',
      skills: ['Kubernetes', 'Helm', 'Docker', 'YAML'],
      milestones: ['Install Minikube locally', 'Write deployment YAML', 'Create Helm chart', 'Configure auto-scaling', 'Add health checks'],
      duration: '8–12 hours',
      difficulty: 'Advanced',
      impact: 'Medium',
    },
    GraphQL: {
      title: 'GraphQL API with Strawberry Django',
      description: 'Convert a REST API to GraphQL using Strawberry for Django. Implement queries, mutations, subscriptions, and authentication.',
      skills: ['GraphQL', 'Strawberry', 'Django', 'Python'],
      milestones: ['Install Strawberry', 'Define GraphQL schema', 'Implement queries', 'Add mutations with auth', 'Compare with REST performance'],
      duration: '5–7 hours',
      difficulty: 'Intermediate',
      impact: 'Medium',
    },
  };

  // Default project if no gaps found
  const defaultProject = {
    id: 'default',
    title: 'Full-Stack Portfolio API',
    description: 'Build a complete portfolio management API with Django, PostgreSQL, and a React frontend. Showcase your existing skills with a real production-grade project.',
    skills: ['Django', 'Python', 'PostgreSQL', 'React', 'REST API'],
    milestones: ['Set up Django project structure', 'Design and implement database models', 'Build REST API endpoints', 'Connect React frontend', 'Deploy to Heroku or Railway'],
    duration: '10–15 hours',
    difficulty: 'Intermediate',
    impact: 'High',
  };

  if (!skillGaps || skillGaps.length === 0) {
    return [defaultProject];
  }

  const prioritized = [...skillGaps].sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 };
    return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
  });

  const projects = [];
  for (const gap of prioritized) {
    const template = projectTemplates[gap.name];
    if (template && projects.length < 4) {
      projects.push({ id: gap.name, ...template });
    }
    if (projects.length >= 4) break;
  }

  if (projects.length === 0) projects.push(defaultProject);

  return projects;
};

const ImpactBadge = ({ impact }) => {
  const config = {
    High: { color: '#10b981', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25' },
    Medium: { color: '#f59e0b', bg: 'bg-amber-500/15', border: 'border-amber-500/25' },
  };
  const c = config[impact] || config.Medium;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.bg} ${c.border}`} style={{ color: c.color }}>
      {impact} Impact
    </span>
  );
};

const getProjectSteps = (project) => {
  return [
    {
      title: "Step 1: System Blueprint (Foundation 🏗️)",
      explain: "Bhai, sabse pehle hum ek map banayenge ki system kaisa dikhega. Ghar banane se pehle jaise naksha banta hai, waisa hi. Isme hum decide karenge data kahan se aayega aur kahan jayega.",
      code: "Plan your architecture: User -> Frontend (React) -> Backend API -> Database",
      task: "Draw a simple block diagram on paper."
    },
    {
      title: "Step 2: Environment Setup (Hathyar tayyar karo ⚔️)",
      explain: `Ab hume coding ke tools ready karne hain. Hum ${project.skills[0] || 'framework'} ka naya project start karenge aur zaroori libraries install karenge.`,
      code: "mkdir my_project\ncd my_project\npython -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt",
      task: "Create the project folder and setup environment."
    },
    {
      title: "Step 3: Database Models (Data ka ghar 🏠)",
      explain: "Database tables banani hongi taaki data properly save ho. Yahan pe hum models likhenge jo SQL ki jagah Python/JS me tables define karte hain.",
      code: "class DataModel(models.Model):\n    name = models.CharField(max_length=100)\n    created_at = models.DateTimeField(auto_now_add=True)",
      task: "Write your first model and run migrations."
    },
    {
      title: "Step 4: API Endpoints (Waiter ka kaam 🛎️)",
      explain: "Ab backend endpoints banayenge jo frontend ko data denge aur frontend se data lenge. GET, POST, PUT, DELETE operations yahan likhe jayenge.",
      code: "@api_view(['GET'])\ndef get_data(request):\n    return Response({'message': 'Bhai data ready hai!'})",
      task: "Create a simple GET endpoint and test it in browser."
    },
    {
      title: "Step 5: Frontend Integration (Chehre ka shringar ✨)",
      explain: "Last step! Ab API ko React UI ke saath connect karenge. User button dabayega, API call hogi aur data screen pe show hoga.",
      code: "fetch('/api/data')\n  .then(res => res.json())\n  .then(data => console.log(data));",
      task: "Fetch data from backend and display it."
    }
  ];
};

const Projects = () => {
  const [selected, setSelected] = useState(null);
  const [learningProject, setLearningProject] = useState(null);
  const [learningSteps, setLearningSteps] = useState(null);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSkillGaps, setHasSkillGaps] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/skills_gap/');
      const gaps = res.data?.data?.skill_gaps || res.data?.skill_gaps || [];
      setHasSkillGaps(gaps.length > 0);
      
      const gapNames = gaps.length > 0 ? gaps.map(g => g.skill_name || g.name).join(', ') : "React, Python, Django";
      
      const prompt = `You are an API returning JSON. Based on the user's skill gaps: ${gapNames}. Generate EXACTLY 3 personalized project ideas (1 Beginner, 1 Intermediate, 1 Advanced) that help them learn these skills.
Return ONLY valid JSON in this exact format:
[
  {
    "id": "1",
    "title": "Project Title",
    "description": "Short description...",
    "skills": ["Skill 1", "Skill 2"],
    "milestones": ["M1", "M2", "M3"],
    "duration": "10-15 hours",
    "difficulty": "Intermediate",
    "impact": "High"
  }
]
Do NOT return markdown blocks. Return plain JSON text.`;

      const aiRes = await api.post('/chat/send/', { message: prompt });
      const aiText = aiRes.data?.response || aiRes.data?.data?.response;
      
      let parsed = [];
      try {
        const jsonStr = (aiText || '').replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(jsonStr);
      } catch (err) {
        parsed = deriveProjects(gaps); // fallback to hardcoded
      }
      setProjects(Array.isArray(parsed) ? parsed : deriveProjects(gaps));
    } catch (e) {
      setProjects(deriveProjects([]));
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async (project) => {
    setLearningProject(project);
    setSelected(null);
    setLoadingSteps(true);
    setLearningSteps(null);

    const prompt = `Act as a friendly coding mentor talking in Hinglish (Bhai language). The user selected the project: "${project.title}".
Skills: ${project.skills.join(', ')}
Generate a long, detailed step-by-step tutorial (4 to 6 steps) on how to build it.
Return ONLY valid JSON in this exact format:
[
  {
    "title": "Step 1: ...",
    "explain": "Bhai sabse pehle...",
    "code": "commands or code snippets",
    "task": "Your task is..."
  }
]
Do NOT return markdown blocks. Return plain JSON text.`;

    try {
      const res = await api.post('/chat/send/', { message: prompt });
      const aiText = res.data?.response || res.data?.data?.response;
      const jsonStr = (aiText || '').replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      setLearningSteps(Array.isArray(parsed) ? parsed : getProjectSteps(project));
    } catch (err) {
      setLearningSteps(getProjectSteps(project)); // fallback
    } finally {
      setLoadingSteps(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Projects" subtitle="Build projects that prove your skills">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  if (learningProject) {
    const steps = learningSteps || [];
    return (
      <AppLayout title="Project Learning Mode" subtitle={`Learning: ${learningProject.title}`}>
        <div className="p-6 max-w-4xl mx-auto pb-24">
          <button 
            onClick={() => setLearningProject(null)}
            className="flex items-center gap-2 text-xs font-semibold mb-6 hover:text-indigo-400 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronRight className="rotate-180" size={14} /> Back to Projects
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>{learningProject.title}</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{learningProject.description}</p>
          </motion.div>

          {loadingSteps ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-indigo-400" />
              <p className="text-xs text-indigo-300 font-semibold animate-pulse">AI Mentor is writing your custom project plan...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {steps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl border"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                </div>
                <div className="pl-11">
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {step.explain}
                  </p>
                  <div className="p-3 rounded-xl bg-black/40 border mb-3 overflow-x-auto" style={{ borderColor: 'var(--bg-card-border)' }}>
                    <code className="text-[11px] font-mono text-emerald-400 whitespace-pre">{step.code}</code>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <TrendingUp size={12} className="text-indigo-400 flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-indigo-300">Task: {step.task}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
        <AIAssistant />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Projects" subtitle="Build projects that prove your skills">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/8 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 mb-6">
          <Sparkles size={18} className="text-indigo-400 flex-shrink-0" />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {hasSkillGaps
              ? 'These projects are AI-selected from your real skill gaps to target your biggest career growth opportunities.'
              : 'Complete your Career DNA and Skill Gap analysis to get personalized project recommendations.'}
          </p>
          {!hasSkillGaps && (
            <button onClick={() => navigate('/career-dna')}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-indigo-500 rounded-lg text-xs text-white font-semibold">
              Set up <ChevronRight size={11} />
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <motion.div key={project.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl p-5 group cursor-pointer transition-all hover:-translate-y-0.5 border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)', boxShadow: 'var(--shadow-card)' }}
              onClick={() => setSelected(project)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <FolderGit2 size={18} className="text-indigo-400" />
                </div>
                <ImpactBadge impact={project.impact} />
              </div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{project.title}</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>{project.description}</p>
              <div className="flex items-center gap-3 text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1"><Zap size={9} />{project.difficulty}</span>
                <span className="flex items-center gap-1"><Clock size={9} />{project.duration}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.skills.map(skill => (
                  <span key={skill} className="text-[10px] px-2 py-0.5 rounded-lg border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--bg-card-border)', color: 'var(--text-secondary)' }}>
                    {skill}
                  </span>
                ))}
              </div>
              <button className="w-full py-2 border border-indigo-500/30 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-1">
                View Project Plan <ChevronRight size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--bg-card-border)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)}
              className="absolute top-4 right-4 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <FolderGit2 size={18} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selected.title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selected.difficulty}</span>
                  <span style={{ color: 'var(--bg-card-border)' }}>·</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selected.duration}</span>
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Milestones</p>
              <div className="relative pl-5 space-y-3">
                <div className="absolute left-2 top-1 bottom-1 w-px" style={{ background: 'var(--bg-card-border)' }} />
                {selected.milestones.map((m, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-3 top-1.5 w-2 h-2 rounded-full border"
                      style={{ borderColor: 'var(--bg-card-border)', background: 'var(--bg-card)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.skills.map(skill => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">{skill}</span>
                ))}
              </div>
            </div>
            <button id="project-start-btn"
              onClick={() => handleStartLearning(selected)}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl text-sm font-semibold text-white transition-all hover:from-indigo-600 hover:to-violet-700">
              Start This Project
            </button>
          </motion.div>
        </div>
      )}

      <AIAssistant />
    </AppLayout>
  );
};

export default Projects;
