'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Calendar, Users, FileText, CheckCircle, Clock, UserCheck, Award } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export default function StudentThesisPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const { data: misTesis, isLoading } = trpc.thesis.getProyectos.useQuery();
  const tesisDelEstudiante = misTesis?.filter((t: any) => t.estudiante?.usuario?.id === user?.id);

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  const getEstadoInfo = (estado: string) => {
    const estados: Record<string, { label: string; color: string; icon: any }> = {
      propuesta: { label: 'Propuesta', color: 'bg-yellow-500', icon: Clock },
      en_curso: { label: 'En Curso', color: 'bg-blue-500', icon: GraduationCap },
      sustentada: { label: 'Sustentada', color: 'bg-purple-500', icon: CheckCircle },
      finalizada: { label: 'Finalizada', color: 'bg-green-500', icon: Award },
    };
    return estados[estado] || { label: estado, color: 'bg-gray-500', icon: Clock };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Proyecto de Tesis</h1>
        <p className="text-muted-foreground">Seguimiento de tu proyecto de investigación</p>
      </div>

      {tesisDelEstudiante?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <GraduationCap className="h-20 w-20 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-semibold text-foreground">No tienes un proyecto de tesis registrado</h3>
            <p className="text-muted-foreground mt-2">Si ya has iniciado tu proyecto, contacta con tu asesor para registrarlo en el sistema.</p>
          </CardContent>
        </Card>
      ) : (
        tesisDelEstudiante?.map((tesis: any) => {
          const estadoInfo = getEstadoInfo(tesis.estado);
          const EstadoIcon = estadoInfo.icon;
          
          return (
            <div key={tesis.id} className="space-y-6">
              {/* Información General */}
              <Card className="overflow-hidden">
                <div className={`h-1 w-full ${estadoInfo.color}`} />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{tesis.titulo}</h2>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Registrado: {formatDate(tesis.fecha_registro)}
                      </p>
                    </div>
                    <Badge className={`${estadoInfo.color} text-white px-3 py-1`}>
                      <EstadoIcon className="h-3 w-3 mr-1" />
                      {estadoInfo.label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{tesis.descripcion}</p>
                </CardContent>
              </Card>

              {/* Asesor */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Asesor Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="font-semibold text-foreground text-lg">{tesis.asesor?.usuario?.nombre_completo}</p>
                    <p className="text-sm text-muted-foreground mt-1">Especialidad: {tesis.asesor?.especialidad || 'No especificada'}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">Email: {tesis.asesor?.usuario?.correo || 'No disponible'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Jurados */}
              {tesis.jurados?.length > 0 && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Jurado Evaluador
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {tesis.jurados.map((j: any) => (
                        <div key={j.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div>
                            <p className="font-medium text-foreground">{j.docente?.usuario?.nombre_completo}</p>
                            <p className="text-sm text-muted-foreground">Cargo: {j.cargo || 'Vocal'}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{j.cargo || 'Vocal'}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Entregables */}
              <Card>
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Avances y Entregables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tesis.entregables?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No hay entregables registrados</div>
                  ) : (
                    <div className="space-y-4">
                      {tesis.entregables.map((e: any) => (
                        <div key={e.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{e.titulo}</p>
                              <p className="text-sm text-muted-foreground mt-1">{e.descripcion}</p>
                              <div className="flex flex-wrap gap-4 mt-3">
                                <span className="text-xs text-muted-foreground/70 flex items-center gap-1">📅 Fecha límite: {formatDate(e.fecha_limite)}</span>
                                {e.fecha_entrega && <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">✅ Entregado: {formatDate(e.fecha_entrega)}</span>}
                              </div>
                            </div>
                            <Badge className={
                              e.estado === 'aprobado' ? 'bg-green-500' :
                              e.estado === 'entregado' ? 'bg-blue-500' :
                              e.estado === 'observado' ? 'bg-red-500' : 'bg-yellow-500'
                            }>
                              {e.estado === 'aprobado' ? 'Aprobado' :
                               e.estado === 'entregado' ? 'Entregado' :
                               e.estado === 'observado' ? 'Observado' : 'Pendiente'}
                            </Badge>
                          </div>
                          {e.archivo_url && (
                            <a href={e.archivo_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm mt-3 inline-flex items-center gap-1 hover:underline">
                              📎 Ver Documento
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sustentación */}
              {tesis.sustentacion && (
                <Card>
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Sustentación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800/30">
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha y Hora</p>
                        <p className="font-medium text-foreground">{new Date(tesis.sustentacion.fecha_hora).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lugar</p>
                        <p className="font-medium text-foreground">{tesis.sustentacion.lugar || 'No especificado'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Resultado</p>
                        <p className="font-medium text-green-600 dark:text-green-400">{tesis.sustentacion.resultado || 'Pendiente'}</p>
                      </div>
                      {tesis.sustentacion.acta_url && (
                        <div>
                          <p className="text-xs text-muted-foreground">Acta</p>
                          <a href={tesis.sustentacion.acta_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">📄 Ver Acta</a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}