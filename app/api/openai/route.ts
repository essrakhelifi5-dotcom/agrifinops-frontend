import { NextRequest, NextResponse } from 'next/server';//	Next request Représente la requête reçue par l’API Next.js
import Groq from 'groq-sdk';//	SDK utilisé pour appeler le modèle IA Groq
//Cette ligne crée un client Groq avec une clé API stockée dans les variables d’environnement.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//Cette fonction est exécutée quand le frontend fait une requête 
export async function POST(req: NextRequest) {
  try {
    //Elle récupère les messages du chatbot et les données du dashboard envoyés par le frontend
    const { messages, dashboardData } = await req.json();

    // Construit le contexte dashboard si disponible
    //Cette variable sert à transformer les données du dashboard en texte compréhensible pour l’IA.
    let dashboardContext = '';

    if (dashboardData?.kpis) {
      const k = dashboardData.kpis;
      dashboardContext += `
      
═══════════════════════════════════════
📊 DONNÉES RÉELLES DU DASHBOARD (temps réel)
═══════════════════════════════════════
//Si les KPIs sont chargés, elle ajoute une section avec les chiffres clés :
 KPIs FINANCIERS :
- Burn Rate mensuel : ${k.burnRate} TND/mois (dépenses moyennes par mois)
- Revenus mensuels moyens : ${k.monthlyRevenue} TND/mois
- Quick Ratio : ${k.quickRatio} (ratio liquidité = revenus/dépenses, idéal > 1)
- Runway : ${k.runway} mois (combien de temps avant épuisement trésorerie)
- Total AR (factures impayées) : ${k.totalAR} TND
- Nombre de factures impayées : ${k.unpaidInvoicesCount}
`;
    }

    if (dashboardData?.burnVsEarn?.length > 0) {
      dashboardContext += `
📈 REVENUS VS DÉPENSES (par mois) :
${dashboardData.burnVsEarn.map((d: { month: string; revenue: number; expenses: number; profit: number }) =>
  `- ${d.month} : Revenus ${d.revenue} TND | Dépenses ${d.expenses} TND | Profit ${d.profit} TND`
).join('\n')}
`;
    }

    if (dashboardData?.arAging?.length > 0) {
      dashboardContext += `
⏰ AR AGING (factures impayées par ancienneté) :
${dashboardData.arAging.map((a: { label: string; count: number; total: number }) =>
  `- ${a.label} : ${a.count} factures = ${a.total} TND`
).join('\n')}
`;
    }

    if (dashboardData?.categoryMargins?.length > 0) {
      dashboardContext += `
🏷️ DÉPENSES PAR CATÉGORIE :
${dashboardData.categoryMargins.map((c: { category: string; amount: number; percentage: number }) =>
  `- ${c.category} : ${c.amount} TND (${c.percentage}%)`
).join('\n')}
`;
    }

    const systemPrompt = `Tu es l'assistant IA intelligent d'Agri-FinOps, une plateforme de gestion financière pour startups agri-food.

Tu es expert en :
- Finance d'entreprise (KPIs, burn rate, runway, quick ratio, AR aging, trésorerie)
- Agriculture et secteur agroalimentaire
- QuickBooks et comptabilité
- Analyse et interprétation de données financières
- Conseils stratégiques pour startups

${dashboardContext ? `Tu as accès aux données RÉELLES et ACTUELLES du dashboard de l'utilisateur :
${dashboardContext}

INSTRUCTIONS IMPORTANTES :
- Utilise ces données pour donner des réponses précises et personnalisées
- Interprète les KPIs et explique ce qu'ils signifient concrètement
- Identifie les points positifs et les risques
- Donne des conseils actionables basés sur les chiffres réels
- Si le quick ratio < 1 : signale un risque de liquidité
- Si le runway < 6 mois : signale une urgence de financement
- Compare les dépenses par catégorie et identifie les plus importantes` 
: 'Les données du dashboard ne sont pas encore chargées. Réponds aux questions générales sur la finance et l\'agriculture.'}

Tu réponds TOUJOURS en français, de façon claire, structurée et professionnelle.
Pour les analyses financières, utilise des emojis pour rendre la lecture plus facile.
Tu peux répondre à TOUTES les questions, pas seulement celles liées à Agri-FinOps.`;
// appelle le modèle IA de Groq en lui envoyant le system prompt (contexte et instructions) et les messages du chatbot (questions de l’utilisateur).
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return NextResponse.json({
      content: completion.choices[0].message.content,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('ERREUR API:', message);
    return NextResponse.json(
      { content: `❌ Erreur: ${message}` },
    
      { status: 500 }
    );
  }
}