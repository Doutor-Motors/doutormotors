import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText, AlertTriangle, CheckCircle, Info, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TechnicalReport = () => {
  const navigate = useNavigate();
  
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Print styles */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; font-size: 10px; }
            table { page-break-inside: avoid; font-size: 9px; }
            h2 { page-break-after: avoid; }
            pre { font-size: 8px; white-space: pre-wrap; }
            .page-break { page-break-before: always; }
          }
        `}
      </style>

      {/* Header */}
      <div className="no-print bg-dm-space text-primary-foreground border-b sticky top-0 z-50 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 border-white/50 text-white hover:bg-white hover:text-dm-space"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-chakra uppercase">Voltar</span>
          </Button>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-primary hover:bg-dm-blue-3">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content" className="max-w-5xl mx-auto p-8 bg-background text-foreground">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
          <h1 className="text-3xl font-bold mb-2">RELATÓRIO TÉCNICO COMPLETO</h1>
          <h2 className="text-xl text-gray-600">Sistema Doutor Motors</h2>
          <p className="text-sm text-gray-500 mt-2">
            Gerado em: {new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-8 p-4 bg-gray-50 rounded">
          <h3 className="font-bold mb-3">ÍNDICE</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Estrutura de Páginas e Rotas</li>
            <li>Componentes e Funcionalidades</li>
            <li>Elementos Interativos (Botões e Ações)</li>
            <li>Banco de Dados</li>
            <li>Integrações e APIs</li>
            <li>Gerenciamento de Estado</li>
            <li>Autenticação e Autorização</li>
            <li>Configurações e Variáveis de Ambiente</li>
            <li>Fluxos de Dados</li>
            <li>Estrutura de Arquivos</li>
            <li>Erros, Avisos e Cuidados</li>
            <li>Edge Functions</li>
            <li>Feedback do Sistema</li>
            <li>O Que Falta Implementar</li>
            <li>Sugestões de Melhoria</li>
          </ol>
        </div>

        {/* Section 1 - ROTAS */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            1. ESTRUTURA DE PÁGINAS E ROTAS
          </h2>
          
          <h3 className="font-bold mt-4 mb-2">1.1 Rotas Públicas</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Rota</th>
                <th className="border border-gray-300 p-2 text-left">Componente</th>
                <th className="border border-gray-300 p-2 text-left">Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">/</td><td className="border border-gray-300 p-2">LandingPage</td><td className="border border-gray-300 p-2">Página inicial com apresentação do produto</td></tr>
              <tr><td className="border border-gray-300 p-2">/sobre</td><td className="border border-gray-300 p-2">AboutPage</td><td className="border border-gray-300 p-2">Informações sobre a empresa</td></tr>
              <tr><td className="border border-gray-300 p-2">/servicos</td><td className="border border-gray-300 p-2">ServicesPage</td><td className="border border-gray-300 p-2">Lista de serviços oferecidos</td></tr>
              <tr><td className="border border-gray-300 p-2">/como-funciona</td><td className="border border-gray-300 p-2">HowItWorksPage</td><td className="border border-gray-300 p-2">Explicação do funcionamento</td></tr>
              <tr><td className="border border-gray-300 p-2">/contato</td><td className="border border-gray-300 p-2">ContactPage</td><td className="border border-gray-300 p-2">Formulário de contato</td></tr>
              <tr><td className="border border-gray-300 p-2">/login</td><td className="border border-gray-300 p-2">LoginPage</td><td className="border border-gray-300 p-2">Autenticação de usuários</td></tr>
              <tr><td className="border border-gray-300 p-2">/signup</td><td className="border border-gray-300 p-2">SignUpPage</td><td className="border border-gray-300 p-2">Cadastro de novos usuários</td></tr>
              <tr><td className="border border-gray-300 p-2">/forgot-password</td><td className="border border-gray-300 p-2">ForgotPasswordPage</td><td className="border border-gray-300 p-2">Recuperação de senha</td></tr>
              <tr><td className="border border-gray-300 p-2">/reset-password</td><td className="border border-gray-300 p-2">ResetPasswordPage</td><td className="border border-gray-300 p-2">Redefinição de senha</td></tr>
              <tr><td className="border border-gray-300 p-2">/estude-seu-carro</td><td className="border border-gray-300 p-2">StudyCarPage</td><td className="border border-gray-300 p-2">Tutoriais sobre carros</td></tr>
              <tr><td className="border border-gray-300 p-2">/termos</td><td className="border border-gray-300 p-2">TermsPage</td><td className="border border-gray-300 p-2">Termos de uso</td></tr>
              <tr><td className="border border-gray-300 p-2">/privacidade</td><td className="border border-gray-300 p-2">PrivacyPolicyPage</td><td className="border border-gray-300 p-2">Política de privacidade</td></tr>
              <tr><td className="border border-gray-300 p-2">/faq</td><td className="border border-gray-300 p-2">FAQPage</td><td className="border border-gray-300 p-2">Perguntas frequentes</td></tr>
              <tr><td className="border border-gray-300 p-2">/relatorio-tecnico</td><td className="border border-gray-300 p-2">TechnicalReport</td><td className="border border-gray-300 p-2">Este relatório técnico</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">1.2 Rotas Protegidas (Usuário)</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Rota</th>
                <th className="border border-gray-300 p-2 text-left">Componente</th>
                <th className="border border-gray-300 p-2 text-left">Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">/dashboard</td><td className="border border-gray-300 p-2">UserDashboard</td><td className="border border-gray-300 p-2">Visão geral do usuário, alertas e estatísticas</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/vehicles</td><td className="border border-gray-300 p-2">VehicleManager</td><td className="border border-gray-300 p-2">CRUD de veículos do usuário</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/diagnostics</td><td className="border border-gray-300 p-2">DiagnosticCenter</td><td className="border border-gray-300 p-2">Centro de diagnóstico OBD2</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/diagnostics/:id</td><td className="border border-gray-300 p-2">DiagnosticReport</td><td className="border border-gray-300 p-2">Detalhes de um diagnóstico específico</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/solutions/:diagnosticItemId</td><td className="border border-gray-300 p-2">SolutionGuide</td><td className="border border-gray-300 p-2">Guias de reparo para problemas</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/history</td><td className="border border-gray-300 p-2">DiagnosticHistory</td><td className="border border-gray-300 p-2">Histórico completo de diagnósticos</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/support</td><td className="border border-gray-300 p-2">SupportCenter</td><td className="border border-gray-300 p-2">Central de tickets de suporte</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/support/:id</td><td className="border border-gray-300 p-2">TicketDetail</td><td className="border border-gray-300 p-2">Detalhes de ticket de suporte</td></tr>
              <tr><td className="border border-gray-300 p-2">/profile</td><td className="border border-gray-300 p-2">UserProfile</td><td className="border border-gray-300 p-2">Configurações da conta do usuário</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">1.3 Rotas Admin (Protegidas + Role Admin)</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Rota</th>
                <th className="border border-gray-300 p-2 text-left">Componente</th>
                <th className="border border-gray-300 p-2 text-left">Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">/admin</td><td className="border border-gray-300 p-2">AdminDashboard</td><td className="border border-gray-300 p-2">Dashboard administrativo</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/users</td><td className="border border-gray-300 p-2">AdminUsers</td><td className="border border-gray-300 p-2">Gerenciamento de usuários</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/vehicles</td><td className="border border-gray-300 p-2">AdminVehicles</td><td className="border border-gray-300 p-2">Gerenciamento de veículos</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/diagnostics</td><td className="border border-gray-300 p-2">AdminDiagnostics</td><td className="border border-gray-300 p-2">Gerenciamento de diagnósticos</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/tickets</td><td className="border border-gray-300 p-2">AdminTickets</td><td className="border border-gray-300 p-2">Gerenciamento de tickets</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/messages</td><td className="border border-gray-300 p-2">AdminMessages</td><td className="border border-gray-300 p-2">Mensagens de contato</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/reports</td><td className="border border-gray-300 p-2">AdminReports</td><td className="border border-gray-300 p-2">Relatórios e gráficos</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/logs</td><td className="border border-gray-300 p-2">AdminLogs</td><td className="border border-gray-300 p-2">Logs do sistema</td></tr>
              <tr><td className="border border-gray-300 p-2">/admin/settings</td><td className="border border-gray-300 p-2">AdminSettings</td><td className="border border-gray-300 p-2">Configurações do admin</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 2 - COMPONENTES */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            2. COMPONENTES E FUNCIONALIDADES
          </h2>
          
          <h3 className="font-bold mt-4 mb-2">2.1 OBDConnector</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Arquivo</td><td className="border border-gray-300 p-2">src/components/obd/OBDConnector.tsx</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Funcionalidade</td><td className="border border-gray-300 p-2">Conexão Bluetooth/Wi-Fi com adaptador OBD2, leitura de códigos DTC</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Props</td><td className="border border-gray-300 p-2">onDataReceived, onConnectionChange</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Estados</td><td className="border border-gray-300 p-2">obdConnectionStatus (via Zustand)</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Hooks</td><td className="border border-gray-300 p-2">useCallback, useAppStore, useToast</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">2.2 DashboardLayout</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Arquivo</td><td className="border border-gray-300 p-2">src/components/dashboard/DashboardLayout.tsx</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Funcionalidade</td><td className="border border-gray-300 p-2">Layout principal do dashboard com sidebar e navegação</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Recursos</td><td className="border border-gray-300 p-2">Menu lateral, navegação mobile, logout</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">2.3 AdminLayout</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Arquivo</td><td className="border border-gray-300 p-2">src/components/admin/AdminLayout.tsx</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Funcionalidade</td><td className="border border-gray-300 p-2">Layout do painel administrativo</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Recursos</td><td className="border border-gray-300 p-2">Sidebar admin, notificações, estatísticas</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">2.4 Serviços de Diagnóstico</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>dtcDatabase.ts</strong> - Base de códigos DTC com descrições em português</li>
            <li><strong>engine.ts</strong> - Motor de análise com fallback para banco local</li>
            <li><strong>priorityClassifier.ts</strong> - Classificação por severidade (crítico/atenção/preventivo)</li>
            <li><strong>recommender.ts</strong> - Recomendador de soluções DIY</li>
          </ul>

          <h3 className="font-bold mt-4 mb-2">2.5 Componentes de UI (shadcn/ui)</h3>
          <div className="bg-gray-50 p-3 rounded text-sm">
            <p>O sistema utiliza uma biblioteca completa de componentes shadcn/ui:</p>
            <p className="mt-2">Button, Card, Dialog, Form, Input, Select, Table, Tabs, Toast, Tooltip, Avatar, Badge, Accordion, Alert, Calendar, Checkbox, Command, Dropdown, Label, Popover, Progress, RadioGroup, ScrollArea, Separator, Sheet, Skeleton, Slider, Switch, Textarea, Toggle</p>
          </div>
        </section>

        {/* Section 3 - BOTÕES */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            3. ELEMENTOS INTERATIVOS (BOTÕES E AÇÕES)
          </h2>
          
          <h3 className="font-bold mt-4 mb-2">3.1 DiagnosticCenter</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Botão</th>
                <th className="border border-gray-300 p-2 text-left">Ação</th>
                <th className="border border-gray-300 p-2 text-left">API/Função</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">Conectar OBD2</td><td className="border border-gray-300 p-2">Inicia conexão Bluetooth com adaptador</td><td className="border border-gray-300 p-2">OBDConnector.connect()</td></tr>
              <tr><td className="border border-gray-300 p-2">Executar Diagnóstico</td><td className="border border-gray-300 p-2">Lê DTCs e processa com IA</td><td className="border border-gray-300 p-2">supabase.functions.invoke('diagnose')</td></tr>
              <tr><td className="border border-gray-300 p-2">Desconectar</td><td className="border border-gray-300 p-2">Encerra conexão OBD2</td><td className="border border-gray-300 p-2">OBDConnector.disconnect()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">3.2 VehicleManager</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Botão</th>
                <th className="border border-gray-300 p-2 text-left">Ação</th>
                <th className="border border-gray-300 p-2 text-left">API/Função</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">Adicionar Veículo</td><td className="border border-gray-300 p-2">Abre modal de cadastro</td><td className="border border-gray-300 p-2">Estado local (modal)</td></tr>
              <tr><td className="border border-gray-300 p-2">Salvar</td><td className="border border-gray-300 p-2">Insere veículo no banco</td><td className="border border-gray-300 p-2">supabase.from('vehicles').insert()</td></tr>
              <tr><td className="border border-gray-300 p-2">Editar</td><td className="border border-gray-300 p-2">Atualiza dados do veículo</td><td className="border border-gray-300 p-2">supabase.from('vehicles').update()</td></tr>
              <tr><td className="border border-gray-300 p-2">Excluir</td><td className="border border-gray-300 p-2">Remove veículo (com confirmação)</td><td className="border border-gray-300 p-2">supabase.from('vehicles').delete()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">3.3 SupportCenter</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Botão</th>
                <th className="border border-gray-300 p-2 text-left">Ação</th>
                <th className="border border-gray-300 p-2 text-left">API/Função</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">Novo Ticket</td><td className="border border-gray-300 p-2">Abre formulário de ticket</td><td className="border border-gray-300 p-2">Estado local</td></tr>
              <tr><td className="border border-gray-300 p-2">Enviar Ticket</td><td className="border border-gray-300 p-2">Cria ticket de suporte</td><td className="border border-gray-300 p-2">supabase.from('support_tickets').insert()</td></tr>
              <tr><td className="border border-gray-300 p-2">Enviar Mensagem</td><td className="border border-gray-300 p-2">Adiciona mensagem ao ticket</td><td className="border border-gray-300 p-2">supabase.from('ticket_messages').insert()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">3.4 Autenticação</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Botão</th>
                <th className="border border-gray-300 p-2 text-left">Ação</th>
                <th className="border border-gray-300 p-2 text-left">API/Função</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">Login</td><td className="border border-gray-300 p-2">Autentica usuário</td><td className="border border-gray-300 p-2">supabase.auth.signInWithPassword()</td></tr>
              <tr><td className="border border-gray-300 p-2">Criar Conta</td><td className="border border-gray-300 p-2">Registra novo usuário</td><td className="border border-gray-300 p-2">supabase.auth.signUp()</td></tr>
              <tr><td className="border border-gray-300 p-2">Recuperar Senha</td><td className="border border-gray-300 p-2">Envia email de recuperação</td><td className="border border-gray-300 p-2">supabase.auth.resetPasswordForEmail()</td></tr>
              <tr><td className="border border-gray-300 p-2">Logout</td><td className="border border-gray-300 p-2">Encerra sessão</td><td className="border border-gray-300 p-2">supabase.auth.signOut()</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 4 - BANCO DE DADOS */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            4. BANCO DE DADOS
          </h2>

          <h3 className="font-bold mt-4 mb-2">4.1 Tabela: vehicles</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
                <th className="border border-gray-300 p-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">gen_random_uuid()</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">brand</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">model</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">year</td><td className="border border-gray-300 p-2">integer</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">engine</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">fuel_type</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">license_plate</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">created_at</td><td className="border border-gray-300 p-2">timestamptz</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">now()</td></tr>
              <tr><td className="border border-gray-300 p-2">updated_at</td><td className="border border-gray-300 p-2">timestamptz</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">now()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.2 Tabela: diagnostics</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
                <th className="border border-gray-300 p-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">gen_random_uuid()</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">vehicle_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">FK → vehicles</td></tr>
              <tr><td className="border border-gray-300 p-2">status</td><td className="border border-gray-300 p-2">diagnostic_status</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">'pending'</td></tr>
              <tr><td className="border border-gray-300 p-2">obd_raw_data</td><td className="border border-gray-300 p-2">jsonb</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">notes</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">created_at</td><td className="border border-gray-300 p-2">timestamptz</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">now()</td></tr>
              <tr><td className="border border-gray-300 p-2">updated_at</td><td className="border border-gray-300 p-2">timestamptz</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">now()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.3 Tabela: diagnostic_items</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
                <th className="border border-gray-300 p-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">gen_random_uuid()</td></tr>
              <tr><td className="border border-gray-300 p-2">diagnostic_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">FK → diagnostics</td></tr>
              <tr><td className="border border-gray-300 p-2">dtc_code</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">description_human</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">priority</td><td className="border border-gray-300 p-2">diagnostic_priority</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">'attention'</td></tr>
              <tr><td className="border border-gray-300 p-2">severity</td><td className="border border-gray-300 p-2">integer</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">5</td></tr>
              <tr><td className="border border-gray-300 p-2">can_diy</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">false</td></tr>
              <tr><td className="border border-gray-300 p-2">diy_difficulty</td><td className="border border-gray-300 p-2">integer</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">probable_causes</td><td className="border border-gray-300 p-2">text[]</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">solution_url</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">status</td><td className="border border-gray-300 p-2">diagnostic_status</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">'pending'</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.4 Tabela: profiles</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">name</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">email</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">phone</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td></tr>
              <tr><td className="border border-gray-300 p-2">avatar_url</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.5 Tabela: user_roles</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">gen_random_uuid()</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">role</td><td className="border border-gray-300 p-2">app_role</td><td className="border border-gray-300 p-2">'user'</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.6 Tabela: support_tickets</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">ticket_number</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">subject</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">description</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">category</td><td className="border border-gray-300 p-2">ticket_category</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">priority</td><td className="border border-gray-300 p-2">ticket_priority</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">status</td><td className="border border-gray-300 p-2">ticket_status</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">vehicle_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">❌</td></tr>
              <tr><td className="border border-gray-300 p-2">diagnostic_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">❌</td></tr>
              <tr><td className="border border-gray-300 p-2">assigned_to</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.7 Tabela: ticket_messages</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">ticket_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">message</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">is_staff</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">✅</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.8 Tabela: contact_messages</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">name</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">email</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">phone</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td></tr>
              <tr><td className="border border-gray-300 p-2">subject</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">message</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">status</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.9 Tabela: legal_consents</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Obrigatório</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">consent_type</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">consent_version</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">consented_at</td><td className="border border-gray-300 p-2">timestamptz</td><td className="border border-gray-300 p-2">✅</td></tr>
              <tr><td className="border border-gray-300 p-2">ip_address</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td></tr>
              <tr><td className="border border-gray-300 p-2">user_agent</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.10 Tabela: user_notification_preferences</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Campo</th>
                <th className="border border-gray-300 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 p-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">gen_random_uuid()</td></tr>
              <tr><td className="border border-gray-300 p-2">user_id</td><td className="border border-gray-300 p-2">uuid</td><td className="border border-gray-300 p-2">-</td></tr>
              <tr><td className="border border-gray-300 p-2">email_diagnostic_completed</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">true</td></tr>
              <tr><td className="border border-gray-300 p-2">email_critical_diagnostics</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">true</td></tr>
              <tr><td className="border border-gray-300 p-2">email_ticket_updates</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">true</td></tr>
              <tr><td className="border border-gray-300 p-2">email_account_updates</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">true</td></tr>
              <tr><td className="border border-gray-300 p-2">email_marketing</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">false</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.11 Enums do Banco de Dados</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono">
            <p><strong>diagnostic_priority:</strong> 'critical' | 'attention' | 'preventive'</p>
            <p><strong>diagnostic_status:</strong> 'pending' | 'completed' | 'resolved'</p>
            <p><strong>app_role:</strong> 'admin' | 'user'</p>
            <p><strong>ticket_category:</strong> 'technical' | 'account' | 'billing' | 'diagnostic' | 'general'</p>
            <p><strong>ticket_priority:</strong> 'low' | 'medium' | 'high' | 'urgent'</p>
            <p><strong>ticket_status:</strong> 'open' | 'in_progress' | 'resolved' | 'closed'</p>
          </div>

          <h3 className="font-bold mt-4 mb-2">4.12 Políticas RLS (Row Level Security)</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Tabela</th>
                <th className="border border-gray-300 p-2 text-left">Política</th>
                <th className="border border-gray-300 p-2 text-left">Expressão</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">vehicles</td><td className="border border-gray-300 p-2">CRUD próprio</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
              <tr><td className="border border-gray-300 p-2">diagnostics</td><td className="border border-gray-300 p-2">CRUD próprio</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
              <tr><td className="border border-gray-300 p-2">diagnostic_items</td><td className="border border-gray-300 p-2">Via diagnostic</td><td className="border border-gray-300 p-2">EXISTS (SELECT FROM diagnostics)</td></tr>
              <tr><td className="border border-gray-300 p-2">profiles</td><td className="border border-gray-300 p-2">SELECT/UPDATE</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
              <tr><td className="border border-gray-300 p-2">user_roles</td><td className="border border-gray-300 p-2">SELECT</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
              <tr><td className="border border-gray-300 p-2">support_tickets</td><td className="border border-gray-300 p-2">CRUD próprio</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
              <tr><td className="border border-gray-300 p-2">ticket_messages</td><td className="border border-gray-300 p-2">Via ticket</td><td className="border border-gray-300 p-2">EXISTS (SELECT FROM support_tickets)</td></tr>
              <tr><td className="border border-gray-300 p-2">legal_consents</td><td className="border border-gray-300 p-2">CRUD próprio</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
              <tr><td className="border border-gray-300 p-2">user_notification_preferences</td><td className="border border-gray-300 p-2">CRUD próprio</td><td className="border border-gray-300 p-2">auth.uid() = user_id</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 5 - INTEGRAÇÕES */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            5. INTEGRAÇÕES E APIs
          </h2>

          <h3 className="font-bold mt-4 mb-2">5.1 Supabase</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Serviço</td><td className="border border-gray-300 p-2">Supabase (Lovable Cloud)</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Banco de dados, autenticação, edge functions</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Autenticação</td><td className="border border-gray-300 p-2">JWT Bearer Token</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Cliente</td><td className="border border-gray-300 p-2">@supabase/supabase-js v2.90.1</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">5.2 Web Bluetooth API</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Conexão com adaptador OBD2 via Bluetooth</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Filtros</td><td className="border border-gray-300 p-2">namePrefix: 'OBD', 'ELM', 'OBDII'</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Service UUID</td><td className="border border-gray-300 p-2">0000fff0-0000-1000-8000-00805f9b34fb</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Fallback</td><td className="border border-gray-300 p-2">Modo simulação quando Bluetooth indisponível</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">5.3 Lovable AI API</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Análise de códigos DTC com IA</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">Via Edge Function 'diagnose'</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Secret</td><td className="border border-gray-300 p-2">LOVABLE_API_KEY</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">5.4 Links Externos (Deep Linking)</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>CarCareKiosk:</strong> Guias de reparo detalhados</li>
            <li><strong>YouTube:</strong> Tutoriais em vídeo</li>
            <li><strong>Mercado Livre:</strong> Compra de peças automotivas</li>
          </ul>
        </section>

        {/* Section 6 - ESTADO */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            6. GERENCIAMENTO DE ESTADO
          </h2>

          <h3 className="font-bold mt-4 mb-2">6.1 Zustand Store (useAppStore)</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-4">
            <pre>{`interface AppState {
  activeVehicleId: string | null;
  vehicles: Vehicle[];
  diagnostics: Diagnostic[];
  obdConnectionStatus: 'disconnected' | 'connecting' | 'connected';
  currentDiagnosticId: string | null;
}`}</pre>
          </div>
          <p className="text-sm"><strong>Persistência:</strong> localStorage (activeVehicleId)</p>

          <h3 className="font-bold mt-4 mb-2">6.2 Auth Context (useAuth)</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-4">
            <pre>{`interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email, password, name) => Promise<AuthResponse>;
  signIn: (email, password) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}`}</pre>
          </div>

          <h3 className="font-bold mt-4 mb-2">6.3 Notification Context</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono mb-4">
            <pre>{`interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification) => void;
  removeNotification: (id) => void;
  clearAll: () => void;
}`}</pre>
          </div>

          <h3 className="font-bold mt-4 mb-2">6.4 Admin Notification Context</h3>
          <p className="text-sm">Contexto separado para notificações administrativas com mesma interface.</p>

          <h3 className="font-bold mt-4 mb-2">6.5 React Query</h3>
          <p className="text-sm">Usado para cache e sincronização de dados do servidor (fetching, caching, background updates).</p>
        </section>

        {/* Section 7 - AUTENTICAÇÃO */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            7. AUTENTICAÇÃO E AUTORIZAÇÃO
          </h2>

          <h3 className="font-bold mt-4 mb-2">7.1 Fluxo de Autenticação</h3>
          <div className="bg-gray-50 p-3 rounded text-sm mb-4">
            <ol className="list-decimal list-inside space-y-1">
              <li>Usuário acessa /signup → Preenche formulário de cadastro</li>
              <li>supabase.auth.signUp() → Cria conta no Supabase Auth</li>
              <li>Trigger no banco cria automaticamente profile + role 'user'</li>
              <li>Usuário faz login → supabase.auth.signInWithPassword()</li>
              <li>JWT armazenado em session → Renovado automaticamente</li>
              <li>ProtectedRoute verifica auth antes de renderizar rotas protegidas</li>
              <li>AdminProtectedRoute verifica role 'admin' adicionalmente</li>
            </ol>
          </div>

          <h3 className="font-bold mt-4 mb-2">7.2 Roles e Permissões</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Role</th>
                <th className="border border-gray-300 p-2 text-left">Permissões</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">user</td><td className="border border-gray-300 p-2">CRUD próprios veículos, diagnósticos, tickets. Acesso ao dashboard.</td></tr>
              <tr><td className="border border-gray-300 p-2">admin</td><td className="border border-gray-300 p-2">Acesso total: gerenciar usuários, veículos, diagnósticos, tickets, mensagens, relatórios, logs, configurações.</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">7.3 Proteção de Rotas</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>ProtectedRoute:</strong> Verifica se usuário está autenticado</li>
            <li><strong>AdminProtectedRoute:</strong> Verifica role 'admin' via has_role() no banco</li>
          </ul>
        </section>

        {/* Section 8 - CONFIGURAÇÕES */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            8. CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE
          </h2>

          <h3 className="font-bold mt-4 mb-2">8.1 Secrets (Edge Functions)</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Nome</th>
                <th className="border border-gray-300 p-2 text-left">Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">SUPABASE_URL</td><td className="border border-gray-300 p-2">URL do projeto Supabase</td></tr>
              <tr><td className="border border-gray-300 p-2">SUPABASE_ANON_KEY</td><td className="border border-gray-300 p-2">Chave pública anônima</td></tr>
              <tr><td className="border border-gray-300 p-2">SUPABASE_SERVICE_ROLE_KEY</td><td className="border border-gray-300 p-2">Chave admin (apenas edge functions)</td></tr>
              <tr><td className="border border-gray-300 p-2">LOVABLE_API_KEY</td><td className="border border-gray-300 p-2">API de IA para diagnósticos</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">8.2 Dependências Principais</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono">
            <pre>{`react: ^18.3.1
