export function translateCategoryName(name: string): string {
  const translations: Record<string, string> = {
    "air conditioner": "Ar Condicionado",
    "air filter engine": "Filtro de Ar (Motor)",
    "cabin air filter": "Filtro de Ar (Cabine)",
    "battery": "Bateria",
    "brakes": "Freios",
    "brake light": "Luz de Freio",
    "coolant antifreeze": "Arrefecimento",
    "headlight": "Faróis",
    "highbeam": "Farol Alto",
    "oil": "Óleo do Motor",
    "power steering": "Direção Hidráulica",
    "tail light": "Lanterna Traseira",
    "transmission fluid": "Fluido de Transmissão",
    "washer fluid": "Fluido do Limpador",
    "wipers": "Palhetas",
    "windshield wipers": "Palhetas do Para-brisa",
    "tires wheels": "Pneus e Rodas",
    "interior fuse": "Fusíveis Internos",
    "engine fuse": "Fusíveis do Motor",
    "turn signal": "Setas",
    "fog light": "Farol de Neblina",
    "reverse light": "Luz de Ré",
    "parking light": "Luz de Estacionamento",
    "license plate light": "Luz da Placa",
    "check engine light": "Luz do Motor",
  };

  const lowerName = name.toLowerCase().trim();
  return translations[lowerName] || name;
}

