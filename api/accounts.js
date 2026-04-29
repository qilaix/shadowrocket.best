// Vercel Serverless Function - API 代理
// 路径: /api/accounts
// 数据源: https://id.bocchi2b.top/

const SOURCE_SITE = 'https://id.bocchi2b.top/';

const SOURCE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Referer': SOURCE_SITE,
  'Cache-Control': 'no-cache',
};

async function resolveSourceApi() {
  const htmlResponse = await fetch(SOURCE_SITE, {
    headers: { ...SOURCE_HEADERS, 'Accept': 'text/html,*/*' },
  });

  if (!htmlResponse.ok) {
    throw new Error(`页面请求失败: ${htmlResponse.status} ${htmlResponse.statusText}`);
  }

  const html = await htmlResponse.text();
  const scriptMatch = html.match(/<script[^>]+src=["']([^"']+\.js)["']/i);
  if (!scriptMatch) {
    throw new Error('未找到目标站点脚本资源');
  }

  const scriptUrl = new URL(scriptMatch[1], SOURCE_SITE).toString();
  const scriptResponse = await fetch(scriptUrl, {
    headers: { ...SOURCE_HEADERS, 'Accept': 'application/javascript,*/*' },
  });

  if (!scriptResponse.ok) {
    throw new Error(`脚本请求失败: ${scriptResponse.status} ${scriptResponse.statusText}`);
  }

  const script = await scriptResponse.text();
  const apiMatch = script.match(/https:\/\/id\.bocchi2b\.top\/api\/list\?password=[^"']+/);
  if (!apiMatch) {
    throw new Error('未找到目标站点账号接口');
  }

  return apiMatch[0];
}

// 获取账号数据
async function fetchAccounts() {
  const SOURCE_API = await resolveSourceApi();
  console.log(`🌐 请求API: ${SOURCE_API}`);

  const response = await fetch(SOURCE_API, {
    headers: SOURCE_HEADERS
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📊 API响应:', JSON.stringify(data).substring(0, 200) + '...');

  if (!Array.isArray(data.id)) {
    throw new Error(data.message || data.error || 'API返回格式异常');
  }

  const normalizeStatus = (item) => {
    const status = String(item.status || '').trim();
    const time = String(item.time || '').trim();
    return status === '正常' && !/(必须|禁止|异常|错误|锁定|失效)/.test(time) ? '正常' : '异常';
  };

  // 转换数据格式以兼容前端
  const accountMap = new Map();

  for (const account of data.id
    .filter(item => item && item.email && item.password)
    .map(item => ({
      email: item.email,
      password: item.password,
      status: normalizeStatus(item),
      rawStatus: item.status || '',
      time: item.time || new Date().toISOString(),
      region: item.country || item.region || '',
      regionName: item.country || item.regionName || '',
      country: item.country || ''
    }))) {
    const key = account.email.toLowerCase();
    const existing = accountMap.get(key);
    if (!existing || (existing.status !== '正常' && account.status === '正常')) {
      accountMap.set(key, account);
    }
  }

  const accounts = Array.from(accountMap.values());
  const normalCount = accounts.filter(account => account.status === '正常').length;
  const abnormalCount = accounts.length - normalCount;

  console.log(`✅ 成功获取 ${accounts.length} 个账号（原始 ${data.id.length} 条，正常 ${normalCount}，异常 ${abnormalCount}）`);
  
  // 返回与原 API 兼容的格式
  return {
    id: accounts,
    totalRaw: data.id.length,
    total: accounts.length,
    normalCount,
    abnormalCount,
    timestamp: Date.now(),
    source: 'id.bocchi2b.top'
  };
}

// Vercel Serverless Function handler
export default async function handler(req, res) {
  const startTime = Date.now();

  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🚀 收到请求:', req.url);

    const result = await fetchAccounts();

    const duration = Date.now() - startTime;
    console.log(`✅ 请求完成，耗时: ${duration}ms`);

    // 返回数据
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    return res.status(200).json(result);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ 请求失败:', error.message);

    return res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
