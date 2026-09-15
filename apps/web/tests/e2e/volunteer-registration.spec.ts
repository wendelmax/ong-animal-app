import { test, expect } from '@playwright/test'

test('exibe mensagem segura para convite inválido', async ({ page }) => {
  await page.route('**/api/volunteer-invitations/e2e-invalid/public', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'INVITATION_INVALID' }) })
  })

  await page.goto('http://localhost:3000/voluntarios/cadastro/e2e-invalid')

  await expect(page.getByRole('heading', { name: 'Link inválido' })).toBeVisible()
  await expect(page.locator('body')).not.toContainText('cpfEncrypted')
  await expect(page.locator('body')).not.toContainText('cpfBlindIndex')
})
