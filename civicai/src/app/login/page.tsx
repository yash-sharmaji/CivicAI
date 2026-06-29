'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Shield, Sparkles } from 'lucide-react';

import { loginUser } from '@/lib/mockData';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('warning', 'Fields Required', 'Please enter your email and password.');
      return;
    }
    
    setIsLoading(true);
    loginUser(email, password)
      .then(() => {
        setIsLoading(false);
        toast('success', 'Welcome Back!', 'Successfully logged in to CivicAI.');
        router.push('/dashboard');
      })
      .catch((err) => {
        setIsLoading(false);
        toast('danger', 'Login Failed', err.message || 'Invalid email or password.');
      });
  };

  const handleOAuth = (provider: string) => {
    toast('info', 'Connecting OAuth', `Initializing connection to ${provider}...`);
    setTimeout(() => {
      toast('success', 'Access Granted', 'Logged in via social account.');
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[#030303] min-h-[calc(100vh-64px)] grid-bg">
      <div className="glow-spot top-[20%] left-[30%]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 mb-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Access CivicAI Portal</h2>
          <p className="text-xs text-gray-500 font-medium mt-1">See it. Snap it. Solve it.</p>
        </div>

        {/* Card Entry Form */}
        <Card glow className="bg-[#07070a]/80 border-white/5">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credential credentials below to manage issues.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="citizen@civicai.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Password</label>
                  <span className="text-[10px] font-semibold text-indigo-400 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <span className="relative bg-[#07070a] px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Or Continue With
              </span>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOAuth('Google')}
                leftIcon={
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.18 15.48 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
                  </svg>
                }
                className="bg-white/5 border-white/5"
              >
                Google
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOAuth('GitHub')}
                leftIcon={
                  <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                }
                className="bg-white/5 border-white/5"
              >
                GitHub
              </Button>
            </div>
          </CardContent>
          <CardFooter className="justify-center text-xs text-gray-400">
            Don't have an account?&nbsp;
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
              Create one
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
