import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TechnicalReport = () => {
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
            body { background: white !important; font-size: 11px; }
            table { page-break-inside: avoid; font-size: 10px; }
            h2 { page-break-after: avoid; }
            pre { font-size: 9px; white-space: pre-wrap; }
          }
        `}
      </style>

      {/* Header */}
      <div className="no-print bg-dm-space text-primary-foreground border-b sticky top-0 z-50 p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-chakra uppercase">Voltar</span>
          </Link>
          <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
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
            <li>Elementos Interativos</li>
            <li>Banco de Dados</li>
            <li>Integrações e APIs</li>
            <li>Gerenciamento de Estado</li>
            <li>Autenticação e Autorização</li>
            <li>Configurações e Variáveis de Ambiente</li>
            <li>Fluxos de Dados</li>
            <li>Estrutura de Arquivos</li>
          </ol>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            1. ESTRUTURA DE PÁGINAS E ROTAS
          </h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Rota</th>
                <th className="border border-gray-300 p-2 text-left">Componente</th>
                <th className="border border-gray-300 p-2 text-left">Propósito</th>
                <th className="border border-gray-300 p-2 text-left">Auth</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">/</td><td className="border border-gray-300 p-2">LandingPage</td><td className="border border-gray-300 p-2">Apresentação do produto</td><td className="border border-gray-300 p-2">Pública</td></tr>
              <tr><td className="border border-gray-300 p-2">/signup</td><td className="border border-gray-300 p-2">SignUpPage</td><td className="border border-gray-300 p-2">Cadastro de usuários</td><td className="border border-gray-300 p-2">Pública</td></tr>
              <tr><td className="border border-gray-300 p-2">/login</td><td className="border border-gray-300 p-2">LoginPage</td><td className="border border-gray-300 p-2">Autenticação</td><td className="border border-gray-300 p-2">Pública</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard</td><td className="border border-gray-300 p-2">UserDashboard</td><td className="border border-gray-300 p-2">Visão geral e alertas</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/vehicles</td><td className="border border-gray-300 p-2">VehicleManager</td><td className="border border-gray-300 p-2">CRUD de veículos</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/diagnostics</td><td className="border border-gray-300 p-2">DiagnosticCenter</td><td className="border border-gray-300 p-2">Leitura OBD2</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/diagnostics/:id</td><td className="border border-gray-300 p-2">DiagnosticReport</td><td className="border border-gray-300 p-2">Detalhes do diagnóstico</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/history</td><td className="border border-gray-300 p-2">DiagnosticHistory</td><td className="border border-gray-300 p-2">Histórico completo</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
              <tr><td className="border border-gray-300 p-2">/dashboard/solutions/:id</td><td className="border border-gray-300 p-2">SolutionGuide</td><td className="border border-gray-300 p-2">Guias de reparo</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
              <tr><td className="border border-gray-300 p-2">/profile</td><td className="border border-gray-300 p-2">UserProfile</td><td className="border border-gray-300 p-2">Configurações da conta</td><td className="border border-gray-300 p-2">✅ Obrigatória</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            2. COMPONENTES E FUNCIONALIDADES
          </h2>
          
          <h3 className="font-bold mt-4 mb-2">2.1 OBDConnector</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Arquivo</td><td className="border border-gray-300 p-2">src/components/obd/OBDConnector.tsx</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Funcionalidade</td><td className="border border-gray-300 p-2">Conexão Bluetooth/Wi-Fi com adaptador OBD2, leitura de DTCs</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Props</td><td className="border border-gray-300 p-2">onDataReceived, onConnectionChange</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Estados</td><td className="border border-gray-300 p-2">obdConnectionStatus (via Zustand)</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Hooks</td><td className="border border-gray-300 p-2">useCallback, useAppStore, useToast</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Retorna</td><td className="border border-gray-300 p-2">StatusIndicator, ConnectButton, connect(), disconnect(), readDTCCodes()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">2.2 Serviços de Diagnóstico</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>dtcDatabase.ts</strong> - Base de códigos DTC com descrições em português</li>
            <li><strong>engine.ts</strong> - Motor de análise com fallback para banco local</li>
            <li><strong>priorityClassifier.ts</strong> - Classificação por severidade (crítico/atenção/preventivo)</li>
            <li><strong>recommender.ts</strong> - Recomendador de soluções DIY</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            3. ELEMENTOS INTERATIVOS (BOTÕES E AÇÕES)
          </h2>
          
          <h3 className="font-bold mt-4 mb-2">DiagnosticCenter</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Botão</th>
                <th className="border border-gray-300 p-2 text-left">Ação</th>
                <th className="border border-gray-300 p-2 text-left">API/Função</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">Conectar OBD2</td><td className="border border-gray-300 p-2">Inicia conexão Bluetooth</td><td className="border border-gray-300 p-2">OBDConnector.connect()</td></tr>
              <tr><td className="border border-gray-300 p-2">Executar Diagnóstico</td><td className="border border-gray-300 p-2">Lê DTCs e salva</td><td className="border border-gray-300 p-2">supabase.functions.invoke('diagnose')</td></tr>
              <tr><td className="border border-gray-300 p-2">Desconectar</td><td className="border border-gray-300 p-2">Encerra conexão</td><td className="border border-gray-300 p-2">OBDConnector.disconnect()</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">VehicleManager</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Botão</th>
                <th className="border border-gray-300 p-2 text-left">Ação</th>
                <th className="border border-gray-300 p-2 text-left">API/Função</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">Adicionar Veículo</td><td className="border border-gray-300 p-2">Abre modal de cadastro</td><td className="border border-gray-300 p-2">Estado local</td></tr>
              <tr><td className="border border-gray-300 p-2">Salvar</td><td className="border border-gray-300 p-2">Insere veículo</td><td className="border border-gray-300 p-2">supabase.from('vehicles').insert()</td></tr>
              <tr><td className="border border-gray-300 p-2">Editar</td><td className="border border-gray-300 p-2">Atualiza veículo</td><td className="border border-gray-300 p-2">supabase.from('vehicles').update()</td></tr>
              <tr><td className="border border-gray-300 p-2">Excluir</td><td className="border border-gray-300 p-2">Remove veículo</td><td className="border border-gray-300 p-2">supabase.from('vehicles').delete()</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
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
              <tr><td className="border border-gray-300 p-2">status</td><td className="border border-gray-300 p-2">enum</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">'pending'</td></tr>
              <tr><td className="border border-gray-300 p-2">obd_raw_data</td><td className="border border-gray-300 p-2">jsonb</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">notes</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
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
              <tr><td className="border border-gray-300 p-2">priority</td><td className="border border-gray-300 p-2">enum</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">'attention'</td></tr>
              <tr><td className="border border-gray-300 p-2">severity</td><td className="border border-gray-300 p-2">integer</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">5</td></tr>
              <tr><td className="border border-gray-300 p-2">can_diy</td><td className="border border-gray-300 p-2">boolean</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">false</td></tr>
              <tr><td className="border border-gray-300 p-2">diy_difficulty</td><td className="border border-gray-300 p-2">integer</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">probable_causes</td><td className="border border-gray-300 p-2">text[]</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">solution_url</td><td className="border border-gray-300 p-2">text</td><td className="border border-gray-300 p-2">❌</td><td className="border border-gray-300 p-2">null</td></tr>
              <tr><td className="border border-gray-300 p-2">status</td><td className="border border-gray-300 p-2">enum</td><td className="border border-gray-300 p-2">✅</td><td className="border border-gray-300 p-2">'pending'</td></tr>
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
              <tr><td className="border border-gray-300 p-2">role</td><td className="border border-gray-300 p-2">enum (admin | user)</td><td className="border border-gray-300 p-2">'user'</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">4.6 Enums</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono">
            <p>diagnostic_priority: 'critical' | 'attention' | 'preventive'</p>
            <p>diagnostic_status: 'pending' | 'completed' | 'resolved'</p>
            <p>app_role: 'admin' | 'user'</p>
          </div>

          <h3 className="font-bold mt-4 mb-2">4.7 Políticas RLS (Row Level Security)</h3>
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
            </tbody>
          </table>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            5. INTEGRAÇÕES E APIs
          </h2>

          <h3 className="font-bold mt-4 mb-2">5.1 Supabase Edge Function: diagnose</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Endpoint</td><td className="border border-gray-300 p-2">POST /functions/v1/diagnose</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Análise de DTCs com IA</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Autenticação</td><td className="border border-gray-300 p-2">JWT Bearer Token</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Request Body</td><td className="border border-gray-300 p-2">{"{ dtcCodes: string[], vehicle: { brand, model, year } }"}</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Response</td><td className="border border-gray-300 p-2">{"{ success: boolean, items: DiagnosticItem[] }"}</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Secret</td><td className="border border-gray-300 p-2">LOVABLE_API_KEY</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">5.2 Web Bluetooth API</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <tbody>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 w-1/4 font-semibold">Propósito</td><td className="border border-gray-300 p-2">Conexão com adaptador OBD2</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Filtros</td><td className="border border-gray-300 p-2">namePrefix: 'OBD', 'ELM', 'OBDII'</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Service UUID</td><td className="border border-gray-300 p-2">0000fff0-0000-1000-8000-00805f9b34fb</td></tr>
              <tr><td className="border border-gray-300 p-2 bg-gray-50 font-semibold">Fallback</td><td className="border border-gray-300 p-2">Modo simulação quando indisponível</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">5.3 Links Externos (Deep Linking)</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>CarCareKiosk:</strong> Guias de reparo</li>
            <li><strong>YouTube:</strong> Tutoriais em vídeo</li>
            <li><strong>Mercado Livre:</strong> Compra de peças</li>
          </ul>
        </section>

        {/* Section 6 */}
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
          <p className="text-sm"><strong>Persistência:</strong> localStorage (apenas activeVehicleId)</p>

          <h3 className="font-bold mt-4 mb-2">6.2 Auth Context (useAuth)</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono">
            <pre>{`interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp, signIn, signOut: Functions;
}`}</pre>
          </div>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            7. AUTENTICAÇÃO E AUTORIZAÇÃO
          </h2>

          <h3 className="font-bold mt-4 mb-2">Fluxo de Autenticação</h3>
          <div className="bg-gray-50 p-3 rounded text-sm mb-4">
            <ol className="list-decimal list-inside space-y-1">
              <li>Usuário acessa /signup → Cria conta</li>
              <li>Trigger cria automaticamente profile + role</li>
              <li>Usuário faz login → Recebe JWT</li>
              <li>JWT armazenado em session → Renovado automaticamente</li>
              <li>Rotas protegidas verificam auth via ProtectedRoute</li>
            </ol>
          </div>

          <h3 className="font-bold mt-4 mb-2">Roles e Permissões</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Role</th>
                <th className="border border-gray-300 p-2 text-left">Permissões</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">user</td><td className="border border-gray-300 p-2">CRUD próprios veículos/diagnósticos</td></tr>
              <tr><td className="border border-gray-300 p-2">admin</td><td className="border border-gray-300 p-2">(Futuro) Acesso total ao sistema</td></tr>
            </tbody>
          </table>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            8. CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE
          </h2>

          <h3 className="font-bold mt-4 mb-2">Secrets (Supabase Edge Functions)</h3>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Nome</th>
                <th className="border border-gray-300 p-2 text-left">Propósito</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-gray-300 p-2">SUPABASE_URL</td><td className="border border-gray-300 p-2">URL do projeto Supabase</td></tr>
              <tr><td className="border border-gray-300 p-2">SUPABASE_ANON_KEY</td><td className="border border-gray-300 p-2">Chave pública</td></tr>
              <tr><td className="border border-gray-300 p-2">SUPABASE_SERVICE_ROLE_KEY</td><td className="border border-gray-300 p-2">Chave admin (edge functions)</td></tr>
              <tr><td className="border border-gray-300 p-2">LOVABLE_API_KEY</td><td className="border border-gray-300 p-2">API de IA para diagnósticos</td></tr>
            </tbody>
          </table>

          <h3 className="font-bold mt-4 mb-2">Dependências Principais</h3>
          <div className="bg-gray-50 p-3 rounded text-sm font-mono">
            <pre>{`react: ^18.3.1
