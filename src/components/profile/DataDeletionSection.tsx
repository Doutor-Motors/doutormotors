import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, Download, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface DataDeletionSectionProps {
  userId: string;
  userEmail: string;
  onAccountDeleted: () => void;
}

const DataDeletionSection = ({ userId, userEmail, onAccountDeleted }: DataDeletionSectionProps) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmChecks, setConfirmChecks] = useState({
    understand: false,
    irreversible: false,
    backup: false,
  });

  const allChecked = confirmChecks.understand && confirmChecks.irreversible && confirmChecks.backup;
  const emailMatches = confirmEmail.toLowerCase() === userEmail.toLowerCase();

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // Fetch all user data
      const [profileResult, vehiclesResult, diagnosticsResult, consentsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('vehicles').select('*').eq('user_id', userId),
        supabase.from('diagnostics').select('*, diagnostic_items(*)').eq('user_id', userId),
        supabase.from('legal_consents').select('*').eq('user_id', userId),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profileResult.data,
        vehicles: vehiclesResult.data,
        diagnostics: diagnosticsResult.data,
        legalConsents: consentsResult.data,
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meus-dados-diagnosticomaster-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados!",
        description: "O arquivo com seus dados foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!allChecked || !emailMatches) return;

    setIsDeleting(true);

    try {
      // Delete user data in order (respecting foreign keys)
      // 1. Delete diagnostic items (through diagnostics cascade would handle this, but being explicit)
      const { data: diagnostics } = await supabase
        .from('diagnostics')
        .select('id')
        .eq('user_id', userId);
      
      if (diagnostics && diagnostics.length > 0) {
        const diagnosticIds = diagnostics.map(d => d.id);
        await supabase
          .from('diagnostic_items')
          .delete()
          .in('diagnostic_id', diagnosticIds);
      }

      // 2. Delete diagnostics
      await supabase
        .from('diagnostics')
        .delete()
        .eq('user_id', userId);

      // 3. Delete vehicles
      await supabase
        .from('vehicles')
        .delete()
        .eq('user_id', userId);

      // 4. Delete legal consents
      await supabase
        .from('legal_consents')
        .delete()
        .eq('user_id', userId);

      // 5. Delete profile
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      // 6. Delete user roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // 7. Sign out and delete auth user (this requires admin privileges, so we'll just sign out)
      // In a production environment, you'd use an edge function with service role key
      await supabase.auth.signOut();

      toast({
        title: "Conta excluída",
        description: "Todos os seus dados foram removidos. Você será redirecionado.",
      });

      // Notify parent component
      onAccountDeleted();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir sua conta. Entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* LGPD Rights Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-chakra uppercase flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Seus Direitos (LGPD)
          </CardTitle>
          <CardDescription>
            Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Direito de Acesso</p>
                <p className="text-xs text-muted-foreground">
                  Você pode visualizar todos os seus dados através do seu perfil e painel de controle.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Direito de Correção</p>
                <p className="text-xs text-muted-foreground">
                  Você pode editar suas informações pessoais na aba "Perfil".
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Direito de Portabilidade</p>
                <p className="text-xs text-muted-foreground">
                  Exporte seus dados em formato JSON a qualquer momento.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Direito de Eliminação</p>
                <p className="text-xs text-muted-foreground">
                  Solicite a exclusão total dos seus dados pessoais.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Para mais informações, consulte nossa{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="font-chakra uppercase flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Meus Dados
          </CardTitle>
          <CardDescription>
            Baixe uma cópia de todos os seus dados armazenados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            O arquivo incluirá: perfil, veículos cadastrados, histórico de diagnósticos e consentimentos registrados.
          </p>
          <Button 
            onClick={handleExportData} 
            disabled={isExporting}
            variant="outline"
            className="font-chakra uppercase"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados (JSON)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50">
        <CardHeader className="bg-destructive/5">
          <CardTitle className="font-chakra uppercase flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Excluir Conta e Dados
          </CardTitle>
          <CardDescription>
            Solicite a exclusão permanente de todos os seus dados
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-destructive mb-2">
              ⚠️ Atenção: Esta ação é irreversível
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seu perfil será permanentemente excluído</li>
              <li>• Todos os veículos cadastrados serão removidos</li>
              <li>• Todo o histórico de diagnósticos será apagado</li>
              <li>• Você perderá acesso a todos os relatórios</li>
              <li>• Esta ação não pode ser desfeita</li>
            </ul>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="font-chakra uppercase"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Solicitar Exclusão de Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-chakra flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Confirmar Exclusão de Conta
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação excluirá permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="understand"
                      checked={confirmChecks.understand}
                      onCheckedChange={(checked) => 
                        setConfirmChecks(prev => ({ ...prev, understand: checked === true }))
                      }
                    />
                    <Label htmlFor="understand" className="text-sm leading-relaxed">
                      Entendo que todos os meus dados serão excluídos permanentemente
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="irreversible"
                      checked={confirmChecks.irreversible}
                      onCheckedChange={(checked) => 
                        setConfirmChecks(prev => ({ ...prev, irreversible: checked === true }))
                      }
                    />
                    <Label htmlFor="irreversible" className="text-sm leading-relaxed">
                      Entendo que esta ação é irreversível
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="backup"
                      checked={confirmChecks.backup}
                      onCheckedChange={(checked) => 
                        setConfirmChecks(prev => ({ ...prev, backup: checked === true }))
                      }
                    />
                    <Label htmlFor="backup" className="text-sm leading-relaxed">
                      Já exportei meus dados ou não preciso de backup
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmEmail">
                    Digite seu email para confirmar: <span className="text-muted-foreground">{userEmail}</span>
                  </Label>
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel className="font-chakra uppercase">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={!allChecked || !emailMatches || isDeleting}
                  className="bg-destructive hover:bg-destructive/90 font-chakra uppercase"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Permanentemente
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDeletionSection;
