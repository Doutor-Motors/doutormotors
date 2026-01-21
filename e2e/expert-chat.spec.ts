import { test, expect } from "@playwright/test";

test.describe("Expert Chat - Conversation Management", () => {
  // Skip auth for now - these tests check UI behavior
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/study-car");
    await page.waitForLoadState("networkidle");
  });

  test("should display expert chat button on brands view", async ({ page }) => {
    // Look for the expert chat button/card
    const expertButton = page.locator('text=Especialista Automotivo').first();
    await expect(expertButton).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to expert chat view", async ({ page }) => {
    // Click on expert chat option
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Verify we're in the expert chat view
    await expect(page.locator('text=Converse, envie fotos')).toBeVisible({ timeout: 10000 });
  });

  test("should display quick question options", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Check for quick question cards
    const questionCards = page.locator('text=Meu carro está fazendo um barulho estranho');
    await expect(questionCards).toBeVisible({ timeout: 10000 });
  });

  test("should have new conversation button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Look for "Nova" button
    const newButton = page.locator('button:has-text("Nova")').first();
    await expect(newButton).toBeVisible({ timeout: 10000 });
  });

  test("should have history button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Look for "Histórico" button
    const historyButton = page.locator('button:has-text("Histórico")').first();
    await expect(historyButton).toBeVisible({ timeout: 10000 });
  });

  test("should open history sheet when clicking history button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Click history button
    await page.locator('button:has-text("Histórico")').first().click();
    
    // Verify sheet is open - look for "Minhas Conversas" title
    await expect(page.locator('text=Minhas Conversas')).toBeVisible({ timeout: 5000 });
  });

  test("should have search input in history sheet", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    await page.locator('button:has-text("Histórico")').first().click();
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test("should have tabs for All and Pinned conversations", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    await page.locator('button:has-text("Histórico")').first().click();
    
    // Look for tabs
    await expect(page.locator('button[role="tab"]:has-text("Todas")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Fixadas")')).toBeVisible();
  });

  test("should close history sheet when clicking outside", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    await page.locator('button:has-text("Histórico")').first().click();
    
    // Verify sheet is open
    await expect(page.locator('text=Minhas Conversas')).toBeVisible({ timeout: 5000 });
    
    // Press Escape to close
    await page.keyboard.press("Escape");
    
    // Verify sheet is closed
    await expect(page.locator('text=Minhas Conversas')).toBeHidden({ timeout: 5000 });
  });

  test("should have input field for sending messages", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Look for message input
    const messageInput = page.locator('input[placeholder*="Digite sua pergunta"]');
    await expect(messageInput).toBeVisible({ timeout: 10000 });
  });

  test("should have image upload button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Look for image button (has ImageIcon)
    const imageButton = page.locator('button[title="Enviar foto"]');
    await expect(imageButton).toBeVisible({ timeout: 10000 });
  });

  test("should have document upload button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Look for document button
    const docButton = page.locator('button[title="Enviar documento"]');
    await expect(docButton).toBeVisible({ timeout: 10000 });
  });

  test("should have ranking button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Look for "Ranking" button
    const rankingButton = page.locator('button:has-text("Ranking")').first();
    await expect(rankingButton).toBeVisible({ timeout: 10000 });
  });

  test("should navigate back when clicking back button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Wait for expert view
    await expect(page.locator('text=Converse, envie fotos')).toBeVisible({ timeout: 10000 });
    
    // Click back button (ArrowLeft icon)
    await page.locator('button').filter({ has: page.locator('svg.lucide-arrow-left') }).first().click();
    
    // Should be back at brands view
    await expect(page.locator('text=Selecione a Marca')).toBeVisible({ timeout: 10000 });
  });

  test("should navigate home when clicking home button", async ({ page }) => {
    await page.locator('text=Especialista Automotivo').first().click();
    
    // Wait for expert view
    await expect(page.locator('text=Converse, envie fotos')).toBeVisible({ timeout: 10000 });
    
    // Click home button
    await page.locator('button').filter({ has: page.locator('svg.lucide-home') }).first().click();
    
    // Should be back at brands view
    await expect(page.locator('text=Selecione a Marca')).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Expert Chat - With Authentication", () => {
  // Use authenticated state
  test.use({ storageState: ".playwright/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/study-car");
    await page.waitForLoadState("networkidle");
    await page.locator('text=Especialista Automotivo').first().click();
    await expect(page.locator('text=Converse, envie fotos')).toBeVisible({ timeout: 10000 });
  });

  test("should be able to type in message input", async ({ page }) => {
    const messageInput = page.locator('input[placeholder*="Digite sua pergunta"]');
    await messageInput.fill("Teste de mensagem");
    await expect(messageInput).toHaveValue("Teste de mensagem");
  });

  test("should have send button disabled when input is empty", async ({ page }) => {
    const sendButton = page.locator('button').filter({ has: page.locator('svg.lucide-send') }).first();
    await expect(sendButton).toBeDisabled();
  });

  test("should enable send button when input has text", async ({ page }) => {
    const messageInput = page.locator('input[placeholder*="Digite sua pergunta"]');
    await messageInput.fill("Teste de mensagem");
    
    const sendButton = page.locator('button').filter({ has: page.locator('svg.lucide-send') }).first();
    await expect(sendButton).toBeEnabled();
  });
});
