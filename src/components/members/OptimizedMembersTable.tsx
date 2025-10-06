import React, { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Eye, Edit, User } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role?: string;
  partition?: string;
  is_active: boolean;
  phone?: string;
  member_code?: string;
  profile_image_url?: string;
}

interface OptimizedMembersTableProps {
  members: Member[];
  onMemberView: (memberId: string) => void;
  onMemberEdit?: (memberId: string) => void;
  showActions?: boolean;
}

const MemberRow = memo(({ 
  member, 
  onMemberView, 
  onMemberEdit, 
  showActions = true 
}: { 
  member: Member; 
  onMemberView: (id: string) => void;
  onMemberEdit?: (id: string) => void;
  showActions?: boolean;
}) => {
  const initials = useMemo(() => {
    return member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [member.name]);

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 py-3 border-r border-border/50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={member.profile_image_url} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.role && (
          <Badge variant="secondary" className="capitalize">
            {member.role.replace('_', ' ')}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.partition && (
          <span className="text-sm capitalize text-muted-foreground">
            {member.partition}
          </span>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{member.phone}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        <Badge variant={member.is_active ? "default" : "secondary"}>
          {member.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </td>
      {showActions && (
        <td className="px-4 py-3">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMemberView(member.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {onMemberEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMemberEdit(member.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

MemberRow.displayName = "MemberRow";

export const OptimizedMembersTable = memo(({ 
  members, 
  onMemberView, 
  onMemberEdit,
  showActions = true 
}: OptimizedMembersTableProps) => {
  const memoizedMembers = useMemo(() => members, [members]);

  if (memoizedMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum membro encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-2 py-1 text-center text-sm font-medium text-muted-foreground w-12 border-r border-border/50">
              Nº.
            </th>
            <th className="px-3 py-1 text-center text-sm font-medium text-muted-foreground w-16 border-r border-border/50">
              Foto
            </th>
            <th className="px-4 py-1 text-left text-sm font-medium text-muted-foreground">
              Nome Completo
            </th>
          </tr>
        </thead>
        <tbody>
          {memoizedMembers.map((member, index) => (
            <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
              <td className="px-2 py-1.5 text-center text-sm text-muted-foreground border-r border-border/50">
                {index + 1}
              </td>
              <td className="px-3 py-1.5 text-center border-r border-border/50">
                <Avatar 
                  className="w-9 h-9 mx-auto cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 rounded-md border-2 border-border/50 hover:border-primary/50 shadow-sm"
                  onClick={() => {
                    if (member.profile_image_url) {
                      const overlay = document.createElement('div');
                      overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.95);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                        cursor: zoom-out;
                        animation: fadeIn 0.2s ease-in-out;
                      `;
                      
                      const img = document.createElement('img');
                      img.src = member.profile_image_url;
                      img.style.cssText = `
                        max-width: 90%;
                        max-height: 90%;
                        object-fit: contain;
                        border-radius: 8px;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        animation: zoomIn 0.3s ease-out;
                      `;
                      
                      const closeBtn = document.createElement('button');
                      closeBtn.innerHTML = '✕';
                      closeBtn.style.cssText = `
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: white;
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        backdrop-filter: blur(10px);
                        transition: all 0.2s;
                      `;
                      closeBtn.onmouseover = () => {
                        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                        closeBtn.style.transform = 'scale(1.1)';
                      };
                      closeBtn.onmouseout = () => {
                        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                        closeBtn.style.transform = 'scale(1)';
                      };
                      
                      const memberName = document.createElement('div');
                      memberName.textContent = member.name;
                      memberName.style.cssText = `
                        position: absolute;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        color: white;
                        font-size: 18px;
                        font-weight: 500;
                        background: rgba(0, 0, 0, 0.5);
                        padding: 10px 20px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                      `;
                      
                      const style = document.createElement('style');
                      style.textContent = `
                        @keyframes fadeIn {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        @keyframes zoomIn {
                          from { transform: scale(0.8); opacity: 0; }
                          to { transform: scale(1); opacity: 1; }
                        }
                      `;
                      
                      document.head.appendChild(style);
                      overlay.appendChild(img);
                      overlay.appendChild(closeBtn);
                      overlay.appendChild(memberName);
                      document.body.appendChild(overlay);
                      
                      const closeOverlay = () => {
                        overlay.style.animation = 'fadeIn 0.2s ease-in-out reverse';
                        setTimeout(() => {
                          document.body.removeChild(overlay);
                          document.head.removeChild(style);
                        }, 200);
                      };
                      
                      overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) closeOverlay();
                      });
                      closeBtn.addEventListener('click', closeOverlay);
                      
                      document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                          closeOverlay();
                          document.removeEventListener('keydown', escHandler);
                        }
                      });
                    }
                  }}
                >
                  <AvatarImage src={member.profile_image_url} className="object-cover" />
                  <AvatarFallback className="text-xs rounded-md bg-gradient-to-br from-primary/20 to-primary/10">
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </td>
              <td className="px-4 py-1.5">
                <button
                  className="text-left hover:text-primary transition-colors font-medium"
                  onClick={() => onMemberView(member.id)}
                >
                  {member.name}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}); 

OptimizedMembersTable.displayName = "OptimizedMembersTable";