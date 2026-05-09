import { getPayload } from 'payload';
import config from './src/payload.config.js';

async function updatePage() {
  const payload = await getPayload({ config });

  console.log('Updating "Quem Somos" with critical disclaimer...');

  const createLexicalContent = (text: string) => ({
    root: {
      children: text.split('\n').map(p => ({
        children: [{ text: p, type: 'text', version: 1 }],
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  });

  const refinedText = `O Legado de Charlie e Nossa Missão

O principal intuito da ONG Viralatinhas de Sumaré é atuar na proteção e bem-estar de cães e gatos, especialmente aqueles em situação de abandono e maus-tratos, focando no controle populacional e na promoção da adoção responsável.

⚠️ NOTA IMPORTANTE: A Viralatinhas de Sumaré NÃO POSSUI ABRIGO PRÓPRIO E NÃO RECOLHE ANIMAIS. Nosso trabalho é focado no suporte, castração e intermediação da adoção. Não temos estrutura para receber novos animais.

Nossos Principais Objetivos e Atividades:

• Controle Populacional: Promovemos campanhas de castração a preços reduzidos em parceria com clínicas, poder público e empresas.
• Adoção Consciente: Realizamos feirinhas de adoção e utilizamos nossas redes sociais para encontrar lares para animais, exigindo a assinatura de um Termo de Responsabilidade.
• Defesa e Direitos: Atuamos no combate aos maus-tratos e na construção de políticas públicas para a causa animal.
• Educação: Conscientizamos a população sobre a posse responsável e os cuidados básicos.
• Apoio Financeiro: Arrecadamos recursos através de doações, venda de produtos (agendas, camisetas) e campanhas de reciclagem (Viratampinhas), revertendo 100% do valor para ração, remédios e tratamentos de animais já assistidos pela rede de voluntários.

Para acompanhar nosso trabalho ou ajudar, entre em contato:
Instagram: @viralatinhasoficial
WhatsApp: (19) 99708-0388`;

  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'quem-somos',
      },
    },
  });

  if (result.docs.length > 0) {
    await payload.update({
      collection: 'pages',
      id: result.docs[0].id,
      data: {
        content: createLexicalContent(refinedText),
      },
    });
    console.log('Page updated successfully!');
  } else {
    console.log('Page "quem-somos" not found.');
  }

  process.exit(0);
}

updatePage().catch(err => {
  console.error(err);
  process.exit(1);
});
