import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.email !== 'admin@admin.com') {
      toast.error('Access denied. Admin email required.');
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.post('/v1/backend/signin', {
        email: credentials.email,
        password: credentials.password
      });
      
      const result = response.data;
      
      if (result.access_token) {
        localStorage.setItem('kalakriti-admin-token', result.access_token);
      }
      
      if (result.user) {
        localStorage.setItem('kalakriti-admin-user', JSON.stringify(result.user));
      }
      
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kalakriti-primary/5 via-kalakriti-secondary/5 to-kalakriti-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-smooth-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-kalakriti-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-kalakriti-primary">
              Admin Panel
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Sign in to manage Kalakriti competitions
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  placeholder="admin@admin.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Admin Access:</h4>
              <p className="text-sm text-blue-700">
                Only <strong>admin@admin.com</strong> can access the admin panel
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;