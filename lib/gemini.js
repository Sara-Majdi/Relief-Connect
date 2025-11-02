import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
let genAI;
let model;

function getGeminiModel() {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    genAI = new GoogleGenerativeAI(apiKey);
    // Using Gemini 1.5 Flash for fast, cost-effective responses
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return model;
}

/**
 * Helper function to generate content with Gemini
 */
async function generateContent(prompt, systemInstruction = '') {
  try {
    const model = getGeminiModel();

    const fullPrompt = systemInstruction
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);

    // Handle specific Gemini errors
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API key. Please check your configuration');
    }
    if (error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error('Gemini quota exceeded. Please check your usage limits');
    }
    if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
      throw new Error('Rate limit exceeded. Please try again in a moment');
    }

    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Generate campaign title suggestions using Gemini
 * @param {Object} context - Campaign context
 * @param {string} context.disaster - Type of disaster
 * @param {string} context.location - Location of campaign
 * @param {string} context.state - State where campaign is located
 * @param {string} context.urgency - Urgency level
 * @returns {Promise<Array<string>>} Array of 3 title suggestions
 */
export async function generateCampaignTitles(context) {
  const { disaster, location, state, urgency } = context;

  const systemInstruction = 'You are an expert copywriter specializing in nonprofit fundraising campaigns. You create compelling, empathetic titles that inspire action while maintaining professionalism.';

  const prompt = `Generate 3 compelling campaign titles for a disaster relief fundraising campaign with the following details:
- Disaster Type: ${disaster || 'General Relief'}
- Location: ${location || state || 'Malaysia'}
- Urgency Level: ${urgency || 'Medium'}

Requirements:
- Titles should be concise (5-10 words)
- Emotionally engaging but professional
- Action-oriented and clear about the cause
- Suitable for Malaysian context
- SEO-friendly

Return only the 3 titles, one per line, without numbering or bullet points.`;

  try {
    const response = await generateContent(prompt, systemInstruction);
    const titles = response
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^[*\-•]\s*/, '').trim()) // Remove bullets/dashes
      .slice(0, 3);

    return titles;
  } catch (error) {
    console.error('Error in generateCampaignTitles:', error);
    throw error;
  }
}

/**
 * Generate campaign description using Gemini
 * @param {Object} context - Campaign context
 * @param {string} type - 'short' or 'long' description
 * @returns {Promise<string>} Generated description
 */
export async function generateCampaignDescription(context, type = 'short') {
  const {
    disaster,
    location,
    state,
    urgency,
    beneficiaries,
    goal,
    title,
  } = context;

  const lengthGuide = type === 'short'
    ? '2-3 sentences (50-100 words)'
    : '4-6 paragraphs (300-500 words) covering situation overview, impact assessment, planned interventions, expected outcomes, and call to action';

  const systemInstruction = 'You are an expert nonprofit copywriter who creates compelling fundraising campaign descriptions that inspire donors to take action.';

  const prompt = `Generate a ${type} description for a disaster relief fundraising campaign:

Campaign Title: ${title || 'Relief Campaign'}
Disaster Type: ${disaster || 'General Relief'}
Location: ${location || state || 'Malaysia'}
Urgency Level: ${urgency || 'Medium'}
${beneficiaries ? `Number of Beneficiaries: ${beneficiaries}` : ''}
${goal ? `Funding Goal: RM ${goal}` : ''}

Requirements:
- Length: ${lengthGuide}
- Tone: Empathetic, urgent, but professional
- Focus on human impact and community needs
- Include specific details about how funds will be used
- End with a clear call to action
- Suitable for Malaysian context

${type === 'long' ? 'Structure the description with clear sections: Situation Overview, Impact Assessment, Planned Interventions, Expected Outcomes, and Call to Action.' : ''}`;

  try {
    const response = await generateContent(prompt, systemInstruction);
    return response.trim();
  } catch (error) {
    console.error('Error in generateCampaignDescription:', error);
    throw error;
  }
}

/**
 * Polish and improve existing copy using Gemini
 * @param {string} text - Original text to polish
 * @param {Object} options - Polishing options
 * @param {string} options.tone - Desired tone (professional, emotional, urgent, hopeful)
 * @param {string} options.context - Context about what this text is for
 * @returns {Promise<string>} Polished text
 */
export async function polishCopy(text, options = {}) {
  const { tone = 'professional', context = 'campaign description' } = options;

  const systemInstruction = 'You are an expert editor specializing in nonprofit communications. You improve clarity, tone, and impact while preserving the original message.';

  const prompt = `Polish and improve the following ${context} for a disaster relief fundraising campaign.

Original text:
"${text}"

Requirements:
- Maintain the core message and facts
- Improve clarity and readability
- Adjust tone to be: ${tone}
- Fix any grammar or spelling issues
- Make it more engaging and action-oriented
- Keep the same general length
- Ensure it's suitable for Malaysian donors

Return only the improved text, without explanations or comments.`;

  try {
    const response = await generateContent(prompt, systemInstruction);
    return response.trim();
  } catch (error) {
    console.error('Error in polishCopy:', error);
    throw error;
  }
}

/**
 * Generate financial breakdown categories based on disaster type
 * @param {string} disaster - Type of disaster
 * @param {number} totalGoal - Total campaign goal
 * @returns {Promise<Array<Object>>} Array of category suggestions with allocated amounts
 */
