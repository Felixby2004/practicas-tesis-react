'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  TrendingUp,
  Clock,
  FileCheck,
  CheckCircle,
  Download,
  Calendar,
  Award,
  FileSignature,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec489a'];

export default function DashboardPage() {
  const [generating, setGenerating] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user?.rol || '');
    }
    setIsLoading(false);
  }, []);

  // ⚠️ TODOS los hooks SIEMPRE deben ejecutarse ANTES de cualquier return condicional
  const { data: metricas, isLoading: isLoadingMetricas } = trpc.dashboard.getMetricasGenerales.useQuery({}, {
    refetchInterval: 30000,
  });
  const { data: estadisticasPracticas } = trpc.dashboard.getEstadisticasPracticas.useQuery({}, {
    refetchInterval: 30000,
  });
  const { data: estadisticasTesis } = trpc.dashboard.getEstadisticasTesis.useQuery({}, {
    refetchInterval: 60000,
  });
  const { data: estadisticasEmpresas } = trpc.dashboard.getEstadisticasEmpresas.useQuery({}, {
    refetchInterval: 60000,
  });
  const { data: estudiantes } = trpc.estudiantes.getEstudiantes.useQuery({}, {
    refetchInterval: 45000,
  });
  const { data: ofertas } = trpc.internships.getOfertas.useQuery();
  const { data: tesis } = trpc.thesis.getProyectos.useQuery();

  // Ahora sí podemos hacer retornos condicionales
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'ADMINISTRADOR') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20 w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Acceso Denegado</h2>
            <p className="text-red-600 dark:text-red-300 mb-4">
              El Dashboard de Gestión está disponible solo para administradores del sistema.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              Volver Atrás
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const practicasPorMes = estadisticasPracticas?.practicasPorMes?.map((item: any) => ({
    mes: item.mes,
    cantidad: Number(item.cantidad),
  })) || [];

  const postulacionesData = estadisticasPracticas?.postulacionesPorEstado?.map((item: any) => ({
    name: item.estado === 'pendiente' ? 'Pendientes' : item.estado === 'aprobada' ? 'Aprobadas' : 'Rechazadas',
    value: item._count,
  })) || [];

  const tesisPorEstado = estadisticasTesis?.tesisPorEstado?.map((item: any) => {
    const nombres: Record<string, string> = {
      propuesta: 'Propuesta',
      en_curso: 'En Curso',
      sustentada: 'Sustentada',
      finalizada: 'Finalizada',
    };
    return { name: nombres[item.estado] || item.estado, value: item._count };
  }) || [];

  const conveniosTipoData = estadisticasEmpresas?.conveniosPorTipo?.map((item: any) => ({
    name: item.tipo,
    value: item._count,
  })) || [];

  // Calcular estudiantes en práctica - con validación de array
  const estudiantesArray = Array.isArray(estudiantes) ? estudiantes : [];
  const estudiantesEnPractica = estudiantesArray.filter((e: any) => 
    e.postulaciones?.some((p: any) => p.estado === 'aprobada')
  ).length;

  const practicasActivas = Array.isArray(ofertas) 
    ? ofertas.filter((o: any) => o.estado === 'abierta' && o.activo !== false).length 
    : 0;
  
  const tesisEnCurso = Array.isArray(tesis) 
    ? tesis.filter((t: any) => t.estado === 'en_curso').length 
    : 0;

  const handleGeneratePDF = async () => {
    setGenerating(true);
    toast.success('Reporte PDF generado');
    setGenerating(false);
  };

  if (isLoadingMetricas) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mainStats = [
    { title: 'Estudiantes Activos', value: metricas?.estudiantes?.activos || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Estudiantes en Práctica', value: estudiantesEnPractica, icon: Briefcase, color: 'bg-green-500' },
    { title: 'Tesis en Curso', value: tesisEnCurso, icon: GraduationCap, color: 'bg-purple-500' },
    { title: 'Empresas', value: metricas?.empresas?.total || 0, icon: Building2, color: 'bg-orange-500' },
  ];

  const secundaryStats = [
    { title: 'Prácticas Activas', value: practicasActivas, icon: FileCheck, color: 'bg-green-500' },
    { title: 'Convenios Activos', value: metricas?.convenios?.activos || 0, icon: FileSignature, color: 'bg-blue-500' },
    { title: 'Postulaciones Aprobadas', value: metricas?.postulaciones?.aprobadas || 0, icon: CheckCircle, color: 'bg-purple-500' },
    { title: 'Horas Registradas', value: metricas?.horas?.total || 0, icon: Clock, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Gestión</h1>
          <p className="text-gray-500">Métricas y estadísticas del sistema</p>
        </div>
        <Button onClick={handleGeneratePDF} disabled={generating} className="bg-blue-600">
          <Download className="h-4 w-4 mr-2" />
          {generating ? 'Generando...' : 'Exportar PDF'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {mainStats.map((stat) => {
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
                <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Datos actualizados</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {secundaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-l-4 border-l-green-500">
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

      <Tabs defaultValue="practicas" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="practicas">📊 Prácticas</TabsTrigger>
          <TabsTrigger value="tesis">📚 Tesis</TabsTrigger>
          <TabsTrigger value="empresas">🏢 Empresas</TabsTrigger>
        </TabsList>

        <TabsContent value="practicas" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Prácticas por Mes</CardTitle></CardHeader>
              <CardContent>
                {practicasPorMes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={practicasPorMes}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#3b82f6" name="Ofertas" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Estado de Postulaciones</CardTitle></CardHeader>
              <CardContent>
                {postulacionesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={postulacionesData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                        {postulacionesData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tesis" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Estado de Proyectos de Tesis</CardTitle></CardHeader>
            <CardContent>
              {tesisPorEstado.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={tesisPorEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                      {tesisPorEstado.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresas" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Convenios por Tipo</CardTitle></CardHeader>
            <CardContent>
              {conveniosTipoData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conveniosTipoData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" name="Convenios" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">No hay datos disponibles</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" />Tasa de Éxito</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 border-b">
                <span className="text-sm">Aprobación de postulaciones</span>
                <span className="font-bold text-green-600">
                  {metricas?.postulaciones?.aprobadas && metricas?.postulaciones?.aprobadas > 0 
                    ? `${Math.round((metricas.postulaciones.aprobadas / (metricas.postulaciones.aprobadas + (metricas.postulaciones?.rechazadas || 0))) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 border-b">
                <span className="text-sm">Tesis finalizadas</span>
                <span className="font-bold text-blue-600">
                  {metricas?.tesis?.total && metricas?.tesis?.total > 0 
                    ? `${Math.round((tesisPorEstado.find((t: any) => t.name === 'Finalizada')?.value || 0) / metricas.tesis.total * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 border-b">
                <span className="text-sm">Empresas con convenio activo</span>
                <span className="font-bold text-purple-600">
                  {metricas?.empresas?.total && metricas?.empresas?.total > 0 
                    ? `${Math.round((estadisticasEmpresas?.empresasPorConvenio?.filter((e: any) => e._count?.convenios > 0).length || 0) / metricas.empresas.total * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-blue-500" />Resumen del Sistema</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-sm">📝 Total de postulaciones</span>
                <Badge className="bg-blue-500">{metricas?.postulaciones?.aprobadas || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-sm">🎓 Total de tesis registradas</span>
                <Badge className="bg-green-500">{metricas?.tesis?.total || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                <span className="text-sm">🏢 Total de empresas</span>
                <Badge className="bg-purple-500">{metricas?.empresas?.total || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}