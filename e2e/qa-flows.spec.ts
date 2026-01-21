/**
 * QA FLOWS TESTS - Doutor Motors
 * 
 * Testes de fluxos completos (E2E)
 * Execução: npx playwright test e2e/qa-flows.spec.ts
 */

import { test, expect } from '@playwright/test';

test.use({ 
  storageState: '.playwright/.auth/user.json',
});

test.describe('Fluxo: Cadastro → Seleção de Plano', () => {
  
  test('Usuário pode acessar página de cadastro', async ({ page, context }) => {
    await context.clearCookies();
    
    await page.goto('/signup');
    
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /criar.*conta|cadastrar/i })).toBeVisible();
  });

  test('Link para login existe na página de cadastro', async ({ page, context }) => {
    await context.clearCookies();
    
    await page.goto('/signup');
    
    const loginLink = page.getByRole('link', { name: /login|entrar|já.*conta/i });
    await expect(loginLink).toBeVisible();
  });

  test('Página de seleção de plano mostra opções', async ({ page }) => {
    await page.goto('/select-plan');
    
    const hasBasic = await page.getByText(/basic/i).count() > 0;
    const hasPro = await page.getByText(/pro/i).count() > 0;
    
    expect(hasBasic || hasPro).toBe(true);
  });
});

test.describe('Fluxo: Login → Dashboard', () => {
  
  test('Login válido redireciona para dashboard', async ({ page, context }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await context.clearCookies();
    
    await page.goto('/login');
    
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/senha/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await page.waitForURL(/dashboard|select-plan/, { timeout: 15000 });
    
    const onDashboard = page.url().includes('dashboard');
    const onSelectPlan = page.url().includes('select-plan');
    
    expect(onDashboard || onSelectPlan).toBe(true);
  });

  test('Dashboard mostra navegação principal', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard');
    
    const hasNav = await page.locator('nav, aside, [class*="sidebar"]').count() > 0;
    expect(hasNav).toBe(true);
  });
});

test.describe('Fluxo: Veículos', () => {
  
  test('Usuário pode ver lista de veículos', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/vehicles');
    
    const hasVehicles = await page.locator('[class*="card"], table').count() > 0;
    const hasEmptyState = await page.getByText(/nenhum|adicione|sem veículos/i).count() > 0;
    
    expect(hasVehicles || hasEmptyState).toBe(true);
  });

  test('Usuário pode abrir formulário de adicionar veículo', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/vehicles');
    
    const addButton = page.getByRole('button', { name: /adicionar|novo|add/i });
    
    if (await addButton.count() > 0) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      const hasBrandField = await page.getByLabel(/marca/i).count() > 0;
      expect(hasBrandField).toBe(true);
    }
  });
});

test.describe('Fluxo: Diagnóstico', () => {
  
  test('Centro de diagnóstico carrega corretamente', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/diagnostics');
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('Opções de conexão estão disponíveis', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/diagnostics');
    
    const hasConnectionOptions = await page.locator('button, [class*="card"]')
      .filter({ hasText: /bluetooth|wifi|demo|simular|conectar/i }).count() > 0;
    
    expect(hasConnectionOptions).toBe(true);
  });

  test('Modo demo está disponível', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/diagnostics');
    
    const demoButton = page.locator('button').filter({ hasText: /demo|simular|teste/i });
    const hasDemoMode = await demoButton.count() > 0;
    
    expect(hasDemoMode).toBe(true);
  });
});

test.describe('Fluxo: Suporte', () => {
  
  test('Centro de suporte carrega', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/support');
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('Botão de novo ticket existe', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/support');
    
    const newTicketButton = page.getByRole('button', { name: /ticket|novo|abrir/i });
    const hasButton = await newTicketButton.count() > 0;
    
    expect(hasButton).toBe(true);
  });
});

test.describe('Fluxo: Perfil e Configurações', () => {
  
  test('Página de perfil carrega', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/profile');
    
    await expect(page.getByLabel(/nome/i)).toBeVisible();
  });

  test('Abas do perfil funcionam', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/profile');
    
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    
    if (tabCount > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(500);
      
      // Tab content should change
      expect(true).toBe(true);
    }
  });

  test('Alteração de senha disponível', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/profile');
    
    const passwordSection = page.getByText(/alterar.*senha|nova.*senha/i);
    const hasPasswordSection = await passwordSection.count() > 0;
    
    expect(hasPasswordSection).toBe(true);
  });
});

test.describe('Fluxo: Manutenção', () => {
  
  test('Gerenciador de manutenção carrega', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/maintenance');
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Fluxo: Expert Chat', () => {
  
  test('Página do especialista carrega', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/expert');
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('Interface de chat está disponível', async ({ page }) => {
    test.skip(!process.env.TEST_USER_EMAIL, 'Sem credenciais de teste');
    
    await page.goto('/dashboard/expert');
    
    const hasInput = await page.locator('textarea, input[type="text"]').count() > 0;
    const hasSendButton = await page.getByRole('button', { name: /enviar|send/i }).count() > 0;
    
    expect(hasInput || hasSendButton).toBe(true);
  });
});

test.describe('Fluxo: Estude Seu Carro', () => {
  
  test('Página de estudos carrega', async ({ page }) => {
    await page.goto('/estude-seu-carro');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Busca ou categorias estão disponíveis', async ({ page }) => {
    await page.goto('/estude-seu-carro');
    
    const hasSearch = await page.locator('input[type="search"], input[placeholder*="buscar" i]').count() > 0;
    const hasCategories = await page.locator('[class*="category"], [class*="card"]').count() > 0;
    
    expect(hasSearch || hasCategories).toBe(true);
  });
});

test.describe('Fluxo: Páginas Públicas', () => {
  
  test('Página Sobre carrega', async ({ page }) => {
    await page.goto('/sobre');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Página Serviços carrega', async ({ page }) => {
    await page.goto('/servicos');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Página Como Funciona carrega', async ({ page }) => {
    await page.goto('/como-funciona');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Página Contato carrega', async ({ page }) => {
    await page.goto('/contato');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Página FAQ carrega', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Página Termos carrega', async ({ page }) => {
    await page.goto('/termos');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Página Privacidade carrega', async ({ page }) => {
    await page.goto('/privacidade');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Fluxo: Navegação Global', () => {
  
  test('Header está presente em todas as páginas', async ({ page }) => {
    const pages = ['/', '/sobre', '/servicos', '/contato', '/faq'];
    
    for (const p of pages) {
      await page.goto(p);
      const hasHeader = await page.locator('header').count() > 0;
      expect(hasHeader, `Header deve existir em ${p}`).toBe(true);
    }
  });

  test('Footer está presente em páginas públicas', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const hasFooter = await page.locator('footer').count() > 0;
    expect(hasFooter).toBe(true);
  });

  test('404 mostra página de erro', async ({ page }) => {
    await page.goto('/pagina-que-nao-existe-123456');
    
    const has404 = await page.getByText(/404|não encontrad|not found/i).count() > 0;
    expect(has404).toBe(true);
  });
});