react-router-dom: ^6.30.1
@supabase/supabase-js: ^2.90.1
@tanstack/react-query: ^5.83.0
zustand: ^5.0.10
tailwindcss: via vite
lucide-react: ^0.462.0
recharts: ^2.15.4`}</pre>
          </div>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            9. FLUXOS DE DADOS
          </h2>

          <h3 className="font-bold mt-4 mb-2">Fluxo: Diagnóstico Completo</h3>
          <div className="bg-gray-50 p-4 rounded text-sm text-center">
            <p className="font-mono">
              OBD2 Adapter → OBDConnector → DiagnosticEngine → Edge Function (IA) → PriorityClassifier → UI
            </p>
          </div>

          <h3 className="font-bold mt-4 mb-2">Fluxo: Autenticação</h3>
          <div className="bg-gray-50 p-4 rounded text-sm text-center">
            <p className="font-mono">
              SignUp → Supabase Auth → Trigger → Profile + Role → Dashboard
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold border-b-2 border-blue-600 pb-2 mb-4">
            10. ESTRUTURA DE ARQUIVOS
          </h2>

          <div className="bg-gray-50 p-4 rounded text-sm font-mono whitespace-pre">
{`src/
├── assets/images/          # Imagens estáticas
├── components/
│   ├── dashboard/          # Layout do dashboard
│   ├── landing/            # Seções da landing page
│   ├── layout/             # Header, Footer
│   ├── obd/                # OBDConnector
│   └── ui/                 # Componentes shadcn/ui
├── hooks/
│   ├── useAuth.tsx         # Context de autenticação
│   ├── use-mobile.tsx      # Detecção mobile
│   └── use-toast.ts        # Notificações
├── integrations/supabase/
│   ├── client.ts           # Cliente Supabase
│   └── types.ts            # Tipos gerados
├── pages/
│   ├── dashboard/          # Páginas autenticadas
│   ├── Index.tsx
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   └── SignUpPage.tsx
├── services/
│   ├── diagnostics/
│   │   ├── dtcDatabase.ts
│   │   ├── engine.ts
│   │   └── priorityClassifier.ts
│   └── solutions/
│       └── recommender.ts
├── store/
│   └── useAppStore.ts
└── lib/utils.ts

supabase/
├── config.toml
└── functions/
    └── diagnose/index.ts`}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-8 p-4 bg-blue-50 rounded border border-blue-200">
          <h2 className="text-xl font-bold mb-4">RESUMO EXECUTIVO</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="p-1 font-semibold">Total de Rotas:</td><td className="p-1">11</td></tr>
              <tr><td className="p-1 font-semibold">Tabelas no Banco:</td><td className="p-1">5</td></tr>
              <tr><td className="p-1 font-semibold">Edge Functions:</td><td className="p-1">1</td></tr>
              <tr><td className="p-1 font-semibold">Componentes Principais:</td><td className="p-1">15+</td></tr>
              <tr><td className="p-1 font-semibold">Políticas RLS:</td><td className="p-1">15</td></tr>
              <tr><td className="p-1 font-semibold">Estado Global:</td><td className="p-1">Zustand + Context</td></tr>
              <tr><td className="p-1 font-semibold">Status:</td><td className="p-1">✅ MVP Funcional</td></tr>
            </tbody>
          </table>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4 mt-8">
          <p>Doutor Motors - Relatório Técnico</p>
          <p>Documento gerado automaticamente</p>
        </div>
      </div>
    </>
  );
};

export default TechnicalReport;
