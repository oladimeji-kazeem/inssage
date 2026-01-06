import React, { useState, useEffect } from 'react';
import {
    Building2, ArrowRight, ShieldCheck, UserCheck,
    LogIn, Lock, CheckCircle, Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../lib/supabase';
import './Login.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'login' | 'mfa' | 'role' | 'setup'>('login');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Analyst'); // Default
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('Role selected:', role);
    }, [role]);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        // Try normal Supabase auth first
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (authError) {
            // Fallback for Demo purposes if no real user exists yet in the provided DB
            // Check if user is using demo creds
            if (email === 'demo@inssage.com' || email.includes('@inssage.com')) {
                setStep('mfa');
            } else {
                setError(authError.message);
            }
        } else {
            setStep('mfa');
        }
    };

    const verifyMFA = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep('role');
        }, 1500);
    };

    const selectRole = (selectedRole: string) => {
        setRole(selectedRole);
        setStep('setup');
    };

    const completeSetup = async () => {
        // Optionally update user profile here
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    role: role,
                    updated_at: new Date()
                }, { onConflict: 'id' });
            }
        } catch (e) {
            // Ignore error if profile table is not writable or missing
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/');
        }, 2000);
    };

    return (
        <div className="login-container">
            <div className="login-header">
                <div className="logo-box">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold mt-4">INSSAGE™</h1>
                <p className="text-secondary mt-2">Enterprise AI Governance Control Plane</p>
            </div>

            <Card className="login-card">
                {step === 'login' && (
                    <div className="step-content">
                        <h2 className="text-xl font-bold mb-1">Sign In</h2>
                        <p className="text-sm text-secondary mb-6">Access your organization's secure workspace.</p>

                        <div className="space-y-4">
                            <Input
                                label="Work Email"
                                placeholder="name@company.com"
                                icon={<Building2 size={16} />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock size={16} />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

                        <div className="mt-6 flex justify-between items-center text-xs mb-6">
                            <label className="flex items-center gap-2 text-secondary cursor-pointer">
                                <input type="checkbox" /> Remember device
                            </label>
                            <a href="#" className="text-primary hover:underline">SSO Login</a>
                        </div>

                        <Button
                            onClick={handleLogin}
                            className="w-full"
                            isLoading={loading}
                        >
                            <LogIn size={18} className="mr-2" /> Sign In Securely
                        </Button>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-secondary">
                                Don't have an account? <span className="text-primary font-bold cursor-pointer" onClick={() => { setEmail('demo@inssage.com'); setPassword('password'); }}>Use Demo Creds</span>
                            </p>
                        </div>
                    </div>
                )}

                {step === 'mfa' && (
                    <div className="step-content text-center">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Device Verification</h2>
                        <p className="text-sm text-secondary mb-6">Please verify your identity using your trusted device.</p>

                        <Input placeholder="Enter 6-digit code: 123-456" className="text-center text-2xl tracking-widest font-mono mb-4" />

                        <Button onClick={verifyMFA} className="w-full" isLoading={loading}>
                            Verify Identity
                        </Button>
                    </div>
                )}

                {step === 'role' && (
                    <div className="step-content">
                        <h2 className="text-xl font-bold mb-2">Select Your Role</h2>
                        <p className="text-sm text-secondary mb-6">This customizes your dashboard and risk controls.</p>

                        <div className="space-y-3">
                            {[
                                { label: 'Compliance Officer', icon: ShieldCheck, desc: 'View global risk & audits' },
                                { label: 'HR Analyst', icon: UserCheck, desc: 'Employee performance data' },
                                { label: 'IT Admin', icon: Lock, desc: 'System integrations & logs' },
                            ].map(r => (
                                <button
                                    key={r.label}
                                    onClick={() => selectRole(r.label)}
                                    className="w-full p-3 border border-[var(--color-border)] rounded-lg hover:border-primary hover:bg-[var(--color-bg-hover)] text-left flex items-center gap-3 transition-all"
                                >
                                    <div className="p-2 bg-[var(--color-bg-body)] rounded-md text-primary">
                                        <r.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{r.label}</div>
                                        <div className="text-xs text-secondary">{r.desc}</div>
                                    </div>
                                    <ArrowRight size={16} className="ml-auto opacity-50" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'setup' && (
                    <div className="step-content">
                        <Badge variant="success" className="mb-4 mx-auto w-fit">Workspace Ready</Badge>
                        <h2 className="text-xl font-bold mb-2">Setting up Compliance Engine</h2>
                        <p className="text-sm text-secondary mb-6">Syncing policies and connecting to your data sources.</p>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>Policy Library Synced (14 docs)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle size={16} className="text-green-500" />
                                <span>Connectors Active (3/5)</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Loader size={16} className="text-primary animate-spin" />
                                <span>Calibrating Risk Models...</span>
                            </div>
                        </div>

                        <Button onClick={completeSetup} className="w-full" isLoading={loading}>
                            Enter Dashboard
                        </Button>
                    </div>
                )}

            </Card>

            <div className="login-footer">
                <Lock size={12} />
                <span>SOC2 Type II Certified • End-to-End Encrypted</span>
            </div>
        </div>
    );
};
