'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Edit, Trash2, FileText, Search, Eye, FileSignature, Link as LinkIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

interface Company {
  id: string;
  ruc: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  correo_contacto?: string;
  activo: boolean;
  convenios?: Convenio[];
}

interface Convenio {
  id: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  archivo_url?: string;
}

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConvenioDialog, setShowConvenioDialog] = useState(false);
  const [showConveniosModal, setShowConveniosModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  const [newCompany, setNewCompany] = useState({ ruc: '', razon_social: '', direccion: '', telefono: '', correo_contacto: '' });
  const [editCompany, setEditCompany] = useState({ id: '', ruc: '', razon_social: '', direccion: '', telefono: '', correo_contacto: '' });
  const [newConvenio, setNewConvenio] = useState({ tipo: 'Marco' as 'Marco' | 'Especifico', fecha_inicio: '', fecha_fin: '', archivo_url: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'COORDINADOR';
  const isRepresentante = user.rol === 'REPRESENTANTE_EMPRESA';
  const isEstudiante = user.rol === 'ESTUDIANTE';

  const { data: empresas = [], refetch, isLoading } = trpc.companies.getEmpresas.useQuery();

  // Filtrar empresas según el rol
  const empresasFiltradas = () => {
    if (isRepresentante && user.representante?.empresa_id) {
      // Representante solo ve su empresa
      return (empresas as Company[]).filter(e => e.id === user.representante.empresa_id);
    }
    return empresas as Company[];
  };

  // Obtener la empresa del representante para mostrar convenios
  useEffect(() => {
    if (isRepresentante && user.representante?.empresa_id && empresas.length > 0) {
      const miEmpresa = (empresas as Company[]).find(e => e.id === user.representante.empresa_id);
      if (miEmpresa && !selectedCompany) {
        setSelectedCompany(miEmpresa);
      }
    }
  }, [empresas, isRepresentante, user.representante?.empresa_id]);

  const createCompanyMutation = trpc.companies.createEmpresa.useMutation({
    onSuccess: () => { toast.success('Empresa creada'); setShowCreateDialog(false); refetch(); setNewCompany({ ruc: '', razon_social: '', direccion: '', telefono: '', correo_contacto: '' }); },
    onError: (error) => toast.error(error.message),
  });

  const updateCompanyMutation = trpc.companies.updateEmpresa.useMutation({
    onSuccess: () => { toast.success('Empresa actualizada'); setShowEditDialog(false); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const deleteCompanyMutation = trpc.companies.deleteEmpresa.useMutation({
    onSuccess: () => { toast.success('Empresa desactivada'); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const addConvenioMutation = trpc.companies.addConvenio.useMutation({
    onSuccess: () => { 
      toast.success('Convenio añadido'); 
      refetch().then(() => {
        // Update selectedCompany with fresh data
        if (selectedCompanyId) {
          const updatedCompany = empresas.find((e: any) => e.id === selectedCompanyId);
          if (updatedCompany) {
            setSelectedCompany(updatedCompany);
          }
        }
      });
      setShowConvenioDialog(false); 
      setNewConvenio({ tipo: 'Marco', fecha_inicio: '', fecha_fin: '', archivo_url: '' }); 
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreateCompany = () => {
    if (!newCompany.ruc || !newCompany.razon_social || !newCompany.correo_contacto) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    createCompanyMutation.mutate(newCompany);
  };

  const handleUpdateCompany = () => {
    updateCompanyMutation.mutate({ id: editCompany.id, data: editCompany });
  };

  const handleDeleteCompany = (company: Company) => {
    if (confirm(`¿Desactivar la empresa "${company.razon_social}"?`)) {
      deleteCompanyMutation.mutate({ id: company.id });
    }
  };

  const handleAddConvenio = () => {
    if (!selectedCompanyId || !newConvenio.fecha_inicio || !newConvenio.fecha_fin) {
      toast.error('Complete las fechas del convenio');
      return;
    }
    addConvenioMutation.mutate({ empresa_id: selectedCompanyId, ...newConvenio, archivo_url: newConvenio.archivo_url || undefined });
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

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

  const empresasMostradas = empresasFiltradas();
  const filteredCompanies = empresasMostradas.filter(e => 
    e.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.ruc?.includes(searchTerm)
  );

  // Para representante y estudiante, mostrar botón para ver convenios aunque no tengan permisos de edición
  const puedeEditar = isAdmin;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-foreground">Empresas Conveniadas</h1><p className="text-gray-500">Gestión de empresas y convenios</p></div>
        {isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nueva Empresa</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar Nueva Empresa</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="RUC" value={newCompany.ruc} onChange={(e) => setNewCompany({ ...newCompany, ruc: e.target.value })} />
                <Input placeholder="Razón Social" value={newCompany.razon_social} onChange={(e) => setNewCompany({ ...newCompany, razon_social: e.target.value })} />
                <Input placeholder="Dirección" value={newCompany.direccion} onChange={(e) => setNewCompany({ ...newCompany, direccion: e.target.value })} />
                <Input placeholder="Teléfono" value={newCompany.telefono} onChange={(e) => setNewCompany({ ...newCompany, telefono: e.target.value })} />
                <Input placeholder="Email Contacto" value={newCompany.correo_contacto} onChange={(e) => setNewCompany({ ...newCompany, correo_contacto: e.target.value })} />
                <Button onClick={handleCreateCompany} className="w-full">Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm">Total Empresas</p><p className="text-2xl font-bold">{empresasMostradas.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Convenios Activos</p><p className="text-2xl font-bold text-green-600">{empresasMostradas.reduce((t, e) => t + (e.convenios?.filter(c => new Date(c.fecha_inicio) <= new Date() && new Date(c.fecha_fin) >= new Date()).length || 0), 0)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Buscar..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Lista de Empresas</CardTitle></CardHeader><CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>RUC</TableHead><TableHead>Razón Social</TableHead><TableHead>Contacto</TableHead><TableHead>Convenio</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => {
              const tieneConvenioActivo = company.convenios?.some(c => new Date(c.fecha_inicio) <= new Date() && new Date(c.fecha_fin) >= new Date());
              return (
                <TableRow key={company.id}>
                  <TableCell className="font-mono text-sm">{company.ruc}</TableCell>
                  <TableCell className="font-medium">{company.razon_social}</TableCell>
                  <TableCell>
                    <div className="text-sm">{company.correo_contacto}</div>
                    <div className="text-xs text-gray-500">{company.telefono}</div>
                  </TableCell>
                  <TableCell>
                    {tieneConvenioActivo ? (
                      <Badge className="bg-green-500">✓ Activo</Badge>
                    ) : company.convenios && company.convenios.length > 0 ? (
                      <Badge variant="secondary">Vencido</Badge>
                    ) : (
                      <Badge variant="outline">Sin Convenio</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { 
                        refetch().then(() => {
                          const updated = (empresas as Company[]).find(e => e.id === company.id);
                          setSelectedCompany(updated || company);
                          setShowConveniosModal(true);
                        });
                      }} title="Ver convenios">
                        <FileSignature className="h-4 w-4" />
                      </Button>
                      {puedeEditar && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => { setEditCompany({ id: company.id, ruc: company.ruc, razon_social: company.razon_social, direccion: company.direccion || '', telefono: company.telefono || '', correo_contacto: company.correo_contacto || '' }); setShowEditDialog(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteCompany(company)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Modal Editar Empresa (igual) */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold">✏️ Editar Empresa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-sm font-semibold">📋 RUC *</Label><Input placeholder="12345678901" value={editCompany.ruc} onChange={(e) => setEditCompany({ ...editCompany, ruc: e.target.value })} maxLength={11}/><p className="text-xs text-gray-500">Número de RUC de la empresa (11 dígitos)</p></div>
            <div className="space-y-2"><Label className="text-sm font-semibold">🏢 Razón Social *</Label><Input placeholder="Nombre de la empresa" value={editCompany.razon_social} onChange={(e) => setEditCompany({ ...editCompany, razon_social: e.target.value })}/><p className="text-xs text-gray-500">Nombre o razón social de la empresa</p></div>
            <div className="space-y-2"><Label className="text-sm font-semibold">📍 Dirección</Label><Input placeholder="Dirección completa" value={editCompany.direccion} onChange={(e) => setEditCompany({ ...editCompany, direccion: e.target.value })}/><p className="text-xs text-gray-500">Ubicación de la empresa (opcional)</p></div>
            <div className="space-y-2"><Label className="text-sm font-semibold">📞 Teléfono</Label><Input placeholder="(01) 123-4567" value={editCompany.telefono} onChange={(e) => setEditCompany({ ...editCompany, telefono: e.target.value })}/><p className="text-xs text-gray-500">Número de contacto (opcional)</p></div>
            <div className="space-y-2"><Label className="text-sm font-semibold">✉️ Email de Contacto *</Label><Input type="email" placeholder="contacto@empresa.com" value={editCompany.correo_contacto} onChange={(e) => setEditCompany({ ...editCompany, correo_contacto: e.target.value })}/><p className="text-xs text-gray-500">Correo electrónico de contacto</p></div>
            <div className="flex gap-3 pt-4"><Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">Cancelar</Button><Button onClick={handleUpdateCompany} className="flex-1 bg-blue-600">💾 Guardar Cambios</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Convenios - Ahora accesible para todos los roles */}
      <Dialog open={showConveniosModal} onOpenChange={setShowConveniosModal}>
        <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Convenios - {selectedCompany?.razon_social}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedCompany?.convenios && selectedCompany.convenios.length > 0 ? (
              selectedCompany.convenios.map((c) => (
                <div key={c.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start"><div className="flex items-center gap-2"><FileSignature className="h-4 w-4" /><span className="font-semibold">{c.tipo}</span></div>{getEstadoBadge(c.estado, c.fecha_inicio, c.fecha_fin)}</div>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2"><div><p className="text-gray-500">Inicio</p><p>{formatDate(c.fecha_inicio)}</p></div><div><p className="text-gray-500">Fin</p><p>{formatDate(c.fecha_fin)}</p></div></div>
                  {c.archivo_url && <div className="mt-2"><a href={c.archivo_url} target="_blank" className="text-blue-600 text-sm">Ver Documento</a></div>}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No hay convenios registrados para esta empresa</p>
            )}
            {isAdmin && selectedCompany && (
              <Button onClick={() => { setSelectedCompanyId(selectedCompany.id); setShowConveniosModal(false); setShowConvenioDialog(true); }} className="w-full">
                <Plus className="h-4 w-4 mr-2" />Agregar Convenio
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Agregar Convenio */}
      <Dialog open={showConvenioDialog} onOpenChange={setShowConvenioDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-xl font-bold">📄 Registrar Nuevo Convenio</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label className="text-sm font-semibold">📌 Tipo de Convenio *</Label>
              <div className="flex gap-4"><Button variant={newConvenio.tipo === 'Marco' ? 'default' : 'outline'} onClick={() => setNewConvenio({ ...newConvenio, tipo: 'Marco' })} className="flex-1">📋 Marco</Button><Button variant={newConvenio.tipo === 'Especifico' ? 'default' : 'outline'} onClick={() => setNewConvenio({ ...newConvenio, tipo: 'Especifico' })} className="flex-1">📝 Específico</Button></div>
              <p className="text-xs text-gray-500">Seleccione el tipo de convenio</p>
            </div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label className="text-sm font-semibold">📅 Fecha de Inicio *</Label><Input type="date" value={newConvenio.fecha_inicio} onChange={(e) => setNewConvenio({ ...newConvenio, fecha_inicio: e.target.value })} /><p className="text-xs text-gray-500">Día en que inicia el convenio</p></div>
            <div className="space-y-2"><Label className="text-sm font-semibold">📅 Fecha de Fin *</Label><Input type="date" value={newConvenio.fecha_fin} onChange={(e) => setNewConvenio({ ...newConvenio, fecha_fin: e.target.value })} /><p className="text-xs text-gray-500">Día en que finaliza el convenio</p></div></div>
            <div className="space-y-2"><Label className="text-sm font-semibold">🔗 URL del Documento</Label><div className="flex items-center gap-2"><LinkIcon className="h-4 w-4 text-gray-400" /><Input type="url" value={newConvenio.archivo_url} onChange={(e) => setNewConvenio({ ...newConvenio, archivo_url: e.target.value })} placeholder="https://drive.google.com/file/d/... (opcional)" /></div><p className="text-xs text-gray-500">Enlace al documento del convenio (Google Drive, Dropbox, etc.)</p></div>
            <Button onClick={handleAddConvenio} disabled={addConvenioMutation.isPending} className="w-full bg-blue-600">{addConvenioMutation.isPending ? 'Guardando...' : '✅ Registrar Convenio'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}