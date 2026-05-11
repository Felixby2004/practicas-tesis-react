'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Key, Building2, BookOpen, Clock, CheckCircle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function ProfilePage() {
  const router = useRouter();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  const { data: perfil, refetch: refetchPerfil } = trpc.profile.getPerfil.useQuery();
  const { data: estadisticas } = trpc.profile.getEstadisticas.useQuery();
  
  const updatePerfilMutation = trpc.profile.updatePerfil.useMutation({
    onSuccess: () => {
      toast.success('Perfil actualizado exitosamente');
      refetchPerfil();
    },
    onError: (error) => toast.error(error.message),
  });

  const changePasswordMutation = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success('Contraseña cambiada exitosamente');
      setContrasenaActual('');
      setContrasenaNueva('');
      setConfirmarContrasena('');
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (perfil) {
      setNombreCompleto(perfil.nombre_completo || '');
    }
  }, [perfil]);

  const handleUpdatePerfil = () => {
    if (!nombreCompleto.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    updatePerfilMutation.mutate({ nombre_completo: nombreCompleto });
  };

  const handleChangePassword = () => {
    if (!contrasenaActual || !contrasenaNueva) {
      toast.error('Complete todos los campos');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }
    if (contrasenaNueva.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    changePasswordMutation.mutate({
      contrasena_actual: contrasenaActual,
      contrasena_nueva: contrasenaNueva,
    });
  };

  if (!perfil) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground">Gestiona tu información personal y contraseña</p>
      </div>

      <div>
        {/* Información personal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input value={perfil.correo} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">El correo no puede ser modificado</p>
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Badge className="ml-2 bg-green-500">{perfil.rol}</Badge>
            </div>
            <Button onClick={handleUpdatePerfil} disabled={updatePerfilMutation.isPending}>
              {updatePerfilMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <Input
                type="password"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                placeholder="Ingrese su contraseña actual"
              />
            </div>
            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <Input
                type="password"
                value={contrasenaNueva}
                onChange={(e) => setContrasenaNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nueva Contraseña</Label>
              <Input
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="Repita la nueva contraseña"
              />
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending} variant="outline">
            {changePasswordMutation.isPending ? 'Actualizando...' : 'Cambiar Contraseña'}
          </Button>
        </CardContent>
      </Card>

      {/* Información específica según rol */}
      {perfil.rol === 'ESTUDIANTE' && perfil.estudiante && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Información Académica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Código Universitario</p>
                <p className="font-medium">{perfil.estudiante.codigo_univ}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carrera</p>
                <p className="font-medium">{perfil.estudiante.carrera}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ciclo</p>
                <p className="font-medium">{perfil.estudiante.ciclo}° Ciclo</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prácticas Completadas</p>
                <p className="font-medium">{perfil.estudiante.practicas_completadas ? '✅ Sí' : '❌ No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {perfil.rol === 'DOCENTE' && perfil.docente && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información Profesional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Especialidad</p>
                <p className="font-medium">{perfil.docente.especialidad}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facultad</p>
                <p className="font-medium">{perfil.docente.facultad || 'No asignada'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {perfil.rol === 'REPRESENTANTE_EMPRESA' && perfil.representante && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{perfil.representante.empresa}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cargo</p>
                <p className="font-medium">{perfil.representante.cargo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}