react-dom: ^18.3.1
react-router-dom: ^6.30.1
@supabase/supabase-js: ^2.90.1
@tanstack/react-query: ^5.83.0
zustand: ^5.0.10
tailwindcss: via Vite
lucide-react: ^0.462.0
recharts: ^2.15.4
framer-motion: ^12.26.2
react-hook-form: ^7.61.1
zod: ^3.25.76
sonner: ^1.7.4
date-fns: ^3.6.0`}</pre>
          </div>
        </section>

        {/* Section 9 - FLUXOS */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            9. FLUXOS DE DADOS
          </h2>

          <h3 className="font-bold mt-4 mb-2">9.1 Fluxo: Diagnóstico Completo</h3>
          <div className="bg-gray-50 p-4 rounded text-sm mb-4">
            <p className="font-mono text-center">
              OBD2 Adapter → OBDConnector (Bluetooth) → DiagnosticEngine → Edge Function (IA) → PriorityClassifier → Supabase → UI
            </p>
            <ol className="list-decimal list-inside mt-3 space-y-1">
              <li>Usuário conecta adaptador OBD2 via Bluetooth</li>
              <li>Sistema lê códigos DTC do veículo</li>
              <li>DTCs são enviados para Edge Function 'diagnose'</li>
              <li>IA analisa e classifica cada código</li>
              <li>Resultados salvos no banco (diagnostics + diagnostic_items)</li>
              <li>UI exibe resultados com prioridades e recomendações</li>
            </ol>
          </div>

          <h3 className="font-bold mt-4 mb-2">9.2 Fluxo: Autenticação</h3>
          <div className="bg-gray-50 p-4 rounded text-sm mb-4">
            <p className="font-mono text-center">
              SignUp Form → Supabase Auth → Database Trigger → Profile + Role → Login → JWT → Dashboard
            </p>
          </div>

          <h3 className="font-bold mt-4 mb-2">9.3 Fluxo: Ticket de Suporte</h3>
          <div className="bg-gray-50 p-4 rounded text-sm">
            <p className="font-mono text-center">
              Usuário cria ticket → Supabase Insert → Admin notificado → Mensagens trocadas → Status atualizado → Ticket resolvido
            </p>
          </div>
        </section>

        {/* Section 10 - ARQUIVOS */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            10. ESTRUTURA DE ARQUIVOS
          </h2>

          <div className="bg-gray-50 p-4 rounded text-sm font-mono whitespace-pre">
{`src/
├── assets/images/          # Imagens e ícones
├── components/
│   ├── admin/              # AdminLayout, AdminProtectedRoute
│   ├── dashboard/          # DashboardLayout, CacheStatsPanel
│   ├── landing/            # HeroSection, ServicesSection, etc.
│   ├── layout/             # Header, Footer
│   ├── legal/              # Disclaimers, TermsModal, SafetyBlocker
│   ├── notifications/      # NotificationContainer
│   ├── obd/                # OBDConnector
│   ├── profile/            # NotificationSettings, DataDeletionSection
│   ├── solutions/          # SolutionSteps, GlossaryPanel, SourceSelector
│   ├── tutorials/          # CategoryCard, TutorialCard, TutorialViewer
│   └── ui/                 # shadcn/ui components (40+ componentes)
├── contexts/
│   ├── AdminNotificationContext.tsx
│   └── NotificationContext.tsx
├── hooks/
│   ├── useAuth.tsx         # Context de autenticação
│   ├── useAdmin.tsx        # Hook para verificar admin
│   ├── useLegalConsent.ts  # Gerenciamento de consentimento
│   ├── useNotifications.ts # Hook de notificações
│   ├── use-mobile.tsx      # Detecção de dispositivo mobile
│   └── use-toast.ts        # Notificações toast
├── integrations/supabase/
│   ├── client.ts           # Cliente Supabase configurado
│   └── types.ts            # Tipos gerados do banco
├── pages/
│   ├── admin/              # 9 páginas administrativas
│   ├── dashboard/          # 9 páginas do dashboard
│   ├── LandingPage.tsx     # Página inicial
│   ├── LoginPage.tsx       # Login
│   ├── SignUpPage.tsx      # Cadastro
│   └── ... (outras 10 páginas públicas)
├── services/
│   ├── diagnostics/
│   │   ├── dtcDatabase.ts      # Base de códigos DTC
│   │   ├── engine.ts           # Motor de diagnóstico
│   │   └── priorityClassifier.ts
│   ├── solutions/
│   │   ├── api.ts              # API de soluções
│   │   ├── cache.ts            # Cache de soluções
│   │   ├── glossary.ts         # Glossário técnico
│   │   └── recommender.ts      # Recomendador
│   └── tutorials/
│       └── api.ts              # API de tutoriais
├── store/
│   └── useAppStore.ts      # Zustand store
├── lib/
│   └── utils.ts            # Utilitários (cn, etc.)
├── App.tsx                 # Componente raiz com rotas
├── main.tsx                # Entry point
└── index.css               # Estilos globais e tokens

