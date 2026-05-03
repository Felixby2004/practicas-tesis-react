'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Calendar, Users, FileText, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InternshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ofertaId = params.id as string;
  
  const [showPostularDialog, setShowPostularDialog] = useState(false);
  const [showHorasDialog, setShowHorasDialog] = useState(false);
  const [showInformeDialog, setShowInformeDialog] = useState(false);
  const [curriculumUrl, setCurriculumUrl] = useState('');
  const [horasData, setHorasData] = useState({ horas_trabajadas: 0, descripcion_actividad: '' });
  const [informeData, setInformeData] = useState({ tipo: 'inicial', titulo: '', contenido: '' });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEstudiante = user.rol === 'ESTUDIANTE';
  const isAdmin = user.rol === 'ADMINISTRADOR' || user.rol === 'COORDINADOR';

  // Agregar estado para el selector de asesor
  const [showAsignarAsesorDialog, setShowAsignarAsesorDialog] = useState(false);
  const [selectedPostulacionId, setSelectedPostulacionId] = useState('');
  const [selectedDocenteId, setSelectedDocenteId] = useState('');

  // Obtener lista de docentes
  const { data: docentes = [] } = trpc.users.getUsuariosByRol.useQuery({ rol: 'DOCENTE' });

  const { data: oferta, refetch } = trpc.internships.getOfertaById.useQuery({ id: ofertaId });
  const { data: postulaciones, refetch: refetchPostulaciones } = trpc.internships.getPostulacionesByOferta.useQuery({ ofertaId });
  const { data: misPostulaciones } = trpc.internships.getPostulacionesByEstudiante.useQuery(
    { estudianteId: user.estudiante?.id || '' }, { enabled: !!user.estudiante?.id }
  );

  const postularMutation = trpc.internships.postular.useMutation({
    onSuccess: () => { toast.success('Postulación enviada'); setShowPostularDialog(false); refetch(); refetchPostulaciones(); },
    onError: (error) => toast.error(error.message),
  });

  const updateEstadoMutation = trpc.internships.updatePostulacionEstado.useMutation({
    onSuccess: () => { toast.success('Estado actualizado'); refetchPostulaciones(); },
    onError: (error) => toast.error(error.message),
  });

  const asignarAsesorMutation = trpc.internships.asignarAsesor.useMutation({
    onSuccess: () => {
      toast.success('Asesor asignado correctamente');
      refetchPostulaciones();
      setSelectedDocenteId('');
      setShowAsignarAsesorDialog(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const registrarHorasMutation = trpc.internships.registrarHoras.useMutation({
    onSuccess: () => { toast.success('Horas registradas'); setShowHorasDialog(false); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const crearInformeMutation = trpc.internships.crearInforme.useMutation({
    onSuccess: () => { toast.success('Informe enviado'); setShowInformeDialog(false); refetch(); },
    onError: (error) => toast.error(error.message),
  });

  const yaPostulo = misPostulaciones?.some(p => p.oferta_id === ofertaId);

  if (!oferta) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div><h1 className="text-2xl font-bold text-foreground">{oferta.titulo}</h1><div className="flex items-center gap-2 mt-1"><Building2 className="h-4 w-4 text-gray-400" /><span>{oferta.empresa?.razon_social}</span></div></div>
        {isEstudiante && oferta.estado === 'abierta' && !yaPostulo && (
          <Dialog open={showPostularDialog} onOpenChange={setShowPostularDialog}>
            <DialogTrigger asChild><Button>Postularme</Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Postular</DialogTitle></DialogHeader><div className="space-y-4"><Label>URL CV</Label><Input placeholder="https://..." value={curriculumUrl} onChange={(e) => setCurriculumUrl(e.target.value)} /><Button onClick={() => postularMutation.mutate({ oferta_id: ofertaId, estudiante_id: user.estudiante?.id, curriculum_url: curriculumUrl })}>Enviar</Button></div></DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm">Vacantes</p><p className="text-2xl font-bold">{oferta.vacantes}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Postulaciones</p><p className="text-2xl font-bold">{postulaciones?.length || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm">Fecha Límite</p><p className="text-lg">{new Date(oferta.fecha_limite_postulacion).toLocaleDateString()}</p></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Descripción</CardTitle></CardHeader><CardContent><p>{oferta.descripcion}</p></CardContent></Card>
      <Card><CardHeader><CardTitle>Requisitos</CardTitle></CardHeader><CardContent><p>{oferta.requisitos}</p></CardContent></Card>

      <Tabs defaultValue="postulaciones"><TabsList><TabsTrigger value="postulaciones">Postulaciones</TabsTrigger><TabsTrigger value="horas">Horas</TabsTrigger><TabsTrigger value="informes">Informes</TabsTrigger></TabsList>
        <TabsContent value="postulaciones">
  <Card>
    <CardHeader><CardTitle>Postulantes</CardTitle></CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudiante</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asesor</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {postulaciones?.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.estudiante?.usuario?.nombre_completo}</TableCell>
              <TableCell>{p.estudiante?.codigo_univ}</TableCell>
              <TableCell>{new Date(p.fecha_postulacion).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge className={p.estado === 'aprobada' ? 'bg-green-500' : p.estado === 'rechazada' ? 'bg-red-500' : 'bg-yellow-500'}>
                  {p.estado === 'aprobada' ? 'Aprobada' : p.estado === 'rechazada' ? 'Rechazada' : 'Pendiente'}
                </Badge>
              </TableCell>
              <TableCell>{p.asesores?.[0]?.docente?.usuario?.nombre_completo || 'No asignado'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {isAdmin && p.estado === 'pendiente' && (
                    <>
                      <Button size="sm" variant="outline" className="text-green-600" onClick={() => updateEstadoMutation.mutate({ id: p.id, estado: 'aprobada' })}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateEstadoMutation.mutate({ id: p.id, estado: 'rechazada' })}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {isAdmin && p.estado === 'aprobada' && !p.asesores?.length && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPostulacionId(p.id);
                        setShowAsignarAsesorDialog(true);
                      }}
                    >
                      Asignar Asesor
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</TabsContent>

        {/* Dialog Asignar Asesor - Colócalo después del último TabsContent, antes de cerrar el div principal */}
<Dialog open={showAsignarAsesorDialog} onOpenChange={setShowAsignarAsesorDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>👨‍🏫 Asignar Asesor</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Seleccionar Docente</Label>
        <Select value={selectedDocenteId} onValueChange={setSelectedDocenteId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar docente" />
          </SelectTrigger>
          <SelectContent>
            {(docentes as any[])?.map(d => (
              <SelectItem key={d.id} value={d.id}>
                {d.usuario?.nombre_completo} - {d.especialidad || 'Docente'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowAsignarAsesorDialog(false)} className="flex-1">
          Cancelar
        </Button>
        <Button 
          onClick={() => {
            if (selectedDocenteId) {
              asignarAsesorMutation.mutate({ 
                postulacionId: selectedPostulacionId, 
                docenteId: selectedDocenteId 
              });
            } else {
              toast.error('Seleccione un docente');
            }
          }}
          className="flex-1 bg-blue-600"
        >
          Asignar Asesor
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

        <TabsContent value="horas">
          <Card><CardHeader className="flex flex-row justify-between"><CardTitle>Horas</CardTitle>{isEstudiante && <Dialog open={showHorasDialog} onOpenChange={setShowHorasDialog}><DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Registrar</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Registrar Horas</DialogTitle></DialogHeader><div className="space-y-4"><Input type="number" placeholder="Horas" value={horasData.horas_trabajadas} onChange={(e) => setHorasData({ ...horasData, horas_trabajadas: parseInt(e.target.value) })} /><Textarea placeholder="Descripción" value={horasData.descripcion_actividad} onChange={(e) => setHorasData({ ...horasData, descripcion_actividad: e.target.value })} /><Button onClick={() => { const post = postulaciones?.find(p => p.estado === 'aprobada'); if(post) registrarHorasMutation.mutate({ postulacion_id: post.id, ...horasData }); else toast.error('No hay práctica aprobada'); }}>Guardar</Button></div></DialogContent></Dialog>}</CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Horas</TableHead><TableHead>Descripción</TableHead></TableRow></TableHeader><TableBody>{postulaciones?.flatMap(p => p.horas || []).map(h => (<TableRow key={h.id}><TableCell>{new Date(h.fecha).toLocaleDateString()}</TableCell><TableCell>{h.horas_trabajadas}</TableCell><TableCell>{h.descripcion_actividad}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </TabsContent>
        <TabsContent value="informes">
          <Card><CardHeader className="flex flex-row justify-between"><CardTitle>Informes</CardTitle>{isEstudiante && <Dialog open={showInformeDialog} onOpenChange={setShowInformeDialog}><DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4" /> Subir</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Subir Informe</Title></DialogHeader><div className="space-y-4"><select className="w-full p-2 border rounded" value={informeData.tipo} onChange={(e) => setInformeData({ ...informeData, tipo: e.target.value as any })}><option value="inicial">Inicial</option><option value="intermedio">Intermedio</option><option value="final">Final</option></select><Input placeholder="Título" value={informeData.titulo} onChange={(e) => setInformeData({ ...informeData, titulo: e.target.value })} /><Textarea placeholder="Contenido" rows={4} value={informeData.contenido} onChange={(e) => setInformeData({ ...informeData, contenido: e.target.value })} /><Button onClick={() => { const post = postulaciones?.find(p => p.estado === 'aprobada'); if(post) crearInformeMutation.mutate({ postulacion_id: post.id, ...informeData as any }); else toast.error('No hay práctica aprobada'); }}>Enviar</Button></div></DialogContent></Dialog>}</CardHeader>
            <CardContent><Table><TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Título</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{postulaciones?.flatMap(p => p.informes || []).map(i => (<TableRow key={i.id}><TableCell>{i.tipo}</TableCell><TableCell>{i.titulo}</TableCell><TableCell>{new Date(i.fecha_entrega).toLocaleDateString()}</TableCell><TableCell><Badge className={i.estado === 'revisado' ? 'bg-green-500' : i.estado === 'observado' ? 'bg-red-500' : 'bg-yellow-500'}>{i.estado}</Badge></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}