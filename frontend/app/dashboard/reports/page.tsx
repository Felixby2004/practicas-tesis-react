'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText, TrendingUp, Briefcase, GraduationCap, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('gestion');
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: metricas } = trpc.dashboard.getMetricasGenerales.useQuery();
  const { data: estadisticasPracticas } = trpc.dashboard.getEstadisticasPracticas.useQuery();
  const { data: estadisticasTesis } = trpc.dashboard.getEstadisticasTesis.useQuery();
  const { data: estadisticasEmpresas } = trpc.dashboard.getEstadisticasEmpresas.useQuery();
  const { data: ofertas } = trpc.internships.getOfertas.useQuery();
  const { data: tesisList } = trpc.thesis.getProyectos.useQuery();

  const formatNumber = (num: number) => {
    return num?.toLocaleString() || '0';
  };

  const generatePDF = () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Encabezado institucional
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Universidad Nacional de Trujillo', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Sistema de Gestión de Prácticas Preprofesionales y Tesis', 105, 32, { align: 'center' });
      
      // Información del reporte
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${fechaActual}`, 14, 55);
      if (dateRange.start && dateRange.end) {
        doc.text(`Período: ${dateRange.start} al ${dateRange.end}`, 14, 62);
      }
      
      let title = '';
      let columns: string[] = [];
      let body: any[] = [];
      let summary = '';
      
      if (reportType === 'gestion') {
        title = 'REPORTE DE GESTIÓN EJECUTIVA';
        columns = ['Indicador', 'Valor', 'Descripción'];
        body = [
          ['Estudiantes Activos', formatNumber(metricas?.estudiantes?.activos), 'Estudiantes en el sistema'],
          ['Total Estudiantes Registrados', formatNumber(metricas?.estudiantes?.total), 'Histórico'],
          ['Prácticas Activas (Ofertas)', formatNumber(metricas?.practicas?.activas), 'Ofertas de práctica disponibles'],
          ['Total Prácticas Publicadas', formatNumber(metricas?.practicas?.total), 'Ofertas publicadas históricamente'],
          ['Tesis en Curso', formatNumber(metricas?.tesis?.enCurso), 'Proyectos de tesis en desarrollo'],
          ['Total Proyectos de Tesis', formatNumber(metricas?.tesis?.total), 'Registrados históricamente'],
          ['Convenios Activos', formatNumber(metricas?.convenios?.activos), 'Convenios vigentes con empresas'],
          ['Empresas Conveniadas', formatNumber(metricas?.empresas?.total), 'Empresas aliadas'],
          ['Postulaciones Aprobadas', formatNumber(metricas?.postulaciones?.aprobadas), 'Estudiantes en práctica'],
          ['Horas Registradas', formatNumber(metricas?.horas?.total), 'Horas acumuladas en prácticas'],
        ];
        summary = `Resumen: ${metricas?.estudiantes?.activos || 0} estudiantes activos, ${metricas?.practicas?.activas || 0} prácticas disponibles, ${metricas?.tesis?.enCurso || 0} tesis en curso.`;
      } 
      else if (reportType === 'practicas') {
        title = 'REPORTE DE PRÁCTICAS PREPROFESIONALES';
        columns = ['Título', 'Empresa', 'Fecha Límite', 'Vacantes', 'Estado'];
        
        const ofertasActivas = (ofertas as any[])?.filter(o => o.activo !== false) || [];
        
        if (ofertasActivas.length === 0) {
          body = [['No hay ofertas de práctica registradas', '', '', '', '']];
        } else {
          body = ofertasActivas.map((o: any) => [
            o.titulo,
            o.empresa?.razon_social || 'N/A',
            new Date(o.fecha_limite_postulacion).toLocaleDateString(),
            o.vacantes,
            o.estado === 'abierta' ? 'Abierta' : 'Cerrada'
          ]);
        }
        
        const totalOfertas = ofertasActivas.length;
        const ofertasAbiertas = ofertasActivas.filter((o: any) => o.estado === 'abierta').length;
        summary = `Total de ofertas de práctica: ${totalOfertas}. Ofertas abiertas actualmente: ${ofertasAbiertas}.`;
      } 
      else if (reportType === 'tesis') {
        title = 'REPORTE DE PROYECTOS DE TESIS';
        columns = ['Título', 'Estudiante', 'Asesor', 'Estado'];
        const tesisData = (tesisList as any[]) || [];
        
        if (tesisData.length === 0) {
          body = [['No hay proyectos de tesis registrados', '', '', '']];
        } else {
          body = tesisData.map((t: any) => [
            t.titulo,
            t.estudiante?.usuario?.nombre_completo || 'N/A',
            t.asesor?.usuario?.nombre_completo || 'N/A',
            t.estado === 'propuesta' ? 'Propuesta' : t.estado === 'en_curso' ? 'En Curso' : t.estado === 'sustentada' ? 'Sustentada' : 'Finalizada'
          ]);
        }
        
        const totalTesis = tesisData.length;
        const tesisEnCurso = tesisData.filter((t: any) => t.estado === 'en_curso').length;
        summary = `Total de proyectos de tesis: ${totalTesis}. Tesis en curso: ${tesisEnCurso}.`;
      } else if (reportType === 'empresas') {
        title = 'REPORTE DE EMPRESAS CONVENIADAS';
        columns = ['RUC', 'Razón Social', 'Correo Contacto', 'Teléfono', 'Convenios Activos'];
        const empresas = estadisticasEmpresas?.empresasPorConvenio || [];
        
        if (empresas.length === 0) {
          body = [['No hay empresas registradas', '', '', '', '']];
        } else {
          body = empresas.map((item: any) => [
            item.ruc || 'N/A',
            item.razon_social,
            item.correo_contacto || 'N/A',
            item.telefono || 'N/A',
            item._count?.convenios || 0
          ]);
        }
        const totalConvenios = empresas.reduce((acc: number, item: any) => acc + (item._count?.convenios || 0), 0);
        const totalEmpresas = empresas.length;
        summary = `Total de empresas: ${totalEmpresas}. Total de convenios activos: ${totalConvenios}.`;
      }
      
      // Título del reporte
      doc.setFontSize(16);
      doc.setTextColor(59, 130, 246);
      doc.text(title, 105, 75, { align: 'center' });
      
      // Tabla
      doc.setTextColor(0, 0, 0);
      const hasData = body.length > 0 && !(body.length === 1 && body[0][0] === 'No hay ofertas de práctica registradas');
      
      if (hasData) {
        autoTable(doc, {
          startY: 85,
          head: [columns],
          body: body,
          theme: 'striped',
          headStyles: { 
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          alternateRowStyles: { fillColor: [240, 248, 255] },
          margin: { top: 10 },
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text('No hay datos disponibles para este reporte', 105, 100, { align: 'center' });
      }
      
      // Resumen
      const finalY = (doc as any).lastAutoTable?.finalY || 120;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Resumen:', 14, finalY + 10);
      doc.text(summary, 14, finalY + 20);
      
      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount} - Sistema de Gestión UNT`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setGenerating(false);
    }
  };

  const reportOptions = [
    { value: 'gestion', label: 'Reporte de Gestión', icon: TrendingUp, desc: 'Métricas generales del sistema' },
    { value: 'practicas', label: 'Reporte de Prácticas', icon: Briefcase, desc: 'Ofertas de práctica y postulaciones' },
    { value: 'tesis', label: 'Reporte de Tesis', icon: GraduationCap, desc: 'Proyectos de tesis' },
    { value: 'empresas', label: ' Reporte de Empresas', icon: Building2, desc: 'Empresas y convenios' },
  ];

  // Obtener datos para vista previa
  const ofertasActivas = (ofertas as any[])?.filter(o => o.activo !== false) || [];
  const empresasData = estadisticasEmpresas?.empresasPorConvenio || [];
  const tesisData = (tesisList as any[]) || [];
  const tesisPorEstado = estadisticasTesis?.tesisPorEstado || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-gray-500">Generación y exportación de reportes en PDF</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Generar Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo de reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reportOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon && <opt.icon className="h-4 w-4" />}
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {reportOptions.find(o => o.value === reportType)?.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio (opcional)</Label>
                <Input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Fin (opcional)</Label>
                <Input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>

            <Button 
              onClick={generatePDF} 
              disabled={generating} 
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {generating ? 'Generando reporte...' : 'Exportar a PDF'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Vista Previa del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reporte seleccionado:</strong> {reportOptions.find(o => o.value === reportType)?.label}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Formato:</strong> PDF
              </p>
              <p className="text-sm text-gray-500 mt-4">
                El reporte incluirá:
              </p>
              <ul className="text-sm text-gray-500 list-disc list-inside mt-2 space-y-1">
                <li>Encabezado institucional</li>
                <li>Fecha de generación</li>
                <li>Tabla con datos relevantes</li>
                <li>Resumen ejecutivo</li>
                <li>Pie de página con numeración</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista previa de datos según tipo de reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vista Previa de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          {reportType === 'gestion' && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Estudiantes Activos</p>
                <p className="text-2xl font-bold text-blue-700">{metricas?.estudiantes?.activos || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Prácticas Activas</p>
                <p className="text-2xl font-bold text-green-700">{metricas?.practicas?.activas || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600">Tesis en Curso</p>
                <p className="text-2xl font-bold text-purple-700">{metricas?.tesis?.enCurso || 0}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600">Empresas Conveniadas</p>
                <p className="text-2xl font-bold text-orange-700">{metricas?.empresas?.total || 0}</p>
              </div>
            </div>
          )}

          {reportType === 'practicas' && (
            <div className="space-y-2">
              {ofertasActivas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay ofertas de práctica registradas</p>
                </div>
              ) : (
                ofertasActivas.slice(0, 5).map((o: any) => (
                  <div key={o.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">{o.titulo}</p>
                      <p className="text-sm text-gray-500">{o.empresa?.razon_social}</p>
                    </div>
                    <Badge className={o.estado === 'abierta' ? 'bg-green-500' : 'bg-gray-500'}>
                      {o.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {reportType === 'tesis' && (
            <div className="space-y-2">
              {tesisData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay proyectos de tesis registrados</p>
                </div>
              ) : (
                tesisPorEstado.map((item: any) => (
                  <div key={item.estado} className="flex justify-between items-center p-2 border-b">
                    <span>{item.estado === 'propuesta' ? '📝 Propuesta' : item.estado === 'en_curso' ? '🔄 En Curso' : item.estado === 'sustentada' ? '✅ Sustentada' : '🎓 Finalizada'}</span>
                    <Badge>{item._count}</Badge>
                  </div>
                ))
              )}
            </div>
          )}

          {reportType === 'empresas' && (
            <div className="space-y-2">
              {empresasData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay empresas registradas</p>
                </div>
              ) : (
                empresasData.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">{item.razon_social}</p>
                      <p className="text-xs text-gray-500">
                        RUC: {item.ruc || 'N/A'} | {item.correo_contacto || 'N/A'} | Tel: {item.telefono || 'N/A'}
                      </p>
                    </div>
                    <Badge variant="outline">{item._count?.convenios || 0} convenios</Badge>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}