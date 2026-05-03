'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec489a'];

export default function DashboardPage() {
  const [generating, setGenerating] = useState(false);

  const { data: metricas, isLoading: isLoadingMetricas } = trpc.dashboard.getMetricasGenerales.useQuery();
  const { data: estadisticasPracticas } = trpc.dashboard.getEstadisticasPracticas.useQuery();
  const { data: estadisticasTesis } = trpc.dashboard.getEstadisticasTesis.useQuery();
  const { data: estadisticasEmpresas } = trpc.dashboard.getEstadisticasEmpresas.useQuery();
  const { data: estudiantes } = trpc.estudiantes.getEstudiantes.useQuery();
  const { data: ofertas } = trpc.internships.getOfertas.useQuery();
  const { data: tesis } = trpc.thesis.getProyectos.useQuery();

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

  const estudiantesEnPractica = (estudiantes as any[])?.filter(e => 
    e.postulaciones?.some((p: any) => p.estado === 'aprobada')
  ).length || 0;

  const practicasActivas = (ofertas as any[])?.filter(o => o.estado === 'abierta' && o.activo !== false).length || 0;
  const tesisEnCurso = (tesis as any[])?.filter(t => t.estado === 'en_curso').length || 0;

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString('es-ES');
      
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('Universidad Nacional de Trujillo', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Reporte de Gestión Académica', 105, 32, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Fecha: ${fechaActual}`, 14, 55);
      
      autoTable(doc, {
        startY: 65,
        head: [['Indicador', 'Valor']],
        body: [
          ['Estudiantes Activos', metricas?.estudiantes?.activos || 0],
          ['Estudiantes en Práctica', estudiantesEnPractica],
          ['Prácticas Activas', practicasActivas],
          ['Tesis en Curso', tesisEnCurso],
          ['Empresas Conveniadas', metricas?.empresas?.total || 0],
          ['Convenios Activos', metricas?.convenios?.activos || 0],
          ['Postulaciones Aprobadas', metricas?.postulaciones?.aprobadas || 0],
          ['Horas Registradas', metricas?.horas?.total || 0],
        ],
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
      });
      
      doc.save(`reporte_dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Reporte PDF generado');
    } catch (error) {
      toast.error('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  if (isLoadingMetricas) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const mainStats = [
    { title: 'Estudiantes Activos', value: metricas?.estudiantes?.activos || 0, icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Estudiantes en Práctica', value: estudiantesEnPractica, icon: Briefcase, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Tesis en Curso', value: tesisEnCurso, icon: GraduationCap, gradient: 'from-purple-500 to-indigo-600' },
    { title: 'Empresas', value: metricas?.empresas?.total || 0, icon: Building2, gradient: 'from-orange-500 to-amber-600' },
  ];

  const secundaryStats = [
    { title: 'Prácticas Activas', value: practicasActivas, icon: FileCheck, gradient: 'from-green-500 to-emerald-600' },
    { title: 'Convenios Activos', value: metricas?.convenios?.activos || 0, icon: FileSignature, gradient: 'from-blue-500 to-indigo-600' },
    { title: 'Postulaciones Aprobadas', value: metricas?.postulaciones?.aprobadas || 0, icon: CheckCircle, gradient: 'from-purple-500 to-pink-600' },
    { title: 'Horas Registradas', value: metricas?.horas?.total || 0, icon: Clock, gradient: 'from-yellow-500 to-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard de Gestión</h1>
          <p className="text-muted-foreground">Métricas y estadísticas del sistema</p>
        </div>
        <Button onClick={handleGeneratePDF} disabled={generating} className="bg-primary hover:bg-primary/90">
          <Download className="h-4 w-4 mr-2" />
          {generating ? 'Generando...' : 'Exportar PDF'}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-l-4 border-l-primary hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <TrendingUp className="h-3 w-3" />
                  <span>Datos actualizados</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {secundaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="practicas" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="tesis">📚 Tesis</TabsTrigger>
          <TabsTrigger value="empresas">🏢 Empresas</TabsTrigger>
        </TabsList>

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
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos disponibles</div>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Bar dataKey="value" fill="#8b5cf6" name="Convenios" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No hay datos disponibles</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500" />Tasa de Éxito</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Aprobación de postulaciones</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {metricas?.postulaciones?.aprobadas && metricas?.postulaciones?.aprobadas > 0 
                    ? `${Math.round((metricas.postulaciones.aprobadas / (metricas.postulaciones.aprobadas + (metricas.postulaciones?.rechazadas || 0))) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Tesis finalizadas</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {metricas?.tesis?.total && metricas?.tesis?.total > 0 
                    ? `${Math.round((tesisPorEstado.find((t: any) => t.name === 'Finalizada')?.value || 0) / metricas.tesis.total * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm">Empresas con convenio activo</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {metricas?.empresas?.total && metricas?.empresas?.total > 0 
                    ? `${Math.round((estadisticasEmpresas?.empresasPorConvenio?.filter((e: any) => e._count?.convenios > 0).length || 0) / metricas.empresas.total * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Resumen del Sistema</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <span className="text-sm">📝 Total de postulaciones</span>
                <Badge className="bg-blue-500">{metricas?.postulaciones?.aprobadas || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                <span className="text-sm">🎓 Total de tesis registradas</span>
                <Badge className="bg-green-500">{metricas?.tesis?.total || 0}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
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