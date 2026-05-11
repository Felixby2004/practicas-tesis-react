'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Users, GraduationCap, FileText, CheckCircle, Clock, 
  Eye, UserCheck, BookOpen, Calendar, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function TeacherDashboardPage() {
  const [selectedInforme, setSelectedInforme] = useState<any>(null);
  const [observaciones, setObservaciones] = useState('');
  const [showEvaluacionDialog, setShowEvaluacionDialog] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState<any>(null);
  const [evaluacionData, setEvaluacionData] = useState({
    nota: 0,
    comentarios: '',
    puntualidad: 5,
    calidad: 5,
    responsabilidad: 5,
  });

  // Usar el router de teacher
  const { data: dashboard, refetch } = trpc.teacher.getDashboard.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: perfil } = trpc.teacher.getPerfil.useQuery();

  const revisarInformeMutation = trpc.teacher.revisarInforme.useMutation({
    onSuccess: () => {
      toast.success('Informe revisado exitosamente');
      setSelectedInforme(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const evaluarPracticaMutation = trpc.teacher.evaluarPractica.useMutation({
    onSuccess: () => {
      toast.success('Evaluación guardada exitosamente');
      setShowEvaluacionDialog(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'revisado': return <Badge className="bg-green-500">Revisado</Badge>;
      case 'observado': return <Badge variant="destructive">Observado</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel del Docente</h1>
        <p className="text-muted-foreground">Bienvenido, {perfil?.usuario?.nombre_completo || 'Docente'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Asesorías de Práctica</p>
                <p className="text-2xl font-bold">{dashboard?.asesorias?.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tesis Asesoradas</p>
                <p className="text-2xl font-bold">{dashboard?.tesisAsesoradas?.total || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/30">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tesis como Jurado</p>
                <p className="text-2xl font-bold">{dashboard?.tesisJurado?.total || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/30">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evaluaciones Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboard?.evaluacionesPendientes || 0}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="asesorias">
        <TabsList>
          <TabsTrigger value="asesorias">📋 Asesorías</TabsTrigger>
          <TabsTrigger value="tesis-asesoradas">📚 Tesis Asesoradas</TabsTrigger>
          <TabsTrigger value="tesis-jurado">⚖️ Tesis como Jurado</TabsTrigger>
          <TabsTrigger value="evaluaciones">⭐ Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="asesorias" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Prácticas Asignadas</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.asesorias?.list?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes prácticas asignadas
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard?.asesorias?.list?.map((asignacion: any) => (
                    <div key={asignacion.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{asignacion.postulacion?.oferta?.titulo}</h3>
                          <p className="text-sm text-muted-foreground">
                            Estudiante: {asignacion.postulacion?.estudiante?.usuario?.nombre_completo}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Empresa: {asignacion.postulacion?.oferta?.empresa?.razon_social}
                          </p>
                        </div>
                        <Badge className={asignacion.postulacion?.estado === 'aprobada' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {asignacion.postulacion?.estado}
                        </Badge>
                      </div>
                      
                      {/* Informes pendientes */}
                      {asignacion.postulacion?.informes?.filter((i: any) => i.estado === 'pendiente').length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Informes pendientes:</p>
                          <div className="space-y-2">
                            {asignacion.postulacion.informes
                              .filter((i: any) => i.estado === 'pendiente')
                              .map((informe: any) => (
                                <div key={informe.id} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium">{informe.titulo}</p>
                                    <p className="text-xs text-muted-foreground">Tipo: {informe.tipo}</p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedInforme(informe);
                                      setObservaciones('');
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Revisar
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Horas registradas */}
                      {asignacion.postulacion?.horas?.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium">
                            Horas registradas: {asignacion.postulacion.horas.reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0)} / 240
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tesis-asesoradas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tesis que Asesoro</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.tesisAsesoradas?.list?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes tesis asignadas como asesor
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard?.tesisAsesoradas?.list?.map((tesis: any) => (
                    <div key={tesis.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{tesis.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          Estudiante: {tesis.estudiante?.usuario?.nombre_completo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entregables: {tesis.entregables?.length || 0} / {tesis.entregables?.length || 0}
                        </p>
                      </div>
                      <Badge className={
                        tesis.estado === 'finalizada' ? 'bg-green-500' :
                        tesis.estado === 'en_curso' ? 'bg-blue-500' :
                        tesis.estado === 'sustentada' ? 'bg-purple-500' : 'bg-yellow-500'
                      }>
                        {tesis.estado === 'propuesta' ? 'Propuesta' :
                         tesis.estado === 'en_curso' ? 'En Curso' :
                         tesis.estado === 'sustentada' ? 'Sustentada' : 'Finalizada'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tesis-jurado" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tesis como Jurado</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.tesisJurado?.list?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No eres jurado de ninguna tesis
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard?.tesisJurado?.list?.map((jurado: any) => (
                    <div key={jurado.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{jurado.tesis?.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          Estudiante: {jurado.tesis?.estudiante?.usuario?.nombre_completo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cargo: {jurado.cargo || 'Vocal'}
                        </p>
                      </div>
                      <Badge className={
                        jurado.tesis?.estado === 'finalizada' ? 'bg-green-500' :
                        jurado.tesis?.estado === 'sustentada' ? 'bg-purple-500' : 'bg-yellow-500'
                      }>
                        {jurado.tesis?.estado === 'propuesta' ? 'Propuesta' :
                         jurado.tesis?.estado === 'en_curso' ? 'En Curso' :
                         jurado.tesis?.estado === 'sustentada' ? 'Sustentada' : 'Finalizada'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evaluar Prácticas</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.asesorias?.list?.filter((a: any) => a.postulacion?.estado === 'aprobada').length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay prácticas aprobadas para evaluar
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard?.asesorias?.list
                    ?.filter((a: any) => a.postulacion?.estado === 'aprobada')
                    .map((asignacion: any) => (
                      <div key={asignacion.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{asignacion.postulacion?.oferta?.titulo}</p>
                          <p className="text-sm text-muted-foreground">
                            Estudiante: {asignacion.postulacion?.estudiante?.usuario?.nombre_completo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Horas: {asignacion.postulacion?.horas?.reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0)} / 240
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            setSelectedPostulacion(asignacion.postulacion);
                            setEvaluacionData({
                              nota: 0,
                              comentarios: '',
                              puntualidad: 5,
                              calidad: 5,
                              responsabilidad: 5,
                            });
                            setShowEvaluacionDialog(true);
                          }}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Evaluar
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Revisar Informe */}
      <Dialog open={!!selectedInforme} onOpenChange={() => setSelectedInforme(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar Informe</DialogTitle>
          </DialogHeader>
          {selectedInforme && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Estudiante</p>
                <p>{selectedInforme.postulacion?.estudiante?.usuario?.nombre_completo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Título</p>
                <p>{selectedInforme.titulo}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contenido</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedInforme.contenido || 'Sin contenido'}</p>
              </div>
              {selectedInforme.archivo_url && (
                <div>
                  <a 
                    href={selectedInforme.archivo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    📎 Ver documento adjunto
                  </a>
                </div>
              )}
              <div className="space-y-2">
                <Label>Observaciones (opcional)</Label>
                <Textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Escribe aquí tus observaciones..."
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => revisarInformeMutation.mutate({ 
                    informeId: selectedInforme.id, 
                    estado: 'revisado',
                    observaciones 
                  })}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprobar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => revisarInformeMutation.mutate({ 
                    informeId: selectedInforme.id, 
                    estado: 'observado',
                    observaciones 
                  })}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Observar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Evaluación */}
      <Dialog open={showEvaluacionDialog} onOpenChange={setShowEvaluacionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluar Práctica - {selectedPostulacion?.oferta?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedPostulacion && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">Estudiante: {selectedPostulacion.estudiante?.usuario?.nombre_completo}</p>
                <p className="text-sm text-muted-foreground">Empresa: {selectedPostulacion.oferta?.empresa?.razon_social}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Puntualidad (1-5)</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluacionData.puntualidad}
                    onChange={(e) => setEvaluacionData({ ...evaluacionData, puntualidad: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-center font-bold">{evaluacionData.puntualidad}</p>
                </div>
                <div>
                  <Label>Calidad (1-5)</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluacionData.calidad}
                    onChange={(e) => setEvaluacionData({ ...evaluacionData, calidad: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-center font-bold">{evaluacionData.calidad}</p>
                </div>
                <div>
                  <Label>Responsabilidad (1-5)</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={evaluacionData.responsabilidad}
                    onChange={(e) => setEvaluacionData({ ...evaluacionData, responsabilidad: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-center font-bold">{evaluacionData.responsabilidad}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Nota Final (0-20)</Label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={evaluacionData.nota}
                  onChange={(e) => setEvaluacionData({ ...evaluacionData, nota: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Comentarios</Label>
                <Textarea
                  value={evaluacionData.comentarios}
                  onChange={(e) => setEvaluacionData({ ...evaluacionData, comentarios: e.target.value })}
                  placeholder="Comentarios sobre el desempeño del estudiante..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEvaluacionDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={() => evaluarPracticaMutation.mutate({
                    postulacion_id: selectedPostulacion.id,
                    rubrica: {
                      puntualidad: evaluacionData.puntualidad,
                      calidad: evaluacionData.calidad,
                      responsabilidad: evaluacionData.responsabilidad,
                    },
                    nota_final: evaluacionData.nota,
                    comentarios: evaluacionData.comentarios,
                    evaluador_id: perfil?.id,
                  })}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Guardar Evaluación
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}