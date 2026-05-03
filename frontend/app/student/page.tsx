'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, GraduationCap, Clock, CheckCircle, 
  FileText, Calendar, TrendingUp
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [estudianteId, setEstudianteId] = useState<string>('');
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEstudianteId(parsedUser?.estudiante?.id || '');
    }
  }, []);

  const { data: misPostulaciones } = trpc.internships.getPostulacionesByEstudiante.useQuery(
    { estudianteId: estudianteId },
    { enabled: !!estudianteId }
  );
  
  const { data: misTesis } = trpc.thesis.getProyectos.useQuery();
  const tesisDelEstudiante = misTesis?.filter((t: any) => t.estudiante?.usuario?.id === user?.id);
  
  const { data: ofertasDisponibles } = trpc.internships.getOfertas.useQuery();

  const postulacionesAprobadas = misPostulaciones?.filter(p => p.estado === 'aprobada').length || 0;
  const postulacionesPendientes = misPostulaciones?.filter(p => p.estado === 'pendiente').length || 0;
  const tesisEnCurso = tesisDelEstudiante?.filter(t => t.estado === 'en_curso').length || 0;
  const horasTotales = misPostulaciones?.find(p => p.estado === 'aprobada')?.horas?.reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0) || 0;

  const stats = [
    { title: 'Prácticas Aprobadas', value: postulacionesAprobadas, icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
    { title: 'Postulaciones Pendientes', value: postulacionesPendientes, icon: Clock, color: 'from-yellow-500 to-amber-600' },
    { title: 'Tesis en Curso', value: tesisEnCurso, icon: GraduationCap, color: 'from-blue-500 to-indigo-600' },
    { title: 'Ofertas Disponibles', value: ofertasDisponibles?.filter(o => o.estado === 'abierta').length || 0, icon: Briefcase, color: 'from-purple-500 to-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Panel</h1>
          <p className="text-muted-foreground">Resumen de tu actividad académica</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <span className="text-xs text-primary">📅 {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mis Postulaciones */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Mis Postulaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {misPostulaciones?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
              <p>Aún no has postulado a ninguna práctica</p>
              <Link href="/student/internships">
                <Button className="mt-4 bg-primary hover:bg-primary/90">Explorar Ofertas</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {misPostulaciones?.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300">
                  <div>
                    <p className="font-semibold text-foreground">{post.oferta?.titulo}</p>
                    <p className="text-sm text-muted-foreground mt-1">{post.oferta?.empresa?.razon_social}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">📅 Postulado: {new Date(post.fecha_postulacion).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={post.estado === 'aprobada' ? 'default' : post.estado === 'rechazada' ? 'destructive' : 'secondary'}>
                    {post.estado === 'aprobada' ? 'Aprobada' : post.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mi Tesis */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Mi Proyecto de Tesis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {tesisDelEstudiante?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
              <p>No tienes un proyecto de tesis registrado</p>
              <Link href="/student/thesis">
                <Button className="mt-4 bg-primary hover:bg-primary/90">Registrar Tesis</Button>
              </Link>
            </div>
          ) : (
            tesisDelEstudiante?.map((tesis: any) => {
              const estadoColors: Record<string, string> = {
                propuesta: 'bg-yellow-500',
                en_curso: 'bg-blue-500',
                sustentada: 'bg-purple-500',
                finalizada: 'bg-green-500',
              };
              const estadoLabels: Record<string, string> = {
                propuesta: 'Propuesta',
                en_curso: 'En Curso',
                sustentada: 'Sustentada',
                finalizada: 'Finalizada',
              };
              return (
                <div key={tesis.id} className="p-5 rounded-xl bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{tesis.titulo}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{tesis.descripcion}</p>
                    </div>
                    <Badge className={estadoColors[tesis.estado]}>{estadoLabels[tesis.estado]}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 mt-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Asesor</p>
                      <p className="text-sm font-medium">{tesis.asesor?.usuario?.nombre_completo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Registro</p>
                      <p className="text-sm font-medium">{new Date(tesis.fecha_registro).toLocaleDateString()}</p>
                    </div>
                    <Link href={`/student/thesis`}>
                      <Button variant="outline" size="sm" className="ml-auto">Ver Detalles</Button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Resumen de Horas y Acciones */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2">📊 Resumen de Horas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-primary">{horasTotales}</p>
              <p className="text-muted-foreground mt-2">Horas totales registradas</p>
              <div className="mt-4 w-full bg-secondary rounded-full h-2">
                <div className="bg-primary rounded-full h-2" style={{ width: `${Math.min((horasTotales / 240) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground/70 mt-2">Mínimo requerido: 240 horas ({Math.round((horasTotales / 240) * 100)}%)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2">⚡ Acciones Rápidas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link href="/student/internships">
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-colors">
                <Briefcase className="h-4 w-4 mr-2" />
                Explorar Prácticas
              </Button>
            </Link>
            <Link href="/student/internships?tab=seguimiento">
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-colors">
                <Clock className="h-4 w-4 mr-2" />
                Registrar Horas
              </Button>
            </Link>
            <Link href="/student/thesis">
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-colors">
                <GraduationCap className="h-4 w-4 mr-2" />
                Ver Mi Tesis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}