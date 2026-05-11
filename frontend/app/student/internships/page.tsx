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
import { Search, Clock, FileText, Plus, UserCheck, CheckCircle, Building2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

export default function StudentInternshipsPage() {
  const [user, setUser] = useState<any>(null);
  const [estudianteId, setEstudianteId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPostularDialog, setShowPostularDialog] = useState(false);
  const [selectedOferta, setSelectedOferta] = useState<any>(null);
  const [curriculumUrl, setCurriculumUrl] = useState('');
  const [showHorasDialog, setShowHorasDialog] = useState(false);
  const [showInformeDialog, setShowInformeDialog] = useState(false);
  const [horasData, setHorasData] = useState({ horas_trabajadas: 0, descripcion_actividad: '' });
  const [informeData, setInformeData] = useState({ tipo: 'inicial', titulo: '', contenido: '' });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEstudianteId(parsedUser?.estudiante?.id || '');
    }
  }, []);

  const { data: ofertas = [], refetch: refetchOfertas } = trpc.internships.getOfertas.useQuery();
  const { data: empresas = [], refetch: refetchEmpresas } = trpc.companies.getEmpresas.useQuery();
  const { data: misPostulaciones, refetch: refetchPostulaciones } = trpc.internships.getPostulacionesByEstudiante.useQuery(
    { estudianteId: estudianteId },
    { enabled: !!estudianteId }
  );
  
  // Enrich ofertas with full empresa data (including convenios)
  const ofertasEnriquecidas = ofertas.map(oferta => ({
    ...oferta,
    empresa: empresas.find(e => e.id === oferta.empresa?.id) || oferta.empresa
  }));
  
  const postulacionesAprobadas = misPostulaciones?.filter(p => p.estado === 'aprobada') || [];
  const [postulacionActivaId, setPostulacionActivaId] = useState<string>('');
  
  const postularMutation = trpc.internships.postular.useMutation({
    onSuccess: () => { 
      toast.success('Postulación enviada'); 
      setShowPostularDialog(false); 
      refetchPostulaciones(); 
      refetchOfertas();
      refetchEmpresas();
    },
    onError: (error) => toast.error(error.message),
  });

  const registrarHorasMutation = trpc.internships.registrarHoras.useMutation({
    onSuccess: () => { 
      toast.success('Horas registradas'); 
      setShowHorasDialog(false); 
      refetchPostulaciones(); 
      setHorasData({ horas_trabajadas: 0, descripcion_actividad: '' });
    },
    onError: (error) => toast.error(error.message),
  });

  const crearInformeMutation = trpc.internships.crearInforme.useMutation({
    onSuccess: () => { 
      toast.success('Informe enviado'); 
      setShowInformeDialog(false); 
      refetchPostulaciones(); 
      setInformeData({ tipo: 'inicial', titulo: '', contenido: '' });
    },
    onError: (error) => toast.error(error.message),
  });

  const yaPostulo = (ofertaId: string) => misPostulaciones?.some(p => p.oferta_id === ofertaId);
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  
  const getConvenioStatus = (empresa: any) => {
    if (!empresa?.convenios || empresa.convenios.length === 0) {
      return { status: 'sin-convenio', label: 'Sin Convenio', color: 'text-red-600' };
    }
    const convenioActivo = empresa.convenios.find((c: any) => {
      const hoy = new Date();
      const inicio = new Date(c.fecha_inicio);
      const fin = new Date(c.fecha_fin);
      return inicio <= hoy && hoy <= fin;
    });
    
    if (convenioActivo) {
      return { status: 'activo', label: 'Convenio Activo', color: 'text-white' };
    }
    
    const convenioFuturo = empresa.convenios.find((c: any) => new Date(c.fecha_inicio) > new Date());
    if (convenioFuturo) {
      return { status: 'pendiente', label: 'Convenio Pendiente', color: 'text-yellow-600' };
    }
    
    return { status: 'vencido', label: 'Convenio Vencido', color: 'text-orange-600' };
  };
  
  const postulacionActiva = postulacionesAprobadas.find(p => p.id === postulacionActivaId) || postulacionesAprobadas[0];
  const asesor = postulacionActiva?.asesores?.[0]?.docente;
  const horasTotales = postulacionActiva?.horas?.reduce((acc: number, h: any) => acc + h.horas_trabajadas, 0) || 0;

  const handlePostular = () => {
    if (!estudianteId) {
      toast.error('No se pudo identificar tu cuenta de estudiante');
      return;
    }
    postularMutation.mutate({ 
      oferta_id: selectedOferta?.id, 
      estudiante_id: estudianteId, 
      curriculum_url: curriculumUrl 
    });
  };

  const filteredOfertas = (ofertasEnriquecidas as any[]).filter(o => 
    o.activo !== false && o.estado === 'abierta' && (
      o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.empresa?.razon_social?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!estudianteId && user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-yellow-100 dark:bg-yellow-950/30 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300 px-6 py-4 rounded-lg">
          <p className="font-medium">⚠️ Cuenta de estudiante no configurada</p>
          <p className="text-sm mt-1">Por favor, contacta al administrador para completar tu registro.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Prácticas Preprofesionales</h1>
        <p className="text-muted-foreground">Postulación, seguimiento de horas e informes</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Mis Postulaciones</p><p className="text-3xl font-bold text-foreground">{misPostulaciones?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Aprobadas</p><p className="text-3xl font-bold text-green-600">{misPostulaciones?.filter(p => p.estado === 'aprobada').length || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Horas Registradas</p><p className="text-3xl font-bold text-primary">{horasTotales}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar ofertas..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></CardContent></Card>
      </div>

      <Tabs defaultValue="ofertas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ofertas" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Ofertas</TabsTrigger>
          <TabsTrigger value="mis" className="flex items-center gap-2"><FileText className="h-4 w-4" />Postulaciones</TabsTrigger>
          <TabsTrigger value="seguimiento" className="flex items-center gap-2"><Clock className="h-4 w-4" />Seguimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="ofertas" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Título</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Convenio</TableHead>
                      <TableHead>Fecha Límite</TableHead>
                      <TableHead>Vacantes</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfertas.map(o => {
                      const convenio = getConvenioStatus(o.empresa);
                      const puedePostular = convenio.status === 'activo' && !yaPostulo(o.id);
                      return (
                        <TableRow key={o.id} className={convenio.status !== 'activo' ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/30 transition-colors'}>
                          <TableCell className="font-medium">{o.titulo}</TableCell>
                          <TableCell>{o.empresa?.razon_social}</TableCell>
                          <TableCell>
                            <Badge variant={convenio.status === 'activo' ? 'default' : 'secondary'} className={convenio.color}>
                              {convenio.label}
                            </Badge>
                          </TableCell>
                          <TableCell><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(o.fecha_limite_postulacion)}</span></TableCell>
                          <TableCell>{o.vacantes}</TableCell>
                          <TableCell className="text-right">
                            {yaPostulo(o.id) ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Ya postulaste</Badge>
                            ) : convenio.status !== 'activo' ? (
                              <Badge variant="destructive" className="text-xs">Sin convenio activo</Badge>
                            ) : (
                              <Button size="sm" variant="default" onClick={() => { setSelectedOferta(o); setShowPostularDialog(true); }}>Postular</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredOfertas.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay ofertas disponibles</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                <strong>💡 Nota:</strong> Solo puedes postularte a ofertas de empresas que tienen un convenio activo vigente.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mis" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {misPostulaciones?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No has postulado a ninguna oferta</div>
              ) : (
                <div className="space-y-3">
                  {misPostulaciones?.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                      <div>
                        <p className="font-semibold">{p.oferta?.titulo}</p>
                        <p className="text-sm text-muted-foreground">{p.oferta?.empresa?.razon_social}</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">📅 Postulado: {formatDate(p.fecha_postulacion)}</p>
                      </div>
                      <Badge variant={p.estado === 'aprobada' ? 'default' : p.estado === 'rechazada' ? 'destructive' : 'secondary'}>
                        {p.estado === 'aprobada' ? 'Aprobada' : p.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguimiento" className="mt-6">
          {postulacionesAprobadas.length > 0 ? (
            <div className="space-y-6">
              {postulacionesAprobadas.length > 1 && (
                <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-3">Selecciona una práctica para ver el seguimiento:</p>
                    <div className="flex flex-wrap gap-2">
                      {postulacionesAprobadas.map((p) => (
                        <Button
                          key={p.id}
                          variant={postulacionActiva?.id === p.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPostulacionActivaId(p.id)}
                          className="flex-1 sm:flex-none"
                        >
                          {p.oferta?.titulo}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {postulacionActiva && (
                <>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <h3 className="font-semibold text-xl">{postulacionActiva.oferta?.titulo}</h3>
                          <p className="text-muted-foreground">{postulacionActiva.oferta?.empresa?.razon_social}</p>
                        </div>
                        <Badge className="bg-green-500">Aprobada</Badge>
                      </div>
                      {asesor && (
                        <div className="mt-4 p-3 rounded-lg bg-primary/10 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <span className="text-sm">Asesor: <span className="font-medium">{asesor.usuario?.nombre_completo}</span></span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5" /> Horas Registradas</CardTitle>
                      <Button size="sm" onClick={() => setShowHorasDialog(true)}><Plus className="h-4 w-4 mr-1" /> Registrar Horas</Button>
                    </CardHeader>
                    <CardContent>
                      {postulacionActiva.horas?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No hay horas registradas</div>
                      ) : (
                        <>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Fecha</TableHead>
                                  <TableHead>Horas</TableHead>
                                  <TableHead>Descripción</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {postulacionActiva.horas.map((h: any) => (
                                  <TableRow key={h.id}>
                                    <TableCell>{formatDate(h.fecha)}</TableCell>
                                    <TableCell className="font-mono">{h.horas_trabajadas}</TableCell>
                                    <TableCell>{h.descripcion_actividad}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          <div className="mt-4 text-right">
                            <p className="text-sm text-muted-foreground">Total acumulado:</p>
                            <p className="text-2xl font-bold text-primary">{horasTotales} horas</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" /> Mis Informes</CardTitle>
                      <Button size="sm" onClick={() => setShowInformeDialog(true)}><Plus className="h-4 w-4 mr-1" /> Subir Informe</Button>
                    </CardHeader>
                    <CardContent>
                      {postulacionActiva.informes?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No hay informes subidos</div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {postulacionActiva.informes.map((i: any) => (
                                <TableRow key={i.id}>
                                  <TableCell className="capitalize">{i.tipo}</TableCell>
                                  <TableCell>{i.titulo}</TableCell>
                                  <TableCell>{formatDate(i.fecha_entrega)}</TableCell>
                                  <TableCell><Badge variant={i.estado === 'revisado' ? 'default' : 'secondary'}>{i.estado === 'revisado' ? 'Revisado' : 'Pendiente'}</Badge></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16 text-muted-foreground">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium">Aún no tienes una práctica aprobada</p>
                <p className="text-sm mt-1">Explora ofertas y postula para comenzar tu práctica</p>
                <Button className="mt-4" variant="outline" onClick={() => document.querySelector('[value="ofertas"]')?.dispatchEvent(new Event('click'))}>
                  Explorar Ofertas
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modales - mantienen la misma estructura pero con mejor estilo */}
      <Dialog open={showPostularDialog} onOpenChange={setShowPostularDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl">📝 Postular a la oferta</DialogTitle></DialogHeader>
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-muted/50 border">
              <p className="font-semibold text-lg">{selectedOferta?.titulo}</p>
              <p className="text-muted-foreground">{selectedOferta?.empresa?.razon_social}</p>
            </div>
            <div className="space-y-2">
              <Label>URL de tu CV</Label>
              <Input placeholder="https://drive.google.com/..." value={curriculumUrl} onChange={(e) => setCurriculumUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">Enlace a tu currículum vitae (Google Drive, Dropbox, etc.)</p>
            </div>
            <Button onClick={handlePostular} disabled={postularMutation.isPending} className="w-full">Enviar Postulación</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHorasDialog} onOpenChange={setShowHorasDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>⏰ Registrar Horas - {postulacionActiva?.oferta?.titulo}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Horas trabajadas</Label>
              <Input type="number" min="1" max="24" placeholder="Ej: 8" value={horasData.horas_trabajadas} onChange={(e) => setHorasData({ ...horasData, horas_trabajadas: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción de actividades</Label>
              <Textarea placeholder="Describe las actividades realizadas..." rows={3} value={horasData.descripcion_actividad} onChange={(e) => setHorasData({ ...horasData, descripcion_actividad: e.target.value })} />
            </div>
            <Button onClick={() => registrarHorasMutation.mutate({ postulacion_id: postulacionActiva?.id, ...horasData })} className="w-full">Guardar Horas</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showInformeDialog} onOpenChange={setShowInformeDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>📄 Subir Informe - {postulacionActiva?.oferta?.titulo}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Informe</Label>
              <select className="w-full p-2 rounded-md border bg-background" value={informeData.tipo} onChange={(e) => setInformeData({ ...informeData, tipo: e.target.value as any })}>
                <option value="inicial">Informe Inicial</option>
                <option value="intermedio">Informe Intermedio</option>
                <option value="final">Informe Final</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Título</Label><Input placeholder="Título del informe" value={informeData.titulo} onChange={(e) => setInformeData({ ...informeData, titulo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Contenido</Label><Textarea placeholder="Describe los avances y resultados..." rows={5} value={informeData.contenido} onChange={(e) => setInformeData({ ...informeData, contenido: e.target.value })} /></div>
            <Button onClick={() => crearInformeMutation.mutate({ postulacion_id: postulacionActiva?.id, ...informeData as any })} className="w-full">Enviar Informe</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}