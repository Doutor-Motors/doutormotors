import { useState } from "react";
import { generateAuditReportPDF } from "@/services/pdf/auditReportGenerator";
import { generateDidacticAuditPDF } from "@/services/pdf/didacticAuditReportGenerator";
import { generateFinalAuditPDF } from "@/services/pdf/finalAuditPdfGenerator";

const AuditReportTestPage = () => {
    const [generatingTechnical, setGeneratingTechnical] = useState(false);
    const [generatingDidactic, setGeneratingDidactic] = useState(false);
    const [generatingFinal, setGeneratingFinal] = useState(false);

    const handleDownloadReport = async () => {
        try {
            setGeneratingTechnical(true);

            // Importação dinâmica para evitar erros de compilação
            const { downloadAuditReport } = await import("@/services/pdf/auditReportGenerator");
            await downloadAuditReport();

            alert("✅ Relatório gerado com sucesso!");
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            alert("❌ Erro ao gerar relatório. Verifique o console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Teste de Relatório de Auditoria
                    </h1>
                    <p className="text-gray-600">
                        Teste o novo template de PDF do sistema com o relatório de auditoria completa
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Relatório de Auditoria Completa
                        </h2>
                    </div>

                    <p className="text-gray-600">
                        Relatório profundo de segurança, funcionalidades e arquitetura do sistema Doutor Motors
                    </p>

                    {/* Content Info */}
                    <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                        <h3 className="font-semibold text-sm text-gray-900">Conteúdo do Relatório:</h3>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                            <li>Resumo Executivo com nota geral (8.2/10)</li>
                            <li>Notas detalhadas por categoria (Segurança, BD, Performance, etc.)</li>
                            <li>Vulnerabilidades identificadas (Críticas, Médias, Baixas)</li>
                            <li>Correções aplicadas durante a auditoria</li>
                            <li>Recomendações prioritárias</li>
                            <li>Próximos passos e conclusão</li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-sm text-blue-900 mb-2">
                            Recursos do Template:
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Capa profissional com logo Doutor Motors</li>
                            <li>Cabeçalhos e rodapés automáticos</li>
                            <li>Tabelas formatadas</li>
                            <li>Color boxes para destacar informações</li>
                            <li>Seções numeradas e organizadas</li>
                            <li>Formatação consistente em todo o documento</li>
                        </ul>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownloadReport}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Gerar Relatório Técnico (Resumido)
                            </>
                        )}
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const { downloadDidacticAuditReport } = await import("@/services/pdf/didacticAuditReportGenerator");
                                await downloadDidacticAuditReport();
                                alert("✅ Relatório Didático gerado com sucesso!");
                            } catch (error) {
                                console.error("Erro:", error);
                                alert("❌ Erro ao gerar relatório.");
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Gerar Relatório Didático (Completo)
                            </>
                        )}
                    </button>

                    <button
                        onClick={async () => {
                            try {
                                setGeneratingFinal(true);
                                generateFinalAuditPDF();
                                alert("✅ Relatório Final (9.0/10) gerado com sucesso!");
                            } catch (error) {
                                console.error("Erro:", error);
                                alert("❌ Erro ao gerar relatório final.");
                            } finally {
                                setGeneratingFinal(false);
                            }
                        }}
                        disabled={generatingFinal}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {generatingFinal ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando PDF...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Gerar Relatório Final (9.0/10) ★
                            </>
                        )}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        O PDF será gerado e baixado automaticamente
                    </p>
                </div>

                {/* Audit Score Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Nota da Auditoria</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Nota Geral:</span>
                            <span className="text-3xl font-bold text-green-600">8.2/10</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <span className="text-sm font-semibold text-green-600">✓ Aprovado para Produção</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Vulnerabilidades Corrigidas:</span>
                            <span className="text-sm font-semibold text-gray-900">3/4</span>
                        </div>
                        <div className="pt-3 border-t border-amber-200">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">Segurança:</span>
                                    <span className="ml-2 font-semibold text-green-600">9.5/10</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Arquitetura:</span>
                                    <span className="ml-2 font-semibold text-green-600">9.0/10</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Banco de Dados:</span>
                                    <span className="ml-2 font-semibold text-green-600">8.5/10</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Performance:</span>
                                    <span className="ml-2 font-semibold text-yellow-600">7.5/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