// Gerar passos estáticos de fallback baseados na categoria e procedimento
export function generateStaticFallbackSteps(procedure: string, category: string, vehicleContext?: string): string[] {
  const vehicle = vehicleContext || "seu veículo";
  const procedureName = procedure.replace(/_/g, " ").replace(/-/g, " ");
  const categoryName = category.replace(/_/g, " ").replace(/-/g, " ");

  // Passos genéricos baseados na categoria
  const categorySteps: Record<string, string[]> = {
    "oil": [
      "1️⃣ **Preparação**: Estacione o veículo em superfície plana e desligue o motor. Aguarde alguns minutos para o óleo esfriar.",
      "2️⃣ **Materiais**: Reúna óleo novo (verificar especificação no manual), filtro de óleo, funil, chave para dreno e recipiente para óleo usado.",
      "3️⃣ **Drenagem**: Localize o bujão de dreno sob o veículo. Posicione o recipiente e remova o bujão. Aguarde o óleo escoar completamente.",
      "4️⃣ **Filtro**: Remova o filtro de óleo antigo. Aplique uma fina camada de óleo novo na borracha do filtro novo e instale.",
      "5️⃣ **Recolocar bujão**: Limpe a área do bujão, coloque nova arruela se necessário e aperte o bujão conforme especificação.",
      "6️⃣ **Adicionar óleo**: Remova a tampa do óleo no motor e adicione a quantidade especificada usando o funil.",
      "7️⃣ **Verificação**: Ligue o motor por alguns minutos, desligue e verifique o nível com a vareta. Complete se necessário.",
      "⚠️ **Importante**: Descarte o óleo usado em um ponto de coleta adequado. Nunca despeje no meio ambiente.",
    ],
    "battery": [
      "1️⃣ **Segurança**: Desligue o veículo e remova a chave. Use óculos e luvas de proteção.",
      "2️⃣ **Localização**: Abra o capô e localize a bateria. Em alguns veículos pode estar no porta-malas.",
      "3️⃣ **Desconectar**: SEMPRE desconecte primeiro o terminal NEGATIVO (-), depois o POSITIVO (+).",
      "4️⃣ **Remover**: Solte as travas de fixação da bateria e remova-a com cuidado (é pesada!).",
      "5️⃣ **Limpar**: Limpe os terminais e a bandeja com solução de bicarbonato se houver corrosão.",
      "6️⃣ **Instalar**: Posicione a bateria nova e fixe com as travas. Conecte primeiro o POSITIVO (+), depois o NEGATIVO (-).",
      "7️⃣ **Teste**: Ligue o veículo e verifique se todos os sistemas elétricos funcionam corretamente.",
      "⚠️ **Atenção**: Após a troca, pode ser necessário reprogramar o rádio e ajustar o relógio.",
    ],
    "brakes": [
      "1️⃣ **Preparação**: Estacione em local plano, acione o freio de mão e coloque calços nas rodas.",
      "2️⃣ **Remover roda**: Afrouxe os parafusos, levante o veículo com macaco e remova a roda.",
      "3️⃣ **Inspecionar**: Verifique a espessura das pastilhas e o estado do disco de freio.",
      "4️⃣ **Caliper**: Remova os parafusos do caliper e suspenda-o com arame (não deixe pendurado pela mangueira!).",
      "5️⃣ **Pastilhas**: Remova as pastilhas antigas e compare com as novas. Limpe as guias.",
      "6️⃣ **Recuar pistão**: Use uma ferramenta apropriada para recuar o pistão do caliper.",
      "7️⃣ **Montar**: Instale as pastilhas novas, recoloque o caliper e aperte os parafusos corretamente.",
      "8️⃣ **Finalizar**: Recoloque a roda, abaixe o veículo e antes de dirigir, acione o pedal várias vezes.",
      "⚠️ **Crítico**: Freios são itens de segurança. Se não tiver experiência, procure um profissional.",
    ],
    "air_filter": [
      "1️⃣ **Localizar**: Abra o capô e localize a caixa do filtro de ar (geralmente uma caixa preta próxima ao motor).",
      "2️⃣ **Abrir**: Solte as travas ou parafusos que prendem a tampa da caixa do filtro.",
      "3️⃣ **Remover**: Retire o filtro antigo e observe como está posicionado.",
      "4️⃣ **Limpar**: Limpe o interior da caixa do filtro com um pano seco para remover detritos.",
      "5️⃣ **Instalar**: Coloque o filtro novo na mesma posição do antigo.",
      "6️⃣ **Fechar**: Recoloque a tampa e prenda as travas/parafusos.",
      "⚠️ **Dica**: Troque o filtro a cada 15.000-30.000 km ou conforme indicado no manual.",
    ],
    "cabin_air_filter": [
      "1️⃣ **Localizar**: O filtro de cabine geralmente fica atrás do porta-luvas ou sob o painel.",
      "2️⃣ **Acessar**: Remova o porta-luvas ou a tampa de acesso (consulte o manual para seu modelo específico).",
      "3️⃣ **Remover**: Retire o filtro antigo e observe como está posicionado.",
      "4️⃣ **Comparar**: Compare o filtro novo com o antigo para confirmar que é o modelo correto.",
      "5️⃣ **Instalar**: Insira o filtro novo observando a direção do fluxo de ar (seta no filtro).",
      "6️⃣ **Montar**: Recoloque a tampa e o porta-luvas.",
      "⚠️ **Recomendação**: Troque a cada 15.000 km ou 1 ano para manter a qualidade do ar.",
    ],
    "coolant": [
      "1️⃣ **Segurança**: NUNCA abra o sistema de arrefecimento com o motor quente!",
      "2️⃣ **Localizar**: Encontre o reservatório de expansão (tampa com símbolo de radiador).",
      "3️⃣ **Verificar nível**: O líquido deve estar entre as marcas MIN e MAX com motor frio.",
      "4️⃣ **Adicionar**: Se necessário, complete com a mistura correta de água destilada e aditivo.",
      "5️⃣ **Verificar**: Procure por vazamentos nas mangueiras, conexões e radiador.",
      "⚠️ **Importante**: Use sempre o tipo de fluido recomendado pelo fabricante.",
    ],
    "headlight": [
      "1️⃣ **Identificar**: Verifique o tipo de lâmpada necessária (consulte o manual ou a lâmpada antiga).",
      "2️⃣ **Acessar**: Abra o capô e localize a parte traseira do farol. Em alguns casos, pode ser necessário remover peças.",
      "3️⃣ **Desconectar**: Desconecte o soquete elétrico da lâmpada queimada.",
      "4️⃣ **Remover**: Solte a trava de metal ou gire o soquete para liberar a lâmpada.",
      "5️⃣ **Instalar**: Segure a lâmpada nova pela base (não toque no vidro!) e insira no soquete.",
      "6️⃣ **Reconectar**: Recoloque a trava e conecte o soquete elétrico.",
      "7️⃣ **Testar**: Ligue os faróis para verificar o funcionamento.",
      "⚠️ **Atenção**: Lâmpadas halógenas podem explodir se tocadas com os dedos.",
    ],
    "wipers": [
      "1️⃣ **Levantar**: Levante o braço do limpador afastando-o do para-brisa.",
      "2️⃣ **Destravar**: Localize a trava de liberação da palheta (geralmente um botão ou clipe).",
      "3️⃣ **Remover**: Pressione a trava e deslize a palheta antiga para fora do braço.",
      "4️⃣ **Instalar**: Deslize a palheta nova até ouvir o clique de travamento.",
      "5️⃣ **Abaixar**: Baixe cuidadosamente o braço de volta ao para-brisa.",
      "6️⃣ **Testar**: Borrife água e acione os limpadores para verificar o funcionamento.",
      "⚠️ **Dica**: Troque as palhetas a cada 6-12 meses para melhor visibilidade.",
    ],
    "fuse": [
      "1️⃣ **Localizar**: Encontre a caixa de fusíveis (geralmente sob o painel ou no compartimento do motor).",
      "2️⃣ **Diagrama**: Consulte a tampa da caixa ou o manual para identificar o fusível correto.",
      "3️⃣ **Desligar**: Desligue a ignição antes de mexer nos fusíveis.",
      "4️⃣ **Verificar**: Use o extrator de fusíveis para remover o fusível suspeito e verificar se está queimado.",
      "5️⃣ **Substituir**: Coloque um fusível novo com a mesma amperagem (nunca use maior!).",
      "6️⃣ **Testar**: Ligue la ignição e verifique se o sistema voltou a funcionar.",
      "⚠️ **Atenção**: Se o fusível queimar novamente, há um problema elétrico que precisa de diagnóstico.",
    ],
    "spark_plug": [
      "1️⃣ **Preparação**: Desligue o motor e aguarde esfriar completamente. Reúna as velas novas (verificar especificação), chave de vela e calibrador de gap.",
      "2️⃣ **Acesso**: Remova a tampa do motor se houver. Localize os cabos de vela ou bobinas sobre cada cilindro.",
      "3️⃣ **Desconectar**: Desconecte o cabo ou bobina da primeira vela, puxando pelo conector (nunca pelo cabo!).",
      "4️⃣ **Limpar**: Limpe a área ao redor da vela com ar comprimido para evitar que sujeira caia no cilindro.",
      "5️⃣ **Remover**: Use a chave de vela para remover a vela antiga, girando no sentido anti-horário.",
      "6️⃣ **Verificar gap**: Confirme que o gap da vela nova está correto (consulte o manual).",
      "7️⃣ **Instalar**: Rosqueie a vela nova à mão primeiro, depois aperte com a chave (não force demais!).",
      "8️⃣ **Reconectar**: Conecte o cabo ou bobina de volta. Repita para cada cilindro.",
      "⚠️ **Importante**: Troque todas as velas ao mesmo tempo. Velas erradas podem danificar o motor.",
    ],
    "transmission_fluid": [
      "1️⃣ **Preparação**: Estacione em superfície plana e aqueça o veículo até a temperatura de operação normal.",
      "2️⃣ **Localizar**: Encontre la vareta de transmissão (geralmente com tampa vermelha ou amarela próxima ao motor).",
      "3️⃣ **Verificar nível**: Com o motor funcionando em ponto morto, retire a vareta, limpe, reinsira e retire novamente.",
      "4️⃣ **Leitura**: O fluido deve estar entre as marcas de quente (HOT). Observe a cor - deve ser vermelho translúcido.",
      "5️⃣ **Adicionar**: Se baixo, adicione fluido ATF do tipo especificado no manual através do tubo da vareta.",
      "6️⃣ **Verificar novamente**: Adicione em pequenas quantidades, verificando o nível a cada adição.",
      "7️⃣ **Teste**: Mova a alavanca por todas as posições (P, R, N, D) e verifique novamente o nível.",
      "⚠️ **Crítico**: Fluido escuro ou com cheiro de queimado indica necessidade de troca completa por um profissional.",
    ],
    "power_steering": [
      "1️⃣ **Segurança**: Desligue o motor e deixe esfriar. Estacione em superfície plana.",
      "2️⃣ **Localizar**: Encontre o reservatório de direção hidráulica (geralmente com tampa marcada 'Power Steering').",
      "3️⃣ **Verificar nível**: O nível deve estar entre as marcas MIN e MAX.",
      "4️⃣ **Adicionar**: Use apenas o fluido especificado no manual. Não misture tipos diferentes.",
      "5️⃣ **Verificar vazamentos**: Inspecione a bomba, mangueiras e a caixa de direção.",
      "⚠️ **Atenção**: Ruídos ao girar o volante podem indicar nível baixo ou ar no sistema.",
    ],
    "washer_fluid": [
      "1️⃣ **Localizar**: Procure o reservatório com o símbolo de para-brisa na tampa (geralmente azul).",
      "2️⃣ **Adicionar**: Complete com água e um aditivo limpa-vidros apropriado.",
      "3️⃣ **Verificar**: Certifique-se de que os bicos ejetores não estão obstruídos.",
    ]
  };

  const lowerCategory = category.toLowerCase().replace(/[\s-]/g, "_");
  const baseSteps = categorySteps[lowerCategory] || [
    `1️⃣ **Preparação**: Verifique o manual do proprietário para especificações do ${procedureName}.`,
    `2️⃣ **Localização**: Identifique os componentes envolvidos no sistema de ${categoryName}.`,
    `3️⃣ **Execução**: Realize o procedimento conforme as orientações técnicas para seu ${vehicle}.`,
    `4️⃣ **Verificação**: Teste o funcionamento após a conclusão.`,
    `⚠️ **Segurança**: Use sempre Equipamentos de Proteção Individual (EPIs).`
  ];

  return baseSteps;
}

