import { useState, useMemo } from "react";
import { Book, Search, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  GlossaryTerm,
  findTermsInText,
  getCategoryColor,
  getCategoryLabel,
  getDifficultyInfo,
  AUTOMOTIVE_GLOSSARY,
} from "@/services/solutions/glossary";

interface GlossaryPanelProps {
  /** Texto para detectar termos automaticamente */
  contextText?: string;
  /** Se true, mostra apenas termos encontrados no contexto */
  contextOnly?: boolean;
  /** Se true, inicia colapsado */
  defaultCollapsed?: boolean;
}

const GlossaryPanel = ({ 
  contextText, 
  contextOnly = false,
  defaultCollapsed = true 
}: GlossaryPanelProps) => {
  const [isOpen, setIsOpen] = useState(!defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Detecta termos no texto de contexto
  const contextTerms = useMemo(() => {
    if (!contextText) return [];
    return findTermsInText(contextText);
  }, [contextText]);

  // Filtra termos baseado na busca e categoria
  const filteredTerms = useMemo(() => {
    let terms = contextOnly && contextText ? contextTerms : AUTOMOTIVE_GLOSSARY;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      terms = terms.filter(term => 
        term.term.toLowerCase().includes(query) ||
        term.aliases.some(a => a.toLowerCase().includes(query)) ||
        term.definition.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      terms = terms.filter(term => term.category === selectedCategory);
    }
    
    return terms;
  }, [contextTerms, contextOnly, contextText, searchQuery, selectedCategory]);

  // Agrupa por categoria
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    
    for (const term of filteredTerms) {
      if (!groups[term.category]) {
        groups[term.category] = [];
      }
      groups[term.category].push(term);
    }
    
    return groups;
  }, [filteredTerms]);

  const categories = Object.keys(groupedTerms).sort();

  // Componente de termo individual
  const TermItem = ({ term }: { term: GlossaryTerm }) => {
    const difficultyInfo = getDifficultyInfo(term.difficulty);
    
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-help transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{term.term}</span>
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(term.category)}`}>
                    {getCategoryLabel(term.category)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {term.definition}
                </p>
              </div>
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" side="left">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground">{term.term}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${getCategoryColor(term.category)}`}>
                  {getCategoryLabel(term.category)}
                </Badge>
                <span className={`text-xs ${difficultyInfo.color}`}>
                  {difficultyInfo.label}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">{term.definition}</p>
            
            {term.aliases.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Também conhecido como:
                </p>
                <div className="flex flex-wrap gap-1">
                  {term.aliases.slice(0, 4).map((alias, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {alias}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="font-chakra uppercase flex items-center gap-2 text-base">
                <Book className="w-5 h-5 text-primary" />
                Glossário Técnico
                {contextOnly && contextTerms.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {contextTerms.length} termos detectados
                  </Badge>
                )}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar termo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filtro de Categoria */}
            {!contextOnly && (
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs h-7"
                >
                  Todos
                </Button>
                {['motor', 'sensores', 'eletrica', 'freios', 'combustivel', 'arrefecimento', 'suspensao', 'transmissao', 'geral'].map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="text-xs h-7"
                  >
                    {getCategoryLabel(cat as GlossaryTerm['category'])}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Lista de Termos */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredTerms.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Book className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery 
                      ? "Nenhum termo encontrado para esta busca." 
                      : "Nenhum termo técnico detectado neste conteúdo."}
                  </p>
                </div>
              ) : (
                <>
                  {contextOnly ? (
                    // Modo contexto: lista simples
                    <div className="space-y-2">
                      {filteredTerms.map((term, idx) => (
                        <TermItem key={idx} term={term} />
                      ))}
                    </div>
                  ) : (
                    // Modo completo: agrupado por categoria
                    categories.map(category => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Badge variant="outline" className={getCategoryColor(category as GlossaryTerm['category'])}>
                            {getCategoryLabel(category as GlossaryTerm['category'])}
                          </Badge>
                          <span className="text-xs">({groupedTerms[category].length})</span>
                        </h4>
                        <div className="space-y-2 pl-2">
                          {groupedTerms[category].map((term, idx) => (
                            <TermItem key={idx} term={term} />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
            
            {/* Contador */}
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              {filteredTerms.length} de {AUTOMOTIVE_GLOSSARY.length} termos
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default GlossaryPanel;
