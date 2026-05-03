'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Search, Eye, FileText, RefreshCw, GraduationCap, BookOpen, User, Mail, Briefcase, Building2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

type RolType = 'ESTUDIANTE' | 'DOCENTE' | 'COORDINADOR' | 'REPRESENTANTE_EMPRESA';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRol, setSelectedRol] = useState<RolType>('ESTUDIANTE');
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [facultadesList, setFacultadesList] = useState<any[]>([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'COORDINADOR';

  const { data: usuarios = [], isLoading, refetch } = trpc.users.getUsuariosByRol.useQuery({ rol: selectedRol });
  const { data: estadisticas } = trpc.users.getEstadisticasByRol.useQuery({ rol: selectedRol });
  const { data: carreras } = trpc.carreras.getCarreras.useQuery(undefined, { enabled: selectedRol === 'ESTUDIANTE' });
  const { data: empresas } = trpc.companies.getEmpresas.useQuery(undefined, { enabled: selectedRol === 'REPRESENTANTE_EMPRESA' });
  const { data: facultades } = trpc.facultades.getFacultades.useQuery();

  useEffect(() => {
    console.log('Facultades cargadas:', facultades);
    if (facultades) {
      setFacultadesList(facultades as any[]);
    }
  }, [facultades]);

  const updateMutation = trpc.users.updateUsuario.useMutation({
    onSuccess: () => { toast.success('Actualizado correctamente'); setShowEditDialog(false); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.users.deleteUsuario.useMutation({
    onSuccess: () => { toast.success('Usuario desactivado'); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const reactivarMutation = trpc.users.reactivarUsuario.useMutation({
    onSuccess: () => { toast.success('Usuario reactivado'); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const handleEdit = (usuario: any) => {
    setSelectedUser(usuario);
    if (selectedRol === 'ESTUDIANTE') {
      setEditData({ carrera_id: usuario.carrera_id, ciclo: usuario.ciclo, expediente: usuario.expediente || '' });
    } 
    else if (selectedRol === 'DOCENTE') {
      // Buscar el ID de la facultad por nombre para preseleccionar
      let facultadId = '';
      const facultadNombre = usuario.facultad_nombre || usuario.facultad;
      if (facultadNombre && facultadesList.length > 0) {
        const found = facultadesList.find(f => f.nombre === facultadNombre);
        if (found) facultadId = found.id;
      }
      setEditData({ 
        especialidad: usuario.especialidad || '', 
        facultad_id: facultadId,
        facultad_nombre: facultadNombre 
      });
    } 
    else if (selectedRol === 'COORDINADOR') {
      setEditData({ facultad_id: usuario.facultad_id || '' });
    } 
    else if (selectedRol === 'REPRESENTANTE_EMPRESA') {
      setEditData({ empresa_id: usuario.empresa_id || '', cargo: usuario.cargo || '' });
    }
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    let dataToSend = { ...editData };
    
    // Para docente, convertir facultad_id a nombre si es necesario
    if (selectedRol === 'DOCENTE' && editData.facultad_id) {
      const facultadSeleccionada = facultadesList.find(f => f.id === editData.facultad_id);
      if (facultadSeleccionada) {
        dataToSend.facultad = facultadSeleccionada.nombre;
        delete dataToSend.facultad_id;
      }
    }
    
    updateMutation.mutate({ id: selectedUser?.id, rol: selectedRol, data: dataToSend });
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Desactivar este usuario? Ya no aparecerá en las búsquedas.')) {
      deleteMutation.mutate({ id, rol: selectedRol });
    }
  };

  const handleReactivar = (id: string) => {
    if (confirm('¿Reactivar este usuario?')) {
      reactivarMutation.mutate({ id, rol: selectedRol });
    }
  };

  const handleViewDetail = (usuario: any) => {
    setSelectedUser(usuario);
    setShowDetailDialog(true);
  };

  const getRolIcon = () => {
    switch (selectedRol) {
      case 'ESTUDIANTE': return <GraduationCap className="h-5 w-5" />;
      case 'DOCENTE': return <UserCheck className="h-5 w-5" />;
      case 'COORDINADOR': return <UserCheck className="h-5 w-5" />;
      case 'REPRESENTANTE_EMPRESA': return <Building2 className="h-5 w-5" />;
    }
  };

  const getRolNombre = () => {
    switch (selectedRol) {
      case 'ESTUDIANTE': return 'Estudiantes';
      case 'DOCENTE': return 'Docentes';
      case 'COORDINADOR': return 'Coordinadores';
      case 'REPRESANTE_EMPRESA': return 'Representantes de Empresa';
      default: return 'Usuarios';
    }
  };

  const getColumns = () => {
    switch (selectedRol) {
      case 'ESTUDIANTE': return ['Nombre', 'Email', 'Código', 'Carrera', 'Ciclo', 'Estado', 'Acciones'];
      case 'DOCENTE': return ['Nombre', 'Email', 'Especialidad', 'Facultad', 'Estado', 'Acciones'];
      case 'COORDINADOR': return ['Nombre', 'Email', 'Facultad', 'Estado', 'Acciones'];
      case 'REPRESENTANTE_EMPRESA': return ['Nombre', 'Email', 'Empresa', 'Cargo', 'Estado', 'Acciones'];
    }
  };

  const renderRow = (usuario: any) => {
    switch (selectedRol) {
      case 'ESTUDIANTE':
        return (
          <>
            <TableCell className="font-medium">{usuario.usuario?.nombre_completo}</TableCell>
            <TableCell>{usuario.usuario?.correo}</TableCell>
            <TableCell className="font-mono">{usuario.codigo_univ}</TableCell>
            <TableCell>{usuario.carrera?.nombre}</TableCell>
            <TableCell><Badge variant="outline">Ciclo {usuario.ciclo}</Badge></TableCell>
          </>
        );
      case 'DOCENTE':
        return (
          <>
            <TableCell className="font-medium">{usuario.usuario?.nombre_completo}</TableCell>
            <TableCell>{usuario.usuario?.correo}</TableCell>
            <TableCell>{usuario.especialidad || '--'}</TableCell>
            <TableCell>{usuario.facultad_nombre || usuario.facultad || '--'}</TableCell>
          </>
        );
      case 'COORDINADOR':
        return (
          <>
            <TableCell className="font-medium">{usuario.usuario?.nombre_completo}</TableCell>
            <TableCell>{usuario.usuario?.correo}</TableCell>
            <TableCell>{usuario.facultad?.nombre || usuario.facultad_id || '--'}</TableCell>
          </>
        );
      case 'REPRESENTANTE_EMPRESA':
        return (
          <>
            <TableCell className="font-medium">{usuario.usuario?.nombre_completo}</TableCell>
            <TableCell>{usuario.usuario?.correo}</TableCell>
            <TableCell>{usuario.empresa?.razon_social || '--'}</TableCell>
            <TableCell>{usuario.cargo || '--'}</TableCell>
          </>
        );
    }
  };

  const filteredUsuarios = (usuarios as any[]).filter((u) =>
    u.usuario?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.usuario?.correo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1><p className="text-gray-500">Administración de estudiantes, docentes, coordinadores y representantes</p></div>

      <Tabs defaultValue="ESTUDIANTE" onValueChange={(v) => setSelectedRol(v as RolType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ESTUDIANTE" className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />Estudiantes</TabsTrigger>
          <TabsTrigger value="DOCENTE" className="flex items-center gap-2"><UserCheck className="h-4 w-4" />Docentes</TabsTrigger>
          <TabsTrigger value="COORDINADOR" className="flex items-center gap-2"><UserCheck className="h-4 w-4" />Coordinadores</TabsTrigger>
          <TabsTrigger value="REPRESENTANTE_EMPRESA" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Representantes</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedRol} className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-500">Total {getRolNombre()}</p><p className="text-2xl font-bold">{estadisticas?.total || 0}</p></div>
                  <div className="p-3 bg-blue-100 rounded-full">{getRolIcon()}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm text-gray-500">Activos</p><p className="text-2xl font-bold text-green-600">{estadisticas?.activos || 0}</p></div>
                  <div className="p-3 bg-green-100 rounded-full"><User className="h-6 w-6 text-green-600" /></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Buscar por nombre o email..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              </CardContent>
            </Card>
          </div>

          <Card><CardHeader><CardTitle>Lista de {getRolNombre()}</CardTitle></CardHeader><CardContent>
            <Table><TableHeader><TableRow>{getColumns().map((col, i) => (<TableHead key={i}>{col}</TableHead>))}</TableRow></TableHeader>
              <TableBody>
                {isLoading ? (<TableRow><TableCell colSpan={6} className="text-center py-12">Cargando...</TableCell></TableRow>
                ) : filteredUsuarios.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center py-12 text-gray-500">No hay {getRolNombre().toLowerCase()} registrados</TableCell></TableRow>
                ) : (filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id} className="hover:bg-gray-50">
                    {renderRow(usuario)}
                    <TableCell>{usuario.activo ? <Badge className="bg-green-500">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}</TableCell>
                    <TableCell><div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetail(usuario)} title="Ver detalles"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(usuario)} title="Editar"><Edit className="h-4 w-4" /></Button>
                      {usuario.activo ? (
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(usuario.id)} title="Desactivar"><Trash2 className="h-4 w-4" /></Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleReactivar(usuario.id)} title="Reactivar"><RefreshCw className="h-4 w-4" /></Button>
                      )}
                    </div></TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Modal Detalle */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Detalle del Usuario</DialogTitle></DialogHeader>
          {selectedUser && (<div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg"><div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">Nombre</p><p className="font-medium">{selectedUser.usuario?.nombre_completo}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{selectedUser.usuario?.correo}</p></div>
              {selectedRol === 'ESTUDIANTE' && (<><div><p className="text-gray-500">Código</p><p className="font-mono">{selectedUser.codigo_univ}</p></div><div><p className="text-gray-500">Carrera</p><p>{selectedUser.carrera?.nombre}</p></div><div><p className="text-gray-500">Ciclo</p><p>{selectedUser.ciclo}</p></div></>)}
              {selectedRol === 'DOCENTE' && (<><div><p className="text-gray-500">Especialidad</p><p>{selectedUser.especialidad}</p></div><div><p className="text-gray-500">Facultad</p><p>{selectedUser.facultad_nombre || selectedUser.facultad || '--'}</p></div></>)}
              {selectedRol === 'COORDINADOR' && (<div><p className="text-gray-500">Facultad</p><p>{selectedUser.facultad?.nombre || selectedUser.facultad_id || 'Sin facultad'}</p></div>)}
              {selectedRol === 'REPRESENTANTE_EMPRESA' && (<><div><p className="text-gray-500">Empresa</p><p>{selectedUser.empresa?.razon_social}</p></div><div><p className="text-gray-500">Cargo</p><p>{selectedUser.cargo}</p></div></>)}
              <div><p className="text-gray-500">Estado</p>{selectedUser.activo ? <Badge className="bg-green-500">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}</div>
            </div></div>
            {selectedRol === 'ESTUDIANTE' && selectedUser.expediente && (<div><p className="text-gray-500">Expediente</p><a href={selectedUser.expediente} target="_blank" className="text-blue-600">Ver documento</a></div>)}
          </div>)}
        </DialogContent>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar {getRolNombre().slice(0, -1)}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedRol === 'ESTUDIANTE' && (<>
              <div><Label>Carrera</Label><Select value={editData.carrera_id} onValueChange={(v) => setEditData({ ...editData, carrera_id: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(carreras as any[])?.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Ciclo</Label><Select value={editData.ciclo?.toString()} onValueChange={(v) => setEditData({ ...editData, ciclo: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5,6,7,8,9,10].map(c => <SelectItem key={c} value={c.toString()}>{c}°</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Expediente URL</Label><Input value={editData.expediente} onChange={(e) => setEditData({ ...editData, expediente: e.target.value })} placeholder="https://..." /></div>
            </>)}
            
            {selectedRol === 'DOCENTE' && (<>
              <div><Label>Especialidad</Label><Input value={editData.especialidad} onChange={(e) => setEditData({ ...editData, especialidad: e.target.value })} /></div>
              <div><Label>Facultad</Label>
                <Select value={editData.facultad_id} onValueChange={(v) => setEditData({ ...editData, facultad_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultadesList.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>)}
            
            {selectedRol === 'COORDINADOR' && (
              <div className="space-y-2">
                <Label>Facultad</Label>
                <Select value={editData.facultad_id} onValueChange={(v) => setEditData({ ...editData, facultad_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultadesList.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedRol === 'REPRESENTANTE_EMPRESA' && (<>
              <div><Label>Empresa</Label><Select value={editData.empresa_id} onValueChange={(v) => setEditData({ ...editData, empresa_id: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(empresas as any[])?.map(e => <SelectItem key={e.id} value={e.id}>{e.razon_social}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Cargo</Label><Input value={editData.cargo} onChange={(e) => setEditData({ ...editData, cargo: e.target.value })} /></div>
            </>)}
            
            <Button onClick={handleUpdate} className="w-full">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}