export function formatProcedureTitle(procedure: string): string {
  return procedure
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatBrandName(brand: string): string {
  return brand
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatModelName(model: string): string {
  return model.replace(/_/g, ' ');
}

export function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    'air-conditioner': 'Wind',
    'air-filter-engine': 'Wind',
    'cabin-air-filter': 'Wind',
    'battery': 'Battery',
    'brakes': 'Disc',
    'brake-light': 'Lightbulb',
    'coolant-antifreeze': 'Thermometer',
    'headlight': 'Lightbulb',
    'highbeam': 'Lightbulb',
    'oil': 'Droplet',
    'power-steering': 'Settings',
    'tail-light': 'Lightbulb',
    'transmission-fluid': 'Droplet',
    'washer-fluid': 'Droplet',
    'wipers': 'Wind',
    'windshield-wipers': 'Wind',
    'tires-wheels': 'Disc',
    'interior-fuse': 'Zap',
    'engine-fuse': 'Zap',
    'turn-signal': 'Lightbulb',
    'fog-light': 'Lightbulb',
    'reverse-light': 'Lightbulb',
    'parking-light': 'Lightbulb',
    'license-plate-light': 'Lightbulb',
    'check-engine-light': 'AlertTriangle'
  };
  return icons[categoryId] || 'Settings';
}

// These functions will now be implemented in index.ts using the database
// so we don't need them here as static exporters anymore,
// but we leave placeholders if needed for backwards compatibility during migration.