export async function generateFinancialCategories(disaster, totalGoal = 0) {
  const systemInstruction = 'You are an expert in disaster relief operations and budget planning for NGOs.';

  const prompt = `Generate 5-7 financial breakdown categories for a ${disaster || 'general'} disaster relief campaign in Malaysia.

${totalGoal > 0 ? `Total Campaign Goal: RM ${totalGoal}` : ''}

Requirements:
- Categories should be specific and relevant to ${disaster || 'disaster'} relief
- Include typical expenses like emergency supplies, medical aid, shelter, food, etc.
- ${totalGoal > 0 ? 'Suggest percentage allocation for each category' : 'Just list the categories'}
- Use Malaysian context and terminology

Return the categories in this exact format:
Category Name | ${totalGoal > 0 ? 'Percentage' : 'Description'}

Example:
Emergency Medical Supplies | ${totalGoal > 0 ? '25%' : 'First aid kits, medicines, medical equipment'}`;

  try {
    const response = await generateContent(prompt, systemInstruction);
    const lines = response.split('\n').filter(line => line.includes('|'));

    const categories = lines.map(line => {
      const [name, value] = line.split('|').map(s => s.trim());

      if (totalGoal > 0) {
        const percentage = parseInt(value) || 0;
        const allocated = Math.round((totalGoal * percentage) / 100);
        return {
          category: name,
          allocated,
          spent: 0,
        };
      }

      return {
        category: name,
        description: value,
      };
    });

    return categories;
  } catch (error) {
    console.error('Error in generateFinancialCategories:', error);
    throw error;
  }
}

/**
 * Generate fundraising item suggestions based on disaster type
 * @param {string} disaster - Type of disaster
 * @param {number} count - Number of items to generate
 * @returns {Promise<Array<Object>>} Array of item suggestions
 */
export async function generateFundraisingItems(disaster, count = 5) {
  const systemInstruction = 'You are an expert in disaster relief operations and emergency aid distribution in Malaysia.';

  const prompt = `Generate ${count} specific fundraising items for a ${disaster || 'general'} disaster relief campaign in Malaysia.

Requirements:
- Items should be practical and relevant to ${disaster || 'disaster'} relief
- Include diverse categories (food, medical, shelter, hygiene, etc.)
- Provide realistic quantities and unit costs in Malaysian Ringgit (RM)
- Items should be culturally appropriate for Malaysia

Return each item in this exact format:
Item Name | Description | Quantity | Unit Cost (RM) | Priority

Example:
Emergency Food Packages | Rice, canned goods, and dry food for affected families | 500 | 25 | high`;

  try {
    const response = await generateContent(prompt, systemInstruction);
    const lines = response.split('\n').filter(line => line.includes('|'));

    const items = lines.slice(0, count).map(line => {
      const [name, description, quantity, unitCost, priority] = line
        .split('|')
        .map(s => s.trim());

      const qty = parseInt(quantity) || 100;
      const cost = parseFloat(unitCost.replace(/[^\d.]/g, '')) || 10;

      return {
        name,
        description,
        quantity: qty,
        unit_cost: cost,
        target_amount: qty * cost,
        priority: priority.toLowerCase(),
        category: getCategoryFromItem(name),
      };
    });

    return items;
  } catch (error) {
    console.error('Error in generateFundraisingItems:', error);
    throw error;
  }
}

/**
 * Generate campaign update content
 * @param {Object} context - Update context
 * @returns {Promise<Object>} Generated update with title and description
 */
export async function generateCampaignUpdate(context) {
  const {
    campaignTitle,
    updateType = 'progress',
    progressPercentage,
    amountRaised,
    totalGoal,
    recentDonations,
  } = context;

  const systemInstruction = 'You are an expert nonprofit communicator who creates engaging campaign updates that build trust and inspire continued support.';

  const prompt = `Generate a campaign update for "${campaignTitle}".

Update Type: ${updateType}
${progressPercentage ? `Progress: ${progressPercentage}% of goal reached` : ''}
${amountRaised && totalGoal ? `Amount Raised: RM ${amountRaised} of RM ${totalGoal}` : ''}
${recentDonations ? `Recent Donations: ${recentDonations}` : ''}

Requirements:
- Generate both a title and description
- Title: Short and engaging (5-10 words)
- Description: 3-4 paragraphs
- Tone: Grateful, encouraging, informative
- Include specific impact details
- Thank donors appropriately
- End with motivation to continue supporting

Return in this format:
TITLE: [update title]
DESCRIPTION:
[update description]`;

  try {
    const response = await generateContent(prompt, systemInstruction);
    const titleMatch = response.match(/TITLE:\s*(.+)/);
    const descMatch = response.match(/DESCRIPTION:\s*([\s\S]+)/);

    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : '',
    };
  } catch (error) {
    console.error('Error in generateCampaignUpdate:', error);
    throw error;
  }
}

/**
 * Helper function to categorize items
 */
function getCategoryFromItem(itemName) {
  const name = itemName.toLowerCase();

  if (name.includes('food') || name.includes('rice') || name.includes('meal')) {
    return 'Food & Water';
  }
  if (name.includes('medical') || name.includes('health') || name.includes('medicine')) {
    return 'Medical Supplies';
  }
  if (name.includes('shelter') || name.includes('tent') || name.includes('blanket')) {
    return 'Shelter & Housing';
  }
  if (name.includes('hygiene') || name.includes('soap') || name.includes('sanitizer')) {
    return 'Hygiene & Sanitation';
  }
  if (name.includes('cloth') || name.includes('shirt') || name.includes('wear')) {
    return 'Clothing';
  }
  if (name.includes('education') || name.includes('school') || name.includes('book')) {
    return 'Education';
  }

  return 'Other';
}
