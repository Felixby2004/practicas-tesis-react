'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

interface Carrera {
  id: string;
  nombre: string;
  area: string;
}

interface Facultad {
  id: string;
  nombre: string;
}

interface Empresa {
  id: string;
  razon_social: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo: '',
    contrasena: '',
    rol_solicitado: 'ESTUDIANTE' as 'ESTUDIANTE' | 'DOCENTE' | 'COORDINADOR' | 'REPRESENTANTE_EMPRESA',
    // Para estudiante
    carrera_id: '',
    ciclo: '1',
    // Para docente
    especialidad: '',
    facultad_id: '',  // Cambiado de 'facultad' a 'facultad_id'
    // Para coordinador
    facultad_coordinador_id: '',
    // Para representante de empresa
    empresa_id: '',
    cargo: '',
  });

  // Queries
  const { data: carreras = [] } = trpc.carreras.getCarreras.useQuery(undefined, {
    enabled: formData.rol_solicitado === 'ESTUDIANTE',
  });
  const { data: facultades = [] } = trpc.facultades.getFacultades.useQuery(undefined, {
    enabled: formData.rol_solicitado === 'DOCENTE' || formData.rol_solicitado === 'COORDINADOR',
  });
  const { data: empresas = [] } = trpc.companies.getEmpresas.useQuery(undefined, {
    enabled: formData.rol_solicitado === 'REPRESENTANTE_EMPRESA',
  });

  const createSolicitudMutation = trpc.solicitudes.createSolicitud.useMutation({
    onSuccess: () => {
      toast.success('Solicitud enviada exitosamente. Espera la aprobación del administrador.');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al enviar la solicitud');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre_completo || !formData.correo || !formData.contrasena) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    
    if (formData.contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validaciones según rol
    if (formData.rol_solicitado === 'ESTUDIANTE' && !formData.carrera_id) {
      toast.error('Seleccione una carrera');
      return;
    }
    if (formData.rol_solicitado === 'DOCENTE' && !formData.facultad_id) {
      toast.error('Seleccione una facultad');
      return;
    }
    if (formData.rol_solicitado === 'COORDINADOR' && !formData.facultad_coordinador_id) {
      toast.error('Seleccione una facultad');
      return;
    }
    if (formData.rol_solicitado === 'REPRESENTANTE_EMPRESA' && !formData.empresa_id) {
      toast.error('Seleccione una empresa');
      return;
    }
    
    // Preparar datos para enviar
    const dataToSend: any = {
      nombre_completo: formData.nombre_completo,
      correo: formData.correo,
      contrasena: formData.contrasena,
      rol_solicitado: formData.rol_solicitado,
    };

    if (formData.rol_solicitado === 'ESTUDIANTE') {
      dataToSend.carrera_id = formData.carrera_id;
      dataToSend.ciclo = parseInt(formData.ciclo);
    } else if (formData.rol_solicitado === 'DOCENTE') {
      dataToSend.especialidad = formData.especialidad;
      dataToSend.facultad_id = formData.facultad_id;
    } else if (formData.rol_solicitado === 'COORDINADOR') {
      dataToSend.facultad_id = formData.facultad_coordinador_id;
    } else if (formData.rol_solicitado === 'REPRESENTANTE_EMPRESA') {
      dataToSend.empresa_id = formData.empresa_id;
      dataToSend.cargo = formData.cargo;
    }

    createSolicitudMutation.mutate(dataToSend);
  };

  // Agrupar carreras por área (para estudiante)
  const carrerasPorArea = (carreras as Carrera[]).reduce((acc: any, carrera) => {
    const areaMap: Record<string, string> = {
      'A': '🔬 Ciencias',
      'B': '⚙️ Ingeniería',
      'C': '🏥 Salud',
      'D': '📚 Humanidades'
    };
    const areaNombre = areaMap[carrera.area] || carrera.area;
    if (!acc[areaNombre]) acc[areaNombre] = [];
    acc[areaNombre].push(carrera);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Registro de Usuario</CardTitle>
          <CardDescription className="text-center">
            Universidad Nacional de Trujillo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Campos comunes */}
            <div className="space-y-2">
              <Label>Nombre Completo *</Label>
              <Input
                placeholder="Juan Pérez García"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico *</Label>
              <Input
                type="email"
                placeholder="juan.perez@unt.edu.pe"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Contraseña *</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                required
              />
            </div>

            {/* Selección de rol */}
            <div className="space-y-2">
              <Label>Rol Solicitado *</Label>
              <Select 
                value={formData.rol_solicitado} 
                onValueChange={(value: any) => setFormData({ 
                  ...formData, 
                  rol_solicitado: value,
                  carrera_id: '',
                  ciclo: '1',
                  especialidad: '',
                  facultad_id: '',
                  facultad_coordinador_id: '',
                  empresa_id: '',
                  cargo: '',
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESTUDIANTE">🎓 Estudiante</SelectItem>
                  <SelectItem value="DOCENTE">👨‍🏫 Docente</SelectItem>
                  <SelectItem value="COORDINADOR">📋 Coordinador de Facultad</SelectItem>
                  <SelectItem value="REPRESENTANTE_EMPRESA">🏢 Representante de Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campos para ESTUDIANTE */}
            {formData.rol_solicitado === 'ESTUDIANTE' && (
              <>
                <div className="space-y-2">
                  <Label>Carrera *</Label>
                  <Select value={formData.carrera_id} onValueChange={(value) => setFormData({ ...formData, carrera_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(carrerasPorArea).map(([area, carrerasLista]: [string, any]) => (
                        <div key={area}>
                          <div className="px-2 py-1 text-sm font-semibold text-gray-500 bg-gray-50">
                            {area}
                          </div>
                          {carrerasLista.map((carrera: Carrera) => (
                            <SelectItem key={carrera.id} value={carrera.id}>
                              {carrera.nombre}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ciclo *</Label>
                  <Select value={formData.ciclo} onValueChange={(value) => setFormData({ ...formData, ciclo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar ciclo" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(ciclo => (
                        <SelectItem key={ciclo} value={ciclo.toString()}>
                          {ciclo}° Ciclo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Campos para DOCENTE */}
            {formData.rol_solicitado === 'DOCENTE' && (
              <>
                <div className="space-y-2">
                  <Label>Especialidad</Label>
                  <Input
                    placeholder="Ej: Ingeniería de Software"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facultad *</Label>
                  <Select value={formData.facultad_id} onValueChange={(value) => setFormData({ ...formData, facultad_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar facultad" />
                    </SelectTrigger>
                    <SelectContent>
                      {(facultades as Facultad[])?.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Campos para COORDINADOR */}
            {formData.rol_solicitado === 'COORDINADOR' && (
              <div className="space-y-2">
                <Label>Facultad *</Label>
                <Select value={formData.facultad_coordinador_id} onValueChange={(value) => setFormData({ ...formData, facultad_coordinador_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {(facultades as Facultad[])?.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Campos para REPRESENTANTE DE EMPRESA */}
            {formData.rol_solicitado === 'REPRESENTANTE_EMPRESA' && (
              <>
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select value={formData.empresa_id} onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {(empresas as Empresa[])?.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input
                    placeholder="Ej: Gerente de RRHH"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  />
                </div>
              </>
            )}

            <p className="text-xs text-gray-500">
              El administrador revisará tu solicitud y te asignará los permisos correspondientes.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={createSolicitudMutation.isPending}>
              {createSolicitudMutation.isPending ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
            <p className="text-sm text-center text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Iniciar Sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}