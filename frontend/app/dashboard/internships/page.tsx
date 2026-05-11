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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Eye, Clock, Building2, Calendar, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

interface Oferta {
  id: string;
  titulo: string;
  empresa?: { id: string; razon_social: string };
  descripcion: string;
  requisitos: string;
  fecha_limite_postulacion: string;
  vacantes: number;
  estado: string;
  activo: boolean;
}

interface Empresa {
  id: string;
  razon_social: string;
}

export default function InternshipsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedOfertaId, setSelectedOfertaId] = useState<string | null>(null);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState('');
  const [newOferta, setNewOferta] = useState({ titulo: '', descripcion: '', requisitos: '', fecha_limite_postulacion: '', vacantes: 1 });
  const [editOferta, setEditOferta] = useState({ 
    id: '', 
    titulo: '', 
    descripcion: '', 
    requisitos: '', 
    fecha_limite_postulacion: '',  // 👈 Asegurar que sea string vacío inicialmente
    vacantes: 1, 
    estado: 'abierta' 
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'COORDINADOR';
  const isRepresentante = user.rol === 'REPRESENTANTE_EMPRESA';

  const { data: empresas } = trpc.companies.getEmpresas.useQuery(undefined, { enabled: isAdmin });
  const { data: ofertas = [], refetch } = trpc.internships.getOfertas.useQuery();
  const { data: misPostulaciones } = trpc.internships.getPostulacionesByEstudiante.useQuery(
    { estudianteId: user.estudiante?.id || '' }, { enabled: !!user.estudiante?.id }
  );

  // Update editOferta when ofertas changes (to show fresh data if modal is still open)
  useEffect(() => {
    if (showEditDialog && editOferta.id) {
      const updatedOferta = (ofertas as Oferta[]).find(o => o.id === editOferta.id);
      if (updatedOferta) {
        handleEditOferta(updatedOferta);
      }
    }
  }, [ofertas, showEditDialog, editOferta.id]);

  const createOfertaMutation = trpc.internships.createOferta.useMutation({
    onSuccess: () => { toast.success('Oferta creada'); setShowCreateDialog(false); refetch(); setNewOferta({ titulo: '', descripcion: '', requisitos: '', fecha_limite_postulacion: '', vacantes: 1 }); },
    onError: (error) => toast.error(error.message),
  });

  const updateOfertaMutation = trpc.internships.updateOferta.useMutation({
    onSuccess: () => { 
      toast.success('Oferta actualizada'); 
      refetch(); // Refresh the list
      setShowEditDialog(false); // Close modal
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteOfertaMutation = trpc.internships.deleteOferta.useMutation({
    onSuccess: () => { toast.success('Oferta eliminada'); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const handleCreateOferta = () => {
    if (!newOferta.titulo || !newOferta.descripcion || !newOferta.requisitos || !newOferta.fecha_limite_postulacion) {
      toast.error('Complete los campos obligatorios'); return;
    }
    if (isAdmin && !selectedEmpresaId) { toast.error('Seleccione una empresa'); return; }
    createOfertaMutation.mutate({ ...newOferta, empresa_id: selectedEmpresaId || user.representante?.empresa_id });
  };

  const handleEditOferta = (oferta: Oferta) => {
    setSelectedOfertaId(oferta.id);
    
    // Manejar la fecha correctamente (puede ser string o Date)
    let fechaStr = '';
    if (oferta.fecha_limite_postulacion) {
      if (typeof oferta.fecha_limite_postulacion === 'string') {
        fechaStr = oferta.fecha_limite_postulacion.split('T')[0];
      } else if (typeof oferta.fecha_limite_postulacion === 'object') {
        // Si es un objeto Date
        fechaStr = new Date(oferta.fecha_limite_postulacion).toISOString().split('T')[0];
      }
    }
    
    setEditOferta({
      id: oferta.id,
      titulo: oferta.titulo,
      descripcion: oferta.descripcion,
      requisitos: oferta.requisitos,
      fecha_limite_postulacion: fechaStr,
      vacantes: oferta.vacantes,
      estado: oferta.estado,
    });
    setShowEditDialog(true);
  };

  const handleUpdateOferta = () => {
    updateOfertaMutation.mutate({ id: editOferta.id, data: editOferta });
  };

  const handleDeleteOferta = (id: string) => {
    if (confirm('¿Eliminar esta oferta?')) {
      deleteOfertaMutation.mutate({ id });
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  // Contar ofertas con activo true y false
  const totalOfertas = ofertas.length;
  const ofertasActivas = ofertas.filter(o => o.activo !== false).length;

  const filteredOfertas = (ofertas as Oferta[]).filter(o => 
    o.activo !== false && (o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.empresa?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-foreground">Prácticas Preprofesionales</h1><p className="text-gray-500">Gestión de ofertas y postulaciones</p></div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm">Total Ofertas</p><p className="text-2xl font-bold">{totalOfertas}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Ofertas Activas</p><p className="text-2xl font-bold text-green-600">{ofertasActivas}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Mis Postulaciones</p><p className="text-2xl font-bold text-purple-600">{misPostulaciones?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Buscar ofertas..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Ofertas de Práctica</CardTitle></CardHeader><CardContent>
        <Tabs defaultValue="todas"><TabsList><TabsTrigger value="todas">Todas</TabsTrigger><TabsTrigger value="activas">Activas</TabsTrigger><TabsTrigger value="mis-postulaciones">Mis Postulaciones</TabsTrigger></TabsList>
          <TabsContent value="todas">
            <Table><TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Empresa</TableHead><TableHead>Fecha Límite</TableHead><TableHead>Vacantes</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>{filteredOfertas.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.titulo}</TableCell>
                  <TableCell>{o.empresa?.razon_social}</TableCell>
                  <TableCell>{formatDate(o.fecha_limite_postulacion)}</TableCell>
                  <TableCell>{o.vacantes}</TableCell>
                  <TableCell><Badge className={o.estado === 'abierta' ? 'bg-green-500' : 'bg-gray-500'}>{o.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/internships/${o.id}`)}><Eye className="h-4 w-4" /></Button>
                      {(isAdmin || isRepresentante) && <Button variant="ghost" size="sm" onClick={() => handleEditOferta(o)}><Edit className="h-4 w-4" /></Button>}
                      {(isAdmin || isRepresentante) && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteOferta(o.id)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="activas">
            <Table><TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Empresa</TableHead><TableHead>Fecha Límite</TableHead><TableHead>Vacantes</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>{filteredOfertas.filter(o => o.estado === 'abierta').map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.titulo}</TableCell>
                  <TableCell>{o.empresa?.razon_social}</TableCell>
                  <TableCell>{formatDate(o.fecha_limite_postulacion)}</TableCell>
                  <TableCell>{o.vacantes}</TableCell>
                  <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/internships/${o.id}`)}>Ver Detalles</Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="mis-postulaciones">
            <Table><TableHeader><TableRow><TableHead>Oferta</TableHead><TableHead>Empresa</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>{misPostulaciones?.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.oferta?.titulo}</TableCell>
                  <TableCell>{p.oferta?.empresa?.razon_social}</TableCell>
                  <TableCell>{formatDate(p.fecha_postulacion)}</TableCell>
                  <TableCell><Badge className={p.estado === 'aprobada' ? 'bg-green-500' : p.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'}>{p.estado}</Badge></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/internships/${p.oferta_id}`)}><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent></Card>

      {/* Modal Editar Oferta */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">✏️ Editar Oferta</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">📌 Título</Label>
              <Input value={editOferta.titulo} onChange={(e) => setEditOferta({ ...editOferta, titulo: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">📝 Descripción</Label>
              <Textarea rows={2} value={editOferta.descripcion} onChange={(e) => setEditOferta({ ...editOferta, descripcion: e.target.value })} className="resize-none" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">✅ Requisitos</Label>
              <Textarea rows={2} value={editOferta.requisitos} onChange={(e) => setEditOferta({ ...editOferta, requisitos: e.target.value })} className="resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">📅 Fecha Límite</Label>
                <Input type="date" value={editOferta.fecha_limite_postulacion} onChange={(e) => setEditOferta({ ...editOferta, fecha_limite_postulacion: e.target.value })} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">👥 Vacantes</Label>
                <Input type="number" min="1" value={editOferta.vacantes} onChange={(e) => setEditOferta({ ...editOferta, vacantes: parseInt(e.target.value) })} className="h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">📊 Estado</Label>
              <Select value={editOferta.estado} onValueChange={(value) => setEditOferta({ ...editOferta, estado: value })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="abierta">Abierta</SelectItem>
                  <SelectItem value="cerrada">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1 h-9">
                Cancelar
              </Button>
              <Button onClick={handleUpdateOferta} className="flex-1 h-9 bg-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}