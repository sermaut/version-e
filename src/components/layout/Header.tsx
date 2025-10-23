import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, User, LogOut, Shield, Users, Menu, Eye, EyeOff } from "lucide-react";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAdmin, isMember } = useAuth();
  const { t } = useTranslation();
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (showCode) {
      const timer = setTimeout(() => {
        setShowCode(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCode]);

  const getDisplayInfo = () => {
    if (!user) return { name: 'Usuário', code: '---', icon: User };

    if (isAdmin()) {
      const admin = user.data as any;
      return {
        name: admin.name || 'Administrador',
        code: admin.access_code,
        icon: Shield
      };
    } else {
      const member = user.data as any;
      return {
        name: member.name || 'Membro',
        code: member.member_code,
        icon: Users
      };
    }
  };

  const { name, code, icon: UserIcon } = getDisplayInfo();

  return (
    <header className="h-16 border-b border-border/50 bg-gradient-to-r from-card via-card to-card/95 
                       backdrop-blur-xl shadow-soft sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search com efeito de foco */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 
                              text-muted-foreground w-4 h-4 
                              group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar grupos, membros..."
              className="pl-10 bg-background/50 border-2 border-border/50 
                         focus:border-primary focus:ring-4 focus:ring-primary/10 
                         transition-all duration-300 hover:border-primary/50"
            />
          </div>
        </div>

        {/* User info com avatar animado */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <LanguageSelector />
          
          {/* Notificação com pulso */}
          <Button variant="ghost" size="icon" className="relative hidden md:flex group">
            <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-accent to-accent/70 
                             rounded-full flex items-center justify-center shadow-glow-accent animate-pulse">
              <span className="text-white text-xs font-bold">3</span>
            </span>
          </Button>
          
          <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-xs md:text-sm font-semibold text-foreground">{name}</p>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-muted-foreground">Código:</p>
                {showCode ? (
                  <span className="text-xs text-primary font-mono font-semibold">{code}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">••••••</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCode(!showCode)}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>
            
            {/* Avatar com gradiente e animação */}
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-full blur opacity-0 
                              group-hover:opacity-75 transition-opacity duration-500" />
              <Button variant="outline" size="icon" 
                      className="relative rounded-full w-8 h-8 md:w-10 md:h-10 border-2 
                                 border-primary/20 hover:border-primary hover:scale-110 
                                 transition-all duration-300 gradient-primary">
                <UserIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </Button>
            </div>
            
            {/* Botão de logout com hover effect */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 
                         w-8 h-8 md:w-10 md:h-10 hidden md:flex transition-all duration-300
                         hover:scale-110 hover:rotate-12"
              title="Sair do sistema"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}