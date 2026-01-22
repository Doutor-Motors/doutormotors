# Documentação de APIs - Doutor Motors

## Edge Functions (Supabase)

Todas as Edge Functions usam autenticação via JWT token no header `Authorization: Bearer <token>` (exceto webhooks).

---

## 🔍 **diagnose**

Realiza análise de códigos DTC com IA (Google Gemini).

### Endpoint
```
POST /functions/v1/diagnose
```

### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Request Body
```json
{
  "dtcCodes": ["P0300", "P0420"],
  "vehicleBrand": "Toyota",
  "vehicleModel": "Corolla",
  "vehicleYear": 2020,
  "diagnosticId": "uuid-opcional",
  "userId": "uuid-opcional",
  "vehicleId": "uuid-opcional"
}
```

### Response (200 OK)
```json
{
  "diagnostics": [
    {
      "dtc_code": "P0300",
      "description_human": "Falha de ignição aleatória detectada",
      "priority": "critical",
      "severity": 8,
      "can_diy": false,
      "diy_difficulty": null,
      "probable_causes": ["Velas de ignição desgastadas", "Bobinas defeituosas"],
      "solution_url": null
    }
  ]
}
```

### Rate Limit
- **10 requisições por minuto** por usuário
- Retorna `429 Too Many Requests` se exceder

---

## 🔧 **fetch-solution**

Busca solução detalhada para um código DTC específico.

### Endpoint
```
POST /functions/v1/fetch-solution
```

### Request Body
```json
{
  "dtcCode": "P0420",
  "vehicleBrand": "Honda",
  "vehicleModel": "Civic",
  "vehicleYear": 2018,
  "problemDescription": "Motor falhando em baixa rotação"
}
```

### Response (200 OK)
```json
{
  "title": "Como Resolver P0420 - Sistema Catalítico Abaixo da Eficiência",
  "description": "Este código indica...",
  "steps": ["1. Verificar sensor de oxigênio", "2. Inspecionar catalisador"],
  "estimatedTime": "2-4 horas",
  "estimatedCost": "R$ 500 - R$ 2.000",
  "difficulty": 7,
  "tools": ["Scanner OBD2", "Chave de 14mm"],
  "parts": ["Catalisador", "Sensor O2"],
  "warnings": ["Não dirija com catalisador danificado"],
  "professionalRecommended": true
}
```

### Rate Limit
- **10 requisições por minuto** por usuário

---

## 💬 **automotive-expert-chat**

Chat com especialista automotivo (IA Gemini).

### Endpoint
```
POST /functions/v1/automotive-expert-chat
```

### Request Body
```json
{
  "message": "Por que meu carro está superaquecendo?",
  "vehicleContext": {
    "brand": "Ford",
    "model": "Focus",
    "year": 2015
  },
  "conversationHistory": [
    {"role": "user", "content": "Oi"},
    {"role": "assistant", "content": "Olá! Como posso ajudar?"}
  ]
}
```

### Response (200 OK - Streaming)
Retorna stream de eventos SSE (Server-Sent Events):
```
data: {"chunk": "O superaquecimento pode ser..."}
data: {"chunk": " causado por vários fatores"}
data: {"done": true}
```

---

## 📚 **fetch-tutorial**

Busca tutoriais de manutenção.

### Endpoint
```
POST /functions/v1/fetch-tutorial
```

### Request Body
```json
{
  "brand": "Volkswagen",
  "model": "Gol",
  "category": "troca_de_oleo"
}
```

### Response (200 OK)
```json
{
  "title": "Como Trocar o Óleo do Volkswagen Gol",
  "difficulty": "easy",
  "estimatedTime": "30 minutos",
  "tools": ["Chave de filtro", "Recipiente para óleo"],
  "steps": [
    {
      "order": 1,
      "title": "Aqueça o motor",
      "description": "Deixe o motor funcionando por 5 minutos"
    }
  ],
  "videoUrl": "https://youtube.com/...",
  "warnings": ["Nunca remova o tampão com motor quente"]
}
```

---

## 🔐 **abacatepay-webhook**

Recebe webhooks do AbacatePay (pagamentos Pix).

### Endpoint
```
POST /functions/v1/abacatepay-webhook
```

### Headers
```
x-webhook-signature: <HMAC-SHA256>
Content-Type: application/json
```

### Request Body (AbacatePay)
```json
{
  "event": "pixQrCode.paid",
  "data": {
    "pixQrCode": {
      "id": "pix-abc123",
      "amount": 3490,
      "status": "paid"
    }
  }
}
```

### Response (200 OK)
```json
{
  "received": true,
  "processed": true
}
```

**Nota:** Webhook valida assinatura HMAC usando `ABACATEPAY_WEBHOOK_SECRET`.

---

## 🎯 **create-pix-qrcode**

Cria QR Code Pix para pagamento de assinatura.

### Endpoint
```
POST /functions/v1/create-pix-qrcode
```

### Request Body
```json
{
  "amount": 3490,
  "planType": "pro",
  "user": {
    "email": "usuario@example.com",
    "name": "João Silva",
    "taxID": "12345678900"
  }
}
```

### Response (200 OK)
```json
{
  "pixId": "pix-xyz789",
  "qrCode": "00020126580014BR.GOV.BCB.PIX...",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KG...",
  "expiresAt": "2026-01-22T02:00:00Z"
}
```

---

## 📊 **Códigos de Erro Comuns**

| Código | Descrição |
|--------|-----------|
| 400 | Dados inválidos |
| 401 | Token JWT inválido ou expirado |
| 403 | Sem permissão (ex: plano Basic tentando acessar feature Pro) |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |
| 503 | Serviço temporariamente indisponível |

---

## 🔑 **Variáveis de Ambiente Necessárias**

```env
SUPABASE_URL=https://txxgmxxssnogumcwsfvn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GEMINI_API_KEY=<google-gemini-key>
ABACATEPAY_API_KEY=<abacatepay-key>
ABACATEPAY_WEBHOOK_SECRET=<webhook-secret>
FIRECRAWL_API_KEY=<firecrawl-key>
ELEVENLABS_API_KEY=<elevenlabs-key>
```

---

## 🚀 **Testing**

### Health Check
Todas as funções principais suportam health check:
```bash
curl https://your-project.supabase.co/functions/v1/diagnose/health
```

Response:
```json
{
  "status": "healthy",
  "function": "diagnose",
  "version": "1.0.0",
  "timestamp": "2026-01-22T01:30:00Z",
  "uptime": 3600000
}
```

---

**Última atualização:** 2026-01-22  
**Versão:** 2.1.0
