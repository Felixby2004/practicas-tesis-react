'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, GraduationCap, Clock, CheckCircle, 
  FileText, TrendingUp, Calendar 
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const { data: misPostulaciones } = trpc.internships.getPostulacionesByEstudiante.useQuery(
    { estudianteId: user.estudiante?.id || '' },
    { enabled: !!user.estudiante?.id }
  );
  
  const { data: misTesis } = trpc.thesis.getProyectosByEstudiante.useQuery(
    { estudianteId: user.estudiante?.id || '' },
    { enabled: !!user.estudiante?.id }
  );
  
  const { data: ofertasDisponibles } = trpc.internships.getOfertas.useQuery({ estado: 'abierta' });

  const postulacionesAprobadas = misPostulaciones?.filter(p => p.estado === 'aprobada').length || 0;
  const postulacionesPendientes = misPostulaciones?.filter(p => p.estado === 'pendiente').length || 0;
  const tesisEnCurso = misTesis?.filter(t => t.estado === 'en_curso').length || 0;
  const horasTotales = misPostulaciones?.find(p => p.estado === 'aprobada')?.horas?.reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0) || 0;

  const stats = [
    { title: 'Prácticas Aprobadas', value: postulacionesAprobadas, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Postulaciones Pendientes', value: postulacionesPendientes, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Tesis en Curso', value: tesisEnCurso, icon: GraduationCap, color: 'bg-blue-500' },
    { title: 'Ofertas Disponibles', value: ofertasDisponibles?.length || 0, icon: Briefcase, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Panel</h1>
        <p className="text-gray-500">Resumen de tu actividad académica</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mis Postulaciones */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500" />Mis Postulaciones</CardTitle></CardHeader>
        <CardContent>
          {misPostulaciones?.length === 0 ? (
            <div className="text-center py-8 text-gray-500"><Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>Aún no has postulado a ninguna práctica</p><Link href="/student/internships"><Button className="mt-4">Explorar Ofertas</Button></Link></div>
          ) : (
            <div className="space-y-3">
              {misPostulaciones?.slice(0, 5).map((post: any) => (
                <div key={post.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div><p className="font-medium">{post.oferta?.titulo}</p><p className="text-sm text-gray-500">{post.oferta?.empresa?.razon_social}</p></div>
                  <Badge className={post.estado === 'aprobada' ? 'bg-green-500' : post.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'}>{post.estado === 'aprobada' ? 'Aprobada' : post.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mi Tesis */}
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="h-5 w-5 text-purple-500" />Mi Proyecto de Tesis</CardTitle></CardHeader>
        <CardContent>
          {misTesis?.length === 0 ? (
            <div className="text-center py-8 text-gray-500"><GraduationCap className="h-12 w-12 mx-auto mb-3 text-gray-300" /><p>No tienes un proyecto de tesis registrado</p><Link href="/dashboard/student/thesis"><Button className="mt-4">Registrar Tesis</Button></Link></div>
          ) : (
            misTesis?.map((tesis: any) => (
              <div key={tesis.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h3 className="font-semibold text-lg">{tesis.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">{tesis.descripcion}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div><p className="text-xs text-gray-500">Asesor</p><p className="text-sm font-medium">{tesis.asesor?.usuario?.nombre_completo}</p></div>
                  <div><p className="text-xs text-gray-500">Estado</p><Badge className={tesis.estado === 'finalizada' ? 'bg-green-500' : tesis.estado === 'en_curso' ? 'bg-blue-500' : tesis.estado === 'sustentada' ? 'bg-purple-500' : 'bg-yellow-500'}>{tesis.estado === 'propuesta' ? 'Propuesta' : tesis.estado === 'en_curso' ? 'En Curso' : tesis.estado === 'sustentada' ? 'Sustentada' : 'Finalizada'}</Badge></div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Resumen de Horas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">📊 Resumen de Horas</CardTitle></CardHeader>
          <CardContent><div className="text-center py-4"><p className="text-3xl font-bold text-blue-600">{horasTotales}</p><p className="text-sm text-gray-500">Horas totales registradas</p><p className="text-xs text-gray-400 mt-2">Mínimo requerido: 240 horas</p></div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">⚡ Acciones Rápidas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Link href="/student/internships"><Button variant="outline" className="w-full justify-start"><Briefcase className="h-4 w-4 mr-2" />Buscar Prácticas</Button></Link>
            <Link href="/student/internships"><Button variant="outline" className="w-full justify-start"><Clock className="h-4 w-4 mr-2" />Registrar Horas</Button></Link>
            <Link href="/student/internships"><Button variant="outline" className="w-full justify-start"><FileText className="h-4 w-4 mr-2" />Subir Informe</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}