supabase/
├── config.toml             # Configuração do Supabase
└── functions/
    ├── diagnose/           # Diagnóstico com IA
    ├── fetch-solution/     # Busca de soluções
    ├── fetch-tutorial/     # Busca de tutoriais
    ├── search-tutorials/   # Pesquisa de tutoriais
    ├── send-contact-email/ # Envio de email de contato
    └── send-notification/  # Envio de notificações`}
          </div>
        </section>

        {/* Section 11 - ERROS */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-red-600 pb-2 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            11. ERROS, AVISOS E CUIDADOS
          </h2>

          <h3 className="font-bold mt-4 mb-2">11.1 ⚠️ Avisos Importantes</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Web Bluetooth:</strong> Disponível apenas em navegadores Chromium (Chrome, Edge). Safari e Firefox não suportam.</li>
              <li><strong>HTTPS obrigatório:</strong> Web Bluetooth exige conexão segura. Funciona em localhost para desenvolvimento.</li>
              <li><strong>Modo Simulação:</strong> Quando Bluetooth não disponível, sistema opera com dados simulados.</li>
              <li><strong>Consentimento Legal:</strong> Usuários devem aceitar termos antes de usar diagnósticos.</li>
            </ul>
          </div>

          <h3 className="font-bold mt-4 mb-2">11.2 🔴 Potenciais Erros</h3>
          <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Timeout de conexão OBD2:</strong> Se adaptador não responder em 10 segundos, conexão falha.</li>
              <li><strong>Falha na Edge Function:</strong> Se IA não responder, sistema usa base local de DTCs.</li>
              <li><strong>RLS bloqueando acesso:</strong> Tentar acessar dados de outros usuários retorna array vazio.</li>
              <li><strong>Token JWT expirado:</strong> Sistema redireciona para login automaticamente.</li>
            </ul>
          </div>

          <h3 className="font-bold mt-4 mb-2">11.3 🛡️ Cuidados de Segurança</h3>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Nunca expor SERVICE_ROLE_KEY:</strong> Esta chave deve permanecer apenas nas Edge Functions.</li>
              <li><strong>Validar inputs:</strong> Todos os formulários usam Zod para validação.</li>
              <li><strong>RLS sempre ativado:</strong> Todas as tabelas têm Row Level Security.</li>
              <li><strong>Diagnósticos não são aconselhamento:</strong> Sistema inclui disclaimer legal obrigatório.</li>
            </ul>
          </div>
        </section>

        {/* Section 12 - EDGE FUNCTIONS */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            12. EDGE FUNCTIONS (SUPABASE)
          </h2>

          <h3 className="font-bold mt-4 mb-2">12.1 diagnose</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/diagnose</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Análise de códigos DTC com IA</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Request</td><td className="border border-gray-300 p-2">{"{ dtcCodes: string[], vehicle: { brand, model, year } }"}</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Response</td><td className="border border-gray-300 p-2">{"{ success: boolean, items: DiagnosticItem[] }"}</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">12.2 fetch-solution</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/fetch-solution</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Buscar guia de solução para problema específico</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">12.3 fetch-tutorial</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/fetch-tutorial</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Buscar tutorial específico</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">12.4 search-tutorials</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/search-tutorials</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Pesquisar tutoriais por termo</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">12.5 send-contact-email</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/send-contact-email</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Enviar email quando formulário de contato é submetido</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">12.6 send-notification</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/send-notification</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Enviar notificações por email aos usuários</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 13 - FEEDBACK */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-green-600 pb-2 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            13. FEEDBACK DO SISTEMA (LINGUAGEM SIMPLES)
          </h2>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <h3 className="font-bold mb-2">✅ O que está funcionando bem:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Login e cadastro:</strong> Tá funcionando direitinho! Você cria sua conta, faz login, e o sistema lembra de você.</li>
              <li><strong>Cadastro de veículos:</strong> Dá pra adicionar, editar e excluir seus carros sem problema.</li>
              <li><strong>Dashboard:</strong> A tela principal mostra tudo organizado - seus carros, diagnósticos, alertas.</li>
              <li><strong>Sistema de tickets:</strong> Se precisar de ajuda, pode abrir um ticket e conversar com o suporte.</li>
              <li><strong>Área administrativa:</strong> Admins conseguem ver tudo: usuários, carros, diagnósticos, mensagens.</li>
              <li><strong>Segurança:</strong> Cada usuário só vê os próprios dados, ninguém acessa o que é dos outros.</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <h3 className="font-bold mb-2">⚠️ O que funciona com limitações:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><strong>Conexão OBD2:</strong> Funciona, mas só em Chrome/Edge. Se você usa Safari ou Firefox, vai rodar em modo simulação (dados de exemplo).</li>
              <li><strong>Análise com IA:</strong> Funciona quando a API responde. Se der problema, usa a base local de códigos.</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="font-bold mb-2">💡 Resumo:</h3>
            <p className="text-sm">
              O sistema está <strong>funcional e estável</strong> para uso. As funcionalidades principais (cadastro, veículos, diagnósticos, suporte) 
              estão operando corretamente. A limitação do Bluetooth afeta apenas navegadores específicos, mas o sistema se adapta 
              automaticamente usando modo simulação quando necessário.
            </p>
          </div>
        </section>

        {/* Section 14 - O QUE FALTA */}
        <section className="mb-8 page-break">
          <h2 className="text-xl font-bold border-b-2 border-orange-600 pb-2 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-orange-600" />
            14. O QUE FALTA IMPLEMENTAR
          </h2>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
            <ul className="space-y-4 text-sm">
              <li>
                <strong>🔌 Integração Real com OBD2:</strong>
                <p className="ml-4 text-gray-600">Atualmente o sistema simula a leitura de códigos. Falta implementar a comunicação real via protocolo ELM327 para ler os códigos diretamente do carro.</p>
              </li>
              <li>
                <strong>📧 Envio Real de Emails:</strong>
                <p className="ml-4 text-gray-600">As Edge Functions de email estão prontas, mas precisam de um serviço de email configurado (Resend, SendGrid, etc.).</p>
              </li>
              <li>
                <strong>🔔 Push Notifications:</strong>
                <p className="ml-4 text-gray-600">Notificações no navegador usando Service Workers para alertar sobre diagnósticos críticos.</p>
              </li>
              <li>
                <strong>📊 Exportação de PDF:</strong>
                <p className="ml-4 text-gray-600">Gerar relatórios de diagnóstico em PDF para download e compartilhamento.</p>
              </li>
              <li>
                <strong>📱 App Mobile Nativo:</strong>
                <p className="ml-4 text-gray-600">Versão React Native para iOS e Android com melhor suporte a Bluetooth.</p>
              </li>
              <li>
                <strong>🧪 Testes Automatizados:</strong>
                <p className="ml-4 text-gray-600">Implementar testes E2E com Playwright para validar fluxos críticos.</p>
              </li>
              <li>
                <strong>🌐 Internacionalização:</strong>
                <p className="ml-4 text-gray-600">Suporte a múltiplos idiomas (atualmente apenas português).</p>
              </li>
              <li>
                <strong>💳 Pagamentos:</strong>
                <p className="ml-4 text-gray-600">Integração com Stripe para planos premium, se necessário.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 15 - SUGESTÕES */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-purple-600 pb-2 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            15. SUGESTÕES DE MELHORIA E OTIMIZAÇÃO
          </h2>

          <div className="space-y-4">
            <div className="bg-purple-50 border-l-4 border-purple-400 p-3">
              <h4 className="font-bold">🚀 Performance</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Implementar lazy loading nas rotas para carregar apenas quando necessário</li>
                <li>Adicionar skeleton loading em todas as listas para melhor UX</li>
                <li>Implementar cache de imagens com service worker</li>
                <li>Otimizar queries do banco com índices adicionais</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-3">
              <h4 className="font-bold">🔒 Segurança</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Implementar rate limiting nas Edge Functions</li>
                <li>Adicionar autenticação 2FA (dois fatores)</li>
                <li>Logs de auditoria para ações sensíveis</li>
                <li>Revisão periódica das políticas RLS</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-3">
              <h4 className="font-bold">📊 Analytics</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Integrar Google Analytics ou Mixpanel para métricas de uso</li>
                <li>Criar dashboard de métricas em tempo real para admins</li>
                <li>Tracking de erros com Sentry ou similar</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-3">
              <h4 className="font-bold">🎨 UX/UI</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Adicionar modo escuro completo</li>
                <li>Melhorar acessibilidade (WCAG 2.1)</li>
                <li>Onboarding interativo para novos usuários</li>
                <li>Animações de transição entre páginas</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-400 p-3">
              <h4 className="font-bold">🔧 Manutenibilidade</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Documentação de API com Swagger/OpenAPI</li>
                <li>Storybook para documentação de componentes</li>
                <li>CI/CD com GitHub Actions para deploy automático</li>
                <li>Monitoramento de uptime e alertas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8 p-4 bg-blue-50 rounded border border-blue-200">
          <h2 className="text-xl font-bold mb-4">RESUMO EXECUTIVO</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="p-1 font-semibold">Total de Rotas:</td><td className="p-1">32 (14 públicas, 9 usuário, 9 admin)</td></tr>
              <tr><td className="p-1 font-semibold">Tabelas no Banco:</td><td className="p-1">10</td></tr>
              <tr><td className="p-1 font-semibold">Edge Functions:</td><td className="p-1">6</td></tr>
              <tr><td className="p-1 font-semibold">Componentes UI:</td><td className="p-1">40+ (shadcn/ui)</td></tr>
              <tr><td className="p-1 font-semibold">Políticas RLS:</td><td className="p-1">20+</td></tr>
              <tr><td className="p-1 font-semibold">Estado Global:</td><td className="p-1">Zustand + React Context + React Query</td></tr>
              <tr><td className="p-1 font-semibold">Framework:</td><td className="p-1">React 18 + Vite + TypeScript</td></tr>
              <tr><td className="p-1 font-semibold">Estilização:</td><td className="p-1">Tailwind CSS + shadcn/ui</td></tr>
              <tr><td className="p-1 font-semibold">Backend:</td><td className="p-1">Supabase (Lovable Cloud)</td></tr>
              <tr><td className="p-1 font-semibold">Status:</td><td className="p-1 text-green-600 font-bold">✅ MVP Funcional e Estável</td></tr>
            </tbody>
          </table>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4 mt-8">
          <p className="font-bold">Doutor Motors - Relatório Técnico Completo</p>
          <p>Versão 1.0 - {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="mt-2">Documento gerado automaticamente pelo sistema</p>
        </div>
      </div>
    </>
  );
};

export default TechnicalReport;
