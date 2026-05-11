'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Briefcase, Users, FileText, Plus, 
  Eye, CheckCircle, XCircle, Calendar, Clock, FileSignature
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function CompanyDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConveniosModal, setShowConveniosModal] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const [newOferta, setNewOferta] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    fecha_limite_postulacion: '',
    vacantes: 1,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, []);

  // Obtener la empresa del representante actual
  const { data: miEmpresa } = trpc.companies.getMyCompany.useQuery();
  const { data: ofertas = [], refetch: refetchOfertas } = trpc.internships.getOfertas.useQuery();

  // Obtener ofertas de mi empresa
  const misOfertas = (ofertas as any[]).filter(o => o.empresa_id === miEmpresa?.id);

  const createOfertaMutation = trpc.internships.createOferta.useMutation({
    onSuccess: () => {
      toast.success('Oferta creada exitosamente');
      setShowCreateDialog(false);
      refetchOfertas();
      setNewOferta({ titulo: '', descripcion: '', requisitos: '', fecha_limite_postulacion: '', vacantes: 1 });
    },
    onError: (error) => toast.error(error.message),
  });

  const updatePostulacionEstadoMutation = trpc.internships.updatePostulacionEstado.useMutation({
    onSuccess: () => {
      toast.success('Estado actualizado');
      refetchOfertas();
    },
    onError: (error) => toast.error(error.message),
  });

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const handleCreateOferta = () => {
    if (!newOferta.titulo || !newOferta.descripcion || !newOferta.requisitos || !newOferta.fecha_limite_postulacion) {
      toast.error('Complete todos los campos');
      return;
    }
    if (!miEmpresa?.id) {
      toast.error('No hay empresa asociada');
      return;
    }
    createOfertaMutation.mutate({
      ...newOferta,
      empresa_id: miEmpresa.id,
    });
  };

  const handleViewConvenios = () => {
    setSelectedEmpresa(miEmpresa);
    setShowConveniosModal(true);
  };

  const getEstadoBadge = (estado: string, fechaInicio?: string, fechaFin?: string) => {
    if (!fechaInicio || !fechaFin) {
      if (estado === 'activo') return <Badge className="bg-green-500">Activo</Badge>;
      if (estado === 'pendiente') return <Badge className="bg-yellow-500">Pendiente</Badge>;
      if (estado === 'vencido') return <Badge variant="destructive">Vencido</Badge>;
      return <Badge variant="outline">{estado}</Badge>;
    }
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (hoy < inicio) return <Badge className="bg-yellow-500">Pendiente</Badge>;
    if (hoy >= inicio && hoy <= fin) return <Badge className="bg-green-500">Activo</Badge>;
    return <Badge variant="destructive">Vencido</Badge>;
  };

  const totalOfertas = misOfertas?.length || 0;
  const ofertasActivas = misOfertas?.filter(o => o.estado === 'abierta').length || 0;
  const totalPostulaciones = misOfertas?.reduce((acc, o) => acc + (o.postulaciones?.length || 0), 0) || 0;
  const conveniosActivos = miEmpresa?.convenios?.filter((c: any) => 
    new Date(c.fecha_inicio) <= new Date() && new Date(c.fecha_fin) >= new Date()
  ).length || 0;

  if (!miEmpresa) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold">No se encontró empresa asociada</h2>
          <p className="text-gray-500 mt-2">Tu cuenta no está vinculada a ninguna empresa. Contacta al administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Empresa</h1>
        <p className="text-muted-foreground">
          {miEmpresa?.razon_social || 'Cargando...'} - {user?.representante?.cargo || 'Representante'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ofertas Activas</p>
                <p className="text-2xl font-bold">{ofertasActivas}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900/30">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Ofertas</p>
                <p className="text-2xl font-bold">{totalOfertas}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full dark:bg-purple-900/30">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Postulaciones</p>
                <p className="text-2xl font-bold">{totalPostulaciones}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/30">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Convenios Activos</p>
                <p className="text-2xl font-bold">{conveniosActivos}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewConvenios} className="ml-2">
                <FileSignature className="h-4 w-4 mr-1" />
                Ver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón Nueva Oferta */}
      <div className="flex justify-end">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Oferta de Práctica</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={newOferta.titulo}
                  onChange={(e) => setNewOferta({ ...newOferta, titulo: e.target.value })}
                  placeholder="Ej: Desarrollador Web"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={newOferta.descripcion}
                  onChange={(e) => setNewOferta({ ...newOferta, descripcion: e.target.value })}
                  placeholder="Descripción del puesto..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Requisitos</Label>
                <Textarea
                  value={newOferta.requisitos}
                  onChange={(e) => setNewOferta({ ...newOferta, requisitos: e.target.value })}
                  placeholder="Requisitos del puesto..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Límite</Label>
                  <Input
                    type="date"
                    value={newOferta.fecha_limite_postulacion}
                    onChange={(e) => setNewOferta({ ...newOferta, fecha_limite_postulacion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vacantes</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newOferta.vacantes}
                    onChange={(e) => setNewOferta({ ...newOferta, vacantes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateOferta} className="w-full bg-blue-600 hover:bg-blue-700">
                Publicar Oferta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ofertas">
        <TabsList>
          <TabsTrigger value="ofertas">📋 Mis Ofertas</TabsTrigger>
          <TabsTrigger value="postulantes">👥 Postulantes</TabsTrigger>
          <TabsTrigger value="convenios">📄 Convenios</TabsTrigger>
        </TabsList>

        {/* Ofertas */}
        <TabsContent value="ofertas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas Publicadas</CardTitle>
            </CardHeader>
            <CardContent>
              {misOfertas?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No has publicado ninguna oferta
                </div>
              ) : (
                <div className="space-y-3">
                  {misOfertas?.map((oferta: any) => (
                    <div key={oferta.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{oferta.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{oferta.descripcion}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Límite: {formatDate(oferta.fecha_limite_postulacion)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Vacantes: {oferta.vacantes}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Postulaciones: {oferta.postulaciones?.length || 0}
                            </span>
                          </div>
                        </div>
                        <Badge className={oferta.estado === 'abierta' ? 'bg-green-500' : 'bg-gray-500'}>
                          {oferta.estado === 'abierta' ? 'Activa' : 'Cerrada'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Postulantes */}
        <TabsContent value="postulantes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Postulantes</CardTitle>
            </CardHeader>
            <CardContent>
              {misOfertas?.filter((o: any) => o.postulaciones?.length > 0).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay postulaciones aún
                </div>
              ) : (
                <div className="space-y-6">
                  {misOfertas?.filter((o: any) => o.postulaciones?.length > 0).map((oferta: any) => (
                    <div key={oferta.id} className="border rounded-lg">
                      <div className="bg-muted p-3 rounded-t-lg">
                        <h3 className="font-semibold">{oferta.titulo}</h3>
                      </div>
                      <div className="p-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Estudiante</TableHead>
                              <TableHead>Código</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {oferta.postulaciones.map((post: any) => (
                              <TableRow key={post.id}>
                                <TableCell className="font-medium">
                                  {post.estudiante?.usuario?.nombre_completo}
                                </TableCell>
                                <TableCell>{post.estudiante?.codigo_univ}</TableCell>
                                <TableCell>{formatDate(post.fecha_postulacion)}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    post.estado === 'aprobada' ? 'bg-green-500' :
                                    post.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'
                                  }>
                                    {post.estado === 'aprobada' ? 'Aprobada' :
                                     post.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  {post.estado === 'pendiente' && (
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600"
                                        onClick={() => updatePostulacionEstadoMutation.mutate({ id: post.id, estado: 'aprobada' })}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Aprobar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600"
                                        onClick={() => updatePostulacionEstadoMutation.mutate({ id: post.id, estado: 'rechazada' })}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Rechazar
                                      </Button>
                                    </div>
                                  )}
                                  {post.curriculum_url && (
                                    <a 
                                      href={post.curriculum_url} 
                                      target="_blank" 
                                      className="text-blue-600 text-sm hover:underline ml-2"
                                    >
                                      Ver CV
                                    </a>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convenios */}
        <TabsContent value="convenios" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Convenios de la Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {miEmpresa?.convenios && miEmpresa.convenios.length > 0 ? (
                <div className="space-y-3">
                  {miEmpresa.convenios.map((convenio: any) => (
                    <div key={convenio.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileSignature className="h-5 w-5 text-blue-500" />
                            <span className="font-semibold text-lg">{convenio.tipo}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-gray-500">Fecha Inicio</p>
                              <p className="font-medium">{formatDate(convenio.fecha_inicio)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Fecha Fin</p>
                              <p className="font-medium">{formatDate(convenio.fecha_fin)}</p>
                            </div>
                          </div>
                        </div>
                        {getEstadoBadge(convenio.estado, convenio.fecha_inicio, convenio.fecha_fin)}
                      </div>
                      {convenio.archivo_url && (
                        <div className="mt-3">
                          <a href={convenio.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                            📄 Ver Documento del Convenio
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSignature className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay convenios registrados para esta empresa</p>
                  <p className="text-sm mt-1">Los convenios aparecerán aquí cuando se establezcan con la universidad.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Convenios (detalle) */}
      <Dialog open={showConveniosModal} onOpenChange={setShowConveniosModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Convenios - {selectedEmpresa?.razon_social}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEmpresa?.convenios && selectedEmpresa.convenios.length > 0 ? (
              selectedEmpresa.convenios.map((convenio: any) => (
                <div key={convenio.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileSignature className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-lg">{convenio.tipo}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                        <div>
                          <p className="text-gray-500">Fecha Inicio</p>
                          <p className="font-medium">{formatDate(convenio.fecha_inicio)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fecha Fin</p>
                          <p className="font-medium">{formatDate(convenio.fecha_fin)}</p>
                        </div>
                      </div>
                    </div>
                    {getEstadoBadge(convenio.estado, convenio.fecha_inicio, convenio.fecha_fin)}
                  </div>
                  {convenio.archivo_url && (
                    <div className="mt-3">
                      <a href={convenio.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
                        📄 Ver Documento
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileSignature className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No hay convenios registrados</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}