export default async function handler(req, res) {
  // Verificação de segurança: a requisição deve vir do Vercel Cron
  // e conter o header correto de autorização
  if (
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized. Invalid CRON_SECRET.' });
  }

  const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
  const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !databaseId || !apiKey) {
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  const headers = {
    'X-Appwrite-Project': projectId,
    'X-Appwrite-Key': apiKey,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Buscar todos os documentos de usuarios_metadata
    const listMetaUrl = `${endpoint}/databases/${databaseId}/collections/usuarios_metadata/documents?limit=100`;
    const listMetaRes = await fetch(listMetaUrl, { headers });
    
    if (!listMetaRes.ok) {
      throw new Error(`Falha ao buscar metadados: ${listMetaRes.status}`);
    }

    const listMetaData = await listMetaRes.json();
    const docs = listMetaData.documents;

    // Resetar mcoins para 0 em todos
    for (const doc of docs) {
      const updateUrl = `${endpoint}/databases/${databaseId}/collections/usuarios_metadata/documents/${doc.$id}`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          data: {
            mcoins: 0
          }
        })
      });
    }

    // 2. Limpar o feed de atividades de pontos
    const listActUrl = `${endpoint}/databases/${databaseId}/collections/atividades/documents?limit=100`;
    const listActRes = await fetch(listActUrl, { headers });

    if (listActRes.ok) {
      const listActData = await listActRes.json();
      const activities = listActData.documents;

      for (const act of activities) {
        const delUrl = `${endpoint}/databases/${databaseId}/collections/atividades/documents/${act.$id}`;
        await fetch(delUrl, {
          method: 'DELETE',
          headers
        });
      }
    }

    return res.status(200).json({ success: true, message: 'Pontos resetados com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao processar o reset.' });
  }
}
