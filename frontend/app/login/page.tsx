'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: formData.correo,
          contrasena: formData.contrasena,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
        toast.success('Inicio de sesión exitoso');
        
        if (data.usuario.rol === 'ESTUDIANTE') {
          router.push('/student');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Universidad Nacional de Trujillo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-gray-700 dark:text-gray-300">Correo Electrónico</Label>
              <Input
                id="correo"
                type="email"
                placeholder="admin@unt.edu.pe"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contrasena" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="••••••"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition-colors"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                Regístrate aquí
              </Link>
            </p>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              Demo: admin@unt.edu.pe / admin123
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}