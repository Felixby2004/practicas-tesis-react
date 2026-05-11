'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Users, GraduationCap, Building2, FileText, Calendar, Eye, CheckCircle, XCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CoordinatorDashboardPage() {
  const [selectedPostulante, setSelectedPostulante] = useState<any>(null);
  const [selectedDocente, setSelectedDocente] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);

  const { data: dashboard } = trpc.coordinator.getDashboard.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: postulaciones, refetch: refetchPostulaciones } = trpc.coordinator.getPostulacionesByFacultad.useQuery(undefined, {
    refetchInterval: 30000, // Refresco cada 30 segundos
  });
  const { data: tesis } = trpc.coordinator.getTesisByFacultad.useQuery(undefined, {
    refetchInterval: 60000, // Refresco cada 60 segundos
  });
  const { data: perfil } = trpc.profile.getPerfil.useQuery();
  const { data: docentes } = trpc.coordinator.getDocentesByFacultad.useQuery(undefined);

  const getPostulante = trpc.coordinator.getPostulanteDetalles.useMutation();
  const aprobarPostulanteMutation = trpc.coordinator.aprobarPostulante.useMutation({
    onSuccess: () => {
      toast.success('Postulante aprobado exitosamente');
      setShowDialog(false);
      setSelectedPostulante(null);
      setSelectedDocente('');
      refetchPostulaciones();
    },
    onError: (error) => toast.error(error.message),
  });

  const rechazarPostulanteMutation = trpc.coordinator.rechazarPostulante.useMutation({
    onSuccess: () => {
      toast.success('Postulante rechazado');
      setShowDialog(false);
      setSelectedPostulante(null);
      refetchPostulaciones();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleVerDetalles = async (postulacionId: string) => {
    try {
      const detalles = await getPostulante.mutateAsync({ postulacionId });
      setSelectedPostulante(detalles);
      setShowDialog(true);
    } catch (error: any) {
      toast.error('Error al cargar detalles');
    }
  };

  const handleAprobar = async () => {
    if (!selectedDocente) {
      toast.error('Selecciona un docente asesor');
      return;
    }
    if (selectedPostulante) {
      await aprobarPostulanteMutation.mutateAsync({
        postulacionId: selectedPostulante.id,
        docenteId: selectedDocente,
      });
    }
  };

  const handleRechazar = async () => {
    if (selectedPostulante) {
      await rechazarPostulanteMutation.mutateAsync({
        postulacionId: selectedPostulante.id,
      });
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'aprobada': return <Badge className="bg-green-500">Aprobada</Badge>;
      case 'rechazada': return <Badge variant="destructive">Rechazada</Badge>;
      case 'pendiente': return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'propuesta': return <Badge className="bg-yellow-500">Propuesta</Badge>;
      case 'en_curso': return <Badge className="bg-blue-500">En Curso</Badge>;
      case 'sustentada': return <Badge className="bg-purple-500">Sustentada</Badge>;
      case 'finalizada': return <Badge className="bg-green-500">Finalizada</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel del Coordinador</h1>
        <p className="text-muted-foreground">
          Facultad: {dashboard?.facultad || 'Cargando...'} - Supervisión académica
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estudiantes</p>
                <p className="text-2xl font-bold">{dashboard?.estadisticas?.estudiantes || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prácticas</p>
                <p className="text-2xl font-bold">{dashboard?.estadisticas?.practicas || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tesis</p>
                <p className="text-2xl font-bold">{dashboard?.estadisticas?.tesis || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Docentes</p>
                <p className="text-2xl font-bold">{dashboard?.estadisticas?.docentes || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="postulaciones">
        <TabsList>
          <TabsTrigger value="postulaciones">📋 Postulaciones</TabsTrigger>
          <TabsTrigger value="tesis">📚 Tesis</TabsTrigger>
          <TabsTrigger value="estadisticas">📊 Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="postulaciones" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Postulaciones de la Facultad</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Práctica</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postulaciones?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay postulaciones registradas
                      </TableCell>
                    </TableRow>
                  ) : (
                    postulaciones?.map((post: any) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">
                          {post.estudiante?.usuario?.nombre_completo}
                        </TableCell>
                        <TableCell>{post.oferta?.titulo}</TableCell>
                        <TableCell>{post.oferta?.empresa?.razon_social}</TableCell>
                        <TableCell>{formatDate(post.fecha_postulacion)}</TableCell>
                        <TableCell>{getEstadoBadge(post.estado)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVerDetalles(post.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalles
                          </Button>
                          <Link href={`/dashboard/internships/${post.oferta_id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Oferta
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tesis" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Proyectos de Tesis de la Facultad</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Asesor</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tesis?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No hay proyectos de tesis registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    tesis?.map((proyecto: any) => (
                      <TableRow key={proyecto.id}>
                        <TableCell className="font-medium">{proyecto.titulo}</TableCell>
                        <TableCell>{proyecto.estudiante?.usuario?.nombre_completo}</TableCell>
                        <TableCell>{proyecto.asesor?.usuario?.nombre_completo}</TableCell>
                        <TableCell>{formatDate(proyecto.fecha_registro)}</TableCell>
                        <TableCell>{getEstadoBadge(proyecto.estado)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/thesis/${proyecto.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Postulaciones Aprobadas</span>
                    <Badge className="bg-green-500">
                      {postulaciones?.filter(p => p.estado === 'aprobada').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Postulaciones Pendientes</span>
                    <Badge className="bg-yellow-500">
                      {postulaciones?.filter(p => p.estado === 'pendiente').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Postulaciones Rechazadas</span>
                    <Badge variant="destructive">
                      {postulaciones?.filter(p => p.estado === 'rechazada').length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tesis por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Tesis en Curso</span>
                    <Badge className="bg-blue-500">
                      {tesis?.filter(t => t.estado === 'en_curso').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tesis Sustentadas</span>
                    <Badge className="bg-purple-500">
                      {tesis?.filter(t => t.estado === 'sustentada').length || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tesis Finalizadas</span>
                    <Badge className="bg-green-500">
                      {tesis?.filter(t => t.estado === 'finalizada').length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para detalles del postulante */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Postulante</DialogTitle>
          </DialogHeader>
          {selectedPostulante && (
            <div className="space-y-4">
              {/* Datos del Estudiante */}
              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Información del Estudiante</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-semibold">Nombre:</p>
                    <p>{selectedPostulante.estudiante?.usuario?.nombre_completo}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Código:</p>
                    <p>{selectedPostulante.estudiante?.codigo_univ}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{selectedPostulante.estudiante?.usuario?.correo}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Carrera:</p>
                    <p>{selectedPostulante.estudiante?.carrera?.nombre}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Ciclo:</p>
                    <p>{selectedPostulante.estudiante?.ciclo}</p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              {(selectedPostulante.curriculum_url || selectedPostulante.carta_presentacion_url) && (
                <div className="border-b pb-4">
                  <h3 className="font-bold mb-2">Documentos</h3>
                  <div className="space-y-2">
                    {selectedPostulante.curriculum_url && (
                      <a 
                        href={selectedPostulante.curriculum_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Ver Curriculum
                      </a>
                    )}
                    {selectedPostulante.carta_presentacion_url && (
                      <a 
                        href={selectedPostulante.carta_presentacion_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Ver Carta de Presentación
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Oferta */}
              <div className="border-b pb-4">
                <h3 className="font-bold mb-2">Oferta de Práctica</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-semibold">Título:</p>
                    <p>{selectedPostulante.oferta?.titulo}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Empresa:</p>
                    <p>{selectedPostulante.oferta?.empresa?.razon_social}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Duración:</p>
                    <p>{selectedPostulante.oferta?.duracion_semanas} semanas</p>
                  </div>
                  <div>
                    <p className="font-semibold">Vacantes:</p>
                    <p>{selectedPostulante.oferta?.vacantes || 0}</p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {selectedPostulante.estado === 'pendiente' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="docente-select">Asignar Docente Asesor</Label>
                    <select
                      id="docente-select"
                      value={selectedDocente}
                      onChange={(e) => setSelectedDocente(e.target.value)}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="">Selecciona un docente...</option>
                      {docentes?.map((doc: any) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.usuario?.nombre_completo} ({doc.especialidad})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="destructive"
                      onClick={handleRechazar}
                      disabled={rechazarPostulanteMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button 
                      onClick={handleAprobar}
                      disabled={!selectedDocente || aprobarPostulanteMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              )}

              {selectedPostulante.estado === 'aprobada' && (
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-green-700 font-semibold">✓ Postulante Aprobado</p>
                  {selectedPostulante.asesores?.length > 0 && (
                    <p className="text-sm mt-1">
                      Asesor: {selectedPostulante.asesores[0]?.docente?.usuario?.nombre_completo}
                    </p>
                  )}
                </div>
              )}

              {selectedPostulante.estado === 'rechazada' && (
                <div className="bg-red-50 p-3 rounded">
                  <p className="text-red-700 font-semibold">✗ Postulante Rechazado</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}