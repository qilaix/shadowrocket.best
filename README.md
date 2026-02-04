# Shadowrocket ID 共享网站

## 🌟 部署方式对比

| 特性 | 本地开发 | Cloudflare Pages |
|------|---------|------------------|
| **成本** | 免费 | 免费（10万请求/天）|
| **域名** | localhost:8000 | your-name.pages.dev |
| **HTTPS** | ❌ | ✅ 自动配置 |
| **CDN** | ❌ | ✅ 全球加速 |
| **需要服务器** | ✅ 需要保持运行 | ❌ 无需维护 |
| **访问性** | 仅本地 | 全球可访问 |
| **自动扩展** | ❌ | ✅ 自动处理流量 |
| **自定义域名** | 需要配置 | ✅ 免费绑定 |

## 📦 项目文件

### 本地开发文件
- `server.js` - Node.js 服务器
- `start-server.sh` - 启动脚本
- `使用说明.md` - 本地使用文档

### Cloudflare Pages 文件
- `functions/api/accounts.js` - API 代理函数
- `wrangler.toml` - Cloudflare 配置
- `deploy-cloudflare.sh` - 部署脚本
- `README-CLOUDFLARE.md` - Cloudflare 部署指南

### 共享文件
- `index.html` - 网站主页（两种方式通用）

## 🚀 快速开始

### 选项 1: 本地开发

```bash
cd ~/Desktop/ai-website/shadowrocket.best
./start-server.sh
# 访问 http://localhost:8000
```

详细说明：[使用说明.md](使用说明.md)

### 选项 2: 部署到 Cloudflare Pages

```bash
cd ~/Desktop/ai-website/shadowrocket.best
./deploy-cloudflare.sh
# 自动部署到 https://your-project.pages.dev
```

详细说明：[README-CLOUDFLARE.md](README-CLOUDFLARE.md)

## 💡 推荐方案

### 适合本地开发的场景：
- 🔧 开发和测试
- 🏠 仅个人本地使用
- 🔒 不想公开访问

### 适合 Cloudflare Pages 的场景：
- 🌐 需要公网访问
- 👥 多人共享使用
- 📈 需要稳定性和性能
- 💰 预算有限（完全免费）

## ⚙️ 技术架构

### 本地开发架构
```
浏览器 → Node.js 服务器 → 密码提取 → API 请求 → 返回数据
```

### Cloudflare Pages 架构
```
浏览器 → CF Edge (全球CDN)
          ↓
       Pages Function → 密码提取 → API 请求 → 缓存 → 返回数据
```

## 📊 功能对比

| 功能 | 本地 | Cloudflare |
|------|------|------------|
| 自动提取密码 | ✅ | ✅ |
| 密码缓存 | ✅ | ✅ |
| CORS 解决 | ✅ | ✅ |
| 账号复制 | ✅ | ✅ |
| 响应速度 | 快 | 极快（CDN）|
| 可靠性 | 依赖本地 | 99.9% SLA |

## 🔄 从本地迁移到 Cloudflare

1. 确保 `index.html` 已更新
2. 运行 `./deploy-cloudflare.sh`
3. 部署完成后测试功能
4. 绑定自定义域名（可选）

## 📚 文档索引

- 📖 [本地使用说明](使用说明.md)
- 📖 [Cloudflare 部署指南](README-CLOUDFLARE.md)
- 📖 [更新日志](更新说明.md)

## 🆘 获取帮助

### 本地开发问题
查看 [使用说明.md](使用说明.md) 的常见问题部分

### Cloudflare 部署问题
查看 [README-CLOUDFLARE.md](README-CLOUDFLARE.md) 的故障排除部分

## 🎉 立即开始

选择你的部署方式并按照对应文档操作即可！

---

**提示**: 如果只是个人使用，推荐本地开发；如果需要分享给他人，推荐 Cloudflare Pages。
