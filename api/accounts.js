// Vercel Serverless Function - API 代理
// 路径: /api/accounts
// 数据源: https://fanqiangnan.com/data_sync.php

const SOURCE_API = 'https://fanqiangnan.com/data_sync.php';

// 获取账号数据
async function fetchAccounts() {
  console.log(`🌐 请求API: ${SOURCE_API}`);

  const response = await fetch(SOURCE_API, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📊 API响应:', JSON.stringify(data).substring(0, 200) + '...');

  if (!data.success) {
    throw new Error(data.error || 'API返回失败状态');
  }

  // 转换数据格式以兼容前端
  const accounts = [];
  
  // 从 data.data.accounts 中提取所有分组的账号
  if (data.data && data.data.accounts) {
    const accountGroups = data.data.accounts;
    
    for (const groupKey in accountGroups) {
      const group = accountGroups[groupKey];
      if (Array.isArray(group)) {
        for (const item of group) {
          accounts.push({
            email: item.fullEmail || item.email,
            password: item.password,
            status: item.status,
            time: item.checkTime || item.time,
            region: item.region,
            regionName: item.regionName
          });
        }
      }
    }
  }

  console.log(`✅ 成功获取 ${accounts.length} 个账号`);
  
  // 返回与原 API 兼容的格式
  return {
    id: accounts,
    timestamp: data.timestamp,
    source: 'fanqiangnan.com'
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
