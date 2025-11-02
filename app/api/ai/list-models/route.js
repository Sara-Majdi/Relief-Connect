export async function GET() {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return Response.json({ 
          success: false, 
          error: 'GEMINI_API_KEY not found in environment variables' 
        }, { status: 500 });
      }
  
      // Direct API call to list models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return Response.json({ 
          success: false, 
          error: errorData,
          status: response.status
        }, { status: response.status });
      }
      
      const data = await response.json();
      
      // Filter for models that support generateContent
      const compatibleModels = data.models?.filter(model => 
        model.supportedGenerationMethods?.includes('generateContent')
      ) || [];
      
      return Response.json({ 
        success: true, 
        models: compatibleModels.map(m => ({
          name: m.name,
          displayName: m.displayName,
          description: m.description
        })),
        allModels: data.models?.map(m => m.name) || []
      });
    } catch (error) {
      return Response.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
  }