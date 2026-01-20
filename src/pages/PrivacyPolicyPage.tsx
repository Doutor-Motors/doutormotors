import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, UserCheck, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PrivacyPolicyPage = () => {
  const lastUpdated = "15 de Janeiro de 2025";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-36 sm:pt-40 md:pt-44 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mt-8 mb-4 text-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-chakra text-3xl md:text-4xl font-bold uppercase text-foreground">
                  Política de Privacidade
                </h1>
                <p className="text-muted-foreground">Última atualização: {lastUpdated}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Em conformidade com a LGPD (Lei Geral de Proteção de Dados)
            </Badge>
          </div>

          {/* Resumo */}
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Resumo da Nossa Política
                  </h3>
                  <ul className="text-green-700 dark:text-green-400 space-y-1 text-sm">
                    <li>✓ Coletamos apenas dados necessários para o serviço</li>
                    <li>✓ Não vendemos seus dados para terceiros</li>
                    <li>✓ Você pode excluir seus dados a qualquer momento</li>
                    <li>✓ Usamos criptografia para proteger suas informações</li>
                    <li>✓ Somos transparentes sobre como usamos seus dados</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Índice de Navegação */}
          <Card className="mb-8 bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="font-chakra text-sm uppercase text-muted-foreground">
                Índice
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a href="#introducao" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Eye className="w-4 h-4" />
                  1. Introdução
                </a>
                <a href="#dados-coletados" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Database className="w-4 h-4" />
                  2. Dados Coletados
                </a>
                <a href="#uso-dados" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <UserCheck className="w-4 h-4" />
                  3. Como Usamos seus Dados
                </a>
                <a href="#compartilhamento" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Globe className="w-4 h-4" />
                  4. Compartilhamento
                </a>
                <a href="#seguranca" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Lock className="w-4 h-4" />
                  5. Segurança
                </a>
                <a href="#direitos" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Shield className="w-4 h-4" />
                  6. Seus Direitos (LGPD)
                </a>
                <a href="#exclusao" className="text-sm text-primary hover:underline flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  7. Exclusão de Dados
                </a>
              </nav>
            </CardContent>
          </Card>

          {/* Conteúdo da Política */}
          <div className="space-y-8">
            {/* 1. Introdução */}
            <Card id="introducao" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  1. Introdução
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  O Doutor Motors ("nós", "nosso" ou "plataforma") está comprometido em proteger 
                  sua privacidade e seus dados pessoais. Esta Política de Privacidade explica como 
                  coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza 
                  nossa plataforma de diagnóstico automotivo.
                </p>
                <p>
                  Esta política foi elaborada em conformidade com a Lei Geral de Proteção de Dados 
                  (LGPD - Lei nº 13.709/2018) e outras legislações aplicáveis.
                </p>
              </CardContent>
            </Card>

            {/* 2. Dados Coletados */}
            <Card id="dados-coletados" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  2. Dados que Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>2.1. Dados de Cadastro:</strong></p>
                <ul>
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Telefone (opcional)</li>
                  <li>Senha (armazenada de forma criptografada)</li>
                </ul>

                <p><strong>2.2. Dados do Veículo:</strong></p>
                <ul>
                  <li>Marca e modelo do veículo</li>
                  <li>Ano de fabricação</li>
                  <li>Tipo de motor e combustível</li>
                  <li>Placa do veículo (opcional)</li>
                </ul>

                <p><strong>2.3. Dados de Diagnóstico:</strong></p>
                <ul>
                  <li>Códigos de diagnóstico (DTCs) lidos do veículo</li>
                  <li>Histórico de diagnósticos realizados</li>
                  <li>Status de resolução de problemas</li>
                  <li>Data e hora dos diagnósticos</li>
                </ul>

                <p><strong>2.4. Dados de Navegação:</strong></p>
                <ul>
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e dispositivo</li>
                  <li>Páginas visitadas na plataforma</li>
                  <li>Data e hora de acesso</li>
                </ul>

                <p><strong>2.5. Dados de Consentimento:</strong></p>
                <ul>
                  <li>Registro de aceite dos termos de uso</li>
                  <li>Registro de aceite da política de privacidade</li>
                  <li>Registro de aceite da isenção de responsabilidade</li>
                  <li>Data, hora e versão dos termos aceitos</li>
                </ul>
              </CardContent>
            </Card>

            {/* 3. Como Usamos */}
            <Card id="uso-dados" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  3. Como Usamos seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>Utilizamos seus dados pessoais para:</p>
                <ul>
                  <li><strong>Fornecer o serviço:</strong> Realizar diagnósticos e exibir informações relevantes para seu veículo.</li>
                  <li><strong>Personalização:</strong> Adaptar a experiência com base nos seus veículos e histórico.</li>
                  <li><strong>Comunicação:</strong> Enviar notificações sobre diagnósticos, alertas de segurança e atualizações do serviço.</li>
                  <li><strong>Melhoria do serviço:</strong> Analisar padrões de uso para melhorar nossa plataforma.</li>
                  <li><strong>Segurança:</strong> Proteger contra fraudes e acessos não autorizados.</li>
                  <li><strong>Cumprimento legal:</strong> Atender requisitos legais e regulatórios.</li>
                </ul>

                <p><strong>NÃO utilizamos seus dados para:</strong></p>
                <ul>
                  <li>Vender para terceiros</li>
                  <li>Marketing de empresas parceiras sem seu consentimento</li>
                  <li>Criação de perfis de crédito ou financeiros</li>
                  <li>Qualquer finalidade não descrita nesta política</li>
                </ul>
              </CardContent>
            </Card>

            {/* 4. Compartilhamento */}
            <Card id="compartilhamento" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  4. Compartilhamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>Podemos compartilhar seus dados com:</strong></p>
                <ul>
                  <li><strong>Provedores de infraestrutura:</strong> Supabase (banco de dados e autenticação), hospedagem em nuvem.</li>
                  <li><strong>Provedores de IA:</strong> Para geração de soluções personalizadas (dados anonimizados quando possível).</li>
                  <li><strong>Autoridades legais:</strong> Quando exigido por lei ou ordem judicial.</li>
                </ul>

                <p><strong>Garantias de proteção:</strong></p>
                <ul>
                  <li>Todos os parceiros são obrigados contratualmente a proteger seus dados.</li>
                  <li>Utilizamos apenas provedores com certificações de segurança.</li>
                  <li>Dados sensíveis são anonimizados quando possível.</li>
                </ul>
              </CardContent>
            </Card>

            {/* 5. Segurança */}
            <Card id="seguranca" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  5. Segurança dos Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                <ul>
                  <li><strong>Criptografia:</strong> Dados em trânsito (HTTPS/TLS) e em repouso.</li>
                  <li><strong>Senhas:</strong> Armazenadas com hash seguro (bcrypt).</li>
                  <li><strong>Controle de acesso:</strong> Acesso restrito aos dados conforme necessidade.</li>
                  <li><strong>Row Level Security (RLS):</strong> Cada usuário só acessa seus próprios dados.</li>
                  <li><strong>Backups:</strong> Realizados regularmente com criptografia.</li>
                  <li><strong>Monitoramento:</strong> Logs de acesso e alertas de segurança.</li>
                </ul>
              </CardContent>
            </Card>

            {/* 6. Seus Direitos */}
            <Card id="direitos" className="border-primary/30 scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  6. Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>Conforme a LGPD, você tem os seguintes direitos:</p>
                <ul>
                  <li><strong>Acesso:</strong> Saber quais dados temos sobre você.</li>
                  <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos.</li>
                  <li><strong>Exclusão:</strong> Solicitar a exclusão dos seus dados.</li>
                  <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado.</li>
                  <li><strong>Revogação:</strong> Revogar consentimentos dados anteriormente.</li>
                  <li><strong>Informação:</strong> Saber com quem seus dados foram compartilhados.</li>
                  <li><strong>Oposição:</strong> Opor-se a tratamentos com base em legítimo interesse.</li>
                </ul>

                <p className="font-semibold">
                  Para exercer qualquer um desses direitos, acesse seu perfil na plataforma ou 
                  entre em contato conosco através dos canais indicados abaixo.
                </p>
              </CardContent>
            </Card>

            {/* 7. Exclusão de Dados */}
            <Card id="exclusao" className="scroll-mt-24">
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-primary" />
                  7. Exclusão de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>Como solicitar a exclusão:</strong></p>
                <ul>
                  <li>Acesse seu perfil e clique em "Excluir minha conta".</li>
                  <li>Ou envie um e-mail para: contato@doutormotors.com</li>
                </ul>

                <p><strong>O que acontece após a solicitação:</strong></p>
                <ul>
                  <li>Seus dados serão excluídos em até 15 dias úteis.</li>
                  <li>Alguns dados podem ser retidos por obrigação legal (ex: registros fiscais).</li>
                  <li>Dados anonimizados para estatísticas podem ser mantidos.</li>
                  <li>Você receberá confirmação por e-mail quando a exclusão for concluída.</li>
                </ul>
              </CardContent>
            </Card>

            {/* 8. Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  8. Cookies e Tecnologias Similares
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>Utilizamos cookies para:</p>
                <ul>
                  <li><strong>Essenciais:</strong> Manter sua sessão ativa e autenticação.</li>
                  <li><strong>Preferências:</strong> Lembrar suas configurações (tema, idioma).</li>
                  <li><strong>Análise:</strong> Entender como você usa a plataforma.</li>
                </ul>
                <p>
                  Você pode gerenciar cookies nas configurações do seu navegador. 
                  Desativar cookies essenciais pode afetar o funcionamento da plataforma.
                </p>
              </CardContent>
            </Card>

            {/* 9. Retenção */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  9. Retenção de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>Mantemos seus dados pelo tempo necessário para:</p>
                <ul>
                  <li>Fornecer o serviço enquanto você tiver uma conta ativa.</li>
                  <li>Cumprir obrigações legais (ex: 5 anos para registros fiscais).</li>
                  <li>Resolver disputas e fazer cumprir nossos acordos.</li>
                </ul>
                <p>
                  Após a exclusão da conta, dados são removidos em até 30 dias, 
                  exceto quando a retenção é exigida por lei.
                </p>
              </CardContent>
            </Card>

            {/* 10. Alterações */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  10. Alterações nesta Política
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. 
                  Alterações significativas serão notificadas por e-mail ou através da plataforma. 
                  Recomendamos revisar esta página regularmente.
                </p>
                <p>
                  A data de "última atualização" no topo da página indica quando a política foi revisada.
                </p>
              </CardContent>
            </Card>

            {/* 11. Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="font-chakra uppercase flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  11. Contato e Encarregado de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p>Para questões sobre esta política ou seus dados pessoais:</p>
                <ul>
                  <li><strong>E-mail:</strong> privacidade@doutormotors.com</li>
                  <li><strong>E-mail geral:</strong> contato@doutormotors.com</li>
                  <li><strong>Página de Contato:</strong> <Link to="/contato" className="text-primary hover:underline">www.doutormotors.com/contato</Link></li>
                </ul>
                <p>
                  Responderemos sua solicitação em até 15 dias úteis, conforme exigido pela LGPD.
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-8" />

          {/* Footer do documento */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Ao utilizar a plataforma Doutor Motors, você declara ter lido, compreendido e 
              concordado com esta Política de Privacidade.
            </p>
            <p className="mt-2">
              <Link to="/termos" className="text-primary hover:underline">
                Ver também: Termos de Uso
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
