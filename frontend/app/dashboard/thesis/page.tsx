'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, Search, Eye, FileText, Calendar, Users, 
  BookOpen, CheckCircle, Clock, AlertCircle, UserCheck, FileSignature, 
  Award, Download, Upload, X, Save, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

interface Tesis {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_registro: string;
  estudiante: { usuario: { nombre_completo: string }; codigo_univ: string };
  asesor: { usuario: { nombre_completo: string } };
  entregables?: any[];
  jurados?: any[];
  sustentacion?: any;
}

export default function ThesisPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showJuradoDialog, setShowJuradoDialog] = useState(false);
  const [showEntregableDialog, setShowEntregableDialog] = useState(false);
  const [showSustentacionDialog, setShowSustentacionDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTesis, setSelectedTesis] = useState<Tesis | null>(null);
  const [selectedTesisId, setSelectedTesisId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('entregables');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEditSustentacionDialog, setShowEditSustentacionDialog] = useState(false);
  const [editSustentacion, setEditSustentacion] = useState({ fecha_hora: '', lugar: '', resultado: '', acta_url: '' });
  
  const [newTesis, setNewTesis] = useState({ titulo: '', descripcion: '', estudiante_id: '', asesor_id: '' });
  const [editTesis, setEditTesis] = useState({ id: '', titulo: '', descripcion: '', estado: '' });
  const [newEntregable, setNewEntregable] = useState({ titulo: '', descripcion: '', fecha_limite: '' });
  const [newJurado, setNewJurado] = useState({ docente_id: '', cargo: 'Vocal' });
  const [sustentacion, setSustentacion] = useState({ fecha_hora: '', lugar: '', resultado: '', acta_url: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'COORDINADOR';
  const isDocente = user.rol === 'DOCENTE';
  const handleEdit = (tesis: Tesis) => {
    setEditTesis({ 
      id: tesis.id, 
      titulo: tesis.titulo, 
      descripcion: tesis.descripcion, 
      estado: tesis.estado 
    });
    setShowEditDialog(true);
  };

  // Queries
  const { data: tesis = [], refetch } = trpc.thesis.getProyectos.useQuery();
  const { data: estudiantes } = trpc.estudiantes.getEstudiantes.useQuery();
  const { data: docentes = [] } = trpc.users.getUsuariosByRol.useQuery({ rol: 'DOCENTE' });

  // Función para refrescar datos en tiempo real
  const refreshData = async () => {
    setIsRefreshing(true);
    await refetch();
    if (selectedTesis) {
      const updatedTesis = (tesis as Tesis[]).find(t => t.id === selectedTesis.id);
      if (updatedTesis) setSelectedTesis(updatedTesis);
    }
    setIsRefreshing(false);
  };

  // Mutations con auto-refresh
  const createTesisMutation = trpc.thesis.createProyecto.useMutation({
    onSuccess: () => { toast.success('Proyecto registrado'); setShowCreateDialog(false); refreshData(); },
    onError: (error) => toast.error(error.message),
  });

  const updateTesisMutation = trpc.thesis.updateProyecto.useMutation({
    onSuccess: () => { 
      toast.success('Proyecto actualizado'); 
      setShowEditDialog(false); 
      refreshData(); 
    },
    onError: (error) => { 
      console.error('Error:', error);
      toast.error(error.message); 
    },
  });

  const addEntregableMutation = trpc.thesis.addEntregable.useMutation({
    onSuccess: () => { toast.success('Entregable registrado'); setShowEntregableDialog(false); setNewEntregable({ titulo: '', descripcion: '', fecha_limite: '' }); refreshData(); },
    onError: (error) => toast.error(error.message),
  });

  const addJuradoMutation = trpc.thesis.addJurado.useMutation({
    onSuccess: () => { toast.success('Jurado asignado'); setShowJuradoDialog(false); setNewJurado({ docente_id: '', cargo: 'Vocal' }); refreshData(); },
    onError: (error) => toast.error(error.message),
  });

  const registrarSustentacionMutation = trpc.thesis.registrarSustentacion.useMutation({
    onSuccess: () => { 
      toast.success('Sustentación guardada'); 
      setShowSustentacionDialog(false); 
      setShowEditSustentacionDialog(false);
      setSustentacion({ fecha_hora: '', lugar: '', resultado: '', acta_url: '' });
      setEditSustentacion({ fecha_hora: '', lugar: '', resultado: '', acta_url: '' });
      refreshData(); 
    },
    onError: (error) => toast.error(error.message),
  });

  // Actualizar entregable (cambiar estado)
  const updateEntregableMutation = trpc.thesis.updateEntregable.useMutation({
    onSuccess: () => { toast.success('Entregable actualizado'); refreshData(); },
    onError: (error) => toast.error(error.message),
  });

  // Eliminar jurado
  const deleteJuradoMutation = trpc.thesis.deleteJurado.useMutation({
    onSuccess: () => { toast.success('Jurado eliminado'); refreshData(); },
    onError: (error) => toast.error(error.message),
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'propuesta': return <Badge className="bg-yellow-500">📝 Propuesta</Badge>;
      case 'en_curso': return <Badge className="bg-blue-500">🔄 En Curso</Badge>;
      case 'sustentada': return <Badge className="bg-purple-500">✅ Sustentada</Badge>;
      case 'finalizada': return <Badge className="bg-green-500">🎓 Finalizada</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getEntregableEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Badge variant="destructive">⏳ Pendiente</Badge>;
      case 'entregado': return <Badge variant="destructive">📤 Entregado</Badge>;
      case 'observado': return <Badge variant="destructive">⚠️ Observado</Badge>;
      case 'aprobado': return <Badge variant="destructive">✅ Aprobado</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');

  const isTesisFinalizada = selectedTesis?.estado === 'finalizada';

  const filteredTesis = (tesis as Tesis[]).filter(t => 
    t.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.estudiante?.usuario?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdate = () => {
    if (editTesis.estado === 'finalizada') {
      if (confirm('⚠️ ¿Estás seguro de marcar esta tesis como FINALIZADA?\n\nUna vez finalizada, no podrás editarla nuevamente.')) {
        updateTesisMutation.mutate({ id: editTesis.id, data: editTesis });
      }
    } else {
      updateTesisMutation.mutate({ id: editTesis.id, data: editTesis });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Tesis</h1>
          <p className="text-gray-500">Registro, seguimiento, jurados, entregables y sustentación</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          {(isAdmin || isDocente) && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600"><Plus className="h-4 w-4 mr-2" />Registrar Tesis</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>📝 Registrar Nuevo Proyecto de Tesis</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>📌 Título *</Label><Input placeholder="Título de la tesis" value={newTesis.titulo} onChange={(e) => setNewTesis({ ...newTesis, titulo: e.target.value })} /></div>
                  <div className="space-y-2"><Label>📝 Descripción</Label><Textarea placeholder="Resumen del proyecto" rows={3} value={newTesis.descripcion} onChange={(e) => setNewTesis({ ...newTesis, descripcion: e.target.value })} /></div>
                  <div className="space-y-2"><Label>👨‍🎓 Estudiante *</Label><Select value={newTesis.estudiante_id} onValueChange={(v) => setNewTesis({ ...newTesis, estudiante_id: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(estudiantes as any[])?.map(e => <SelectItem key={e.id} value={e.id}>{e.usuario?.nombre_completo} ({e.codigo_univ})</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-2"><Label>👨‍🏫 Asesor *</Label><Select value={newTesis.asesor_id} onValueChange={(v) => setNewTesis({ ...newTesis, asesor_id: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(docentes as any[])?.map(d => <SelectItem key={d.id} value={d.id}>{d.usuario?.nombre_completo}</SelectItem>)}</SelectContent></Select></div>
                  <Button onClick={() => createTesisMutation.mutate(newTesis)} className="w-full">✅ Registrar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="pt-6"><p className="text-sm">Total Tesis</p><p className="text-2xl font-bold">{tesis.length}</p></CardContent></Card>
        <Card className="border-l-4 border-l-yellow-500"><CardContent className="pt-6"><p className="text-sm">En Propuesta</p><p className="text-2xl font-bold text-yellow-600">{tesis.filter(t => t.estado === 'propuesta').length}</p></CardContent></Card>
        <Card className="border-l-4 border-l-blue-500"><CardContent className="pt-6"><p className="text-sm">En Curso</p><p className="text-2xl font-bold text-blue-600">{tesis.filter(t => t.estado === 'en_curso').length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" /><Input placeholder="Buscar..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></CardContent></Card>
      </div>

      {/* Lista de Tesis */}
      <Card><CardHeader><CardTitle>📋 Proyectos de Tesis</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Estudiante</TableHead><TableHead>Asesor</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>{filteredTesis.map(t => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.titulo}</TableCell>
              <TableCell>{t.estudiante?.usuario?.nombre_completo}</TableCell>
              <TableCell>{t.asesor?.usuario?.nombre_completo}</TableCell>
              <TableCell>{formatDate(t.fecha_registro)}</TableCell>
              <TableCell>{getEstadoBadge(t.estado)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedTesis(t); setShowDetailDialog(true); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {(isAdmin || isDocente) && t.estado !== 'finalizada' && (
                    <Button variant="ghost" size="sm" onClick={() => { 
                      setEditTesis({ id: t.id, titulo: t.titulo, descripcion: t.descripcion, estado: t.estato }); 
                      setShowEditDialog(true); 
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>

      {/* Modal Editar Tesis */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>✏️ Editar Tesis</DialogTitle></DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input 
                placeholder="Título" 
                value={editTesis.titulo} 
                onChange={(e) => setEditTesis({ ...editTesis, titulo: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea 
                placeholder="Descripción" 
                rows={3} 
                value={editTesis.descripcion} 
                onChange={(e) => setEditTesis({ ...editTesis, descripcion: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={editTesis.estado} onValueChange={(v) => setEditTesis({ ...editTesis, estado: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propuesta">📝 Propuesta</SelectItem>
                  <SelectItem value="en_curso">🔄 En Curso</SelectItem>
                  <SelectItem value="sustentada">✅ Sustentada</SelectItem>
                  <SelectItem value="finalizada">🎓 Finalizada</SelectItem>
                </SelectContent>
              </Select>
              {editTesis.estado === 'finalizada' && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Al marcar como "Finalizada", la tesis quedará bloqueada y no podrá ser editada nuevamente.
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleUpdate} className="flex-1 bg-blue-600">
                💾 Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle Completo con Tabs y Actualización en Tiempo Real */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex justify-between items-center">
              <span>📖 {selectedTesis?.titulo}</span>
              {selectedTesis?.estado === 'finalizada' && <Badge className="bg-green-500">🎓 Tesis Finalizada - Solo Lectura</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selectedTesis && (
            <div className="space-y-6">
              {/* Información General */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500">Estudiante</p><p className="font-medium">{selectedTesis.estudiante?.usuario?.nombre_completo}</p><p className="text-xs text-gray-400">{selectedTesis.estudiante?.codigo_univ}</p></div>
                  <div><p className="text-gray-500">Asesor</p><p className="font-medium">{selectedTesis.asesor?.usuario?.nombre_completo}</p></div>
                  <div><p className="text-gray-500">Fecha Registro</p><p className="font-medium">{formatDate(selectedTesis.fecha_registro)}</p></div>
                  <div><p className="text-gray-500">Estado</p>{getEstadoBadge(selectedTesis.estado)}</div>
                </div>
                <div className="mt-3"><p className="text-gray-500">Descripción</p><p className="text-sm">{selectedTesis.descripcion}</p></div>
              </div>

              {/* Tabs con bloqueo si está finalizada */}
              <Tabs defaultValue="entregables" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="entregables">📋 Entregables</TabsTrigger>
                  <TabsTrigger value="jurados">👥 Jurados</TabsTrigger>
                  <TabsTrigger value="sustentacion">🎓 Sustentación</TabsTrigger>
                </TabsList>

                {/* Entregables */}
                <TabsContent value="entregables" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Avances y Entregables</h3>
                    {(isAdmin || isDocente) && !isTesisFinalizada && (
                      <Dialog open={showEntregableDialog} onOpenChange={setShowEntregableDialog}>
                        <DialogTrigger asChild><Button size="sm" onClick={() => setSelectedTesisId(selectedTesis.id)}><Plus className="h-4 w-4 mr-1" />Agregar Entregable</Button></DialogTrigger>
                        <DialogContent><DialogHeader><DialogTitle>📌 Nuevo Entregable</DialogTitle></DialogHeader>
                          <div className="space-y-4"><Input placeholder="Título" value={newEntregable.titulo} onChange={(e) => setNewEntregable({ ...newEntregable, titulo: e.target.value })} /><Textarea placeholder="Descripción" rows={2} value={newEntregable.descripcion} onChange={(e) => setNewEntregable({ ...newEntregable, descripcion: e.target.value })} /><Input type="date" value={newEntregable.fecha_limite} onChange={(e) => setNewEntregable({ ...newEntregable, fecha_limite: e.target.value })} /><Button onClick={() => addEntregableMutation.mutate({ tesis_id: selectedTesisId!, ...newEntregable })}>Registrar</Button></div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  {selectedTesis.entregables?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500"><FileText className="h-12 w-12 mx-auto mb-3" /><p>No hay entregables registrados</p></div>
                  ) : (
                    <div className="space-y-3">
                      {selectedTesis.entregables?.map((e: any) => (
                        <div key={e.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1"><p className="font-medium">{e.titulo}</p><p className="text-sm text-gray-500">{e.descripcion}</p><p className="text-xs text-gray-400">📅 Límite: {formatDate(e.fecha_limite)}</p></div>
                            <div className="flex items-center gap-2">
                              {!isTesisFinalizada && (isAdmin || isDocente) ? (
                                <Select value={e.estado} onValueChange={(v) => updateEntregableMutation.mutate({ id: e.id, estado: v })}>
                                  <SelectTrigger className="w-32 h-8">{getEntregableEstadoBadge(e.estado)}</SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                                    <SelectItem value="entregado">📤 Entregado</SelectItem>
                                    <SelectItem value="observado">⚠️ Observado</SelectItem>
                                    <SelectItem value="aprobado">✅ Aprobado</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                getEntregableEstadoBadge(e.estado)
                              )}
                            </div>
                          </div>
                          {e.fecha_entrega && <p className="text-xs text-green-600 mt-1">📅 Entregado: {formatDate(e.fecha_entrega)}</p>}
                          {e.archivo_url && <a href={e.archivo_url} target="_blank" className="text-blue-600 text-sm">📎 Ver Documento</a>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Jurados */}
                <TabsContent value="jurados" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Miembros del Jurado</h3>
                    {(isAdmin || isDocente) && !isTesisFinalizada && (
                      <Dialog open={showJuradoDialog} onOpenChange={setShowJuradoDialog}>
                        <DialogTrigger asChild><Button size="sm" onClick={() => setSelectedTesisId(selectedTesis.id)}><Plus className="h-4 w-4 mr-1" />Agregar Jurado</Button></DialogTrigger>
                        <DialogContent><DialogHeader><DialogTitle>👨‍⚖️ Asignar Jurado</DialogTitle></DialogHeader>
                          <div className="space-y-4"><Label>Docente</Label><Select value={newJurado.docente_id} onValueChange={(v) => setNewJurado({ ...newJurado, docente_id: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(docentes as any[])?.map(d => <SelectItem key={d.id} value={d.id}>{d.usuario?.nombre_completo}</SelectItem>)}</SelectContent></Select><Label>Cargo</Label><Select value={newJurado.cargo} onValueChange={(v) => setNewJurado({ ...newJurado, cargo: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Presidente">👑 Presidente</SelectItem><SelectItem value="Secretario">📝 Secretario</SelectItem><SelectItem value="Vocal">🎤 Vocal</SelectItem></SelectContent></Select><Button onClick={() => addJuradoMutation.mutate({ tesis_id: selectedTesisId!, ...newJurado })}>Asignar</Button></div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  {selectedTesis.jurados?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500"><Users className="h-12 w-12 mx-auto mb-3" /><p>No hay jurados asignados</p></div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTesis.jurados?.map((j: any) => (
                        <div key={j.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div><p className="font-medium">{j.docente?.usuario?.nombre_completo}</p><p className="text-sm text-gray-500">Cargo: {j.cargo || 'Vocal'}</p></div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{j.cargo || 'Vocal'}</Badge>
                            {!isTesisFinalizada && (isAdmin || isDocente) && (
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deleteJuradoMutation.mutate({ id: j.id })}><Trash2 className="h-4 w-4" /></Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Sustentación */}
                <TabsContent value="sustentacion" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Información de Sustentación</h3>
                    {(isAdmin || isDocente) && !isTesisFinalizada && !selectedTesis.sustentacion && (
                      <Dialog open={showSustentacionDialog} onOpenChange={setShowSustentacionDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedTesisId(selectedTesis.id)}>
                            <Calendar className="h-4 w-4 mr-1" />Registrar Sustentación
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>🎓 Registrar Sustentación</DialogTitle></DialogHeader>
                          <div className="space-y-4">
                            <Input type="datetime-local" value={sustentacion.fecha_hora} onChange={(e) => setSustentacion({ ...sustentacion, fecha_hora: e.target.value })} placeholder="Fecha y Hora" />
                            <Input placeholder="Lugar" value={sustentacion.lugar} onChange={(e) => setSustentacion({ ...sustentacion, lugar: e.target.value })} />
                            <Select value={sustentacion.resultado} onValueChange={(v) => setSustentacion({ ...sustentacion, resultado: v })}>
                              <SelectTrigger><SelectValue placeholder="Resultado" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aprobado">✅ Aprobado</SelectItem>
                                <SelectItem value="Desaprobado">❌ Desaprobado</SelectItem>
                                <SelectItem value="Aprobado con mención">🏅 Aprobado con mención</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="URL del Acta" value={sustentacion.acta_url} onChange={(e) => setSustentacion({ ...sustentacion, acta_url: e.target.value })} />
                            <Button onClick={() => registrarSustentacionMutation.mutate({ tesis_id: selectedTesisId!, ...sustentacion })}>Registrar</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {selectedTesis.sustentacion ? (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div><p className="text-gray-500">Fecha y Hora</p><p className="font-medium">{formatDate(selectedTesis.sustentacion.fecha_hora)}</p></div>
                        <div><p className="text-gray-500">Lugar</p><p className="font-medium">{selectedTesis.sustentacion.lugar || 'No especificado'}</p></div>
                        <div><p className="text-gray-500">Resultado</p><p className="font-medium text-green-600">{selectedTesis.sustentacion.resultado || 'Pendiente'}</p></div>
                        {selectedTesis.sustentacion.acta_url && <div><p className="text-gray-500">Acta</p><a href={selectedTesis.sustentacion.acta_url} target="_blank" className="text-blue-600">📄 Ver Acta</a></div>}
                      </div>
                      {(isAdmin || isDocente) && !isTesisFinalizada && (
                        <Dialog open={showEditSustentacionDialog} onOpenChange={setShowEditSustentacionDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-3" onClick={() => {
                              setEditSustentacion({
                                fecha_hora: selectedTesis.sustentacion.fecha_hora?.split('T')[0] + 'T' + (selectedTesis.sustentacion.fecha_hora?.split('T')[1] || '00:00'),
                                lugar: selectedTesis.sustentacion.lugar || '',
                                resultado: selectedTesis.sustentacion.resultado || '',
                                acta_url: selectedTesis.sustentacion.acta_url || '',
                              });
                            }}>
                              <Edit className="h-4 w-4 mr-1" />Editar Sustentación
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>✏️ Editar Sustentación</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <Input type="datetime-local" value={editSustentacion.fecha_hora} onChange={(e) => setEditSustentacion({ ...editSustentacion, fecha_hora: e.target.value })} />
                              <Input placeholder="Lugar" value={editSustentacion.lugar} onChange={(e) => setEditSustentacion({ ...editSustentacion, lugar: e.target.value })} />
                              <Select value={editSustentacion.resultado} onValueChange={(v) => setEditSustentacion({ ...editSustentacion, resultado: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Aprobado">✅ Aprobado</SelectItem>
                                  <SelectItem value="Desaprobado">❌ Desaprobado</SelectItem>
                                  <SelectItem value="Aprobado con mención">🏅 Aprobado con mención</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input placeholder="URL del Acta" value={editSustentacion.acta_url} onChange={(e) => setEditSustentacion({ ...editSustentacion, acta_url: e.target.value })} />
                              <Button onClick={() => {
                                registrarSustentacionMutation.mutate({ tesis_id: selectedTesis.id, ...editSustentacion });
                                setShowEditSustentacionDialog(false);
                              }}>Guardar Cambios</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500"><Calendar className="h-12 w-12 mx-auto mb-3" /><p>No hay sustentación registrada</p></div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}