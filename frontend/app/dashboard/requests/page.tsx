'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Clock, Users, Mail, User, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function RequestsPage() {
  const [filtro, setFiltro] = useState('todos');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMINISTRADOR';

  const { data: solicitudes = [], refetch } = trpc.solicitudes.getSolicitudes.useQuery({ filtro: filtro !== 'todos' ? filtro : undefined });
  const { data: estadisticas } = trpc.solicitudes.getEstadisticas.useQuery();
  
  const updateSolicitudMutation = trpc.solicitudes.updateSolicitud.useMutation({
    onSuccess: () => {
      toast.success('Solicitud actualizada exitosamente');
      setShowDetailDialog(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleUpdateSolicitud = () => {
    if (!selectedRequest) return;
    updateSolicitudMutation.mutate({
      id: selectedRequest.id,
      data: { estado: estadoSeleccionado, observaciones },
      adminId: user.id,
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'aprobado': return <Badge className="bg-green-500">Aprobado</Badge>;
      case 'rechazado': return <Badge variant="destructive">Rechazado</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case 'ESTUDIANTE': return <Badge variant="outline" className="border-blue-500 text-blue-600">Estudiante</Badge>;
      case 'DOCENTE': return <Badge variant="outline" className="border-green-500 text-green-600">Docente</Badge>;
      case 'COORDINADOR': return <Badge variant="outline" className="border-purple-500 text-purple-600">Coordinador</Badge>;
      case 'REPRESENTANTE_EMPRESA': return <Badge variant="outline" className="border-orange-500 text-orange-600">Rep. Empresa</Badge>;
      default: return <Badge variant="outline">{rol}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Solicitudes de Registro</h1>
        <p className="text-gray-500">Gestiona las solicitudes de nuevos usuarios</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Pendientes</p><p className="text-2xl font-bold text-yellow-600">{estadisticas?.pendientes || 0}</p></div>
              <div className="p-3 bg-yellow-100 rounded-full"><Clock className="h-6 w-6 text-yellow-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Aprobadas</p><p className="text-2xl font-bold text-green-600">{estadisticas?.aprobados || 0}</p></div>
              <div className="p-3 bg-green-100 rounded-full"><FileText className="h-6 w-6 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Rechazadas</p><p className="text-2xl font-bold text-red-600">{estadisticas?.rechazados || 0}</p></div>
              <div className="p-3 bg-red-100 rounded-full"><FileText className="h-6 w-6 text-red-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold text-blue-600">{estadisticas?.total || 0}</p></div>
              <div className="p-3 bg-blue-100 rounded-full"><Users className="h-6 w-6 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="text-sm">Filtrar:</Label>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobado">Aprobados</SelectItem>
                <SelectItem value="rechazado">Rechazados</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 ml-auto">Mostrando {solicitudes.length} solicitudes</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Solicitudes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitante</TableHead><TableHead>Contacto</TableHead><TableHead>Rol</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500">No hay solicitudes</TableCell></TableRow>
              ) : (
                solicitudes.map((solicitud: any) => (
                  <TableRow key={solicitud.id}>
                    <TableCell className="font-medium">{solicitud.nombre_completo}</TableCell>
                    <TableCell>{solicitud.correo}</TableCell>
                    <TableCell>{getRolBadge(solicitud.rol_solicitado)}</TableCell>
                    <TableCell className="text-sm">{formatDate(solicitud.fecha_solicitud)}</TableCell>
                    <TableCell>{getEstadoBadge(solicitud.estado)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedRequest(solicitud); setEstadoSeleccionado(solicitud.estado); setObservaciones(solicitud.observaciones || ''); setShowDetailDialog(true); }}>
                        <Eye className="h-4 w-4 mr-1" /> Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalle de Solicitud</DialogTitle></DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-gray-500">Nombre</p><p className="font-medium">{selectedRequest.nombre_completo}</p></div>
                  <div><p className="text-xs text-gray-500">Correo</p><p className="font-medium">{selectedRequest.correo}</p></div>
                  <div><p className="text-xs text-gray-500">Rol</p>{getRolBadge(selectedRequest.rol_solicitado)}</div>
                  <div><p className="text-xs text-gray-500">Fecha</p><p className="text-sm">{formatDate(selectedRequest.fecha_solicitud)}</p></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Estado actual:</span>
                {getEstadoBadge(selectedRequest.estado)}
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Cambiar estado</Label>
                  <Select value={estadoSeleccionado} onValueChange={setEstadoSeleccionado} disabled={selectedRequest.estado === 'aprobado'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="aprobado">Aprobar</SelectItem>
                      <SelectItem value="rechazado">Rechazar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Observaciones</Label>
                  <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Motivo o comentario..." rows={2} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="flex-1">Cancelar</Button>
                <Button onClick={handleUpdateSolicitud} className="flex-1 bg-blue-600">Guardar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}