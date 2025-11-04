import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Crown, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoryLeadersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  groupId: string;
  categoryName: string;
}

interface CategoryRole {
  id: string;
  member_id: string;
  role: 'presidente' | 'secretario' | 'auxiliar';
  members: {
    id: string;
    name: string;
    profile_image_url: string | null;
  };
}

interface Member {
  id: string;
  name: string;
  profile_image_url: string | null;
}

export function CategoryLeadersDialog({
  open,
  onOpenChange,
  categoryId,
  groupId,
  categoryName,
}: CategoryLeadersDialogProps) {
  const [leaders, setLeaders] = useState<CategoryRole[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'presidente' | 'secretario' | 'auxiliar'>("auxiliar");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadLeaders();
      loadMembers();
    }
  }, [open, categoryId, groupId]);

  const loadLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from("category_roles")
        .select(`
          id,
          member_id,
          role,
          members!category_roles_member_id_fkey (
            id,
            name,
            profile_image_url
          )
        `)
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;
      setLeaders(data as any);
    } catch (error) {
      console.error("Erro ao carregar líderes:", error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, profile_image_url")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao carregar membros:", error);
        toast({
          title: "Erro ao carregar membros",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Membros carregados:", data?.length || 0, "para o grupo:", groupId);
      setMembers(data || []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      toast({
        title: "Erro ao carregar membros",
        variant: "destructive",
      });
    }
  };

  const handleAddLeader = async () => {
    if (!selectedMember) return;

    setLoading(true);
    try {
      // Verificar se já existe presidente ou secretário
      if (selectedRole === 'presidente' || selectedRole === 'secretario') {
        const existing = leaders.find(l => l.role === selectedRole);
        if (existing) {
          toast({
            title: "Erro",
            description: `Já existe um ${selectedRole} nesta categoria.`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from("category_roles")
        .insert({
          category_id: categoryId,
          member_id: selectedMember,
          role: selectedRole,
          group_id: groupId,
        });

      if (error) throw error;

      // Criar notificação para o membro atribuído
      const { error: notificationError } = await supabase
        .from("category_role_notifications")
        .insert({
          member_id: selectedMember,
          category_id: categoryId,
          role: selectedRole,
          is_read: false,
        });

      if (notificationError) {
        console.error("Erro ao criar notificação:", notificationError);
      }

      toast({
        title: "Líder adicionado",
        description: "O membro foi atribuído à categoria com sucesso e será notificado.",
      });

      setSelectedMember("");
      loadLeaders();
    } catch (error) {
      console.error("Erro ao adicionar líder:", error);
      toast({
        title: "Erro ao adicionar líder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLeader = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("category_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Líder removido",
        description: "O membro foi removido da categoria.",
      });

      loadLeaders();
    } catch (error) {
      console.error("Erro ao remover líder:", error);
      toast({
        title: "Erro ao remover líder",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'presidente':
        return <Crown className="h-4 w-4" />;
      case 'secretario':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'presidente':
        return 'default';
      case 'secretario':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl sm:text-2xl">Gerir Líderes</DialogTitle>
              <p className="text-sm text-muted-foreground font-normal">{categoryName}</p>
            </div>
          </div>
          <DialogDescription>
            Atribua presidente, secretário e auxiliares para esta categoria financeira.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Adicionar novo líder */}
          <div className="space-y-3 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-primary/10 shadow-sm transition-all duration-300 hover:shadow-md">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Adicionar Líder
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="w-full sm:flex-1 h-11 bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
                  <SelectValue placeholder="Selecionar membro..." />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => !leaders.find(l => l.member_id === m.id))
                    .map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as any)}>
                <SelectTrigger className="w-full sm:w-40 h-11 bg-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="secretario">Secretário</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={handleAddLeader} 
                disabled={!selectedMember || loading}
                className="w-full sm:w-auto h-11 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Adicionando...</span>
                  </div>
                ) : (
                  'Adicionar'
                )}
              </Button>
            </div>
          </div>

          {/* Lista de líderes atuais */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              Líderes Atuais
            </h4>
            {leaders.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed rounded-xl bg-muted/30">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum líder atribuído a esta categoria.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-xl hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-md bg-background/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={leader.members.profile_image_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                          {leader.members.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{leader.members.name}</p>
                        <Badge 
                          variant={getRoleBadgeVariant(leader.role)} 
                          className="mt-1.5 flex items-center gap-1.5 w-fit shadow-sm"
                        >
                          {getRoleIcon(leader.role)}
                          <span className="capitalize font-medium">{leader.role}</span>
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLeader(leader.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                      <span className="sm:hidden">Remover</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
