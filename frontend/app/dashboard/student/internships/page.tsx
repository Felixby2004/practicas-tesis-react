'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Clock, FileText, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function StudentInternshipsPage() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPostularDialog, setShowPostularDialog] = useState(false);
  const [showOfertaDialog, setShowOfertaDialog] = useState(false);
  const [selectedOfertaId, setSelectedOfertaId] = useState('');
  const [selectedOferta, setSelectedOferta] = useState<any>(null);
  const [curriculumUrl, setCurriculumUrl] = useState('');
  const [showHorasDialog, setShowHorasDialog] = useState(false);
  const [showInformeDialog, setShowInformeDialog] = useState(false);
  const [horasData, setHorasData] = useState({ horas_trabajadas: 0, descripcion_actividad: '' });
  const [informeData, setInformeData] = useState({ tipo: 'inicial', titulo: '', contenido: '', archivo_url: '' });
  const [isLoadingConvenios, setIsLoadingConvenios] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const estudianteId = user?.estudiante?.id;
  
  const { data: ofertas = [], refetch: refetchOfertas } = trpc.internships.getOfertas.useQuery();
  const { data: empresas = [] } = trpc.companies.getEmpresas.useQuery();
  const { data: misPostulaciones, refetch: refetchPostulaciones } = trpc.internships.getPostulacionesByEstudiante.useQuery(
    { estudianteId: estudianteId || '' },
    { enabled: !!estudianteId }
  );
  
  const postularMutation = trpc.internships.postular.useMutation({
    onSuccess: () => { toast.success('Postulación enviada'); setShowPostularDialog(false); refetchPostulaciones(); },
    onError: (error) => toast.error(error.message),
  });

  const registrarHorasMutation = trpc.internships.registrarHoras.useMutation({
    onSuccess: () => { toast.success('Horas registradas'); setShowHorasDialog(false); refetchPostulaciones(); },
    onError: (error) => toast.error(error.message),
  });

  const crearInformeMutation = trpc.internships.crearInforme.useMutation({
    onSuccess: () => { toast.success('Informe enviado'); setShowInformeDialog(false); refetchPostulaciones(); },
    onError: (error) => toast.error(error.message),
  });

  const yaPostulo = (ofertaId: string) => misPostulaciones?.some(p => p.oferta_id === ofertaId);
  const postulacionAprobada = misPostulaciones?.find(p => p.estado === 'aprobada');
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  // Get company details with convenios
  const getEmpresaConvenios = (empresaId?: string) => {
    if (!empresaId) return null;
    
    // First try to get from empresas array
    let empresa = (empresas as any[]).find(e => e.id === empresaId);
    
    // If not found, try to get from selectedOferta.empresa which might have full data
    if (!empresa && selectedOferta?.empresa?.id === empresaId) {
      empresa = selectedOferta.empresa;
    }
    
    return empresa;
  };

  const handleVerOferta = (oferta: any) => {
    // Refresh empresas data to ensure convenios are up to date
    setIsLoadingConvenios(true);
    refetchEmpresas().then(() => {
      setSelectedOferta(oferta);
      setShowOfertaDialog(true);
      setIsLoadingConvenios(false);
    });
  };

  const filteredOfertas = (ofertas as any[]).filter(o => 
    o.activo !== false && (o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.empresa?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Prácticas Preprofesionales</h1>
        <p className="text-gray-500">Postulación, seguimiento de horas e informes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm">Mis Postulaciones</p><p className="text-2xl font-bold">{misPostulaciones?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Aprobadas</p><p className="text-2xl font-bold text-green-600">{misPostulaciones?.filter(p => p.estado === 'aprobada').length || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Horas Registradas</p><p className="text-2xl font-bold text-blue-600">{postulacionAprobada?.horas?.reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0) || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" /><Input placeholder="Buscar ofertas..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="ofertas">
        <TabsList>
          <TabsTrigger value="ofertas">📋 Ofertas Disponibles</TabsTrigger>
          <TabsTrigger value="mis">📌 Mis Postulaciones</TabsTrigger>
          <TabsTrigger value="horas">⏰ Registrar Horas</TabsTrigger>
          <TabsTrigger value="informes">📄 Mis Informes</TabsTrigger>
        </TabsList>

        <TabsContent value="ofertas">
          <Card><CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Empresa</TableHead><TableHead>Fecha Límite</TableHead><TableHead>Vacantes</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredOfertas.map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.titulo}</TableCell>
                    <TableCell>{o.empresa?.razon_social}</TableCell>
                    <TableCell>{formatDate(o.fecha_limite_postulacion)}</TableCell>
                    <TableCell>{o.vacantes}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleVerOferta(o)}>Ver Detalles</Button>
                      {yaPostulo(o.id) ? (<Badge className="bg-green-500">Ya postulaste</Badge>) : (<Button size="sm" onClick={() => { setSelectedOfertaId(o.id); setShowPostularDialog(true); }}>Postular</Button>)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="mis">
          <Card><CardContent className="pt-6">
            <div className="space-y-3">
              {misPostulaciones?.map(p => (
                <div 
                  key={p.id} 
                  className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => handleVerOferta(p.oferta)}
                >
                  <div>
                    <p className="font-medium">{p.oferta?.titulo}</p>
                    <p className="text-sm text-gray-500">{p.oferta?.empresa?.razon_social}</p>
                    <p className="text-xs text-gray-400">Postulado: {formatDate(p.fecha_postulacion)}</p>
                  </div>
                  <Badge className={p.estado === 'aprobada' ? 'bg-green-500' : p.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'}>
                    {p.estado === 'aprobada' ? 'Aprobada' : p.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="horas">
          <Card><CardContent className="pt-6">
            {postulacionAprobada ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium">Práctica aprobada: {postulacionAprobada.oferta?.titulo}</p>
                  <p className="text-sm text-gray-500">Empresa: {postulacionAprobada.oferta?.empresa?.razon_social}</p>
                </div>
                <Button onClick={() => setShowHorasDialog(true)}><Plus className="h-4 w-4 mr-2" />Registrar Horas</Button>
                <Table>
                  <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Horas</TableHead><TableHead>Descripción</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {postulacionAprobada.horas?.map((h: any) => (
                      <TableRow key={h.id}><TableCell>{formatDate(h.fecha)}</TableCell><TableCell>{h.horas_trabajadas}</TableCell><TableCell>{h.descripcion_actividad}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><Clock className="h-12 w-12 mx-auto mb-3" /><p>No tienes una práctica aprobada para registrar horas</p></div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="informes">
          <Card><CardContent className="pt-6">
            {postulacionAprobada ? (
              <div className="space-y-4">
                <Button onClick={() => setShowInformeDialog(true)}><Plus className="h-4 w-4 mr-2" />Subir Informe</Button>
                <Table>
                  <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Título</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {postulacionAprobada.informes?.map((i: any) => (
                      <TableRow key={i.id}><TableCell>{i.tipo}</TableCell><TableCell>{i.titulo}</TableCell><TableCell>{formatDate(i.fecha_entrega)}</TableCell><TableCell><Badge className={i.estado === 'revisado' ? 'bg-green-500' : 'bg-yellow-500'}>{i.estado}</Badge></TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500"><FileText className="h-12 w-12 mx-auto mb-3" /><p>No tienes una práctica aprobada para subir informes</p></div>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      <Dialog open={showPostularDialog} onOpenChange={setShowPostularDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Postular a la oferta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Label>URL de tu CV</Label>
            <Input placeholder="https://..." value={curriculumUrl} onChange={(e) => setCurriculumUrl(e.target.value)} />
            <Button onClick={() => postularMutation.mutate({ oferta_id: selectedOfertaId, estudiante_id: estudianteId, curriculum_url: curriculumUrl })}>Enviar Postulación</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHorasDialog} onOpenChange={setShowHorasDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Horas</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input type="number" placeholder="Horas trabajadas" value={horasData.horas_trabajadas} onChange={(e) => setHorasData({ ...horasData, horas_trabajadas: parseInt(e.target.value) })} />
            <Textarea placeholder="Descripción de actividades" value={horasData.descripcion_actividad} onChange={(e) => setHorasData({ ...horasData, descripcion_actividad: e.target.value })} />
            <Button onClick={() => registrarHorasMutation.mutate({ postulacion_id: postulacionAprobada?.id, ...horasData })}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInformeDialog} onOpenChange={setShowInformeDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Subir Informe</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Informe</Label>
              <select className="w-full p-2 border rounded mt-1" value={informeData.tipo} onChange={(e) => setInformeData({ ...informeData, tipo: e.target.value as any })}>
                <option value="inicial">Inicial</option>
                <option value="intermedio">Intermedio</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input 
                id="titulo"
                placeholder="Ej: Informe de avance - Primera quincena" 
                value={informeData.titulo} 
                onChange={(e) => setInformeData({ ...informeData, titulo: e.target.value })} 
              />
            </div>
            <div>
              <Label htmlFor="contenido">Contenido / Resumen</Label>
              <Textarea 
                id="contenido"
                placeholder="Describe el trabajo realizado..." 
                rows={4} 
                value={informeData.contenido} 
                onChange={(e) => setInformeData({ ...informeData, contenido: e.target.value })} 
              />
            </div>
            <div>
              <Label htmlFor="drive-link">Link de Google Drive (opcional)</Label>
              <Input 
                id="drive-link"
                placeholder="https://drive.google.com/file/d/..." 
                value={informeData.archivo_url} 
                onChange={(e) => setInformeData({ ...informeData, archivo_url: e.target.value })} 
              />
              <p className="text-xs text-gray-500 mt-1">Puedes compartir un documento o archivo de Google Drive con el link</p>
            </div>
            <Button onClick={() => crearInformeMutation.mutate({ postulacion_id: postulacionAprobada?.id, ...informeData as any })}>
              Enviar Informe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles de la oferta */}
      <Dialog open={showOfertaDialog} onOpenChange={setShowOfertaDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Detalles de la Oferta</DialogTitle></DialogHeader>
          {selectedOferta && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2">{selectedOferta.titulo}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold">Empresa:</p>
                    <p>{selectedOferta.empresa?.razon_social}</p>
                  </div>
                  <div>
                    <p className="font-semibold">RUC:</p>
                    <p>{selectedOferta.empresa?.ruc}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Ubicación:</p>
                    <p>{selectedOferta.empresa?.direccion || 'No especificada'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Teléfono:</p>
                    <p>{selectedOferta.empresa?.telefono || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email Contacto:</p>
                    <p>{selectedOferta.empresa?.correo_contacto}</p>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">Detalles de la Práctica</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold">Duración:</p>
                    <p>{selectedOferta.duracion_semanas} semanas</p>
                  </div>
                  <div>
                    <p className="font-semibold">Fecha Límite:</p>
                    <p>{formatDate(selectedOferta.fecha_limite_postulacion)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Vacantes:</p>
                    <p className={selectedOferta.vacantes === 0 ? 'text-red-600 font-bold' : ''}>{selectedOferta.vacantes === 0 ? 'Sin vacantes' : selectedOferta.vacantes}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Estado:</p>
                    <Badge className={selectedOferta.estado === 'abierta' ? 'bg-green-500' : 'bg-red-500'}>
                      {selectedOferta.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedOferta.descripcion && (
                <div className="border-b pb-4">
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedOferta.descripcion}</p>
                </div>
              )}

              {/* Convenios section */}
              {(() => {
                const empresaData = getEmpresaConvenios(selectedOferta.empresa?.id);
                const conveniosActivos = empresaData?.convenios?.filter((c: any) => {
                  const hoy = new Date();
                  const inicio = new Date(c.fecha_inicio);
                  const fin = new Date(c.fecha_fin);
                  return inicio <= hoy && fin >= hoy;
                }) || [];

                return (
                  <div className="border-b pb-4">
                    <h4 className="font-semibold mb-2">Convenios Universitarios</h4>
                    {isLoadingConvenios ? (
                      <p className="text-sm text-gray-500">Cargando información de convenios...</p>
                    ) : conveniosActivos.length > 0 ? (
                      <div className="space-y-2">
                        {conveniosActivos.map((c: any) => (
                          <div key={c.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm font-semibold text-green-700">✓ Convenio {c.tipo} Vigente</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Válido desde {formatDate(c.fecha_inicio)} hasta {formatDate(c.fecha_fin)}
                            </p>
                            {c.archivo_url && (
                              <a href={c.archivo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                                Ver documento →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        No hay convenios activos registrados para esta empresa
                      </p>
                    )}
                  </div>
                );
              })()}

              {selectedOferta.requisitos && (
                <div className="pb-4">
                  <h4 className="font-semibold mb-2">Requisitos</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedOferta.requisitos}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowOfertaDialog(false)}>Cerrar</Button>
                {selectedOferta.vacantes > 0 && !yaPostulo(selectedOferta.id) && (
                  <Button onClick={() => { setShowOfertaDialog(false); setSelectedOfertaId(selectedOferta.id); setShowPostularDialog(true); }}>
                    Postular
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}