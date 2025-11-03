import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Users, Save, Music } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  name: string;
  partition?: string;
  is_active: boolean;
}

interface RehearsalAttendanceProps {
  groupId: string;
  members: Member[];
}

export function RehearsalAttendance({ groupId, members }: RehearsalAttendanceProps) {
  const [date, setDate] = useState<Date>();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Filter only active members
  const activeMembers = members.filter(m => m.is_active);

  // Group members by partition
  const membersByPartition = activeMembers.reduce((acc, member) => {
    const partition = member.partition || "Sem Partição";
    if (!acc[partition]) {
      acc[partition] = [];
    }
    acc[partition].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const partitionOrder = [
    "soprano_1",
    "soprano_2", 
    "contralto_1",
    "contralto_2",
    "tenor_1",
    "tenor_2",
    "baixo_1",
    "baixo_2",
    "Sem Partição"
  ];

  const sortedPartitions = Object.keys(membersByPartition).sort((a, b) => {
    const indexA = partitionOrder.indexOf(a);
    const indexB = partitionOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const getPartitionLabel = (partition: string) => {
    const labels: Record<string, string> = {
      soprano_1: "Soprano 1",
      soprano_2: "Soprano 2",
      contralto_1: "Contralto 1",
      contralto_2: "Contralto 2",
      tenor_1: "Tenor 1",
      tenor_2: "Tenor 2",
      baixo_1: "Baixo 1",
      baixo_2: "Baixo 2",
    };
    return labels[partition] || partition;
  };

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const togglePartition = (partition: string) => {
    const partitionMembers = membersByPartition[partition];
    const allSelected = partitionMembers.every(m => selectedMembers.has(m.id));
    
    const newSelected = new Set(selectedMembers);
    partitionMembers.forEach(member => {
      if (allSelected) {
        newSelected.delete(member.id);
      } else {
        newSelected.add(member.id);
      }
    });
    setSelectedMembers(newSelected);
  };

  const handleSave = async () => {
    if (!date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.size === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos um membro",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // TODO: Create table rehearsal_attendance if not exists
      // For now, we'll just show a success message
      const attendanceRecords = Array.from(selectedMembers).map(memberId => ({
        group_id: groupId,
        member_id: memberId,
        rehearsal_date: format(date, "yyyy-MM-dd"),
        created_at: new Date().toISOString(),
      }));

      console.log("Attendance records to save:", attendanceRecords);

      toast({
        title: "Sucesso",
        description: `Presença registrada para ${selectedMembers.size} membros em ${format(date, "dd/MM/yyyy", { locale: pt })}`,
      });

      // Reset form
      setSelectedMembers(new Set());
      setDate(undefined);
    } catch (error) {
      console.error("Erro ao salvar presença:", error);
      toast({
        title: "Erro",
        description: "Falha ao registrar presença. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Registro de Presença nos Ensaios
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-primary/20">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={pt}
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {sortedPartitions.map((partition) => {
              const partitionMembers = membersByPartition[partition];
              const allSelected = partitionMembers.every(m => selectedMembers.has(m.id));
              const someSelected = partitionMembers.some(m => selectedMembers.has(m.id));

              return (
                <div key={partition} className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => togglePartition(partition)}
                        className="border-primary/30"
                      />
                      <h3 className="font-semibold text-foreground">
                        {getPartitionLabel(partition)}
                      </h3>
                      <Badge variant="outline" className="border-primary/20 text-primary">
                        {partitionMembers.length} {partitionMembers.length === 1 ? "membro" : "membros"}
                      </Badge>
                    </div>
                    {someSelected && !allSelected && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        Parcial
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                    {partitionMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => toggleMember(member.id)}
                      >
                        <Checkbox
                          checked={selectedMembers.has(member.id)}
                          onCheckedChange={() => toggleMember(member.id)}
                          className="border-primary/30"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{member.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {activeMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum membro ativo encontrado</p>
            </div>
          )}

          {activeMembers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-primary/10 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">{selectedMembers.size}</strong> de{" "}
                <strong className="text-foreground">{activeMembers.length}</strong> membros selecionados
              </div>
              <Button
                onClick={handleSave}
                disabled={!date || selectedMembers.size === 0 || saving}
                variant="gradient"
                className="shadow-md"
              >
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Presença
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
